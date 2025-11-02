sap.ui.define([
    "sap/ui/mdc/ValueHelpDelegate",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    ValueHelpDelegate,
    Filter,
    FilterOperator
) {
    "use strict";

    /**
     * ValueHelp Delegate for OData V4
     * Extends base ValueHelpDelegate to work with OData V4 services
     */
    const ODataV4ValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

    /**
     * Check if search is supported
     * @param {sap.ui.mdc.ValueHelp} oValueHelp The ValueHelp instance
     * @param {sap.ui.mdc.valuehelp.base.Content} oContent The content (typeahead or dialog)
     * @param {sap.ui.model.ListBinding} oListBinding The list binding
     * @returns {boolean} True if search is supported
     */
    ODataV4ValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
        const oPayload = oValueHelp.getPayload();
        return !!(oPayload && oPayload.searchKeys && oPayload.searchKeys.length > 0);
    };

    /**
     * Get filters for search functionality
     * @param {sap.ui.mdc.ValueHelp} oValueHelp The ValueHelp instance
     * @param {sap.ui.mdc.valuehelp.base.Content} oContent The content
     * @returns {sap.ui.model.Filter[]} Array of filters
     */
    ODataV4ValueHelpDelegate.getFilters = function (oValueHelp, oContent) {
        const aFilters = ValueHelpDelegate.getFilters.call(this, oValueHelp, oContent);
        
        const oPayload = oValueHelp.getPayload();
        if (oPayload && oPayload.searchKeys) {
            const sSearch = oContent.getSearch();
            if (sSearch) {
                // Create OR filters for search across multiple fields
                const aSearchFilters = oPayload.searchKeys.map(function(sPath) {
                    return new Filter({
                        path: sPath,
                        operator: FilterOperator.Contains,
                        value1: sSearch
                    });
                });
                
                if (aSearchFilters.length > 0) {
                    const oSearchFilter = new Filter(aSearchFilters, false); // false = OR
                    aFilters.push(oSearchFilter);
                }
            }
        }
        
        return aFilters;
    };

    /**
     * Update binding info for OData V4
     * @param {sap.ui.mdc.ValueHelp} oValueHelp The ValueHelp instance
     * @param {sap.ui.mdc.valuehelp.base.Content} oContent The content
     * @param {object} oBindingInfo The binding info object
     */
    ODataV4ValueHelpDelegate.updateBindingInfo = function (oValueHelp, oContent, oBindingInfo) {
        ValueHelpDelegate.updateBindingInfo.call(this, oValueHelp, oContent, oBindingInfo);
        
        const oPayload = oValueHelp.getPayload();
        if (oPayload) {
            // Set collection path from payload
            if (oPayload.collectionPath) {
                oBindingInfo.path = oPayload.collectionPath;
            }
            
            // Add $count for pagination
            if (!oBindingInfo.parameters) {
                oBindingInfo.parameters = {};
            }
            oBindingInfo.parameters.$count = true;
        }
    };

    return ODataV4ValueHelpDelegate;
});

