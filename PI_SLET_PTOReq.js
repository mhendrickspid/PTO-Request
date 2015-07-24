/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jul 2015     mhendricks
 *
 */
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function ptoRequest(request, response) {
    if (request.getMethod() == 'GET') {

        //Search existing
        var searchResults = nlapiSearchRecord('customrecord_pi_pto_request', 'customsearch_pi_mypendingrequests');

        //search time items for employees to populate line item list


        var frmPTO = nlapiCreateForm('Request Time Off', false), // create form
            userId = nlapiGetUser(), // get user id
            approverId = nlapiLookupField('employee', userId, 'timeapprover'),
            supId = nlapiLookupField('employee', userId, 'supervisor'), // get the user supervisor id
            subId = nlapiLookupField('employee', userId, 'subsidiary'),
            dptId = nlapiLookupField('employee', userId, 'department'),
            intHrs = parseFloat(nlapiLookupField('employee', userId, 'custentity_pi_pto_hrs')); // update iD

        var filters = [
            new nlobjSearchFilter('custrecord_timeitem_subsidiary', null, 'noneof', 5)
        ];

        var filtersCA = [
            new nlobjSearchFilter('custrecord_timeitem_subsidiary', null, 'anyof', 5)
        ];

        var columns = [
            new nlobjSearchColumn('name'),
            new nlobjSearchColumn('internalid')
        ];
        if (supId == 5) {
            var timeSearch = nlapiSearchRecord('customrecord_pi_time_items', null, filtersCA, columns);
        } else {
            var timeSearch = nlapiSearchRecord('customrecord_pi_time_items', null, filters, columns);
        }
        // add form fields
        var fldEmployee = frmPTO.addField('custpage_emp', 'select', 'Employee', 'employee'),
            fldApprover = frmPTO.addField('custpage_approver', 'select', 'Approver', 'employee'),
            fldSubsidiary = frmPTO.addField('custpage_subsidiary', 'select', 'Subsidiary', 'subsidiary'),
            fldDepartment = frmPTO.addField('custpage_department', 'select', 'Department', 'department'),
            fldUserHours = frmPTO.addField('custpage_userhours', 'float', 'Available PTO Hours'),
            fldOpenCount = frmPTO.addField('custpage_opencount', 'integer', 'Open Requests'),
            fldNote = frmPTO.addField('custpage_note', 'textarea', 'Note');

        // add select options to payroll item type

        // set field defaults & display types

        if (searchResults != null && searchResults.length > 0) {
            fldOpenCount.setDefaultValue(searchResults.length);
        } else {
            fldOpenCount.setDefaultValue(0);
        }

        fldOpenCount.setDisplayType('inline');
        fldEmployee.setDefaultValue(userId);
        fldEmployee.setDisplayType('inline');

        if (approverId != null && approverId != '') {
            fldApprover.setDefaultValue(approverId);
        } else {
            fldApprover.setDefaultValue(supId);
        }

        fldApprover.setDisplayType('inline');
        fldSubsidiary.setDefaultValue(subId);
        fldSubsidiary.setDisplayType('inline');
        fldDepartment.setDefaultValue(dptId);
        fldDepartment.setDisplayType('inline');
        fldUserHours.setDisplayType('inline');
        fldUserHours.setDefaultValue(intHrs);
        fldNote.setDefaultValue('Please adjust the hours field and subtract hours for each weekend or holiday');
        fldNote.setDisplayType('inline');
        fldNote.setLayoutType('outsidebelow');

        // add sublist & columns
        var slPTO = frmPTO.addSubList('custpage_timelist', 'inlineeditor', 'Time Off'),
            colStartDate = slPTO.addField('custlist_start', 'date', 'Start:').setMandatory(true),
            colEndDate = slPTO.addField('custlist_end', 'date', 'End:').setMandatory(true),
            colHrs = slPTO.addField('custlist_hours', 'float', 'Hours').setMandatory(true),
            colTimeItem = slPTO.addField('custlist_timeitem', 'select', 'Time Item', null).setMandatory(true),
            colDescription = slPTO.addField('custlist_description', 'textarea', 'Description').setMandatory(true);
        
        colTimeItem.addSelectOption(null, '',true);

        frmPTO.addSubmitButton('Submit Request(s)');
        // loop through time item search and add select options to the time item field
        // displays different values if the employee is in a canadian subsidiary
        for (var x = 0; timeSearch != null && x < timeSearch.length; x++) {
            var timeresult = timeSearch[x];
            var stTimeId = timeresult.getValue('internalid');
            var stTimeName = timeresult.getValue('name');
            colTimeItem.addSelectOption(stTimeId, stTimeName);
        }

        // set client script to auto calculate hours
        frmPTO.setScript('customscript_pi_cs_timeoff');
        response.writePage(frmPTO);

    } else if (request.getMethod() == 'POST') {
        // Get Main Fields
        var stEmployeeId = request.getParameter('custpage_emp'),
            stApprover = request.getParameter('custpage_approver'),
            stSubsidiary = request.getParameter('custpage_subsidiary'),
            stDepartment = request.getParameter('custpage_department');

        // create custom records		
        var timeListCount = request.getLineItemCount('custpage_timelist');

        if (timeListCount > 0) {
            // Loop through line items and create time off records for each request
            for (var i = 1; i <= timeListCount; i++) {

                // Get Field values from each line item
                var dteStart = request.getLineItemValue('custpage_timelist', 'custlist_from', i),
                    dteEnd = request.getLineItemValue('custpage_timelist', 'custlist_start', i),
                    stHours = request.getLineItemValue('custpage_timelist', 'custlist_hours', i),
                    stTimeItem = request.getLineItemValue('custpage_timelist', 'custlist_timeitem', i),
                    stDescription = request.getLineItemValue('custpage_timelist', 'custlist_description', i);

                // Create Custom record
                var recTimeReq = nlapiCreateRecord('customrecord_pi_pto_request');

                // some Generate the time off request record & populate fields
                recTimeReq.setFieldValue('custrecord_employee', stEmployeeId);
                recTimeReq.setFieldValue('custrecord_approver', stApprover);
                recTimeReq.setFieldValue('custrecord_status', 1);
                recTimeReq.setFieldValue('custrecord_start', dteStart);
                recTimeReq.setFieldValue('custrecord_end', dteEnd);
                recTimeReq.setFieldValue('custrecord_hours', stHours);
                recTimeReq.setFieldValue('custrecord_description', stDescription);
                recTimeReq.setFieldValue('custrecord_time_item', stTimeItem);
                recTimeReq.setFieldValue('custrecord_subsidiary', stSubsidiary);
                recTimeReq.setFieldValue('custrecord_department', stDepartment);

                // Submit PTO Request Record
                nlapiSubmitRecord(recTimeReq);
            }
            // Redirect the user back to the suitelet page.
            nlapiSetRedirectURL('SUITELET', 'customscript_pi_slet_ptoreq', 'customdeploy_pi_slet_ptoreq');
        }
    }
}