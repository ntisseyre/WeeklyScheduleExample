$(document).ready(function ()
{
    var scheduleContentDivs = $('.schedule-content');

    //bind TimpePicker
    scheduleContentDivs.find('input.time').each(function () {initTimePicker($(this));});

    //apply highlighting for the rows of the table on focus
    scheduleContentDivs.hover(
		function () { $(this).addClass('ui-state-hover'); },
		function () { $(this).removeClass('ui-state-hover'); });

    scheduleContentDivs.find('.workingTimeImg').hover(
		function () { $(this).addClass('ui-state-highlight'); },
		function () { $(this).removeClass('ui-state-highlight'); });

    scheduleContentDivs.find('div.breaksContainer').each(function ()
	{
		var breaksContainer = $(this);
		breaksContainer.hover(
			function () { breaksContainer.addClass('ui-state-highlight'); },
			function () { breaksContainer.removeClass('ui-state-highlight'); });

        //build a string with breaks' values and print out
		var dialogForBreaks = getBreaksDialogForContainer(breaksContainer);
		setBreaksContainerText(breaksContainer, dialogForBreaks);

		//apply highlighting on all rows of a breaks' edit table
		addBreakRowsHighlightning(dialogForBreaks);
	});

	$(document).bind("timePickerChanged", function (event, data) { onTimePickerChanged(data.inputControl); });
});

/// <summary>
/// Disable control
/// </summary>
function disableSchedule()
{
	$('#scheduleTable').attr("disabled", "disabled");

	$('#scheduleTable').find('input.time').each(function () {
		$(this).addClass('ignore-validation');
	});

	var workingTimeDivs = this.getActiveWorkingTimes();
	for (var c = 0; c < workingTimeDivs.length; c++)
	{
		var workingTimeDiv = $(workingTimeDivs[c]);
		workingTimeDiv.find('.workingTimeImg').each(function ()
		{
			var workingTime = $(this);
			workingTime.css('cursor', 'default');
			workingTime.unbind('mouseenter mouseleave');
			workingTime.removeAttr("onclick");
		});

		workingTimeDiv.find('input.time').each(function ()
		{
			var workHours = $(this);
			workHours.unbind("click");
			workHours.attr("disabled", "disabled");
		});
	}

	var breaksContainers = this.getBreaksContainers();
	for (var c = 0; c < breaksContainers.length; c++)
	{
		var breaksContainer = $(breaksContainers[c]);
		breaksContainer.css('cursor', 'default');
		breaksContainer.unbind('mouseenter mouseleave');
		breaksContainer.removeAttr("onclick");
	}
}

//===================================================================== Change value functions =====================================================================//

/// <summary>
/// Change working time for a day of a week.
/// Triggered by a user.
/// </summary>
/// <param name="currentId">Current working time id</param>
/// <param name="nextId">Working time id to switch to</param>
/// <param name="breaksContainerId">Id of an Html element which contains breaks list</param>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function changeWorkingTimeManually(currentId, nextId, breaksContainerId, enableBreaks)
{
	this.changeWorkingTime(currentId, nextId, $('#' + breaksContainerId), enableBreaks);

	if (this.isMonday(nextId))
		this.copyWorkingTimeFromMonday(enableBreaks);
}

/// <summary>
/// Change working time for a day of a week.
/// </summary>
/// <param name="currentId">Current working time id</param>
/// <param name="nextId">Working time id to switch to</param>
/// <param name="breaksContainer">Id of an Html element which contains breaks list</param>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function changeWorkingTime(currentId, nextId, breaksContainer, enableBreaks)
{
	$('#' + currentId).hide();
	$('#' + nextId).show();

	if (enableBreaks)
	{
		breaksContainer.show();
	}
	else
	{
		breaksContainer.hide();
	}
}

/// <summary>
/// Copy working time from Monday to [Tuesday; Friday]
/// </summary>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function copyWorkingTimeFromMonday(enableBreaks)
{
    var workingTimeDivs = this.getActiveWorkingTimes();
	var mondayWorkingTime = workingTimeDivs[0].id.split(ConstsForSchedule.IdSeparator)[1]; //Wokring type code for Monday

	for (var c = 1; c < workingTimeDivs.length - 2; c++) //iterate from Tuesday to Friday
	{
		var dayInfo = workingTimeDivs[c].id.split(ConstsForSchedule.IdSeparator);
		var dayOfWeek = dayInfo[0]; //Name of a day of a week
		var nextId = dayOfWeek + ConstsForSchedule.IdSeparator + mondayWorkingTime; //Working time to be set for a specified day of a week
		var breaksContainer = this.getBreaksContainerForDayOfWeek(dayOfWeek);
		this.changeWorkingTime(workingTimeDivs[c].id, nextId, breaksContainer, enableBreaks);
	}
}

/// <summary>
/// Handler of a Timepicker-control's value changed
/// </summary>
/// <param name="inputControl">Html-element which triggered an event</param>
function onTimePickerChanged(inputControl)
{
	if (inputControl.val() == "")
		return;

	var divRow = inputControl.parent().parent();//input -> div[table-cell] -> div[table-row]

	if (divRow.hasClass('breakRow')) //If Timepicker-control is a break -> add new row for input
	{
	    this.addNewBreak(divRow);
	}
	else
	{
		if (this.isMonday(inputControl.attr("id")))
		    this.copyWorkHoursFromMonday(inputControl, divRow);
	}
}

/// <summary>
/// Copy working hours from Monday to [Tuesday; Friday].
/// For Friday only "from".
/// </summary>
/// <param name="changedControl">Html-element which triggered a coping of working hours</param>
/// <param name="divRow">Div-row where timePicker-control lives</param>
function copyWorkHoursFromMonday(changedControl, divRow)
{
	var newTime;
	var isOpenTimeChanged = true;
	var mondayWorkHours = divRow.find('input.time');
	if (mondayWorkHours[0].id == changedControl.attr("id"))
	{
		newTime = $(mondayWorkHours[0]).val();
	}
	else
	{
		newTime = $(mondayWorkHours[1]).val();
		isOpenTimeChanged = false;
	}

	var workingTimeDivs = this.getActiveWorkingTimes();
	for (var c = 1; c < workingTimeDivs.length - 2; c++)//iterate from Tuesday to Friday
	{
		var workHours = $(workingTimeDivs[c]).find('input.time');
		if (workHours.length != 0)
		{
			if (isOpenTimeChanged)
				$(workHours[0]).val(newTime);
			else if (c != 4) //for Friday ignore close time
				$(workHours[1]).val(newTime);
		}
	}
}

//===================================================================== Breaks' Dialog functions =====================================================================//

/// <summary>
/// Show a dialog to edit breaks' list
/// </summary>
/// <param name="breaksContainer">Html-element which contains a text-representation of breaks</param>
/// <param name="breaksDialogId">Breaks' list dialog Id</param>
/// <param name="breaksTitle">Breaks' list dialog title</param>
function showBreaks(breaksContainer, breaksDialogId, breaksTitle)
{
    var breaksDialog = $('#' + breaksDialogId);
	var previousHtml = breaksDialog.html();
	
	var previousInputValues = [];
	breaksDialog.find('input.time').each(function () { previousInputValues.push(this.value); });

	breaksDialog.dialog({
		width: 200,
		height: 'auto',
		modal: true,
		resizable: false,
		closeOnEscape: false,
		title: breaksTitle,
		buttons:
		{
			Ok: function ()
			{
				if (validateBreaks(breaksDialog.find('input.time')))
				{
					breaksDialog.dialog("close");

					setBreaksContainerText(getBreaksContainerForDialog(breaksDialog), breaksDialog);

					if (isMonday(breaksDialogId))
						copyBreaksFromMonday();
				}

			},
			Cancel: function ()
			{
				breaksDialog.dialog("close");
				breaksDialog.html(previousHtml);
				addBreakRowsHighlightning(breaksDialog);//bind again

				var c = 0;
				breaksDialog.find('input.time').each(function ()
				{
					this.value = previousInputValues[c++];
					initTimePicker($(this));
				});
			}
		},
		open: function () { $(".ui-dialog-titlebar-close").hide(); }
	});
}

/// <summary>
/// Show all breaks as a text
/// </summary>
/// <param name="breaksContainer">Html element that contains breaks-text</param>
/// <param name="breaksDialog">Dialog-div to edit breaks</param>
function setBreaksContainerText(breaksContainer, breaksDialog)
{
	var counter = 0;
	var result = "";
	var timePickers = breaksDialog.find('input.time');

	for (var c = 0; c < timePickers.length; c += 2)
	{
		var from = $(timePickers[c]).val();
		var to = $(timePickers[c + 1]).val()

		if (from == "" || to == "")
			continue;

		if (result != "")
			result += ", ";

		if (counter == 2)
		{
			result += "<br/>";
			counter = 0;
		}

		result += from + " - " + to;
		counter++;
	}

	breaksContainer.html(result);
}

/// <summary>
/// Copy breaks from Monday to [Tuesday; Friday].
/// </summary>
/// <param name="breaksContainer">Html-element which contains text-representation of breaks' list</param>
function copyBreaksFromMonday()
{
	var breaksContainersIds = this.getBreaksContainers();
	var mondayBreaks = this.getBreaksInputForContainer($(breaksContainersIds[0]));

	for (var c = 1; c < breaksContainersIds.length - 2; c++)//iterate from Tuesday to Friday
	{
		var breaksContainer = $(breaksContainersIds[c]);
		var dayBreaks = this.getBreaksInputForContainer(breaksContainer); //Breaks for a day of a week
		if (dayBreaks == null)
			continue;

		var i = 0;
		var lastRow = null;
		for (; i < mondayBreaks.length; i += 2)
		{
			if (dayBreaks.length - 1 >= i)
			{
				dayBreaks[i].value = mondayBreaks[i].value;
				dayBreaks[i + 1].value = mondayBreaks[i + 1].value;

				if (dayBreaks.length - 2 == i)
				    lastRow = $(dayBreaks[i]).parent().parent(); //<div class="breakRow"> for a last break in a list
			}
			else
			{
				//Add missing breaks
				lastRow = this.cloneBreakRow(lastRow, mondayBreaks[i].value, mondayBreaks[i + 1].value);
			}
		}

		if (lastRow == null)
		{
			$(dayBreaks[mondayBreaks.length - 1]).parent().parent().find('a').hide();

			for (; i < dayBreaks.length; i += 2) //Delete extra breaks
			{
				$(dayBreaks[i]).parent().parent().remove();
			}
		}

		this.setBreaksContainerText(breaksContainer, this.getBreaksDialogForContainer(breaksContainer));
	}
}

/// <summary>
/// Add a new break
/// </summary>
/// <param name="divRow">Div-row where timePicker lives</param>
function addNewBreak(divRow)
{
    if (divRow.index() != divRow.siblings().length)//If row is not the last one -> skip
		return;

    this.cloneBreakRow(divRow, '', '');
}

/// <summary>
/// Clone a row with breaks
/// </summary>
/// <param name="lastRow">A row to copy from</param>
/// <param name="fromValue">Time "from"</param>
/// <param name="toValue">Time "to"</param>
function cloneBreakRow(lastRow, fromValue, toValue)
{
	var c = 0;
	var nextIndex = (lastRow.index() + 1).toString();
	var clone = lastRow.clone()
		.hover(function () { $(this).addClass('ui-state-hover'); }, function () { $(this).removeClass('ui-state-hover'); })
		.find('input.time') //find all Html-elements to enter time
		.each(function ()
		{
			var breakInput = $(this);
			breakInput.attr('id', this.id.replace(/\d+$/, nextIndex)); //increment index used for an id

			if (c++ == 0)
			{
				breakInput.val(fromValue);
			}
			else
			{
				breakInput.val(toValue);
			}

			initTimePicker(breakInput); //init timePicker control
		})
		.end() //return to a clone
		.insertAfter(lastRow);

	lastRow.find('a').show(); // now current row is before a last one -> enable delete functionality
	return clone;
}

/// <summary>
/// Delete a break from breaks' table
/// </summary>
/// <param name="imgForDelete">Html-element "a" which was clicked</param>
function deleteBreak(imgForDelete)
{
    var rowForBreak = imgForDelete.parent();

	if (rowForBreak.index() == rowForBreak.siblings().length)//If control is a last one, just skip
		return;

	rowForBreak.remove();
}

/// <summary>
/// Apply highlighting on all rows of a breaks' edit table
/// </summary>
/// <param name="dialogForBreaks">Dialog-div element which contains breaks' list</param>
function addBreakRowsHighlightning(dialogForBreaks)
{
    dialogForBreaks.find("div.breakRow").hover(
			function () { $(this).addClass('ui-state-hover'); },
			function () { $(this).removeClass('ui-state-hover'); });
}

//===================================================================== Save functions =====================================================================//

/// <summary>
/// Get schedule in JSON format
/// </summary>
function getJsonSchedule()
{
	var result = {};

	var workingTimeDivs = this.getActiveWorkingTimes();
	for (var c = 0; c < workingTimeDivs.length; c++)
	{
		var dayInfo = workingTimeDivs[c].id.split(ConstsForSchedule.IdSeparator);
		var dayOfWeek = dayInfo[0]; //Name of a day of a week
		var workingTime = dayInfo[1]; //Working time code

		result[dayOfWeek] =
		{
			WorkingTime: workingTime,
			WorkHours: this.getJsonWorkHours($(workingTimeDivs[c])),
			Breaks: this.getJsonBreaks(dayOfWeek)
		};
	}

	return result;
}

/// <summary>
/// Get working hours JSON format
/// </summary>
/// <param name="workingTimeDiv">An Html-element that contains controls to edit time</param>
function getJsonWorkHours(workingTimeDiv)
{
	var workHours = workingTimeDiv.find('input.time');
	if (workHours.length == 0)
		return {};

	return { Open: workHours[0].value, Close: workHours[1].value };
}

/// <summary>
/// Get breaks JSON format
/// </summary>
/// <param name="dayOfWeek">Name of a day of a week</param>
function getJsonBreaks(dayOfWeek)
{
	var timePickers = this.getBreaksForDayOfWeek(dayOfWeek);
	if (timePickers == null)
		return {};

	var result = [];
	for (var c = 0; c < timePickers.length - 2; c += 2)
	{
		var from = $(timePickers[c]).val();
		var to = $(timePickers[c + 1]).val();

		result.push({ From: from, To: to });
	}

	return result;
}

//===================================================================== Validation functions =====================================================================//

/// <summary>
/// Validate schedule data: working times, working hours, breaks
/// </summary>
///<returns>True - everything is Ok, otherwise False</returns>
function validateSchedule()
{
	var workingTimeDivs = this.getActiveWorkingTimes();
	for (var c = 0; c < workingTimeDivs.length; c++)
	{
		var workHours = $(workingTimeDivs[c]).find('input.time');
		if (workHours.length != 0)
		{
			if (!this.validateTimeInterval($(workHours[0]), $(workHours[1])))
				return false;
		}

		var dayOfWeek = workingTimeDivs[c].id.split(ConstsForSchedule.IdSeparator)[0]; //Name of a day of a week
		if (!this.validateBreaks(this.getBreaksForDayOfWeek(dayOfWeek)))
			return false;
	}

	return true;
}

/// <summary>
/// Validate breaks
/// </summary>
/// <param name="breaks">A list of Html-elements "input" to edit breaks</param>
///<returns>True - everything is Ok, otherwise False</returns>
function validateBreaks(breaks)
{
	if (breaks == null)
		return true;

	for (var c = 0; c < breaks.length - 2; c += 2)
		if (!this.validateTimeInterval($(breaks[c]), $(breaks[c + 1])))
			return false;

	return true;
}

/// <summary>
/// Validate time interval is set properly
/// </summary>
/// <param name="from">Time "from"</param>
/// <param name="to">Time "to"</param>
///<returns>True - everything is Ok, otherwise False</returns>
function validateTimeInterval(from, to)
{
	var fromValue = from.val();
	var toValue = to.val();

	if (fromValue == "")
	{
		this.showWarning(ConstsForSchedule.E_EmptyTime, function () { from.focus(); });
		return false;
	}

	if (toValue == "")
	{
		this.showWarning(ConstsForSchedule.E_EmptyTime, function () { to.focus(); });
		return false;
	}

	var fromArray = fromValue.split(':');
	var toArray = toValue.split(':');

	var fromHours = parseInt(fromArray[0]);
	var toHours = parseInt(toArray[0]);
	if (fromHours > toHours)
	{
		this.showWarning(ConstsForSchedule.E_IntervalIsNotValid, function () { from.focus(); });
		return false;
	}

	var fromMinutes = parseInt(fromArray[1]);
	var toMinutes = parseInt(toArray[1]);
	if (fromHours == toHours && fromMinutes > toMinutes)
	{
		this.showWarning(ConstsForSchedule.E_IntervalIsNotValid, function () { from.focus(); });
		return false;
	}

	return true;
}

/// <summary>
/// Show a validation error
/// </summary>
/// <param name="message">Error message</param>
/// <param name="callBack">CallBack-function after closing a window</param>
function showWarning(message, callBack)
{
    alert(message);
    callBack();
}

//===================================================================== DOM Navigation functions =====================================================================//

/// <summary>
/// Get active(visible to a user) working times for a whole week
/// </summary>
///<returns>A list of set working times for each day of a week</returns>
function getActiveWorkingTimes()
{
    return $('.schedule-workingTime:visible');
}

/// <summary>
/// Get html-elements to display breaks as a text for a whole week
/// </summary>
///<returns>A list of breaks for each day of a week</returns>
function getBreaksContainers()
{
    return $('.schedule-content').find('div.breaksContainer');
}

/// <summary>
/// Get an html-element to display breaks as a text for a day of a week
/// </summary>
/// <param name="dayOfWeek">Name of a day of a week</param>
///<returns>An Html-element "div" that contains breaks' list as a text</returns>
function getBreaksContainerForDayOfWeek(dayOfWeek)
{
    return $("#" + dayOfWeek + ConstsForSchedule.IdSeparator + "Breaks");
}

/// <summary>
/// Get a breaks' list for a day of a week
/// </summary>
/// <param name="dayOfWeek">Name of a day of a week</param>
///<returns>A list of Html-elements "input" to edit breaks</returns>
function getBreaksForDayOfWeek(dayOfWeek)
{
	var breaksContainer = this.getBreaksContainerForDayOfWeek(dayOfWeek);
	return this.getBreaksInputForContainer(breaksContainer);
}

/// <summary>
/// Get a breaks' list by the breaks' container
/// </summary>
/// <param name="breaksContainer">Breaks container element</param>
///<returns>A list of Html-elements "input" to edit breaks</returns>
function getBreaksInputForContainer(breaksContainer)
{
	if (!breaksContainer.is(':visible'))
		return null;

	return this.getBreaksDialogForContainer(breaksContainer).find('input.time');
}

/// <summary>
/// Get a dialog-div to edit breaks by the breaks' container
/// </summary>
/// <param name="container">Breaks container element</param>
///<returns>Dialog-div to edit breaks</returns>
function getBreaksDialogForContainer(container)
{
	return $('#dialogFor' + container.attr("id"));
}

/// <summary>
/// Get a breaks' container (an html-element to display breaks as a text) for a dialog-div to edit breaks
/// </summary>
/// <param name="dialog">Dialog-div to edit breaks</param>
///<returns>Breaks container element</returns>
function getBreaksContainerForDialog(dialog)
{
	return $("#" + dialog.attr("id").replace(/^dialogFor/, ""));
}

/// <summary>
/// Check if currnet Html-element belongs to Monday
/// </summary>
/// <param name="elementId">Element's id</param>
///<returns>True - it is Monday, otherwise False</returns>
function isMonday(elementId)
{
	return elementId.toLowerCase().indexOf("monday") >= 0;
}