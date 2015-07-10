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
		var frmPTO = nlapiCreateForm('Request Time Off', false);
		var userId = nlapiGetUser();
		var supId = nlapiLookupField('employee', userId, 'supervisor');
		
		// add form fields
		var fldEmployee = frmPTO.addField('custpage_emp', 'select', 'Employee', 'employee');
		var fldSupervisor = frmPTO.addField('custpage_supervisor', 'select', 'Supervisor', 'employee');
		var fldType = frmPTO.addField('custpage_type', 'select', 'Payroll Type', 'payrollitem');
		
		// set field defaults
		fldEmployee.setDefaultValue(userId);
		fldEmployee.setDisplayType('inline');
		fldSupervisor.setDefaultValue(supId);
		fldSupervisor.setDisplayType('inline');
		
		// add sublist & columns
		var slPTO = frmPTO.addSubList('custpage_timelist', 'inlineeditor', 'Time Off');
		var colStartDate = slPTO.addField('custlist_from', 'date', 'From:').setMandatory(true);
		var colEndDate = slPTO.addField('custlist_to', 'date', 'To:').setMandatory(true);
		var colHrs = slPTO.addField('custlist_hours', 'float', 'Hours');
		var colDescription = slPTO.addField('custlist_des', 'textarea', 'Description').setMandatory(true);
		
		
		
		frmPTO.addSubmitButton('Submit Request');
		
		response.writePage(frmPTO);		
		
	} else if (request.getMethod() == 'POST') {//test
		// create custom records		
		var timeListCount = request.getLineItemCount('custpage_timelist');
		
		for (var i = 1; i <= timeListCount; i++) {
			
			var dteStart = request.getLineItemValue('custpage_timelist', 'custlist_from', i);
			var dteEnd = request.getLineItemValue('custpage_timelist', 'custlist_to', i);
			var stHours = request.getLineItemValue('custpage_timelist', 'custlist_hours', i);
			
			nlapiCreateRecord('customrecord_pi_pto_request');
			
			
			// Set redirect URL
		}
	}
}
