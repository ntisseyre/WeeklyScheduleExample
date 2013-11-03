var AnimSpeed = 0;
var TimePickerFormat = '{h}:{m}';

var timePicker;
var currentInputControl;
var isInsideTimePicker = false;

var onlyHoursRegEx = /^([01]?[0-9]|2[0-3])$/;
var fullTimeRegEx = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

$(document).ready(function ()
{
	timePicker = $('#timeMenu');
});

/// <summary>
/// Init Html element: attach timePicker behaviour
/// </summary>
/// <param name="control">Html element</param>
function initTimePicker(control)
{
	if (control.data('isInited'))
		return;

	control.data('isInited', true);
	control.data('initialValue', control.val());
	control.bind("click", function () { showTimePicker(control); });
	control.bind("change paste", null, function () { currentInputControl = control; validateTimePicker(); });
	control.bind("keydown", function (e) { if (e.keyCode == 27) { hideTimePicker(); validateTimePicker(); } }); //if Esc - hide control
	control.bind("blur", function () { if (!isInsideTimePicker) { hideTimePicker(); } });
}

/// <summary>
/// Set time if "Prefix" was clicked
/// </summary>
/// <param name="value">Day or night</param>
function setTimeForPrefix(value)
{
	this.hideTimePicker();
	this.setTimePickerValue((value == 1) ? "11:00" : "23:00");
}

/// <summary>
/// Set time if "Hour" or "Minute" was clicked
/// </summary>
function setTime()
{
	this.hideTimePicker();
	this.UpdateControlValue();
}

/// <summary>
/// Обработать наведение курсора на уровень Prefix или Hour
/// </summary>
/// <param name="topLevel">Элемент списка из уровня Prefix или Hour</param>
function HoverTopLevel(topLevel)
{
	this.HoverElement(topLevel);

	//Down level
	var downRow = topLevel.parent().next();
	var downRowElements = downRow.children();
	downRowElements.removeClass('ui-state-highlight');
	downRow.show(this.AnimSpeed);

	this.redrawTimePicker();
	downRowElements.filter(':visible:first').addClass('ui-state-highlight');
}

/// <summary>
/// Обработать наведение курсора на любой элемент меню для выбора времени
/// </summary>
/// <param name="element">Элемент меню для выбора времени</param>
function HoverElement(element)
{
	isInsideTimePicker = true;

	//Current level
	element.siblings().removeClass('ui-state-highlight');
	element.addClass('ui-state-highlight');
}

/// <summary>
/// Установить, что меню сейчас не активно
/// </summary>
function LeaveTimePicker() { isInsideTimePicker = false; }

/// <summary>
/// Redraw TimePicker-control
/// </summary>
function redrawTimePicker()
{
	var hrs = this.timePicker.find('div:eq(1)');
	var dayHours = hrs.find('span').slice(0, 12);
	var nightHours = hrs.find('span').slice(12, 24);
	if (this.timePicker.find('div:eq(0) span:eq(0)').hasClass('ui-state-highlight'))
	{
		// daytime
		nightHours.hide();
		dayHours.show();
	} else
	{
		//nighttime
		dayHours.hide();
		nightHours.show();
	}

	// reposition each div
	var divs = this.timePicker.find('div');
	divs.each(function (i)
	{
		var prevDiv = $(this).prev('div');
		// find the span that's being hovered; if nothing, use the first one 
		var pos = prevDiv.find('.ui-state-highlight:visible').position() || prevDiv.find('span:visible:first').position();
		if (pos) $(this).css('margin-left', pos.left);
	});
}

/// <summary>
/// Show a TimePicker-control
/// </summary>
/// <param name="control">Html-element for input time</param>
function showTimePicker(control)
{
    currentInputControl = control;

	this.timePicker.css
	({
		top: control.offset().top + control.height() + 4,
		left: control.offset().left
	});
	this.timePicker.find('div:eq(0)').show();
}

/// <summary>
/// Hide a TimePicker-control
/// </summary>
function hideTimePicker()
{
	this.timePicker.find('div').hide();
}

/// <summary>
/// Set a TimePicker-control's value
/// </summary>
/// <param name="validValue">Valid value</param>
function setTimePickerValue(validValue)
{
	this.currentInputControl.data('initialValue', validValue);
	this.currentInputControl.val(validValue);

	$(document).trigger('timePickerChanged', { inputControl: this.currentInputControl });
}

/// <summary>
/// Check if a TimePicker-control has a valid value
/// </summary>
function validateTimePicker()
{
	var timeString = this.currentInputControl.val();

	if (timeString != "")
	{
		if (onlyHoursRegEx.test(timeString))
		{
			timeString = timeString + ":00";
		}
		else
		{
			if (!fullTimeRegEx.test(timeString))
			{
				this.ResetTimePickerValue();
				return;
			}
		}
	}

	this.setTimePickerValue(timeString);
}

/// <summary>
/// Обновить значение контрола
/// </summary>
function UpdateControlValue()
{
	var val = {
		h: this.GetTimePickerValue('hour'),
		m: this.GetTimePickerValue('minute')
	};

	this.setTimePickerValue(this.FormatTimePickerValue(this.TimePickerFormat, val));
}

/// <summary>
/// Получить текущие выбранные значения в меню
/// </summary>
/// <param name="type">Тип элемента меню (часы, минуты)</param>
function GetTimePickerValue(type)
{
	// get the highlighted element; if none is highlighted, get the first one
	var elem = $('.' + type + '.ui-state-highlight', this.timePicker)[0] || $('.' + type + ':first', this.timePicker)[0];
	return $.trim($(elem).text());
}

/// <summary>
/// Сбросить значение контрола на предыдущее
/// </summary>
function ResetTimePickerValue()
{
	this.currentInputControl.val(this.currentInputControl.data('initialValue'));
}

/// <summary>
/// Отформатировать значение контрола
/// </summary>
/// <param name="s">Шаблон форматирования</param>
/// <param name="o">Значение</param>
function FormatTimePickerValue(s, o)
{ // simple parameterizing strings
	for (key in o) s = s.replace('{' + key + '}', o[key]);
	return s;
}