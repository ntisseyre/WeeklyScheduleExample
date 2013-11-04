$(document).ready(function ()
{
    var scheduleContentDivs = $('.schedule-content');

    //bind TimpePicker
    scheduleContentDivs.find('input.time').each(function () {initTimePicker($(this));});

    //apply highlighting for the rows of the table on focus
    scheduleContentDivs.hover(
		function () { $(this).addClass('ui-state-hover'); },
		function () { $(this).removeClass('ui-state-hover'); });

    scheduleContentDivs.find('.workingTypeImg').hover(
		function () { $(this).addClass('ui-state-highlight'); },
		function () { $(this).removeClass('ui-state-highlight'); });

    scheduleContentDivs.find('div.breaksContainer').each(function ()
	{
		var breaksContainer = $(this);
		breaksContainer.hover(
			function () { breaksContainer.addClass('ui-state-highlight'); },
			function () { breaksContainer.removeClass('ui-state-highlight'); });

        //build a string with breaks' values and print out
		var dialogForBreaks = GetBreaksDialogForContainer(breaksContainer);
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

	var workingTypeDivs = this.getActiveWorkingTypes();
	for (var c = 0; c < workingTypeDivs.length; c++)
	{
		var workingTypeDiv = $(workingTypeDivs[c]);
		workingTypeDiv.find('.workingTypeImg').each(function ()
		{
			var workingType = $(this);
			workingType.css('cursor', 'default');
			workingType.unbind('mouseenter mouseleave');
			workingType.removeAttr("onclick");
		});

		workingTypeDiv.find('input.time').each(function ()
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
/// Change working type for a day of a week.
/// Triggered by a user.
/// </summary>
/// <param name="currentId">Current working type id</param>
/// <param name="nextId">Working type id to switch to</param>
/// <param name="breaksContainerId">Id of an Html element which contains breaks list</param>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function changeWorkingTypeManually(currentId, nextId, breaksContainerId, enableBreaks)
{
	this.changeWorkingType(currentId, nextId, $('#' + breaksContainerId), enableBreaks);

	if (this.isMonday(nextId))
		this.copyWorkingTypeFromMonday(enableBreaks);
}

/// <summary>
/// Change working type for a day of a week.
/// </summary>
/// <param name="currentId">Current working type id</param>
/// <param name="nextId">Working type id to switch to</param>
/// <param name="breaksContainer">Id of an Html element which contains breaks list</param>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function changeWorkingType(currentId, nextId, breaksContainer, enableBreaks)
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
/// Copy working type from Monday to [Tuesday; Friday]
/// </summary>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function copyWorkingTypeFromMonday(enableBreaks)
{
    var workingTypeDivs = this.getActiveWorkingTypes();
	var mondayWorkingType = workingTypeDivs[0].id.split(ConstsForSchedule.IdSeparator)[1]; //Wokring type code for Monday

	for (var c = 1; c < workingTypeDivs.length - 2; c++) //iterate from Tuesday to Friday
	{
		var dayInfo = workingTypeDivs[c].id.split(ConstsForSchedule.IdSeparator);
		var dayOfWeek = dayInfo[0]; //Name of a day of a week
		var nextId = dayOfWeek + ConstsForSchedule.IdSeparator + mondayWorkingType; //Working type to be set for a specified day of a week
		var breaksContainer = this.GetBreaksContainerForDayOfWeek(dayOfWeek);
		this.changeWorkingType(workingTypeDivs[c].id, nextId, breaksContainer, enableBreaks);
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

	var workingTypeDivs = this.getActiveWorkingTypes();
	for (var c = 1; c < workingTypeDivs.length - 2; c++)//iterate from Tuesday to Friday
	{
		var workHours = $(workingTypeDivs[c]).find('input.time');
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
				if (ValidateBreaks(breaksDialog.find('input.time')))
				{
					breaksDialog.dialog("close");

					setBreaksContainerText(GetBreaksContainerForDialog(breaksDialog), breaksDialog);

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

		this.setBreaksContainerText(breaksContainer, this.GetBreaksDialogForContainer(breaksContainer));
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
/// Получить Json-представление расписания
/// </summary>
function GetOperationHours()
{
	var result = {};

	var workingTypeDivs = this.getActiveWorkingTypes();
	for (var c = 0; c < workingTypeDivs.length; c++)
	{
		var dayInfo = workingTypeDivs[c].id.split(ConstsForSchedule.IdSeparator);
		var dayOfWeek = dayInfo[0]; //Название дня недели
		var workingType = dayInfo[1]; //Код режима работы

		result[dayOfWeek] =
		{
			WorkingType: workingType,
			WorkHours: this.GetWorkHours($(workingTypeDivs[c])),
			Breaks: this.GetBreaks(dayOfWeek)
		};
	}

	return result;
}

/// <summary>
/// Получить Json-представление рабочих часов
/// </summary>
/// <param name="workingTypeDiv">Объект, который содержит в себе контролы для задания рабочих часов</param>
function GetWorkHours(workingTypeDiv)
{
	var workHours = workingTypeDiv.find('input.time');
	if (workHours.length == 0)
		return {};

	return { Open: workHours[0].value, Close: workHours[1].value };
}

/// <summary>
/// Получить Json-представление перерывов
/// </summary>
/// <param name="dayOfWeek">Название дня недели</param>
function GetBreaks(dayOfWeek)
{
	var timePickers = this.GetBreaksForDayOfWeek(dayOfWeek);
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
/// Проверить все данные в расписание
/// </summary>
///<returns>True - если все Ок, иначе False</returns>
function ValidateOperationHours()
{
	var workingTypeDivs = this.getActiveWorkingTypes();
	for (var c = 0; c < workingTypeDivs.length; c++)
	{
		var workHours = $(workingTypeDivs[c]).find('input.time');
		if (workHours.length != 0)
		{
			if (!this.ValidateTimeInterval($(workHours[0]), $(workHours[1])))
				return false;
		}

		var dayOfWeek = workingTypeDivs[c].id.split(ConstsForSchedule.IdSeparator)[0]; //Название дня недели
		if (!this.ValidateBreaks(this.GetBreaksForDayOfWeek(dayOfWeek)))
			return false;
	}

	return true;
}

/// <summary>
/// Проверить перерывы
/// </summary>
/// <param name="breaks">Список перерывов</param>
///<returns>True - если все Ок, иначе False</returns>
function ValidateBreaks(breaks)
{
	if (breaks == null)
		return true;

	for (var c = 0; c < breaks.length - 2; c += 2)
		if (!this.ValidateTimeInterval($(breaks[c]), $(breaks[c + 1])))
			return false;

	return true;
}

/// <summary>
/// Проверить корректность временного интервала
/// </summary>
/// <param name="from">Время "с"</param>
/// <param name="to">Время "по"</param>
///<returns>True - если все Ок, иначе False</returns>
function ValidateTimeInterval(from, to)
{
	var fromValue = from.val();
	var toValue = to.val();

	if (fromValue == "")
	{
		this.ShowWarning(ConstsForSchedule.E_EmptyTime, function () { from.focus(); });
		return false;
	}

	if (toValue == "")
	{
		this.ShowWarning(ConstsForSchedule.E_EmptyTime, function () { to.focus(); });
		return false;
	}

	var fromArray = fromValue.split(':');
	var toArray = toValue.split(':');

	var fromHours = parseInt(fromArray[0]);
	var toHours = parseInt(toArray[0]);
	if (fromHours > toHours)
	{
		this.ShowWarning(ConstsForSchedule.E_IntervalIsNotValid, function () { from.focus(); });
		return false;
	}

	var fromMinutes = parseInt(fromArray[1]);
	var toMinutes = parseInt(toArray[1]);
	if (fromHours == toHours && fromMinutes > toMinutes)
	{
		this.ShowWarning(ConstsForSchedule.E_IntervalIsNotValid, function () { from.focus(); });
		return false;
	}

	return true;
}

/// <summary>
/// Показать окно с ошибкой валидации
/// </summary>
/// <param name="message">Сообщение об ошибке</param>
/// <param name="callBack">CallBack, который будет позван при закрытии окна</param>
function ShowWarning(message, callBack)
{
	WU.MessageBox.ShowModalDialogWithMessage('WarningDialog', message, 180, 330, { Ok: function () { $(this).dialog("close"); } }, callBack).dialog('option', 'title', 'Валидация расписания');
}

//===================================================================== DOM Navigation functions =====================================================================//

/// <summary>
/// Get active(visible to a user) working types for a whole week
/// </summary>
///<returns>A list of set working types for each day of a week</returns>
function getActiveWorkingTypes()
{
    return $('.schedule-workingType:visible');
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
/// Получить список перерывов для дня недели
/// </summary>
/// <param name="dayOfWeek">Название дня недели</param>
///<returns>Список контролов для ввода перерывов для указанного дня недели</returns>
function GetBreaksForDayOfWeek(dayOfWeek)
{
	var breaksContainer = this.GetBreaksContainerForDayOfWeek(dayOfWeek);
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

	return this.GetBreaksDialogForContainer(breaksContainer).find('input.time');
}

/// <summary>
/// Get a dialog-div to edit breaks by the breaks' container
/// </summary>
/// <param name="container">Breaks container element</param>
///<returns>Dialog-div to edit breaks</returns>
function GetBreaksDialogForContainer(container)
{
	return $('#dialogFor' + container.attr("id"));
}

/// <summary>
/// Получить контейнер с описанием перерывов
/// </summary>
/// <param name="dayOfWeek">Название дня недели</param>
///<returns>Контейнер с описанием перерывов для дня недели</returns>
function GetBreaksContainerForDayOfWeek(dayOfWeek)
{
	return $("#" + dayOfWeek + ConstsForSchedule.IdSeparator + "Breaks");
}

/// <summary>
/// Получить контейнер с описанием перерывов по диалогу для ввода перерывов
/// </summary>
/// <param name="dialog">Объект диалога</param>
///<returns>Контейнер с описанием перерывов для соответствующего диалога</returns>
function GetBreaksContainerForDialog(dialog)
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
