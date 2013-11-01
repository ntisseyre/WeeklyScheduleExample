using System;
using System.Globalization;
using System.IO;
using System.Xml.Serialization;
using WeeklyScheduleExample.App_GlobalResources;

namespace WeeklyScheduleExample.Models
{
	[XmlRoot(ElementName = "week", Namespace = "urn:supperslonic:weeklySchedule")]
	public class WeekModel
	{
        public static readonly CultureInfo cultureInfo = new CultureInfo(Resources.CultureInfo);
        private static readonly XmlSerializer serializer = new XmlSerializer(typeof(WeekModel));

		[XmlElement(ElementName = "monday")]
		public DayOfTheWeek Monday { get; set; }

		[XmlElement(ElementName = "tuesday")]
		public DayOfTheWeek Tuesday { get; set; }

		[XmlElement(ElementName = "wednesday")]
		public DayOfTheWeek Wednesday { get; set; }

		[XmlElement(ElementName = "thursday")]
		public DayOfTheWeek Thursday { get; set; }

		[XmlElement(ElementName = "friday")]
		public DayOfTheWeek Friday { get; set; }

		[XmlElement(ElementName = "saturday")]
		public DayOfTheWeek Saturday { get; set; }

		[XmlElement(ElementName = "sunday")]
		public DayOfTheWeek Sunday { get; set; }

        public WeekModel()
		{
			this.Monday = new DayOfTheWeek(DayOfWeek.Monday);
			this.Tuesday = new DayOfTheWeek(DayOfWeek.Tuesday);
			this.Wednesday = new DayOfTheWeek(DayOfWeek.Wednesday);
			this.Thursday = new DayOfTheWeek(DayOfWeek.Thursday);
			this.Friday = new DayOfTheWeek(DayOfWeek.Friday);
			this.Saturday = new DayOfTheWeek(DayOfWeek.Saturday);
			this.Sunday = new DayOfTheWeek(DayOfWeek.Sunday);
		}

        public static WeekModel Default
		{
			get
			{
                WeekModel week = new WeekModel();

				week.Monday.WorkingType = WorkingType.RoundTheClock;
				week.Tuesday.WorkingType = WorkingType.RoundTheClock;
				week.Wednesday.WorkingType = WorkingType.RoundTheClock;
				week.Thursday.WorkingType = WorkingType.RoundTheClock;
				week.Friday.WorkingType = WorkingType.RoundTheClock;
				week.Saturday.WorkingType = WorkingType.RoundTheClock;
				week.Sunday.WorkingType = WorkingType.RoundTheClock;

				/*
				week.Monday.WorkHours = new WorkHours();
				week.Tuesday.WorkHours = new WorkHours();
				week.Wednesday.WorkHours = new WorkHours();
				week.Thursday.WorkHours = new WorkHours();
				week.Friday.WorkHours = new WorkHours();
				week.Saturday.WorkHours = new WorkHours();
				week.Sunday.WorkHours = new WorkHours();
				*/

				return week;
			}
		}

		#region Serialization Support

        public static WeekModel GetRecord(string xml)
		{
			using (TextReader reader = new StringReader(xml))
			{
                WeekModel result = serializer.Deserialize(reader) as WeekModel;
				if (result != null)
				{
					result.Monday.DayOfWeek = DayOfWeek.Monday;
					result.Tuesday.DayOfWeek = DayOfWeek.Tuesday;
					result.Wednesday.DayOfWeek = DayOfWeek.Wednesday;
					result.Thursday.DayOfWeek = DayOfWeek.Thursday;
					result.Friday.DayOfWeek = DayOfWeek.Friday;
					result.Saturday.DayOfWeek = DayOfWeek.Saturday;
					result.Sunday.DayOfWeek = DayOfWeek.Sunday;
				}

				return result;
			}
		}

		public override string ToString()
		{
            XmlSerializer serializer = new XmlSerializer(typeof(WeekModel));

            using (TextWriter writer = new StringWriter(WeekModel.cultureInfo))
			{

				serializer.Serialize(writer, this);

				return writer.ToString();
			}
		}

		#endregion

		#region Equality Operations

		public override bool Equals(object obj)
		{
            return Equals(obj as WeekModel);
		}

        public bool Equals(WeekModel obj)
		{
			if (object.ReferenceEquals(obj, null))
			{
				return false;
			}
            return WeekModel.Equals(this, obj);
		}

        public static bool Equals(WeekModel obj1, WeekModel obj2)
		{
			if (object.ReferenceEquals(obj1, null) && object.ReferenceEquals(obj2, null))
			{
				return true;
			}

			if (object.ReferenceEquals(obj1, null) || object.ReferenceEquals(obj2, null))
			{
				return false;
			}

			return obj1.Monday == obj2.Monday
				&& obj1.Tuesday == obj2.Tuesday
				&& obj1.Wednesday == obj2.Wednesday
				&& obj1.Thursday == obj2.Thursday
				&& obj1.Friday == obj2.Friday
				&& obj1.Saturday == obj2.Saturday
				&& obj1.Sunday == obj2.Sunday;
		}

        public static bool operator ==(WeekModel obj1, WeekModel obj2)
		{
            return WeekModel.Equals(obj1, obj2);
		}

        public static bool operator !=(WeekModel obj1, WeekModel obj2)
		{
            return !WeekModel.Equals(obj1, obj2);
		}

        public override int GetHashCode()
        {
            return this.Monday.GetHashCode()
                ^ this.Tuesday.GetHashCode()
                ^ this.Wednesday.GetHashCode()
                ^ this.Thursday.GetHashCode()
                ^ this.Friday.GetHashCode()
                ^ this.Saturday.GetHashCode()
                ^ this.Sunday.GetHashCode();
        }

		#endregion
	}
}
