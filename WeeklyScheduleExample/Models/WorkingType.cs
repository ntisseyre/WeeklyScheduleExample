using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WeeklyScheduleExample.Models
{
    /// <summary>
    /// Type of the schedule for a specific day of a week
    /// </summary>
    public enum WorkingType
    {
        /// <summary>
        /// Undefined
        /// </summary>
        None,

        /// <summary>
        /// Day off
        /// </summary>
        Closed,

        /// <summary>
        /// Working hours "from" and "to",
        /// for example: from 8 am to 4 pm
        /// </summary>
        WorkHours,

        /// <summary>
        /// 24 hours
        /// </summary>
        RoundTheClock
    }
}
