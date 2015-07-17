/**
 * Module Description
 * 
 * Searches employee records at the end of each month and updates their available pto rates
 * on their employee records based on the rate in their Vacation Accrual rate 
 * custom record.
 * 
 * if there is a  year end rollover then the current balance will roll forward to the
 * next year.
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2015     mhendricks
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var TimeOff = {
	// Public
	
	accruePTO: function() {
		// Private
		
		var dteDate = new Date();
		var stMonth = dteDate.getMonth();
		
		// filter if the vacation rate record is not empty
		var filters = [
		               new nlobjSearchFilter('custentity_pi_pto_hrs', null, 'isnotempty')
		              ];
		// search columns
		var columns = [
		               new nlobjSearchColumn('internalid'),
		               new nlobjSearchColumn('custentity_pi_vacation_accruals'),
		               new nlobjSearchColumn('custentity_pi_pto_hrs')
		              ];
		
		// Search employees for PTO accrual rates
		var searchResults = nlapiSearchRecord('employee', null, filters, columns);
		
		// loop through results and update records with new accrued amounts
		for (var i = 0; searchResults != null && i < searchResults.length; i++) {
			var result = searchResults[i],
			 	empId = result.getValue('internalid'),
			 	rateId = result.getValue('custentity_pi_vacation_accruals'),
			 	hours = parseFloat(result.getValue('custentity_pi_pto_hrs')),
			 	accrualRate = parseFloat(nlapiLookupField('customrecord_pi_international_pto', rateId, 'custrecord_rate_accrualrate')),
				isRoll = nlapiLookupField('customrecord_pi_international_pto', rateId, 'custrecord_rate_yearendroll');
			
			// if it is not the last month in the year, then adjust the available pto rate
			if (stMonth != 11) {
				var newPTOHrs = hours + accrualRate;
				nlapiSubmitField('employee', empId, 'custentity_pi_pto_hrs', newPTOHrs);
			}
			// if it is the last month in the year & roll forward is checked, then roll forward remaining balance
			if (stMonth == 11 && isRoll == 'T') {
				// rollover PTO to new year if rollover box is true
			
			// otherwise, reset the annual hours
			} else if (stMonth == 11 && isRoll == 'F') {
				// restart annual PTO hrs for non rollover
			}
		}
	}
};