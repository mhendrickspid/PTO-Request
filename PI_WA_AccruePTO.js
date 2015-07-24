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
	
	/*
	 * need to add logic to handle other time codes :sick time, 
	 * parental leave, etc. 
	 */
	var vacation = 'Vacation',
	 	pingbalance = 'PingBalance PTO',
	 	sicktime = 'Sick Time',
	 	volunteertime = 'Volunteer Time',
	 	parentalleave = 'Parental Leave',
	 	unpaidtime = 'Unpaid Time',
		floating = 'Floating Holiday';
	
	
	// Get employee's current PTO for the year
	var timeItem = nlapiGetFieldText('custrecord_time_item'),
	 	employeeId = nlapiGetFieldValue('custrecord_employee'),
	 	reqHrs = parseFloat(nlapiGetFieldValue('custrecord_hours'));
	
	// subtract different amounts from the employee record depending on the time item
	switch (timeItem) {
		case vacation || pingbalance:
			var stTimeField = 'custentity_pi_pto_hrs';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;		
		case sicktime:
			var stTimeField = 'custentity_pi_sicktime';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;
		case volunteertime:
			var stTimeField = 'custentity_pi_volunteer_time';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;
		case parentalleave:
			var stTimeField = 'custentity_pi_parental_leave';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;
		case unpaidtime:
			var stTimeField = 'custentity_pi_pto_hrs';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;
		case floating:
			var stTimeField = 'custentity_pi_floatingholiday';
			updateHours(timeItem, employeeId, reqHrs, stTimeField);
			break;
		
	}
	/*
	 * Decrease the PTO amount whenever a PTO request is approved by a supervisor
	 * in the PTO Request workflow
	 */ 
}

function updateHours (timeItem, employeeId, reqHrs, stTimeField) {
	var currentPTO = parseFloat(nlapiLookupField('employee', employeeId, stTimeField));
	try {
		var newHrs = currentPTO - reqHrs;
		if (newHrs >= 0) {
			nlapiSubmitField('employee', employeeId, stTimeField, newHrs);
		}
	} catch (e) {
		nlapiLogExecution('ERROR', 'Hours Calculation', e.toString());
		throw (e);
	}
}
