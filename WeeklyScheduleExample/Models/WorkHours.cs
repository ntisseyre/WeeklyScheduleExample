using System;
using System.Xml.Serialization;
using System.Xml;

namespace WeeklyScheduleExample.Models
{
    public class WorkHours : IXmlSerializable
    {
        public TimeSpan Open { get; set; }

        public TimeSpan Close { get; set; }

        #region IXmlSerializable Members

        /// <summary>
        /// This method is reserved and should not be used
        /// </summary>
        /// <returns>An System.Xml.Schema.XmlSchema that describes the XML representation of the object
        /// that is produced by the System.Xml.Serialization.IXmlSerializable.WriteXml(System.Xml.XmlWriter) method 
        /// and consumed by the System.Xml.Serialization.IXmlSerializable.ReadXml(System.Xml.XmlReader) method
        /// </returns>
        public System.Xml.Schema.XmlSchema GetSchema()
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Generates an object from its XML representation
        /// </summary>
        /// <param name="reader">The System.Xml.XmlReader stream from which the object is deserialized</param>
        public void ReadXml(System.Xml.XmlReader reader)
        {
			this.Open = TimeSpan.ParseExact(reader.GetAttribute("open"), "T", null);
			this.Close = TimeSpan.ParseExact(reader.GetAttribute("close"), "T", null);
        }

        /// <summary>
        /// Converts an object into its XML representation
        /// </summary>
        /// <param name="writer">The System.Xml.XmlWriter stream to which the object is serialized</param>
        public void WriteXml(System.Xml.XmlWriter writer)
        {
            writer.WriteAttributeString("open", this.Open.ToString());
            writer.WriteAttributeString("close", this.Close.ToString());
        }

        #endregion

		#region Equality Operations

		public override bool Equals(object obj)
		{
			return Equals(obj as WorkHours);
		}

		public bool Equals(WorkHours obj)
		{
			if (object.ReferenceEquals(obj, null))
			{
				return false;
			}
			return WorkHours.Equals(this, obj);
		}

		public static bool Equals(WorkHours obj1, WorkHours obj2)
		{
			if (object.ReferenceEquals(obj1, null) && object.ReferenceEquals(obj2, null))
			{
				return true;
			}

			if (object.ReferenceEquals(obj1, null) || object.ReferenceEquals(obj2, null))
			{
				return false;
			}

			return obj1.Open == obj2.Open
				&& obj1.Close == obj2.Close;
		}

		public static bool operator ==(WorkHours obj1, WorkHours obj2)
		{
			return WorkHours.Equals(obj1, obj2);
		}

		public static bool operator !=(WorkHours obj1, WorkHours obj2)
		{
			return !WorkHours.Equals(obj1, obj2);
		}

		public override int GetHashCode()
		{
			return this.Open.GetHashCode()
				^ this.Close.GetHashCode();
		}

		#endregion
    }
}