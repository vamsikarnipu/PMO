sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/mdc/p13n/StateUtil",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "project1/utility/crud"
], function (Controller, StateUtil, JSONModel, MessageToast, Crud) {
    "use strict";
    
    // Fixed syntax error - removed duplicate oData declarations
    // Force refresh to clear browser cache

    return Controller.extend("project1.utility.CustomUtility", {
        onInit: function () {
            console.log("=== [Controller] onInit called ===");

            // Lightweight view state model for button enablement
            const oViewState = new JSONModel({ hasSelected: false, hasPendingChanges: false });
            this.getView().setModel(oViewState, "model");
            // Model to track row-level inline editing
            this.getView().setModel(new JSONModel({ editingPath: null, mode: null }), "edit");
        },

        // Initialize table-specific functionality when table is available
        initializeTable: function (sTableId) {
            // Try different table IDs if not specified
            const aTableIds = sTableId ? [sTableId] : ["Customers", "Opportunities", "Projects", "EntityStatuses", "Employees"];
            let oTable = null;

            for (const sId of aTableIds) {
                oTable = this.byId(sId);
                if (oTable) {
                    console.log("[Controller] Found table:", sId);
                    break;
                }
            }

            if (!oTable) {
                console.warn("[Controller] No table found for ID:", sTableId, "Available table IDs:", aTableIds);
                return;
            }

            console.log("[Controller] Starting table initialization for table:", sTableId);

            // Wait for table initialization
            oTable.initialized().then(() => {
                console.log("[Controller] Table initialized");

                // Get the delegate
                const oDelegate = oTable.getControlDelegate();

                // Build initial state using delegate properties to align with MDC p13n
                oDelegate.fetchProperties(oTable)
                    .then((aProperties) => {
                        console.log("[Controller] Properties fetched:", aProperties);

                        // Prepare items for external state (visible true for all non-$ props)
                        const aItems = aProperties
                            .filter((p) => !p.name || !String(p.name).startsWith("$"))
                            .map((p) => ({
                                name: p.name || p.path,
                                visible: true
                            }));

                        const oExternalState = { items: aItems };

                        return StateUtil.applyExternalState(oTable, oExternalState);
                    })
                    .then(() => {
                        console.log("[Controller] External state applied; rebinding table");
                        // Rebind to render columns
                        oTable.rebind();

                        // Fallback: if still no columns, add a few programmatically
                        if (!oTable.getColumns || oTable.getColumns().length === 0) {
                            const oDelegateAgain = oTable.getControlDelegate();
                            const aProps = ["custName","customerId","city","country"]; // safe defaults per entity
                            aProps.forEach((p) => {
                                oDelegateAgain.addItem(oTable, p).then(function (oCol) {
                                    oTable.addColumn(oCol);
                                    oTable.rebind();
                                }).catch(function(){});
                            });
                        }
                    })
                    .catch((err) => {
                        console.error("[Controller] Error during initial column setup:", err);
                    });

                // Keep selection state in sync
                oTable.attachSelectionChange(this._updateSelectionState, this);
            });

            // Track pending changes on default model
            const oModel = this.getOwnerComponent().getModel();
            if (oModel && oModel.attachPropertyChange) {
                oModel.attachPropertyChange(this._updatePendingState, this);
            }
        },

        // Get binding for persons (generic method)
        _getPersonsBinding: function () {
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            return oTable ? oTable.getBinding("rows") : null;
        },

        // Get selected contexts
        _getSelectedContexts: function () {
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            if (!oTable) return [];
            
            const aSelectedContexts = oTable.getSelectedContexts();
            console.log("[Controller] Selected contexts:", aSelectedContexts.length);
            return aSelectedContexts;
        },

        // Update selection state
        _updateSelectionState: function () {
            const aSelectedContexts = this._getSelectedContexts();
            const bHasSelected = aSelectedContexts.length > 0;
            
            const oViewState = this.getView().getModel("model");
            if (oViewState) {
                oViewState.setProperty("/hasSelected", bHasSelected);
            }

            // Update button states
            this._updateButtonStates();
        },

        // Update pending state
        _updatePendingState: function (bHasPending) {
            const oViewState = this.getView().getModel("model");
            if (oViewState) {
                oViewState.setProperty("/hasPendingChanges", bHasPending);
            }
        },

        // Update button states
        _updateButtonStates: function () {
            const aSelectedContexts = this._getSelectedContexts();
            const bHasSelected = aSelectedContexts.length > 0;
            
            // Update delete and edit buttons
            const aDeleteButtons = this.getView().findAggregation("content", true).filter(function(oControl) {
                return oControl.getId && oControl.getId().includes("btnDelete");
            });
            
            const aEditButtons = this.getView().findAggregation("content", true).filter(function(oControl) {
                return oControl.getId && oControl.getId().includes("btnEdit");
            });

            aDeleteButtons.forEach(function(oButton) {
                oButton.setEnabled(bHasSelected);
            });

            aEditButtons.forEach(function(oButton) {
                oButton.setEnabled(bHasSelected);
            });
        },

        // Selection change handler
        onSelectionChange: function (oEvent) {
            console.log("[Controller] Selection changed");
            this._updateSelectionState();
        },

        // Add new row
        onAdd: function (oEvent) {
            console.log("[Controller] Add button pressed");
            
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            if (!oTable) {
                MessageToast.show("No table found");
                return;
            }

            // Create empty row data
            const oEmptyRowData = this._createEmptyRowData();
            
            // Add row to table
            this._executeAddWithRetry(oTable, oEmptyRowData);
        },

        // Edit selected row
        onEditPress: function (oEvent) {
            console.log("[Controller] Edit button pressed");
            
            const aSelectedContexts = this._getSelectedContexts();
            if (aSelectedContexts.length === 0) {
                MessageToast.show("Please select a row to edit");
                return;
            }

            // Enable editing for selected rows
            const oEditModel = this.getView().getModel("edit");
            if (oEditModel) {
                const aEditingPaths = aSelectedContexts.map(function(oContext) {
                    return oContext.getPath();
                });
                oEditModel.setProperty("/editingPath", aEditingPaths.join(","));
                oEditModel.setProperty("/mode", "edit");
            }

            this._updatePendingState(true);
        },

        // Delete selected rows
        onDeletePress: function (oEvent) {
            console.log("[Controller] Delete button pressed");
            
            const aSelectedContexts = this._getSelectedContexts();
            if (aSelectedContexts.length === 0) {
                MessageToast.show("Please select rows to delete");
                return;
            }

            // Confirm deletion
            if (confirm(`Are you sure you want to delete ${aSelectedContexts.length} row(s)?`)) {
                // Delete selected rows
                aSelectedContexts.forEach(function(oContext) {
                    oContext.delete();
                });
                
                MessageToast.show(`${aSelectedContexts.length} row(s) deleted`);
                this._updateSelectionState();
            }
        },

        // Save changes
        onSaveButtonPress: function (oEvent) {
            console.log("[Controller] Save button pressed");
            
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            if (!oTable) {
                MessageToast.show("No table found");
                return;
            }

            // Submit changes
            const oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.submitChanges().then(function() {
                    MessageToast.show("Changes saved successfully");
                    this._updatePendingState(false);
                }.bind(this)).catch(function(oError) {
                    console.error("Save failed:", oError);
                    MessageToast.show("Save failed: " + oError.message);
                });
            }
        },

        // Cancel changes
        onCancelButtonPress: function (oEvent) {
            console.log("[Controller] Cancel button pressed");
            
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            if (!oTable) {
                MessageToast.show("No table found");
                return;
            }

            // Reset editing state
            const oEditModel = this.getView().getModel("edit");
            if (oEditModel) {
                oEditModel.setProperty("/editingPath", null);
                oEditModel.setProperty("/mode", null);
            }

            // Cancel changes
            const oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.resetChanges();
            }

            this._updatePendingState(false);
            MessageToast.show("Changes cancelled");
        },

        // Create empty row data
        _createEmptyRowData: function () {
            // Return empty object - will be populated by the table
            return {};
        },

        // Execute add with retry
        _executeAddWithRetry: function (oTable, oData, iRetries = 3) {
            const oBinding = oTable.getBinding("rows");
            if (!oBinding) {
                MessageToast.show("No binding found");
                return;
            }

            try {
                oBinding.create(oData);
                MessageToast.show("New row added");
            } catch (oError) {
                console.error("Add failed:", oError);
                if (iRetries > 0) {
                    setTimeout(() => {
                        this._executeAddWithRetry(oTable, oData, iRetries - 1);
                    }, 1000);
                } else {
                    MessageToast.show("Failed to add row: " + oError.message);
                }
            }
        },

        // Resolve context by path
        _resolveContextByPath: function (sPath) {
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            if (!oTable) return null;
            
            const oBinding = oTable.getBinding("rows");
            if (!oBinding) return null;
            
            return oBinding.getContextByPath(sPath);
        },

        // Get row binding
        _getRowBinding: function () {
            const oTable = this.byId("Customers") || this.byId("Opportunities") || this.byId("Projects") || this.byId("Employees") || this.byId("EntityStatuses");
            return oTable ? oTable.getBinding("rows") : null;
        },

        // Inline accept
        onInlineAccept: function (oEvent) {
            console.log("[Controller] Inline accept");
            // Handle inline editing accept
        },

        // Inline cancel
        onInlineCancel: function (oEvent) {
            console.log("[Controller] Inline cancel");
            // Handle inline editing cancel
        },

        // CSV Export
        onCSVExport: function (oEvent) {
            console.log("[Controller] CSV Export");
            MessageToast.show("CSV Export functionality");
        },

        // Template Download
        onTemplateDownload: function (oEvent) {
            console.log("[Controller] Template Download");
            MessageToast.show("Template Download functionality");
        },

        // Test cancel direct
        testCancelDirect: function (oEvent) {
            console.log("[Controller] Test cancel direct");
            this.onCancelButtonPress(oEvent);
        }
    });
});
