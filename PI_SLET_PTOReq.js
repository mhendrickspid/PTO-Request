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
		
		var frmPTO = nlapiCreateForm('Request Time Off', false); // create form
		var userId = nlapiGetUser(); // get user id
		var supId = nlapiLookupField('employee', userId, 'supervisor'); // get the user supervisor id
		var subId = nlapiLookupField('employee', userId, 'subsidiary');
		var dptId = nlapiLookupField('employee', userId, 'department');
		var intHrs = parseFloat(nlapiLookupField('employee', userId, 'custentity_pi_pto_hrs')); // update iD
		
		// add form fields
		var fldEmployee = frmPTO.addField('custpage_emp', 'select', 'Employee', 'employee');
		var fldSupervisor = frmPTO.addField('custpage_supervisor', 'select', 'Supervisor', 'employee');
		var fldSubsidiary = frmPTO.addField('custpage_subsidiary', 'select', 'Subsidiary', 'subsidiary');
		var fldDepartment = frmPTO.addField('custpage_department', 'select', 'Department', 'department');
		var fldUserHours = frmPTO.addField('custpage_userhours', 'float', 'Available PTO Hours');
		var fldOpenCount = frmPTO.addField('custpage_opencount', 'integer', 'Open Requests');
		var fldNote = frmPTO.addField('custpage_note', 'textarea', 'Note');
		// add select options to payroll item type
		
		// set field defaults & display types
		if (searchResults.length > 0) {
			fldOpenCount.setDefaultValue(searchResults.length);
		} else {
			fldOpenCount.setDefaultValue(0);
		}
		
		fldOpenCount.setDisplayType('inline');
		fldEmployee.setDefaultValue(userId);
		fldEmployee.setDisplayType('inline');
		fldSupervisor.setDefaultValue(supId);
		fldSupervisor.setDisplayType('inline');
		fldSubsidiary.setDefaultValue(subId);
		fldSubsidiary.setDisplayType('inline');
		fldDepartment.setDefaultValue(dptId);
		fldDepartment.setDisplayType('inline');
		fldUserHours.setDisplayType('inline');
		fldUserHours.setDefaultValue(intHrs);
		fldNote.setDefaultValue('Please adjust the hours field and subtract 8 for each weekend or holiday');
		fldNote.setDisplayType('inline');
		fldNote.setLayoutType('outsidebelow');
		
		// add sublist & columns
		var slPTO = frmPTO.addSubList('custpage_timelist', 'inlineeditor', 'Time Off');
		var colStartDate = slPTO.addField('custlist_start', 'date', 'Start:').setMandatory(true);
		var colEndDate = slPTO.addField('custlist_end', 'date', 'End:').setMandatory(true);
		var colHrs = slPTO.addField('custlist_hours', 'float', 'Hours').setMandatory(true);
		var colTimeItem = slPTO.addField('custlist_timeitem', 'select', 'Time Item', 'customlist_pi_time_items').setMandatory(true);
		var colDescription = slPTO.addField('custlist_description', 'textarea', 'Description').setMandatory(true);
		
		frmPTO.addSubmitButton('Submit Request');
		
		// set client script to auto calculate hours
		frmPTO.setScript('customscript_pi_cs_timeoff');
		response.writePage(frmPTO);		
		
	} else if (request.getMethod() == 'POST') {//test
		// Get Main Fields
		var stEmployeeId = request.getParameter('custpage_emp');
		var stSupervisor = request.getParameter('custpage_supervisor');
		var stSubsidiary = request.getParameter('custpage_subsidiary');
		var stDepartment = request.getParameter('custpage_department');
		
		// create custom records		
		var timeListCount = request.getLineItemCount('custpage_timelist');
		
		if (timeListCount > 0) {
		
			for (var i = 1; i <= timeListCount; i++) {
				
				// Get Field values from each line item
				var dteStart = request.getLineItemValue('custpage_timelist', 'custlist_from', i);
				var dteEnd = request.getLineItemValue('custpage_timelist', 'custlist_start', i);
				var stHours = request.getLineItemValue('custpage_timelist', 'custlist_hours', i);
				var stTimeItem = request.getLineItemValue('custpage_timelist', 'custlist_timeitem', i);
				var stDescription = request.getLineItemValue('custpage_timelist', 'custlist_description', i);
				
				// Create Custom record
				var recTimeReq = nlapiCreateRecord('customrecord_pi_pto_request');
				
				// some Generate the pto request record & populate fields
				recTimeReq.setFieldValue('custrecord_employee', stEmployeeId);
				recTimeReq.setFieldValue('custrecord_supervisor', stSupervisor);
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
