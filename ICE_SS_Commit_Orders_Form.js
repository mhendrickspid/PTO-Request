/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 May 2014     Matt Hendricks
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function suitelet_commitOrders(request, response)
{
	if (request.getMethod() == 'GET')
	{
		var form = nlapiCreateForm('Icelandic Commit Orders', false);
		var instructions = form.addField('custpage_instructions', 'longtext', '');
		instructions.setDefaultValue('Check the box next to each Sales order. Then click Commit Orders to commit inventory');
		instructions.setDisplayType('inline');
		
		var sublistOrders = form.addSubList('custpage_ordersublist', 'list', 'Orders to Commit');
		
		//add sublist fields
		sublistOrders.addField('custpage_commit', 'checkbox', 'Select');
		sublistOrders.addField('custbody_commit_lineitems', 'checkbox', 'Committed').setDisplayType('disabled');
		sublistOrders.addField('internalid', 'text', 'Internal ID').setDisplayType('hidden');
		sublistOrders.addField('tranid', 'text', 'Number','transaction');
		sublistOrders.addField('shipdate', 'date', 'Expected Ship Date');
		sublistOrders.addField('amount', 'currency', 'Amount');
		sublistOrders.addField('location', 'select', 'Location','location').setDisplayType('inline');
		sublistOrders.addField('entity', 'select', 'Customer','customer').setDisplayType('inline');
		sublistOrders.addMarkAllButtons();
		sublistOrders.addRefreshButton();
		form.addSubmitButton('Commit Orders');
		
		//Run Order Search and Set Line items to select
		var searchResults = nlapiSearchRecord('transaction','customsearch_orderstocommit');
		var lstValues = form.getSubList('custpage_ordersublist').setLineItemValues(searchResults);
		
		response.writePage(form);		
	}
	//Execute when user clicks Commit Orders button
	else if (request.getMethod() == 'POST') 
	{
		var intOrderCount = request.getLineItemCount('custpage_ordersublist');
		for (var i = 1; i <= intOrderCount; i++)
		{
			var chkSelected = request.getLineItemValue('custpage_ordersublist', 'custpage_commit', i);
			
			if (chkSelected == 'T')
			{
				var orderId = request.getLineItemValue('custpage_ordersublist', 'internalid', i);
				var recOrder = nlapiLoadRecord('salesorder',orderId);
				
				//check box on order used to filter the orders to commit search
				recOrder.setFieldValue('custbody_commit_lineitems', 'T');
				
				//count number of line items on each order to loop through
				var intItems = recOrder.getLineItemCount('item');
				
				//set commit field to available quantity or complete quantity
				try
				{
					for (var x = 1; x <=intItems; x++)
					{
						//select each line item and set the commit inventory field to available quantity
						recOrder.selectLineItem('item', x);
						var valuecurrent = recOrder.getLineItemValue('item', 'commitinventory', x);
						if (valuecurrent != 1)
						{
							recOrder.setCurrentLineItemValue('item', 'commitinventory', 1);
							recOrder.commitLineItem('item');
						}
						else
						{
							nlapiLogExecution('DEBUG', 'Already Committed', 'The item was already committed');
						}
					}
				}
				catch (e)
				{
					nlapiLogExecution('DEBUG', 'Could not set item value', e.toString());
				}
				//Submit the Sales Order
				nlapiSubmitRecord(recOrder);
			}
		}
			//land on page
			nlapiSetRedirectURL('SUITELET', 'customscript_ice_commit_orders', 'customdeploy_ice_commit_orders');
	}
		
}

