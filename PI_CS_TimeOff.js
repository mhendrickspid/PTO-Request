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

    // Field changed event
		/*
		 
    timeOff_fieldChanged: function(type, name, linenum) {
        if (type == 'custpage_timelist' && (name == 'custlist_start' || name == 'custlist_end')) {
            var stStart = nlapiGetCurrentLineItemValue(type, 'custlist_start'),
             	dteStart = nlapiStringToDate(stStart, 'mm/dd/yyyy'),
             	stEnd = nlapiGetCurrentLineItemValue(type, 'custlist_end'),
             	dteEnd = nlapiStringToDate(stEnd, 'mm/dd/yyyy');

            // Calculate workday hours. Note that this currently does not exclude weekends
            if (stStart != '' && stEnd != '') {
                var inthours = ((dteEnd - dteStart) / 3600000) + 24;
                var intWorkDays = inthours / 24;
                var intWorkHrs = intWorkDays * 8;
                nlapiSetCurrentLineItemValue(type, 'custlist_hours', intWorkHrs, false, true);
            }
        }
    },
    */
	
    // Page init function to set the first line start date to today's date
	pi_setline: function() {
		var today = new Date();
		var stToday = nlapiDateToString(today, 'mm/dd/yyyy');
		
		nlapiSelectNewLineItem('custpage_timelist');
		nlapiSetCurrentLineItemValue('custpage_timelist', 'custlist_start', stToday, false, true);
	},
	// if the hours entered exceeds available hours, alert the user and refuse the line
	pi_validateLine: function(type) {
		if (type == 'custpage_timelist') {
			var stTimeItem = nlapiGetCurrentLineItemText(type, 'custlist_timeitem');
			var intHours = nlapiGetCurrentLineItemValue(type, 'custlist_hours');
			var employeeId = nlapiGetUser();
			var isValid;
			
			//get the time item
			var vacation = 'Vacation',
			 	pingbalance = 'PingBalance PTO',
			 	sicktime = 'Sick Time',
			 	volunteertime = 'Volunteer Time',
			 	parentalleave = 'Parental Leave',
			 	unpaidtime = 'Unpaid Time',
				floating = 'Floating Holiday';
			
			// Adjust the time item to look up the appropriate field on the employee
			switch (stTimeItem) {
			case vacation || pingbalance:
				var stTimeField = 'custentity_pi_pto_hrs';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;		
			case sicktime:
				var stTimeField = 'custentity_pi_sicktime';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;
			case volunteertime:
				var stTimeField = 'custentity_pi_volunteer_time';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;
			case parentalleave:
				var stTimeField = 'custentity_pi_parental_leave';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;
			case unpaidtime:
				var stTimeField = 'custentity_pi_pto_hrs';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;
			case floating:
				var stTimeField = 'custentity_pi_floatingholiday';
				isValid = this.validateHours(stTimeField, intHours, employeeId);
				break;
			}
		}
		if (isValid == 'F') {
			return false;
		} else {
			return true;
		}
	},
	
	validateHours: function validateHours(stTimeField, intHours, employeeId) {
		var currentHours = parseFloat(nlapiLookupField('employee', employeeId, stTimeField)).toFixed(2);
		var x;
		if (parseFloat(intHours) > currentHours) {
			alert(intHours + ' Exceeds your remaining balance: ' + currentHours);
			x = 'F';
		} else {
			x = 'T';
		} 
		return x;
	}		
};