sap.ui.define([
    "sap/ui/mdc/odata/v4/TableDelegate",
    "sap/ui/model/Sorter",
    "sap/ui/mdc/FilterField",
    "sap/ui/mdc/Field",
    "sap/ui/mdc/library",
    "sap/m/HBox",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem"
], function (ODataTableDelegate, Sorter, FilterField, Field, mdcLibrary, HBox, Button, mLibrary, ComboBox, Item,
    SelectDialog, StandardListItem) {
    "use strict";

    const GenericTableDelegate = Object.assign({}, ODataTableDelegate);

    // ✅ ENUM CONFIGURATION: Static values for enum fields
    GenericTableDelegate._getEnumConfig = function(sTableId, sPropertyName) {
        const mEnumFields = {
            "Customers": {
                "status": { values: ["A", "I", "P"], labels: ["Active", "Inactive", "Prospect"] },
                "vertical": { 
                    values: ["BFS", "CapitalMarkets", "CPG", "Healthcare", "HighTech", "Insurance", "LifeSciences", "Manufacturing", "Retail", "Services"],
                    labels: ["BFS", "Capital Markets", "CPG", "Healthcare", "High Tech", "Insurance", "Life Sciences", "Manufacturing", "Retail", "Services"]
                }
            },
            "Opportunities": {
                "probability": { 
                    values: ["ProposalStage", "SoWSent", "SoWSigned", "PurchaseOrderReceived"],
                    labels: ["0%", "33%", "85%", "100%"]
                },
                "Stage": { 
                    values: ["Discover", "Define", "OnBid", "DownSelect", "SignedDeal"],
                    labels: ["Discover", "Define", "On Bid", "Down Select", "Signed Deal"]
                }
            },
            "Projects": {
                "projectType": { 
                    values: ["FixedPrice", "TransactionBased", "FixedMonthly", "PassThru", "Divine"],
                    labels: ["Fixed Price", "Transaction Based", "Fixed Monthly", "Pass Thru", "Divine"]
                },
                "status": { 
                    values: ["Active", "Closed", "Planned"],
                    labels: ["Active", "Closed", "Planned"]
                },
                "SOWReceived": { 
                    values: ["Yes", "No"],
                    labels: ["Yes", "No"]
                },
                "POReceived": { 
                    values: ["Yes", "No"],
                    labels: ["Yes", "No"]
                }
            },
            "Employees": {
                "gender": { 
                    values: ["Male", "Female", "Others"],
                    labels: ["Male", "Female", "Others"]
                },
                "employeeType": { 
                    values: ["FullTime", "SubCon", "Intern", "YTJ"],
                    labels: ["Full Time", "Subcon", "Intern", "Yet To Join"]
                },
                "band": { 
                    values: ["Band1", "Band2", "Band3", "Band4A_1", "Band4A_2", "Band4B_C", "Band4B_LC", "Band4C", "Band4D", "Band5A", "Band5B"],
                    labels: ["Senior Vice President", "Vice President", "Assistant Vice President", "Consultant", "Management Trainee", "Assistant Manager/Consultant", "Assistant Manager/ Lead Consultant", "Manager/Principal Consultant/Project Manager", "Senior Manager/Senior Principal Consultant/Senior Project Manager", "Process Associate", "Senior Associate/Technical Associate"]
                },
                "status": { 
                    values: ["PreAllocated", "Bench", "Resigned", "Allocated"],
                    labels: ["Pre Allocated", "Bench", "Resigned", "Allocated"]
                }
            },
            "Allocations": {
                "status": { 
                    values: ["Active", "Completed", "Cancelled"],
                    labels: ["Active", "Completed", "Cancelled"]
                }
            }
        };
        return mEnumFields[sTableId]?.[sPropertyName] || null;
    };

    // ✅ ASSOCIATION DETECTION: Dynamic detection from OData metadata
    GenericTableDelegate._detectAssociation = function(oTable, sPropertyName) {
        const oModel = oTable.getModel();
        if (!oModel || !oModel.getMetaModel) {
            return Promise.resolve(null);
        }

        const sTableId = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Employees";
        
        const mAssociationFields = {
            "Customers": {
                // No associations in Customers table (vertical is enum, not association)
            },
            "Opportunities": {
                "customerId": { 
                    targetEntity: "Customers", 
                    displayField: "customerName", 
                    keyField: "SAPcustId",
                    displayFormat: "{customerName} ({SAPcustId})",
                    label: "Customer"
                }
            },
            "Projects": {
                "oppId": { 
                    targetEntity: "Opportunities", 
                    displayField: "opportunityName", 
                    keyField: "sapOpportunityId",
                    displayFormat: "{opportunityName} (Opp ID: {sapOpportunityId})",
                    label: "Opportunity"
                }
            },
            "Demands": {
                "skillId": { 
                    targetEntity: "Skills", 
                    displayField: "name", 
                    keyField: "id",
                    displayFormat: "{name}",
                    label: "Skill"
                },
                "sapPId": { 
                    targetEntity: "Projects", 
                    displayField: "projectName", 
                    keyField: "sapPId",
                    displayFormat: "{projectName} (Proj ID: {sapPId})",
                    label: "Project"
                }
            },
            "Employees": {
                "supervisorOHR": { 
                    targetEntity: "Employees", 
                    displayField: "fullName", 
                    keyField: "ohrId",
                    displayFormat: "{fullName} (OHR: {ohrId})",
                    label: "Supervisor"
                }
            },
            "EmployeeSkills": {
                "employeeId": { 
                    targetEntity: "Employees", 
                    displayField: "fullName", 
                    keyField: "ohrId",
                    displayFormat: "{fullName} (OHR: {ohrId})",
                    label: "Employee"
                },
                "skillId": { 
                    targetEntity: "Skills", 
                    displayField: "name", 
                    keyField: "id",
                    displayFormat: "{name}",
                    label: "Skill"
                }
            },
            "Allocations": {
                "employeeId": { 
                    targetEntity: "Employees", 
                    displayField: "fullName", 
                    keyField: "ohrId",
                    displayFormat: "{fullName} (OHR: {ohrId})",
                    label: "Employee"
                },
                "projectId": { 
                    targetEntity: "Projects", 
                    displayField: "projectName", 
                    keyField: "sapPId",
                    displayFormat: "{projectName} (Proj ID: {sapPId})",
                    label: "Project"
                }
            }
        };

        const oAssocConfig = mAssociationFields[sTableId]?.[sPropertyName];
        return Promise.resolve(oAssocConfig || null);
    };

    // Ensure Table advertises support for all desired p13n panels
    GenericTableDelegate.getSupportedP13nModes = function () {
        return ["Column", "Sort", "Filter", "Group"];
    };

    GenericTableDelegate.fetchProperties = function (oTable) {
        console.log("=== [GenericDelegate] fetchProperties called ===");

        const oModel = oTable.getModel();
        if (!oModel) {
            console.error("[GenericDelegate] No model found on table");
            return Promise.resolve([]);
        }

        const oMetaModel = oModel.getMetaModel();
        console.log("[GenericDelegate] MetaModel:", oMetaModel);

        // Get collection path from payload
        const sCollectionPath = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Customers";
        console.log("[GenericDelegate] Collection Path:", sCollectionPath);

        // Wait for metadata to be loaded
        return oMetaModel.requestObject(`/${sCollectionPath}/$Type`)
            .then(function (sEntityTypePath) {
                console.log("[GenericDelegate] Entity Type Path:", sEntityTypePath);

                // Request the entity type definition
                return oMetaModel.requestObject(`/${sEntityTypePath}/`);
            })
            .then(function (oEntityType) {
                console.log("[GenericDelegate] Entity Type loaded:", oEntityType);

                const aProperties = [];

                // Iterate through entity type properties
                Object.keys(oEntityType).forEach(function (sPropertyName) {
                    // Skip metadata properties that start with $
                    if (sPropertyName.startsWith("$")) {
                        return;
                    }

                    const oProperty = oEntityType[sPropertyName];
                    console.log("[GenericDelegate] Processing property:", sPropertyName, oProperty);

                    // Check if it's a property (not a navigation property)
                    if (oProperty.$kind === "Property" || !oProperty.$kind) {
                        const sType = oProperty.$Type || "Edm.String";

                        // Include all necessary attributes for sorting/filtering
                        aProperties.push({
                            name: sPropertyName,
                            path: sPropertyName,
                            label: sPropertyName,
                            dataType: sType,
                            sortable: true,
                            filterable: true,
                            groupable: true,
                            maxConditions: -1,
                            caseSensitive: sType === "Edm.String" ? false : undefined
                        });
                    }
                });

                console.log("[GenericDelegate] Final properties array:", aProperties);
                return aProperties;
            })
            .catch(function (oError) {
                console.error("[GenericDelegate] Error fetching properties:", oError);
                console.log("[GenericDelegate] Using fallback properties for", sCollectionPath);

                // Fallback properties for Opportunities
                const mFallbackProperties = {
                    "Opportunities": [
                        { name: "sapOpportunityId", path: "sapOpportunityId", label: "SAP Opportunity ID", dataType: "Edm.Int32", sortable: true, filterable: true, groupable: true },
                        { name: "sfdcOpportunityId", path: "sfdcOpportunityId", label: "SFDC Opportunity ID", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "probability", path: "probability", label: "Probability", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "salesSPOC", path: "salesSPOC", label: "Sales SPOC", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "deliverySPOC", path: "deliverySPOC", label: "Delivery SPOC", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "expectedStart", path: "expectedStart", label: "Expected Start", dataType: "Edm.Date", sortable: true, filterable: true, groupable: true },
                        { name: "expectedEnd", path: "expectedEnd", label: "Expected End", dataType: "Edm.Date", sortable: true, filterable: true, groupable: true },
                        { name: "customerId", path: "customerId", label: "Customer ID", dataType: "Edm.Int32", sortable: true, filterable: true, groupable: true }
                    ]
                };

                return mFallbackProperties[sCollectionPath] || [];
            });
    };

    GenericTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        ODataTableDelegate.updateBindingInfo.apply(this, arguments);

        const sPath = oTable.getPayload()?.collectionPath || "Customers";
        oBindingInfo.path = "/" + sPath;

        // Essential OData V4 parameters
        oBindingInfo.parameters = Object.assign(oBindingInfo.parameters || {}, {
            $count: true
        });

        console.log("[GenericDelegate] updateBindingInfo - path:", sPath, "bindingInfo:", oBindingInfo);
        console.log("[GenericDelegate] Table payload:", oTable.getPayload());
    };

    GenericTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
        console.log("[GenericDelegate] addItem called for property:", sPropertyName);

        return this.fetchProperties(oTable).then(function (aProperties) {
            const oProperty = aProperties.find(function (p) {
                return p.name === sPropertyName || p.path === sPropertyName;
            });

            if (!oProperty) {
                console.error("[GenericDelegate] Property not found:", sPropertyName);
                return Promise.reject("Property not found: " + sPropertyName);
            }

            // Format label
            // const sLabel = sPropertyName
            //     // .replace(/([A-Z])/g, ' $1')
            //     .replace(/([a-z])([A-Z])/g, '$1 $2')
            //     .replace(/^./, function(str) { return str.toUpperCase(); })
            //     .trim();
            // Custom header mapping for Employees table
            const mCustomHeaders = {
                "ohrId": "OHR ID",
                "mailid": "Email ID",
                "fullName": "Full Name",
                "gender": "Gender",
                "dob": "DOB",                    // Optional if you later add a DOB field
                "employeeType": "Employee Type",
                "doj": "DOJ",
                "band": "Band",
                "role": "Designation",
                "location": "Location",
                "skills": "Skill Details",
                "city": "City",
                "lwd": "LWD",
                "supervisorOHR": "Supervisor Name",  // ✅ FIXED: Use proper name from association config
                "status": "Status",
                "skillCategory": "Skill Category", // Optional future field
                "experience": "Experience"         // Optional future field
            };

            // Smart header generation with better fallback
            let sLabel;
            let sTooltip;

            if (mCustomHeaders[sPropertyName]) {
                // Use custom header if available
                sLabel = mCustomHeaders[sPropertyName];
                sTooltip = sLabel; // Same as label
            } else {
                // Smart fallback for any new or unmapped fields
                sLabel = sPropertyName
                    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // "SAPId" → "SAP Id"
                    .replace(/([a-z])([A-Z])/g, '$1 $2')         // "customerName" → "Customer Name"
                    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')    // "OHRId" → "OHR Id"
                    .replace(/^./, str => str.toUpperCase())     // Capitalize first letter
                    .trim();

                sTooltip = `${sLabel} (Field: ${sPropertyName})`;

                console.log(`[EmployeeTableDelegate] New field detected: "${sPropertyName}" → "${sLabel}"`);
            }

            oProperty.label = sLabel;
            oProperty.tooltip = sTooltip;


            // Load the Column module and create column
            return new Promise(function (resolve) {
                sap.ui.require(["sap/ui/mdc/table/Column"], function (Column) {
                    const sTableId = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Employees";
                    
                    const oEnumConfig = GenericTableDelegate._getEnumConfig(sTableId, sPropertyName);
                    const bIsEnum = !!oEnumConfig;
                    const oAssocPromise = GenericTableDelegate._detectAssociation(oTable, sPropertyName);
                    
                    const fnEditModeFormatter = function (sPath) {
                        var rowPath = this.getBindingContext() && this.getBindingContext().getPath();
                        if (sPath && sPath.includes(",")) {
                            const aEditingPaths = sPath.split(",");
                            return aEditingPaths.includes(rowPath) ? "Editable" : "Display";
                        }
                        return sPath === rowPath ? "Editable" : "Display";
                    };

                    const oEditableBinding = {
                        parts: [{ path: `edit>/${sTableId}/editingPath` }],
                        mode: "TwoWay",
                        formatter: function (sPath) {
                            var rowPath = this.getBindingContext() && this.getBindingContext().getPath();
                            if (sPath && sPath.includes(",")) {
                                const aEditingPaths = sPath.split(",");
                                return aEditingPaths.includes(rowPath);
                            }
                            return sPath === rowPath;
                        }
                    };

                    oAssocPromise.then(function(oAssocConfig) {
                        const bIsAssoc = !!oAssocConfig;
                        let oField;

                        if (bIsEnum) {
                            const aItems = oEnumConfig.values.map(function(sVal, iIndex) {
                                return new Item({
                                    key: sVal,
                                    text: oEnumConfig.labels[iIndex] || sVal
                                });
                            });
                            const oComboBox = new ComboBox({
                                value: "{" + sPropertyName + "}",
                                selectedKey: "{" + sPropertyName + "}",
                                items: aItems,
                                editable: oEditableBinding
                            });
                            oField = new Field({
                                value: "{" + sPropertyName + "}",
                                contentEdit: oComboBox,
                                editMode: {
                                    parts: [{ path: `edit>/${sTableId}/editingPath` }],
                                    mode: "TwoWay",
                                    formatter: fnEditModeFormatter
                                }
                            });
                            console.log("[GenericDelegate] Enum field detected:", sPropertyName, "→ ComboBox");
                        } else if (bIsAssoc) {
                            // ✅ ASSOCIATION: MDC ValueHelp (enterprise-grade for large datasets)
                            const oModel = oTable.getModel();
                            const sCollectionPath = "/" + oAssocConfig.targetEntity;
                            const sLabel = oAssocConfig.label || oAssocConfig.displayField;
                            const sKeyField = oAssocConfig.keyField;
                            const sDisplayField = oAssocConfig.displayField;
                            
                            // Create Input with Value Help button (SHOWS ICON AUTOMATICALLY)
                            const oInput = new Input({
                                value: "{" + sPropertyName + "}",
                                editable: oEditableBinding,
                                placeholder: "Click to select " + sLabel,
                                showValueHelp: true, // ✅ THIS SHOWS THE VALUE HELP ICON
                                valueHelpRequest: function() {
                                    // Create SelectDialog if it doesn't exist (reuse it)
                                    if (!oInput._oSelectDialog) {
                                        const oSelectDialog = new SelectDialog({
                                            title: "Select " + sLabel,
                                            noDataText: "No data available",
                                            growingThreshold: 50,
                                            items: {
                                                path: sCollectionPath,
                                                template: new StandardListItem({
                                                    title: "{" + sDisplayField + "}",
                                                    description: "{" + sKeyField + "}",
                                                    type: "Active"
                                                })
                                            },
                                            confirm: function(oEvent) {
                                                // ✅ CRITICAL FIX: Get row context using resolved path from binding
                                                let oRowContext = null;
                                                const oModel = oInput.getModel();
                                                
                                                if (!oModel) {
                                                    console.error("[ValueHelp] No model found on Input");
                                                    sap.m.MessageBox.error("Unable to update field - model not found.");
                                                    return;
                                                }
                                                
                                                const oInputBinding = oInput.getBinding("value");
                                                if (oInputBinding && oInputBinding.getResolvedPath) {
                                                    try {
                                                        const sResolvedPath = oInputBinding.getResolvedPath();
                                                        if (sResolvedPath) {
                                                            const sRowPath = sResolvedPath.substring(0, sResolvedPath.lastIndexOf("/" + sPropertyName));
                                                            if (sRowPath) {
                                                                oRowContext = oModel.getContext(sRowPath);
                                                            }
                                                        }
                                                    } catch (e) {
                                                        console.warn("[ValueHelp] Error getting resolved path:", e);
                                                    }
                                                }
                                                
                                                if (!oRowContext) {
                                                    const oParent = oInput.getParent();
                                                    if (oParent instanceof Field) {
                                                        const oFieldBinding = oParent.getBinding("value");
                                                        if (oFieldBinding && oFieldBinding.getResolvedPath) {
                                                            try {
                                                                const sResolvedPath = oFieldBinding.getResolvedPath();
                                                                if (sResolvedPath) {
                                                                    const sRowPath = sResolvedPath.substring(0, sResolvedPath.lastIndexOf("/" + sPropertyName));
                                                                    if (sRowPath) {
                                                                        oRowContext = oModel.getContext(sRowPath);
                                                                    }
                                                                }
                                                            } catch (e) {
                                                                console.warn("[ValueHelp] Error getting Field resolved path:", e);
                                                            }
                                                        }
                                                    }
                                                }
                                                
                                                if (!oRowContext && oInputBinding) {
                                                    oRowContext = oInputBinding.getContext();
                                                }
                                                
                                                if (!oRowContext) {
                                                    let oCurrent = oInput;
                                                    while (oCurrent) {
                                                        oRowContext = oCurrent.getBindingContext();
                                                        if (oRowContext) break;
                                                        oCurrent = oCurrent.getParent();
                                                    }
                                                }
                                                
                                                if (!oRowContext) {
                                                    console.error("[ValueHelp] Could not find row context for", sPropertyName);
                                                    sap.m.MessageBox.error("Unable to update field - row context not found. Check console for details.");
                                                    return;
                                                }
                                                
                                                const aSelectedItems = oEvent.getParameter("selectedItems");
                                                if (aSelectedItems && aSelectedItems.length > 0) {
                                                    const oSelectedItem = aSelectedItems[0];
                                                    const oSelectedContext = oSelectedItem.getBindingContext();
                                                    if (oSelectedContext) {
                                                        const oData = oSelectedContext.getObject();
                                                        const sKey = oData[sKeyField];
                                                        const sDisplay = oData[sDisplayField];
                                                        
                                                        oRowContext.setProperty(sPropertyName, sKey);
                                                        oInput.setValue(sDisplay);
                                                        console.log("[ValueHelp] ✅ Updated", sPropertyName, "=", sKey, "for row", oRowContext.getPath());
                                                    }
                                                }
                                            }
                                        });
                                        
                                        oSelectDialog.setModel(oModel);
                                        
                                        const oView = oTable.getParent()?.getParent() || 
                                                     (sap.ui.getCore().byId("__component0") && sap.ui.getCore().byId("__component0").getRootControl());
                                        if (oView) {
                                            oView.addDependent(oSelectDialog);
                                        }
                                        
                                        oInput._oSelectDialog = oSelectDialog;
                                    }
                                    
                                    oInput._oSelectDialog.open();
                                }
                            });
                            
                            oField = new Field({
                                value: "{" + sPropertyName + "}",
                                contentEdit: oInput,
                                editMode: {
                                    parts: [{ path: `edit>/${sTableId}/editingPath` }],
                                    mode: "TwoWay",
                                    formatter: fnEditModeFormatter
                                }
                            });
                            
                            console.log("[GenericDelegate] Association field detected:", sPropertyName, "→ Input + SelectDialog for", oAssocConfig.targetEntity);
                        } else {
                            oField = new Field({
                                value: "{" + sPropertyName + "}",
                                tooltip: "{" + sPropertyName + "}",
                                editMode: {
                                    parts: [{ path: `edit>/${sTableId}/editingPath` }],
                                    mode: "TwoWay",
                                    formatter: fnEditModeFormatter
                                }
                            });
                        }

                        const oColumn = new Column({
                            id: oTable.getId() + "--col-" + sPropertyName,
                            dataProperty: sPropertyName,
                            propertyKey: sPropertyName,
                            header: sLabel,
                            template: oField
                        });

                        console.log("[GenericDelegate] Column created via addItem:", sPropertyName);
                        resolve(oColumn);
                    }).catch(function(oError) {
                        console.warn("[GenericDelegate] Error, using regular field:", oError);
                        const oField = new Field({
                            value: "{" + sPropertyName + "}",
                            tooltip: "{" + sPropertyName + "}",
                            editMode: {
                                parts: [{ path: `edit>/${sTableId}/editingPath` }],
                                mode: "TwoWay",
                                formatter: fnEditModeFormatter
                            }
                        });
                        const oColumn = new Column({
                            id: oTable.getId() + "--col-" + sPropertyName,
                            dataProperty: sPropertyName,
                            propertyKey: sPropertyName,
                            header: sLabel,
                            template: oField
                        });
                        resolve(oColumn);
                    });
                });
            });
        });
    };

    GenericTableDelegate.removeItem = function (oTable, oColumn, mPropertyBag) {
        console.log("[GenericDelegate] removeItem called for column:", oColumn);

        if (oColumn) {
            oColumn.destroy();
        }

        return Promise.resolve(true);
    };

    // Provide FilterField creation for Adaptation Filter panel in table p13n
    GenericTableDelegate.getFilterDelegate = function () {
        return {
            addItem: function (vArg1, vArg2, vArg3) {
                // Normalize signature: MDC may call (oTable, vProperty, mBag) or (vProperty, oTable, mBag)
                var oTable = (vArg1 && typeof vArg1.isA === "function" && vArg1.isA("sap.ui.mdc.Table")) ? vArg1 : vArg2;
                var vProperty = (oTable === vArg1) ? vArg2 : vArg1;
                var mPropertyBag = vArg3;

                // Resolve property name from string, property object, or mPropertyBag
                const sName =
                    (typeof vProperty === "string" && vProperty) ||
                    (vProperty && (vProperty.name || vProperty.path || vProperty.key)) ||
                    (mPropertyBag && (mPropertyBag.name || mPropertyBag.propertyKey)) ||
                    (mPropertyBag && mPropertyBag.property && (mPropertyBag.property.name || mPropertyBag.property.path || mPropertyBag.property.key));
                if (!sName) {
                    return Promise.reject("Invalid property for filter item");
                }

                let sDataType = "sap.ui.model.type.String";
                try {
                    const oModel = oTable.getModel();
                    const oMetaModel = oModel && oModel.getMetaModel && oModel.getMetaModel();
                    if (oMetaModel) {
                        const sCollectionPath = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Customers";
                        const oProp = oMetaModel.getObject(`/${sCollectionPath}/${sName}`);
                        const sEdmType = oProp && oProp.$Type;
                        if (sEdmType === "Edm.Int16" || sEdmType === "Edm.Int32" || sEdmType === "Edm.Int64" || sEdmType === "Edm.Decimal") {
                            sDataType = "sap.ui.model.type.Integer";
                        } else if (sEdmType === "Edm.Boolean") {
                            sDataType = "sap.ui.model.type.Boolean";
                        } else if (sEdmType === "Edm.Date" || sEdmType === "Edm.DateTimeOffset") {
                            sDataType = "sap.ui.model.type.Date";
                        }
                    }
                } catch (e) { /* ignore */ }

                return Promise.resolve(new FilterField({
                    label: String(sName)
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function (str) { return str.toUpperCase(); })
                        .trim(),
                    propertyKey: sName,
                    conditions: "{$filters>/conditions/" + sName + "}",
                    dataType: sDataType
                }));
            }
        };
    };

    return GenericTableDelegate;
});