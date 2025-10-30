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
                verticals: "verticalsPage",
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
            // Reset all tables to "show-less" state before navigating
            this._resetAllTablesToShowLess();
            oNavContainer.to(this.byId(sPageId));

            // Load fragment conditionally
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
            } else if (sKey === "verticals" && !this._bVerticalsLoaded) {
                this._bVerticalsLoaded = true;
                const sPageId = pageMap[sKey];
                const oVerticalsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project2.view.fragments.Verticals",
                    controller: this
                }).then(function (oFragment) {
                    oVerticalsPage.addContent(oFragment);

                    const oTable = this.byId("Verticals");
                    // Ensure table starts with show-less state
                    oTable.removeStyleClass("show-more");
                    oTable.addStyleClass("show-less");

                    // ✅ Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // ✅ Initialize table-specific functionality
                    this.initializeTable("Verticals");
                    // Reset segmented button to "less" state for this fragment
                    this._resetSegmentedButtonForFragment("Verticals");

                }.bind(this));
            }
        },
        // Reset all tables to "show-less" state
        _resetAllTablesToShowLess: function () {
            const aTableIds = ["Customers", "Opportunities", "Projects", "SAPIdStatuses", "Employees", "Verticals"];

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
        onAdd: CustomUtility.prototype.onAdd,
        _createEmptyRowData: CustomUtility.prototype._createEmptyRowData,
        _resolveContextByPath: CustomUtility.prototype._resolveContextByPath,
        _getRowBinding: CustomUtility.prototype._getRowBinding,
        onToggleRowDetail: CustomUtility.prototype.onToggleRowDetail,
        _generateNextIdFromBinding: CustomUtility.prototype._generateNextIdFromBinding,
        onFilterSearch: CustomUtility.prototype.onFilterSearch,

    });
});