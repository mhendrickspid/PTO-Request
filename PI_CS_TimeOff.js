/**
 * Module Description
 * This client script runs on the time off suitelet
 * to calculate the hours between the start and end dates requested by an employee
 * on each line of the sublist.
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2015     mhendricks
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
var TimeOff = {
	
	//field changed function
	timeOff_fieldChanged: function (type, name, linenum) {
		if (type == 'custpage_timelist' && (name == 'custlist_start' || name == 'custlist_end')) {
			var stStart = nlapiGetCurrentLineItemValue(type, 'custlist_start');
			var dteStart = nlapiStringToDate(stStart, 'mm/dd/yyyy');
			var stEnd = nlapiGetCurrentLineItemValue(type, 'custlist_end');
			var dteEnd = nlapiStringToDate(stEnd, 'mm/dd/yyyy');
			
			// Calculate workday hours. Note that this currently does not exclude weekends
			if (stStart != '' && stEnd != '') {
				var inthours = ((dteEnd - dteStart)/3600000) + 24;
				var intWorkDays = inthours / 24;
				var intWorkHrs = intWorkDays * 8;
				nlapiSetCurrentLineItemValue(type, 'custlist_hours', intWorkHrs, false, true);
			}
			
		}
	}
};
