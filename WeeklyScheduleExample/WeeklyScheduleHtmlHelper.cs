using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using WeeklyScheduleExample.App_GlobalResources;
using WeeklyScheduleExample.Models;

namespace WeeklyScheduleExample
{
	public static class WeeklyScheduleHtmlHelper
	{
		#region Const

		/// <summary
        /// Separator symbol which is used to generate an id of an Html-element
		/// </summary>
		public const string IdSeparator = "_";

		/// <summary>
        /// Style to hide an Html-element
		/// </summary>
		private const string Hidden = "display:none";

		/// <summary>
        /// Style to show an Html-element
		/// </summary>
		private const string Visible = "display:block";

		/// <summary>
		/// Template to show the time interval
		/// </summary>
		private const string TimeIntervalTemplate = "c:{0}&nbsp;по:{1}";

		#endregion

		#region Get Ids

		/// <summary>
        /// Get an id of an Html-element to show the "working hours"
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>Id of an Html-element</returns>
		public static IHtmlString GetWorkHoursId(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.GetWorkingTypeId(html, WorkingType.WorkHours);
		}

		/// <summary>
        /// Get an id of an Html-element to show the "round the clock"
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>Id of an Html-element</returns>
		public static IHtmlString GetRoundTheClockId(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.GetWorkingTypeId(html, WorkingType.RoundTheClock);
		}

		/// <summary>
        /// Get an id of an Html-element to show a "day-off"
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>Id of an Html-element</returns>
		public static IHtmlString GetClosedId(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.GetWorkingTypeId(html, WorkingType.Closed);
		}

		/// <summary>
        /// Get an id of an Html-element to show a working type for the specified day of a week
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <param name="workingType">Working type</param>
        /// <returns>Id of an Html-element</returns>
        private static IHtmlString GetWorkingTypeId(HtmlHelper<DayOfTheWeek> html, WorkingType workingType)
		{
            return html.Raw(html.ViewData.Model.DayOfWeek.ToString() + WeeklyScheduleHtmlHelper.IdSeparator + workingType.ToString());
		}

		/// <summary>
        /// Get an id of an Html-element to show breaks for the specified day of a week
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>Id of an Html-element</returns>
		public static IHtmlString GetBreaksId(this HtmlHelper<DayOfTheWeek> html)
		{
            return html.Raw(html.ViewData.Model.DayOfWeek.ToString() + WeeklyScheduleHtmlHelper.IdSeparator + "Breaks");
		}

		#endregion

		#region IsWorkingTypeVisible

		/// <summary>
		/// Based on a working type for a day detect if "working hours" type is visible
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>"display:none" or "display:block"</returns>
		public static string IsWorkHoursVisible(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.IsWorkingTypeVisible(html.ViewData.Model.WorkingType, WorkingType.WorkHours);
		}

		/// <summary>
        /// Based on a working type for a day detect if "round the clock" type is visible
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>"display:none" or "display:block"</returns>
		public static string IsRoundTheClockVisible(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.IsWorkingTypeVisible(html.ViewData.Model.WorkingType, WorkingType.RoundTheClock);
		}

		/// <summary>
        /// Based on a working type for a day detect if "day off" type is visible
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>"display:none" or "display:block"</returns>
		public static string IsClosedVisible(this HtmlHelper<DayOfTheWeek> html)
		{
            return WeeklyScheduleHtmlHelper.IsWorkingTypeVisible(html.ViewData.Model.WorkingType, WorkingType.Closed);
		}

		/// <summary>
        /// Detect if show or hide a given working type based on a model's state
		/// </summary>
		/// <param name="modelWorkingType">Model's working type</param>
		/// <param name="currentWorkingType">Working type</param>
        /// <returns>"display:none" or "display:block"</returns>
		private static string IsWorkingTypeVisible(WorkingType modelWorkingType, WorkingType currentWorkingType)
		{
            return modelWorkingType == currentWorkingType ? WeeklyScheduleHtmlHelper.Visible : WeeklyScheduleHtmlHelper.Hidden;
		}

		#endregion

		#region Time Intervals

		/// <summary>
		/// Get the title of a dialogBox to display a breaks list
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
		/// <returns>Title</returns>
		public static IHtmlString GetBreaksDialogTitle(this HtmlHelper<DayOfTheWeek> html)
		{
			switch (html.ViewData.Model.DayOfWeek)
			{
 				case DayOfWeek.Monday:
					return html.Raw(Resources.BreaksTitleMonday);

				case DayOfWeek.Tuesday:
                    return html.Raw(Resources.BreaksTitleTuesday);

				case DayOfWeek.Wednesday:
                    return html.Raw(Resources.BreaksTitleWednesday);

				case DayOfWeek.Thursday:
                    return html.Raw(Resources.BreaksTitleThursday);

				case DayOfWeek.Friday:
                    return html.Raw(Resources.BreaksTitleFriday);

				case DayOfWeek.Saturday:
                    return html.Raw(Resources.BreaksTitleSaturday);

				default:
                    return html.Raw(Resources.BreaksTitleSunday);
			};
		}
        
		/// <summary>
		/// Detect if to display a breaks list.
        /// If "day-off" than hide a breaks list.
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>"display:none" or "display:block"</returns>
		public static string IsBreakContainerVisible(this HtmlHelper<DayOfTheWeek> html)
		{
            return html.ViewData.Model.WorkingType == WorkingType.Closed ? WeeklyScheduleHtmlHelper.Hidden : WeeklyScheduleHtmlHelper.Visible;
		}

		/// <summary>
        /// Get Html representation of the working hours
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
        /// <returns>Html representation of the working hours</returns>
		public static IHtmlString GetWorkHours(this HtmlHelper<DayOfTheWeek> html)
		{
			TimeSpan open;
			TimeSpan close;

			if (html.ViewData.Model.WorkingType == WorkingType.WorkHours)
			{
				open = html.ViewData.Model.WorkHours.Open;
				close = html.ViewData.Model.WorkHours.Close;
			}
			else
			{
				open = new TimeSpan();
				close = new TimeSpan();
			}

            return WeeklyScheduleHtmlHelper.GetTimeInterval(html, open, "open", close, "close");
		}

		/// <summary>
		/// Get breaks list for a given day of a week
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
		/// <returns>Breaks list in an Html-representation</returns>
		public static IEnumerable<BreakControlInfo> GetBreaks(this HtmlHelper<DayOfTheWeek> html)
		{
			int c = 0;
			string fromName = "from{0}";
			string toName = "to{0}";

			IList<BreakHours> breaks = html.ViewData.Model.Breaks;
			if (breaks != null)
			{
				foreach (BreakHours breakHours in breaks)
				{
					yield return new BreakControlInfo
					{
                        IsDeleteButtonVisible = WeeklyScheduleHtmlHelper.Visible,
                        BreakControl = WeeklyScheduleHtmlHelper.GetTimeInterval(html, breakHours.From, WeeklyScheduleHtmlHelper.GetFormattedName(fromName, c), breakHours.To, WeeklyScheduleHtmlHelper.GetFormattedName(toName, c))
					};

					c++;
				}
			}

			yield return new BreakControlInfo
			{
                IsDeleteButtonVisible = WeeklyScheduleHtmlHelper.Hidden,
                BreakControl = WeeklyScheduleHtmlHelper.GetTimeInterval(html, new TimeSpan(), WeeklyScheduleHtmlHelper.GetFormattedName(fromName, c), new TimeSpan(), WeeklyScheduleHtmlHelper.GetFormattedName(toName, c))
			};
		}

		/// <summary>
		/// Get an Html to display time interval
		/// </summary>
		/// <param name="html">Represents support for rendering HTML controls in a strongly typed view</param>
		/// <param name="from">Time "from"</param>
		/// <param name="fromName">Id of an Html element to display time "from"</param>
		/// <param name="to">Time "to"</param>
        /// <param name="toName">Id of an Html element to display time "to"</param>
		/// <returns>Html-representation of a time interval control</returns>
		private static IHtmlString GetTimeInterval(HtmlHelper<DayOfTheWeek> html, TimeSpan from, string fromName, TimeSpan to, string toName)
		{
            return html.Raw(string.Format(WeekModel.cultureInfo,
                               WeeklyScheduleHtmlHelper.TimeIntervalTemplate,
							   html.EditorFor(m => from, "Time", fromName),
							   html.EditorFor(m => to, "Time", toName)));
		}

		/// <summary>
		/// Get a formatted name for an Html element
		/// </summary>
		/// <param name="template">Template</param>
		/// <param name="index">Index of an Html-element</param>
		/// <returns>Formatted name of an Html element</returns>
		private static string GetFormattedName(string template, int index)
		{
            return string.Format(WeekModel.cultureInfo, template, index);
		}

		#endregion
	}

	/// <summary>
	/// An internal helper class to display breaks list
	/// </summary>
	public class BreakControlInfo
	{
		/// <summary>
		/// Is a button to delete a break visible?
		/// </summary>
		public string IsDeleteButtonVisible { get; set; }

		/// <summary>
		/// Html-representation of a break control
		/// </summary>
		public IHtmlString BreakControl { get; set; }
	}
}