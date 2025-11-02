sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem"
], function (Control, SelectDialog, StandardListItem) {
    "use strict";

    /**
     * Custom Value Help Dialog for Association Fields
     * Wrapper around sap.m.SelectDialog for better integration
     */
    const ValueHelpDialog = Control.extend("project2.control.ValueHelpDialog", {
        metadata: {
            properties: {
                title: { type: "string", defaultValue: "Select Value" }
            },
            aggregations: {
                _selectDialog: { type: "sap.m.SelectDialog", multiple: false, visibility: "hidden" }
            },
            events: {
                confirm: {
                    parameters: {
                        selectedKey: { type: "string" },
                        selectedText: { type: "string" },
                        selectedItem: { type: "object" }
                    }
                },
                cancel: {}
            }
        },

        init: function () {
            // Will be created on first open
            this._oSelectDialog = null;
        },

        /**
         * Opens the Value Help Dialog using sap.m.SelectDialog
         * @param {object} oConfig Configuration object
         * @param {sap.ui.model.Model} oConfig.model OData V4 model
         * @param {string} oConfig.collectionPath Path to collection (e.g., "/Opportunities")
         * @param {string} oConfig.keyField Field name for key (e.g., "sapOpportunityId")
         * @param {string} oConfig.displayField Field name for display (e.g., "opportunityName")
         * @param {string} oConfig.title Dialog title
         * @param {string} oConfig.currentValue Currently selected value (optional)
         * @param {boolean} oConfig.showKeyColumn Show key column (default: false)
         */
        open: function (oConfig) {
            const that = this;
            
            // Destroy existing dialog if any
            if (this._oSelectDialog) {
                this._oSelectDialog.destroy();
                this._oSelectDialog = null;
            }
            
            const oModel = oConfig.model;
            if (!oModel) {
                console.error("[ValueHelpDialog] No model provided in config!");
                return;
            }
            
            const sTitle = oConfig.title || "Select Value";
            const sKeyField = oConfig.keyField;
            const sDisplayField = oConfig.displayField;
            const sCollectionPath = oConfig.collectionPath;
            const bShowKey = oConfig.showKeyColumn !== false;
            
            // Create SelectDialog
            const oSelectDialog = new SelectDialog({
                title: sTitle,
                noDataText: "No data available",
                search: function(oEvent) {
                    const sValue = oEvent.getParameter("value");
                    // SelectDialog handles filtering automatically
                },
                confirm: function(oEvent) {
                    const aSelectedItems = oEvent.getParameter("selectedItems");
                    if (aSelectedItems && aSelectedItems.length > 0) {
                        const oSelectedItem = aSelectedItems[0];
                        const oContext = oSelectedItem.getBindingContext();
                        if (oContext) {
                            const oData = oContext.getObject();
                            const sKey = oData[sKeyField];
                            const sText = oData[sDisplayField];
                            
                            that.fireEvent("confirm", {
                                selectedKey: sKey,
                                selectedText: sText,
                                selectedItem: oData
                            });
                        }
                    }
                },
                cancel: function() {
                    that.fireEvent("cancel");
                },
                growingThreshold: 20,
                rememberSelections: false
            });
            
            // Set model
            oSelectDialog.setModel(oModel);
            
            // Create item template
            // SelectDialog shows title and description
            const oItemTemplate = new StandardListItem({
                title: "{" + sDisplayField + "}",
                description: bShowKey ? "{" + sKeyField + "}" : undefined,
                type: "Active"
            });
            
            // Bind items
            oSelectDialog.bindItems({
                path: sCollectionPath,
                template: oItemTemplate
            });
            
            // Store reference
            this._oSelectDialog = oSelectDialog;
            this.setAggregation("_selectDialog", oSelectDialog);
            
            // Add to view if available
            const oView = this.getParent() || (sap.ui.getCore().byId("__component0") && sap.ui.getCore().byId("__component0").getRootControl());
            if (oView) {
                oView.addDependent(oSelectDialog);
            }
            
            // Pre-select current value if provided
            if (oConfig.currentValue) {
                setTimeout(function() {
                    const aItems = oSelectDialog.getItems();
                    const oSelectedItem = aItems.find(function(oItem) {
                        const oCtx = oItem.getBindingContext();
                        if (oCtx) {
                            const oData = oCtx.getObject();
                            return oData[sKeyField] === oConfig.currentValue;
                        }
                        return false;
                    });
                    if (oSelectedItem) {
                        oSelectDialog.setSelectedItem(oSelectedItem);
                    }
                }, 300);
            }
            
            // Open dialog
            oSelectDialog.open();
            
            console.log("[ValueHelpDialog] SelectDialog opened for", sCollectionPath);
        },

        close: function () {
            if (this._oSelectDialog) {
                this._oSelectDialog.close();
            }
        },

        exit: function () {
            if (this._oSelectDialog) {
                this._oSelectDialog.destroy();
                this._oSelectDialog = null;
            }
        }
    });

    return ValueHelpDialog;
});
