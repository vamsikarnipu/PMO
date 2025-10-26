sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/mdc/p13n/StateUtil",
    "sap/m/MessageToast",
    "project1/utility/CustomUtility"
], (Controller, Fragment, StateUtil, MessageToast, CustomUtility) => {
    "use strict";

    return Controller.extend("project1.controller.Home", {
        onInit() {
            this._oNavContainer = this.byId("pageContainer");
            // Call the centralized controller's onInit
            CustomUtility.prototype.onInit.call(this);
        },

        _initializeNavigation() {
            // Get the side navigation control
            const sideNavigation = this.byId("sideNavigation");
            if (sideNavigation) {
                sideNavigation.attachItemSelect(this.onItemSelect.bind(this));
            }
        },

        onSideNavButtonPress() {
            const oSideNavigation = this.byId("sideNavigation"),
                bExpanded = oSideNavigation.getExpanded();

            oSideNavigation.setExpanded(!bExpanded);
        },

        onLogoPressed() {
            // Navigate to home page
            this._navigateToPage("root1");
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
                entityStatus: "entityStatusPage",
                verticals: "verticalsPage",
                projecttypes: "projecttypesPage",
                businesstypes: "businesstypesPage",
                skills: "skillsPage",
                assignments: "assignmentsPage",
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

            oNavContainer.to(this.byId(sPageId));

            // Load fragment conditionally
            if (sKey === "customers" && !this._bCustomersLoaded) {
                this._bCustomersLoaded = true;
                const oCustomersPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Customers",
                    controller: this
                }).then(function (oFragment) {
                    oCustomersPage.addContent(oFragment);

                    const oTable = this.byId("Customers");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Customers");
                }.bind(this));
            } else if (sKey === "opportunities" && !this._bOpportunitiesLoaded) {
                this._bOpportunitiesLoaded = true;
                const oOpportunitiesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Opportunities",
                    controller: this
                }).then(function (oFragment) {
                    oOpportunitiesPage.addContent(oFragment);

                    const oTable = this.byId("Opportunities");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Opportunities");
                }.bind(this));
            } else if (sKey === "projects" && !this._bProjectsLoaded) {
                this._bProjectsLoaded = true;
                const oProjectsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Projects",
                    controller: this
                }).then(function (oFragment) {
                    oProjectsPage.addContent(oFragment);

                    const oTable = this.byId("Projects");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Projects");
                }.bind(this));
            } else if (sKey === "employees" && !this._bEmployeesLoaded) {
                this._bEmployeesLoaded = true;
                const oEmployeesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Employees",
                    controller: this
                }).then(function (oFragment) {
                    oEmployeesPage.addContent(oFragment);

                    const oTable = this.byId("Employees");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Employees");
                }.bind(this));
            } else if (sKey === "sapid" && !this._bSAPIdLoaded) {
                this._bSAPIdLoaded = true;
                const oSAPIdPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.EntityStatus",
                    controller: this
                }).then(function (oFragment) {
                    oSAPIdPage.addContent(oFragment);

                    const oTable = this.byId("EntityStatuses");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("EntityStatuses");
                }.bind(this));
            } else if (sKey === "entityStatus" && !this._bEntityStatusLoaded) {
                this._bEntityStatusLoaded = true;
                const oEntityStatusPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.EntityStatus",
                    controller: this
                }).then(function (oFragment) {
                    oEntityStatusPage.addContent(oFragment);

                    const oTable = this.byId("EntityStatuses");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("EntityStatuses");
                }.bind(this));
            } else if (sKey === "assignments" && !this._bAssignmentsLoaded) {
                this._bAssignmentsLoaded = true;
                const oAssignmentsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Assignments",
                    controller: this
                }).then(function (oFragment) {
                    oAssignmentsPage.addContent(oFragment);

                    const oTable = this.byId("Assignments");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Assignments");
                }.bind(this));
            } else if (sKey === "verticals" && !this._bVerticalsLoaded) {
                this._bVerticalsLoaded = true;
                const oVerticalsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Verticals",
                    controller: this
                }).then(function (oFragment) {
                    oVerticalsPage.addContent(oFragment);

                    const oTable = this.byId("Verticals");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Verticals");
                }.bind(this));
            } else if (sKey === "projecttypes" && !this._bProjectTypesLoaded) {
                this._bProjectTypesLoaded = true;
                const oProjectTypesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.ProjectTypes",
                    controller: this
                }).then(function (oFragment) {
                    oProjectTypesPage.addContent(oFragment);

                    const oTable = this.byId("ProjectTypes");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("ProjectTypes");
                }.bind(this));
            } else if (sKey === "businesstypes" && !this._bBusinessTypesLoaded) {
                this._bBusinessTypesLoaded = true;
                const oBusinessTypesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.BusinessTypes",
                    controller: this
                }).then(function (oFragment) {
                    oBusinessTypesPage.addContent(oFragment);

                    const oTable = this.byId("BusinessTypes");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("BusinessTypes");
                }.bind(this));
            } else if (sKey === "skills" && !this._bSkillsLoaded) {
                this._bSkillsLoaded = true;
                const oSkillsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.Skills",
                    controller: this
                }).then(function (oFragment) {
                    oSkillsPage.addContent(oFragment);

                    const oTable = this.byId("Skills");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("Skills");
                }.bind(this));
            } else if (sKey === "overview" && !this._bOverviewLoaded) {
                this._bOverviewLoaded = true;
                const oOverviewPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.ProjectsOverview",
                    controller: this
                }).then(function (oFragment) {
                    oOverviewPage.addContent(oFragment);

                    const oTable = this.byId("ProjectsOverview");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("ProjectsOverview");
                }.bind(this));
            } else if (sKey === "requirements" && !this._bRequirementsLoaded) {
                this._bRequirementsLoaded = true;
                const oRequirementsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.ResourceRequirements",
                    controller: this
                }).then(function (oFragment) {
                    oRequirementsPage.addContent(oFragment);

                    const oTable = this.byId("ResourceRequirements");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("ResourceRequirements");
                }.bind(this));
            } else if (sKey === "bench" && !this._bBenchLoaded) {
                this._bBenchLoaded = true;
                const oBenchPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.BenchReport",
                    controller: this
                }).then(function (oFragment) {
                    oBenchPage.addContent(oFragment);

                    const oTable = this.byId("BenchReport");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("BenchReport");
                }.bind(this));
            } else if (sKey === "pendingProjects" && !this._bPendingProjectsLoaded) {
                this._bPendingProjectsLoaded = true;
                const oPendingProjectsPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.PendingProjects",
                    controller: this
                }).then(function (oFragment) {
                    oPendingProjectsPage.addContent(oFragment);

                    const oTable = this.byId("PendingProjects");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("PendingProjects");
                }.bind(this));
            } else if (sKey === "pendingOpportunities" && !this._bPendingOpportunitiesLoaded) {
                this._bPendingOpportunitiesLoaded = true;
                const oPendingOpportunitiesPage = this.byId(sPageId);

                Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.view.fragments.PendingOpportunities",
                    controller: this
                }).then(function (oFragment) {
                    oPendingOpportunitiesPage.addContent(oFragment);

                    const oTable = this.byId("PendingOpportunities");

                    // Ensure the table has the correct model
                    const oModel = this.getOwnerComponent().getModel();
                    if (oModel) {
                        oTable.setModel(oModel);
                    }

                    // Initialize table-specific functionality
                    this.initializeTable("PendingOpportunities");
                }.bind(this));
            }
        },

        _navigateToPage(pageId) {
            const navContainer = this.byId("pageContainer");
            if (navContainer) {
                navContainer.to(pageId);
            }
        },

        // ============================================
        // CRUD OPERATIONS
        // ============================================
        
        onSelectionChange: function(oEvent) {
            const aSelectedContexts = oEvent.getParameter("selectedContexts");
            const bHasSelection = aSelectedContexts && aSelectedContexts.length > 0;
            
            // Update view state
            const oViewState = this.getView().getModel("viewState");
            oViewState.setProperty("/hasSelected", bHasSelection);
            
            // Enable/disable buttons based on selection
            this._updateButtonStates(bHasSelection);
        },

        onAdd: function() {
            MessageToast.show("Add functionality - To be implemented");
        },

        onEditPress: function() {
            MessageToast.show("Edit functionality - To be implemented");
        },

        onDeletePress: function() {
            MessageToast.show("Delete functionality - To be implemented");
        },

        onSaveButtonPress: function() {
            MessageToast.show("Save functionality - To be implemented");
        },

        onCancelButtonPress: function() {
            MessageToast.show("Cancel functionality - To be implemented");
        },

        _updateButtonStates: function(bHasSelection) {
            // Update button states based on selection
            const aButtonIds = [
                // Master Data Management
                "btnEdit_cus", "btnDelete_cus",
                "btnEdit_oppr", "btnDelete_oppr", 
                "btnEdit_proj", "btnDelete_proj",
                "btnEdit_emp", "Delete_emp",
                "btnEdit_assign", "btnDelete_assign",
                "btnEdit_status", "btnDelete_status",
                // Master Data Setup
                "btnEdit_vertical", "btnDelete_vertical",
                "btnEdit_projtype", "btnDelete_projtype",
                "btnEdit_businesstype", "btnDelete_businesstype",
                "btnEdit_skill", "btnDelete_skill"
            ];
            
            aButtonIds.forEach(sButtonId => {
                const oButton = this.byId(sButtonId);
                if (oButton) {
                    oButton.setEnabled(bHasSelection);
                }
            });
        },

        // ============================================
        // BUSINESS ACTIONS
        // ============================================
        
        onStartAssignment: function() {
            MessageToast.show("Start Assignment functionality - To be implemented");
        },

        onCloseAssignment: function() {
            MessageToast.show("Close Assignment functionality - To be implemented");
        },

        // Include all methods from CustomUtility
        initializeTable: CustomUtility.prototype.initializeTable,
        _getPersonsBinding: CustomUtility.prototype._getPersonsBinding,
        _getSelectedContexts: CustomUtility.prototype._getSelectedContexts,
        _updateSelectionState: CustomUtility.prototype._updateSelectionState,
        _updatePendingState: CustomUtility.prototype._updatePendingState,
        _openPersonDialog: CustomUtility.prototype._openPersonDialog,
        onInlineAccept: CustomUtility.prototype.onInlineAccept,
        onInlineCancel: CustomUtility.prototype.onInlineCancel,
        onSelectionChange: CustomUtility.prototype.onSelectionChange,
        onDeletePress: CustomUtility.prototype.onDeletePress,
        onEditPress: CustomUtility.prototype.onEditPress,
        onSaveButtonPress: CustomUtility.prototype.onSaveButtonPress,
        onCancelButtonPress: CustomUtility.prototype.onCancelButtonPress,
        onAdd: CustomUtility.prototype.onAdd,
        onCSVExport: CustomUtility.prototype.onCSVExport,
        onTemplateDownload: CustomUtility.prototype.onTemplateDownload,
        _createEmptyRowData: CustomUtility.prototype._createEmptyRowData,
        _executeAddWithRetry: CustomUtility.prototype._executeAddWithRetry,
        _resolveContextByPath: CustomUtility.prototype._resolveContextByPath,
        _getRowBinding: CustomUtility.prototype._getRowBinding,
        testCancelDirect: CustomUtility.prototype.testCancelDirect 
    });
});