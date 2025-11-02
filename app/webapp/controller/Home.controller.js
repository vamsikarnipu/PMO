sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/mdc/p13n/StateUtil",
    "sap/m/MessageToast",
    "project2/utility/CustomUtility"
], (Controller, Fragment, StateUtil, MessageToast, CustomUtility) => {
    "use strict";

    return Controller.extend("project2.controller.Home", {
        onInit() {
            this._oNavContainer = this.byId("pageContainer");
            // Call the centralized controller's onInit
            CustomUtility.prototype.onInit.call(this);
            // Make sure the OData model is available both as the default (unnamed) model
            // AND as a named model "default" (some parts of your delegates use the named model)
            const oComponentModel = this.getOwnerComponent().getModel();
            if (oComponentModel) {
                this.getView().setModel(oComponentModel); // default (unnamed)
                this.getView().setModel(oComponentModel, "default"); // named "default"
            }

            // Then set the filter model
            const oFilterModel = new sap.ui.model.json.JSONModel({
                conditions: {},
                items: []
            });
            this.getView().setModel(oFilterModel, "filterModel");

            // Optional: Set a separate model for table-specific state (if needed)
            const oTableModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oTableModel, "tableModel");
        },

        onSideNavButtonPress() {
            const oSideNavigation = this.byId("sideNavigation"),
                bExpanded = oSideNavigation.getExpanded();


            oSideNavigation.setExpanded(!bExpanded);
        },

        onItemSelect: function (oEvent) {
            const sKey = oEvent.getParameter("item").getKey();
            const oNavContainer = this.byId("pageContainer");

            const pageMap = {
                home: "root1",
                customers: "customersPage",
                opportunities: "opportunitiesPage",
                projects: "projectsPage",
                sapid: "sapidPage",
                employees: "employeesPage",
                // ✅ REMOVED: verticals: "verticalsPage", (Vertical is now an enum, not an entity)
                overview: "overviewPage",
                requirements: "requirementsPage",
                bench: "benchPage",
                pendingProjects: "pendingProjectsPage",
                pendingOpportunities: "pendingOpportunitiesPage"
            };

            const sPageId = pageMap[sKey];

            if (!sPageId) {
                console.warn("No page mapped for key:", sKey);
                return;
            }
            // ✅ FIXED: Check for unsaved changes before navigating
            this._clearPreviousTableEditState(sKey).then((bAllowNavigation) => {
                if (!bAllowNavigation) {
                    // User chose "Stay" - don't navigate
                    return;
                }
                
                // Reset all tables to "show-less" state before navigating
                this._resetAllTablesToShowLess();
                oNavContainer.to(this.byId(sPageId));
                
                // Continue with fragment loading logic...
                this._loadFragmentIfNeeded(sKey, sPageId);
            });
        },

        // ✅ NEW: Extract fragment loading logic
        _loadFragmentIfNeeded: function (sKey, sPageId) {
            if (sKey === "customers" && !this._bCustomersLoaded) {
                this._bCustomersLoaded = true;
                const oCustomersPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.Customers",
                    controller: this
                }).then(function (oFragment) {
                    oCustomersPage.addContent(oFragment);

                    const oTable = this.byId("Customers");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Customers");

                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("Customers");

                    // ✅ Call the function from CustomUtility
                    // CustomUtility.prototype.onSelectionChange.call(this);




                }.bind(this));
            } else if (sKey === "opportunities" && !this._bOpportunitiesLoaded) {
                this._bOpportunitiesLoaded = true;
                const oOpportunitiesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.Opportunities",
                    controller: this
                }).then(function (oFragment) {
                    oOpportunitiesPage.addContent(oFragment);

                    const oTable = this.byId("Opportunities");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Opportunities");
                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("Opportunities");
                }.bind(this));
            } else if (sKey === "projects" && !this._bProjectsLoaded) {
                this._bProjectsLoaded = true;
                const oProjectsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.Projects",
                    controller: this
                }).then(function (oFragment) {
                    oProjectsPage.addContent(oFragment);

                    const oTable = this.byId("Projects");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Projects");
                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("Projects");

                    // ✅ Call your custom function


                }.bind(this));
            } else if (sKey === "sapid" && !this._bSAPIdLoaded) {
                this._bSAPIdLoaded = true;
                const oSAPIdPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.SAPId",
                    controller: this
                }).then(function (oFragment) {
                    oSAPIdPage.addContent(oFragment);

                    const oTable = this.byId("SAPIdStatuses");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("SAPIdStatuses");
                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("SAPIdStatuses");
                }.bind(this));
            } else if (sKey === "employees" && !this._bEmployeesLoaded) {
                this._bEmployeesLoaded = true;
                const oEmployeesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.Employees",
                    controller: this
                }).then(function (oFragment) {
                    oEmployeesPage.addContent(oFragment);
                    const oTable = this.byId("Employees");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Employees");
                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("Employees");
                }.bind(this));
            }
            // ✅ REMOVED: Verticals fragment loading (Vertical is now an enum, not an entity)
        },
        // Reset all tables to "show-less" state
        _resetAllTablesToShowLess: function () {
            const aTableIds = ["Customers", "Opportunities", "Projects", "SAPIdStatuses", "Employees"]; // ✅ REMOVED: "Verticals"

            aTableIds.forEach((sTableId) => {
                const oTable = this.byId(sTableId);
                if (oTable) {
                    // Remove "show-more" class and add "show-less" class
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");
                    console.log(`[Navigation] Reset table ${sTableId} to show-less state`);
                }
            });

            // Reset all segmented buttons to "less" state
            this._resetAllSegmentedButtons();
        },
        // Reset all segmented buttons to "less" state
        _resetAllSegmentedButtons: function () {
            // Find all segmented buttons in the view
            const oView = this.getView();
            const aSegmentedButtons = oView.findAggregatedObjects(true, function (oControl) {
                return oControl.getMetadata().getName() === "sap.m.SegmentedButton";
            });

            aSegmentedButtons.forEach((oSegmentedButton) => {
                if (oSegmentedButton) {
                    oSegmentedButton.setSelectedKey("less");
                    console.log(`[Navigation] Reset segmented button to "less" state`);
                }
            });
        },
        // Reset segmented button for a specific fragment
        _resetSegmentedButtonForFragment: function (sTableId) {
            // Find segmented button within the specific table's fragment
            const oTable = this.byId(sTableId);
            if (oTable) {
                const oParent = oTable.getParent();
                if (oParent) {
                    const aSegmentedButtons = oParent.findAggregatedObjects(true, function (oControl) {
                        return oControl.getMetadata().getName() === "sap.m.SegmentedButton";
                    });

                    aSegmentedButtons.forEach((oSegmentedButton) => {
                        if (oSegmentedButton) {
                            oSegmentedButton.setSelectedKey("less");
                            console.log(`[Fragment] Reset segmented button for ${sTableId} to "less" state`);
                        }
                    });
                }
            }
        },

        // ✅ NEW: Handle navigation with unsaved changes - Show confirmation dialog
        _clearPreviousTableEditState: function (sNewPageKey) {
            const oEditModel = this.getView().getModel("edit");
            if (!oEditModel) {
                return Promise.resolve(true); // No edit model, allow navigation
            }

            // Map of page keys to table IDs
            const pageToTableMap = {
                customers: "Customers",
                opportunities: "Opportunities",
                projects: "Projects",
                employees: "Employees",
                // ✅ REMOVED: verticals: "Verticals", (Vertical is now an enum)
                sapid: "SAPIdStatuses"
            };

            const sCurrentTable = oEditModel.getProperty("/currentTable");
            if (!sCurrentTable) {
                return Promise.resolve(true); // No table in edit mode, allow navigation
            }

            // If navigating to a different table (or home), check for unsaved changes
            const sNewTableId = pageToTableMap[sNewPageKey];
            if (sCurrentTable === sNewTableId) {
                return Promise.resolve(true); // Same table, allow navigation
            }

            // Get the edit state for the current table
            const sPrevEditingPath = oEditModel.getProperty(`/${sCurrentTable}/editingPath`);
            const sPrevMode = oEditModel.getProperty(`/${sCurrentTable}/mode`);

            if (!sPrevEditingPath || sPrevEditingPath.length === 0) {
                return Promise.resolve(true); // No unsaved changes, allow navigation
            }

            // ✅ Show confirmation dialog with Save, Cancel, and Stay options
            return new Promise((resolve) => {
                // ✅ FIXED: Use custom action strings to ensure button text displays correctly
                const SAVE_ACTION = "Save";
                const CANCEL_ACTION = "Cancel";
                const STAY_ACTION = "Stay";
                
                sap.m.MessageBox.show(
                    `You have unsaved changes in ${sCurrentTable}. What would you like to do?`,
                    {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: "Unsaved Changes",
                        actions: [
                            SAVE_ACTION,
                            CANCEL_ACTION,
                            STAY_ACTION
                        ],
                        emphasizedAction: SAVE_ACTION,
                        onClose: (sAction) => {
                            if (sAction === STAY_ACTION) {
                                // Stay on current fragment - prevent navigation
                                resolve(false);
                                return;
                            }

                            if (sAction === SAVE_ACTION) {
                                // Save changes first, then navigate
                                this._saveCurrentTableChanges(sCurrentTable).then(() => {
                                    this._discardTableEditState(sCurrentTable);
                                    resolve(true); // Allow navigation after save
                                }).catch((err) => {
                                    console.error("[Navigation] Error saving changes:", err);
                                    sap.m.MessageBox.error("Error saving changes. Please try again.");
                                    resolve(false); // Prevent navigation on error
                                });
                            } else if (sAction === CANCEL_ACTION) {
                                // Discard changes and navigate
                                // ✅ FIXED: Call the actual cancel logic from CustomUtility to properly cancel OData changes
                                this._cancelCurrentTableChanges(sCurrentTable).then(() => {
                                    this._discardTableEditState(sCurrentTable);
                                    resolve(true); // Allow navigation after discard
                                }).catch((err) => {
                                    console.error("[Navigation] Error canceling changes:", err);
                                    // Even if cancel fails, clear edit state and allow navigation
                                    this._discardTableEditState(sCurrentTable);
                                    resolve(true);
                                });
                            }
                        }
                    }
                );
            });
        },

        // ✅ NEW: Save changes for a specific table
        _saveCurrentTableChanges: async function (sTableId) {
            // Reuse the save logic from CustomUtility
            const buttonMap = {
                "Customers": { save: "saveButton" },
                "Employees": { save: "saveButton_emp" },
                "Opportunities": { save: "saveButton_oppr" },
                "Projects": { save: "saveButton_proj" },
                "SAPIdStatuses": { save: "saveButton_sap" }
                // ✅ REMOVED: "Verticals": { save: "saveButton_vert" }
            };

            // Create a mock event object to trigger save
            const oMockEvent = {
                getSource: () => {
                    const sButtonId = buttonMap[sTableId]?.save;
                    return {
                        getId: () => `mock--${sButtonId}`
                    };
                }
            };

            // Call the save function
            await CustomUtility.prototype.onSaveButtonPress.call(this, oMockEvent);
        },

        // ✅ NEW: Cancel changes for a specific table (for navigation dialog)
        // This bypasses the confirmation dialog since user already confirmed in navigation dialog
        _cancelCurrentTableChanges: function (sTableId) {
            // Call the internal cancel operation directly (without confirmation dialog)
            // CustomUtility has a method that performs the actual cancel logic
            return new Promise((resolve) => {
                try {
                    // Call the internal cancel operation from CustomUtility
                    // We pass a flag to skip the confirmation dialog
                    CustomUtility.prototype._performCancelOperation.call(this, sTableId, true); // true = skip confirmation
                    
                    // Give it a moment to complete, then resolve
                    setTimeout(() => {
                        resolve();
                    }, 100);
                } catch (error) {
                    console.error("[Navigation] Error canceling changes:", error);
                    resolve(); // Still allow navigation even if cancel fails
                }
            });
        },

        // ✅ NEW: Discard edit state for a specific table
        _discardTableEditState: function (sTableId) {
            const oEditModel = this.getView().getModel("edit");
            if (!oEditModel) return;

            const oPrevTable = this.byId(sTableId);
            if (!oPrevTable) return;

            const sPrevEditingPath = oEditModel.getProperty(`/${sTableId}/editingPath`);
            if (!sPrevEditingPath || sPrevEditingPath.length === 0) return;

            // Reset edit state
            oEditModel.setProperty(`/${sTableId}/editingPath`, "");
            oEditModel.setProperty(`/${sTableId}/mode`, null);
            oEditModel.setProperty("/currentTable", null);

            // Disable Save/Cancel buttons
            const buttonMap = {
                "Customers": { save: "saveButton", cancel: "cancelButton", edit: "btnEdit_cus", delete: "btnDelete_cus", add: "btnAdd" },
                "Employees": { save: "saveButton_emp", cancel: "cancelButton_emp", edit: "Edit_emp", delete: "Delete_emp", add: "btnAdd_emp" },
                "Opportunities": { save: "saveButton_oppr", cancel: "cancelButton_oppr", edit: "btnEdit_oppr", delete: "btnDelete_oppr", add: "btnAdd_oppr" },
                "Projects": { save: "saveButton_proj", cancel: "cancelButton_proj", edit: "btnEdit_proj", delete: "btnDelete_proj", add: "btnAdd_proj" },
                "SAPIdStatuses": { save: "saveButton_sap", cancel: "cancelButton_sap", edit: "btnEdit_sap", delete: "btnDelete_sap", add: "btnAdd_sap" }
                // ✅ REMOVED: "Verticals": { save: "saveButton_vert", cancel: "cancelButton_vert", edit: "btnEdit_vert", delete: "btnDelete_vert", add: "btnAdd_vert" }
            };

            const config = buttonMap[sTableId];
            if (config) {
                this.byId(config.save)?.setEnabled(false);
                this.byId(config.cancel)?.setEnabled(false);
                this.byId(config.edit)?.setEnabled(false);
                this.byId(config.delete)?.setEnabled(false);
                this.byId(config.add)?.setEnabled(true);
            }

            // Discard pending changes
            try {
                const oModel = this.getView().getModel();
                if (oModel) {
                    const aPaths = sPrevEditingPath.split(",").filter(Boolean);
                    aPaths.forEach(sPath => {
                        try {
                            const oContext = CustomUtility.prototype._resolveContextByPath.call(this, oPrevTable, sPath);
                            if (oContext) {
                                // Reset context changes
                                if (oContext.reset) {
                                    oContext.reset();
                                } else if (oContext.getObject) {
                                    const oData = oContext.getObject();
                                    if (oData._originalData) {
                                        // Restore original data
                                        const oOriginal = oData._originalData;
                                        Object.keys(oOriginal).forEach(sKey => {
                                            if (sKey !== '_originalData' && sKey !== 'isEditable' && sKey !== '_hasChanged') {
                                                oContext.setProperty(sKey, oOriginal[sKey]);
                                            }
                                        });
                                        delete oData._originalData;
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn(`[Navigation] Could not reset context ${sPath}:`, e);
                        }
                    });
                }
            } catch (e) {
                console.warn("[Navigation] Error discarding pending changes:", e);
            }
        },

        // Include all methods from CustomUtility
        initializeTable: CustomUtility.prototype.initializeTable,
        _getPersonsBinding: CustomUtility.prototype._getPersonsBinding,
        _getSelectedContexts: CustomUtility.prototype._getSelectedContexts,
        _updateSelectionState: CustomUtility.prototype._updateSelectionState,
        _updatePendingState: CustomUtility.prototype._updatePendingState,
        // onSelectionChange: CustomUtility.prototype.onSelectionChange,
        // onAddPress: CustomUtility.prototype.onAddPress,
        // onDeletePress: CustomUtility.prototype.onDeletePress,
        // onSaveChanges: CustomUtility.prototype.onSaveChanges,
        // onCancelChanges: CustomUtility.prototype.onCancelChanges,
        // onCopyToClipboard: CustomUtility.prototype.onCopyToClipboard,
        // onUploadPress: CustomUtility.prototype.onUploadPress,
        // onUploadTemplate: CustomUtility.prototype.onUploadTemplate,
        // onDownloadTemplate: CustomUtility.prototype.onDownloadTemplate,
        // onEditPress: CustomUtility.prototype.onEditPress,
        // onAlignToggle: CustomUtility.prototype.onAlignToggle,
        _openPersonDialog: CustomUtility.prototype._openPersonDialog,
        onInlineAccept: CustomUtility.prototype.onInlineAccept,
        onInlineCancel: CustomUtility.prototype.onInlineCancel,
        // onSelectionChange_customers: CustomUtility.prototype.onSelectionChange_customers,
        // onSelectionChange_employees: CustomUtility.prototype.onSelectionChange_employees,
        // onSelectionChange_opportunities: CustomUtility.prototype.onSelectionChange_opportunities,
        // onSelectionChange_projects: CustomUtility.prototype.onSelectionChange_projects,
        // onSelectionChange_sapid: CustomUtility.prototype.onSelectionChange_sapid,
        onSelectionChange: CustomUtility.prototype.onSelectionChange,
        onDeletePress: CustomUtility.prototype.onDeletePress,
        onEditPress: CustomUtility.prototype.onEditPress,
        onSaveButtonPress: CustomUtility.prototype.onSaveButtonPress,
        onCancelButtonPress: CustomUtility.prototype.onCancelButtonPress,
        _performCancelOperation: CustomUtility.prototype._performCancelOperation, // ✅ EXPOSED: For cancel button to work
        onAdd: CustomUtility.prototype.onAdd,
        _createEmptyRowData: CustomUtility.prototype._createEmptyRowData,
        _resolveContextByPath: CustomUtility.prototype._resolveContextByPath,
        _getRowBinding: CustomUtility.prototype._getRowBinding,
        onToggleRowDetail: CustomUtility.prototype.onToggleRowDetail,
        _generateNextIdFromBinding: CustomUtility.prototype._generateNextIdFromBinding,
        onFilterSearch: CustomUtility.prototype.onFilterSearch,

    });
});