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
	this.updateControlValue();
}

/// <summary>
/// Handle a mouseOver event for level "Hour" or "Prefix"
/// </summary>
/// <param name="topLevel">Html-element either "Prefix" or "Hour"</param>
function hoverTopLevelHandler(topLevel)
{
	this.hoverElementHandler(topLevel);

	//Down level
	var downRow = topLevel.parent().next();
	var downRowElements = downRow.children();
	downRowElements.removeClass('ui-state-highlight');
	downRow.show(this.AnimSpeed);

	this.redrawTimePicker();
	downRowElements.filter(':visible:first').addClass('ui-state-highlight');
}

/// <summary>
/// Handle a mouseOver event
/// </summary>
/// <param name="element">Element which triggered an event</param>
function hoverElementHandler(element)
{
	isInsideTimePicker = true;

	//Current level
	element.siblings().removeClass('ui-state-highlight');
	element.addClass('ui-state-highlight');
}

/// <summary>
/// Set timePicker's menu to "not active"
/// </summary>
function leaveTimePicker() { isInsideTimePicker = false; }

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
				this.resetTimePickerValue();
				return;
			}
		}
	}

	this.setTimePickerValue(timeString);
}

/// <summary>
/// Update control's value
/// </summary>
function updateControlValue()
{
	var val = {
		h: this.getTimePickerValue('hour'),
		m: this.getTimePickerValue('minute')
	};

	this.setTimePickerValue(this.formatTimePickerValue(this.TimePickerFormat, val));
}

/// <summary>
/// Get current selected values in a menu
/// </summary>
/// <param name="type">A type of a menu's element (hours, minutes)</param>
function getTimePickerValue(type)
{
	// get the highlighted element; if none is highlighted, get the first one
	var elem = $('.' + type + '.ui-state-highlight', this.timePicker)[0] || $('.' + type + ':first', this.timePicker)[0];
	return $.trim($(elem).text());
}

/// <summary>
/// Reset control's value to a previous one
/// </summary>
function resetTimePickerValue()
{
	this.currentInputControl.val(this.currentInputControl.data('initialValue'));
}

/// <summary>
/// Format a value of a control
/// </summary>
/// <param name="template">Шаблон форматирования</param>
/// <param name="values">Values</param>
function formatTimePickerValue(template, values)
{ // simple parameterizing strings
    for (key in values) template = template.replace('{' + key + '}', values[key]);
    return template;
}