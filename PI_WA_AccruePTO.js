/**
 * Module Description
 * 
 * Custom workflow action in the PTO Request workflow.
 * When a request is approved, decrease the PTO accrued hours by
 * the amount requested.
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jul 2015     mhendricks
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function ptoAction() {
	
	// Get employee's current PTO for the year
	var employeeId = nlapiGetFieldValue('custrecord_employee');
	var reqHrs = parseFloat(nlapiGetFieldValue('custrecord_hours'));
	var currentPTO = parseFloat(nlapiLookupField('employee', employeeId, 'custentity_pi_pto_hrs'));
		
	/*
	 * Decrease the PTO amount whenever a PTO request is approved by a supervisor
	 * in the PTO Request workflow
		*/ 
	try {
		var newHrs = currentPTO - reqHrs;
		if (newHrs >= 0){
			nlapiSubmitField('employee', employeeId, 'custentity_pi_pto_hrs', newHrs);
		}
	} catch (e) {
		nlapiLogExecution('ERROR', 'PTO Hours Calculation', e.toString());
		throw (e);
	}
}
