sap.ui.define([
    "sap/ui/mdc/odata/v4/TableDelegate",
    "sap/ui/model/Sorter",
    "sap/ui/mdc/FilterField",
    "sap/ui/mdc/Field",
    "sap/ui/mdc/library",
    "sap/m/HBox",
    "sap/m/Button",
    "sap/m/library"
], function (ODataTableDelegate, Sorter, FilterField, Field, mdcLibrary, HBox, Button, mLibrary) {
    "use strict";

    const GenericTableDelegate = Object.assign({}, ODataTableDelegate);

    GenericTableDelegate.getSupportedP13nModes = function() {
        return ["Column", "Sort", "Filter", "Group"];
    };

    GenericTableDelegate.fetchProperties = function (oTable) {
        const oModel = oTable.getModel();
        if (!oModel) {
            return Promise.resolve([]);
        }

        const oMetaModel = oModel.getMetaModel();
        const sCollectionPath = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Verticals";

        return oMetaModel.requestObject(`/${sCollectionPath}/$Type`)
            .then(function (sEntityTypePath) {
                return oMetaModel.requestObject(`/${sEntityTypePath}/`);
            })
            .then(function (oEntityType) {
                const aProperties = [];
                Object.keys(oEntityType).forEach(function (sPropertyName) {
                    if (sPropertyName.startsWith("$")) {
                        return;
                    }
                    const oProperty = oEntityType[sPropertyName];
                    if (oProperty.$kind === "Property" || !oProperty.$kind) {
                        const sType = oProperty.$Type || "Edm.String";
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
                return aProperties;
            })
            .catch(function (oError) {
                const mFallbackProperties = {
                    "Verticals": [
                        { name: "verticalId", path: "verticalId", label: "Vertical ID", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "verticalName", path: "verticalName", label: "Vertical Name", dataType: "Edm.String", sortable: true, filterable: true, groupable: true },
                        { name: "description", path: "description", label: "Description", dataType: "Edm.String", sortable: true, filterable: true, groupable: true }
                    ]
                };
                return mFallbackProperties[sCollectionPath] || [];
            });
    };

    GenericTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        ODataTableDelegate.updateBindingInfo.apply(this, arguments);
        const sPath = oTable.getPayload()?.collectionPath || "Verticals";
        oBindingInfo.path = "/" + sPath;
        oBindingInfo.parameters = Object.assign(oBindingInfo.parameters || {}, {
            $count: true
        });
    };

    GenericTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
        return this.fetchProperties(oTable).then(function (aProperties) {
            const oProperty = aProperties.find(function (p) {
                return p.name === sPropertyName || p.path === sPropertyName;
            });
            if (!oProperty) {
                return Promise.reject("Property not found: " + sPropertyName);
            }
            const sLabel = sPropertyName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, function(str) { return str.toUpperCase(); })
                .trim();
            return new Promise(function (resolve) {
                sap.ui.require(["sap/ui/mdc/table/Column"], function (Column) {
                    const oField = new Field({
                        value: "{" + sPropertyName + "}",
                        editMode: {
                            parts: [{ path: 'edit>/editingPath' }],
                            mode:"TwoWay",
                            formatter: function (sPath) {
                                var rowPath = this.getBindingContext() && this.getBindingContext().getPath();
                                if (sPath && sPath.includes(",")) {
                                    const aEditingPaths = sPath.split(",");
                                    const bIsEditable = aEditingPaths.includes(rowPath);
                                    return bIsEditable ? "Editable" : "Display";
                                } else {
                                    const bIsEditable = sPath === rowPath;
                                    return bIsEditable ? "Editable" : "Display";
                                }
                            }
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
    };

    GenericTableDelegate.removeItem = function (oTable, oColumn, mPropertyBag) {
        if (oColumn) {
            oColumn.destroy();
        }
        return Promise.resolve(true);
    };

    GenericTableDelegate.getFilterDelegate = function() {
        return {
            addItem: function(vArg1, vArg2, vArg3) {
                var oTable = (vArg1 && typeof vArg1.isA === "function" && vArg1.isA("sap.ui.mdc.Table")) ? vArg1 : vArg2;
                var vProperty = (oTable === vArg1) ? vArg2 : vArg1;
                var mPropertyBag = vArg3;
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
                        const sCollectionPath = oTable.getPayload()?.collectionPath?.replace(/^\//, "") || "Verticals";
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
                        .replace(/^./, function(str) { return str.toUpperCase(); })
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