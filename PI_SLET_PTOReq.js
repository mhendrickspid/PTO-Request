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
		var frmPTO = nlapiCreateForm('Request Time Off', false); // create form
		var userId = nlapiGetUser(); // get user id
		var supId = nlapiLookupField('employee', userId, 'supervisor'); // get the user supervisor id
		
		// add form fields
		var fldEmployee = frmPTO.addField('custpage_emp', 'select', 'Employee', 'employee');
		var fldSupervisor = frmPTO.addField('custpage_supervisor', 'select', 'Supervisor', 'employee');
		var fldType = frmPTO.addField('custpage_type', 'select', 'Payroll Type', 'payrollitem').setMandatory(true);
		// add select options to payroll item type
		
		// set field defaults
		fldEmployee.setDefaultValue(userId);
		fldEmployee.setDisplayType('inline');
		fldSupervisor.setDefaultValue(supId);
		fldSupervisor.setDisplayType('inline');
		
		// add sublist & columns
		var slPTO = frmPTO.addSubList('custpage_timelist', 'inlineeditor', 'Time Off');
		var colStartDate = slPTO.addField('custlist_from', 'date', 'Date:').setMandatory(true);
		//var colEndDate = slPTO.addField('custlist_to', 'date', 'To:').setMandatory(true);
		var colHrs = slPTO.addField('custlist_hours', 'float', 'Hours').setMandatory(true);
		var colDescription = slPTO.addField('custlist_des', 'textarea', 'Description').setMandatory(true);
		
		frmPTO.addSubmitButton('Submit Request');
		
		response.writePage(frmPTO);		
		
	} else if (request.getMethod() == 'POST') {//test
		// create custom records		
		var timeListCount = request.getLineItemCount('custpage_timelist');
		
		for (var i = 1; i <= timeListCount; i++) {
			
			// Get Field values from each line item
			var dteStart = request.getLineItemValue('custpage_timelist', 'custlist_from', i);
			//var dteEnd = request.getLineItemValue('custpage_timelist', 'custlist_to', i);
			var stHours = request.getLineItemValue('custpage_timelist', 'custlist_hours', i);
			var stEmployeeId = request.getParameter('custpage_emp');
			var stSupervisor = request.getParameter('custpage_supervisor');
			var stPayrollId = request.getParameter('custpage_type');
			
			// Create Custom record
			var recTimeReq = nlapiCreateRecord('customrecord_pi_pto_request');
			
			// some Generate the pto request record & populate fields
			recTimeReq.setFieldValue('custrecord_employee', stEmployeeId);
			recTimeReq.setFieldValue('custrecord_supervisor', stSupervisor);
			recTimeReq.setFieldValue('custrecord_status', 1);
			recTimeReq.setFieldValue('custrecord_payroll_item', stPayrollId);
			recTimeReq.setFieldValue('custrecord_from', dteStart);
			//recTimeReq.setFieldValue('custrecord_to', dteEnd);
			recTimeReq.setFieldValue('custrecord_hours', stHours);
			
			// Submit PTO Request Record
			nlapiSubmitRecord(recTimeReq);
		}
		// Redirect the user back to the suitelet page.
		nlapiSetRedirectURL('SUITELET', 'customscript_pi_slet_ptoreq', 'customdeploy_pi_slet_ptoreq');
	}
}
