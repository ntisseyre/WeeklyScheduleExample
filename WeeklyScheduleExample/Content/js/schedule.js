$(document).ready(function ()
{
    var scheduleContentDivs = $('.schedule-content');

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
		SetBreaksContainerText(breaksContainer, dialogForBreaks);

		//Накатываем стили по фокусу на все строки таблицы Перерывов
		dialogForBreaks.find("tr.break").hover(
			function () { $(this).addClass('ui-state-hover'); },
			function () { $(this).removeClass('ui-state-hover'); });
	});

	$(document).bind("timePickerChanged", function (event, data) { OnTimePickerChanged(data.inputControl); });
});

/// <summary>
/// Disable control
/// </summary>
function disableSchedule()
{
	$('#scheduleTable').attr("disabled", "disabled");

	$('#scheduleTable').find('input[type=text]').each(function () {
		$(this).addClass('ignore-validation');
	});

	var workingTypeDivs = this.GetActiveWorkingTypes();
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

		workingTypeDiv.find('input[type=text]').each(function ()
		{
			var workHours = $(this);
			workHours.unbind("click");
			workHours.attr("disabled", "disabled");
		});
	}

	var breaksContainers = this.GetBreaksContainers();
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
function ChangeWorkingTypeManually(currentId, nextId, breaksContainerId, enableBreaks)
{
	this.ChangeWorkingType(currentId, nextId, $('#' + breaksContainerId), enableBreaks);

	if (this.IsMonday(nextId))
		this.CopyWorkingTypeFromMonday(enableBreaks);
}

/// <summary>
/// Change working type for a day of a week.
/// </summary>
/// <param name="currentId">Current working type id</param>
/// <param name="nextId">Working type id to switch to</param>
/// <param name="breaksContainer">Id of an Html element which contains breaks list</param>
/// <param name="enableBreaks">A flag to make breaks enabled. For "day-off" breaks are disabled, for example.</param>
function ChangeWorkingType(currentId, nextId, breaksContainer, enableBreaks)
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
function CopyWorkingTypeFromMonday(enableBreaks)
{
    var workingTypeDivs = this.GetActiveWorkingTypes();
	var mondayWorkingType = workingTypeDivs[0].id.split(ConstsForSchedule.IdSeparator)[1]; //Wokring type code for Monday

	for (var c = 1; c < workingTypeDivs.length - 2; c++) //iterate from Tuesday to Friday
	{
		var dayInfo = workingTypeDivs[c].id.split(ConstsForSchedule.IdSeparator);
		var dayOfWeek = dayInfo[0]; //Name of a day of a week
		var nextId = dayOfWeek + ConstsForSchedule.IdSeparator + mondayWorkingType; //Working type to be set for a specified day of a week
		var breaksContainer = this.GetBreaksContainerForDayOfWeek(dayOfWeek);
		this.ChangeWorkingType(workingTypeDivs[c].id, nextId, breaksContainer, enableBreaks);
	}
}

/// <summary>
/// Обработчик события изменения любого TimePicker'а
/// </summary>
/// <param name="inputControl">TimePicker, у которого поменялось значение</param>
function OnTimePickerChanged(inputControl)
{
	if (inputControl.val() == "")
		return;

	var cellForTimePicker = inputControl.parent(); //td
	if (cellForTimePicker.hasClass('break')) //Если этот TimePicker относится к break'ам, то пробуем добавить новые контролы
	{
		this.AddNewBreak(cellForTimePicker);
	}
	else
	{
		if (this.IsMonday(inputControl.attr("id")))
			this.CopyWorkHoursFromMonday(inputControl, cellForTimePicker);
	}
}

/// <summary>
/// Раскопировать часы работы понедельника на вторник-пятницу.
/// Для пятницы заполняется только дата "с".
/// </summary>
/// <param name="changedControl">Контрол, который послужил trigger'ом для копирования часов работы</param>
/// <param name="cellForTimePicker">Td'шка, в которой живет данный контрол</param>
function CopyWorkHoursFromMonday(changedControl, cellForTimePicker)
{
	var newTime;
	var isOpenTimeChanged = true;
	var mondayWorkHours = cellForTimePicker.find('input[type=text]');
	if (mondayWorkHours[0].id == changedControl.attr("id"))
	{
		newTime = $(mondayWorkHours[0]).val();
	}
	else
	{
		newTime = $(mondayWorkHours[1]).val();
		isOpenTimeChanged = false;
	}

	var workingTypeDivs = this.GetActiveWorkingTypes();
	for (var c = 1; c < workingTypeDivs.length - 2; c++) //со вторника по пятницу
	{
		var workHours = $(workingTypeDivs[c]).find('input[type=text]');
		if (workHours.length != 0)
		{
			if (isOpenTimeChanged)
				$(workHours[0]).val(newTime);
			else if (c != 4) //для пятницы не ставим close time
				$(workHours[1]).val(newTime);
		}
	}
}

//===================================================================== Breaks' Dialog functions =====================================================================//

/// <summary>
/// Показать контрол для редактирования перерывов
/// </summary>
/// <param name="breaksContainer">Объект, содержащий перерывы в виде строки</param>
/// <param name="breaksDialogId">Идентификатор контрола для редактирования перерывов</param>
/// <param name="breaksTitle">Название диалогового окна</param>
function ShowBreaks(breaksContainer, breaksDialogId, breaksTitle)
{
    var breaksDialog = $('#' + breaksDialogId);
	var previousHtml = breaksDialog.html();
	
	var previousInputValues = [];
	breaksDialog.find('input[type=text]').each(function () { previousInputValues.push(this.value); });

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
				if (ValidateBreaks(breaksDialog.find('input[type=text]')))
				{
					breaksDialog.dialog("close");

					SetBreaksContainerText(GetBreaksContainerForDialog(breaksDialog), breaksDialog);

					if (IsMonday(breaksDialogId))
						CopyBreaksFromMonday();
				}

			},
			Отменить: function ()
			{
				breaksDialog.dialog("close");
				breaksDialog.html(previousHtml);

				var c = 0;
				breaksDialog.find('input[type=text]').each(function ()
				{
					this.value = previousInputValues[c++];
					InitTimePicker($(this));
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
function SetBreaksContainerText(breaksContainer, breaksDialog)
{
	var counter = 0;
	var result = "";
	var timePickers = breaksDialog.find('input[type=text]');

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
/// Раскопировать перерывы с понедельника на вторник-пятницу
/// </summary>
/// <param name="breaksContainer">Объект, содержащий перерывы в виде строки</param>
function CopyBreaksFromMonday()
{
	var breaksContainersIds = this.GetBreaksContainers();
	var mondayBreaks = this.GetBreaksForContainer($(breaksContainersIds[0]));

	for (var c = 1; c < breaksContainersIds.length - 2; c++) //со вторника по пятницу
	{
		var breaksContainer = $(breaksContainersIds[c]);
		var dayBreaks = this.GetBreaksForContainer(breaksContainer); //Перерывы дня недели
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
					lastRow = $(dayBreaks[i]).parent().parent(); //Tr'ка для последнего перерыва
			}
			else
			{
				//Недостающие перерывы добавляем
				lastRow = this.CloneBreakRow(lastRow, mondayBreaks[i].value, mondayBreaks[i + 1].value);
			}
		}

		if (lastRow == null)
		{
			$(dayBreaks[mondayBreaks.length - 1]).parent().parent().find('img').hide();

			for (; i < dayBreaks.length; i += 2) //Лишнии перерывы удаляем
			{
				$(dayBreaks[i]).parent().parent().remove();
			}
		}

		this.SetBreaksContainerText(breaksContainer, this.GetBreaksDialogForContainer(breaksContainer));
	}
}

/// <summary>
/// Добавить новый перерыв
/// </summary>
/// <param name="cellForBreak">td'шка, в которой живет timePicker</param>
function AddNewBreak(cellForBreak)
{
	var rowForBreak = cellForBreak.parent(); //tr
	if (rowForBreak.index() != rowForBreak.siblings().length)//Если контрол Не последний, то ничего не делаем
		return;

	this.CloneBreakRow(rowForBreak, '', '');
}

/// <summary>
/// Склонировать строчку с перерывами
/// </summary>
/// <param name="lastRow">Объект строки</param>
/// <param name="fromValue">Время "с"</param>
/// <param name="toValue">Время "по"</param>
function CloneBreakRow(lastRow, fromValue, toValue)
{
	var c = 0;
	var nextIndex = (lastRow.index() + 1).toString();
	var clone = lastRow.clone()
		.hover(function () { $(this).addClass('ui-state-hover'); }, function () { $(this).removeClass('ui-state-hover'); })
		.find('input[type=text]') //найти все контролы для ввода времени
		.each(function ()
		{
			var breakInput = $(this);
			breakInput.attr('id', this.id.replace(/\d+$/, nextIndex)); //накрутить id-шник

			if (c++ == 0)
			{
				breakInput.val(fromValue);
			}
			else
			{
				breakInput.val(toValue);
			}

			InitTimePicker(breakInput); //Инитим timePicker'ы
		})
		.end() //вернуться к клону
		.insertAfter(lastRow);

	lastRow.find('img').show(); // теперь текущий tr стал предпоследним, показываем возможность для удаления
	return clone;
}

/// <summary>
/// Удалить перерыв
/// </summary>
/// <param name="imgForDelete">Объект картинки, на которую жмякнули, чтобы удалить запись</param>
function DeleteBreak(imgForDelete)
{
	var rowForBreak = imgForDelete.parent().parent() //tr

	if (rowForBreak.index() == rowForBreak.siblings().length)//Если контрол последний, то ничего не делаем
		return;

	rowForBreak.remove();
}

//===================================================================== Save functions =====================================================================//

/// <summary>
/// Получить Json-представление расписания
/// </summary>
function GetOperationHours()
{
	var result = {};

	var workingTypeDivs = this.GetActiveWorkingTypes();
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
	var workHours = workingTypeDiv.find('input[type=text]');
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
	var workingTypeDivs = this.GetActiveWorkingTypes();
	for (var c = 0; c < workingTypeDivs.length; c++)
	{
		var workHours = $(workingTypeDivs[c]).find('input[type=text]');
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
/// Get set working types for a whole week
/// </summary>
///<returns>A list of set working types for each day of a week</returns>
function GetActiveWorkingTypes()
{
    return $('.schedule-workingType:visible');
}

/// <summary>
/// Get breaks for a whole week
/// </summary>
///<returns>A list of breaks for each day of a week</returns>
function GetBreaksContainers()
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
	return this.GetBreaksForContainer(breaksContainer);
}


/// <summary>
/// Получить список перерывов для соответствующего контейнера
/// </summary>
/// <param name="breaksContainer">Объект контейнера</param>
///<returns>Список контролов для ввода перерывов для указанного контейнера</returns>
function GetBreaksForContainer(breaksContainer)
{
    alert(breaksContainer);
	if (!breaksContainer.is(':visible'))
		return null;

	return this.GetBreaksDialogForContainer(breaksContainer).find('input[type=text]');
}

/// <summary>
/// Get a dialog-div to edit breaks by the breaks container
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
/// Принадлежит ли указанный элемент понедельнику
/// </summary>
/// <param name="elementId">Уникальный идентификатор элемента</param>
///<returns>True - это понедельник, иначе False</returns>
function IsMonday(elementId)
{
	return elementId.toLowerCase().indexOf("monday") >= 0;
}
