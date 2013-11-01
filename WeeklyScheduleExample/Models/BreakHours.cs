using System;
using System.Xml.Serialization;
using System.Xml;
using System.Xml.Schema;

namespace WeeklyScheduleExample.Models
{
	public class BreakHours : IXmlSerializable
	{
		public TimeSpan From { get; set; }

		public TimeSpan To { get; set; }

		#region IXmlSerializable Members

		/// <summary>
		/// This method is reserved and should not be used
		/// </summary>
		/// <returns>An System.Xml.Schema.XmlSchema that describes the XML representation of the object
		/// that is produced by the System.Xml.Serialization.IXmlSerializable.WriteXml(System.Xml.XmlWriter) method 
		/// and consumed by the System.Xml.Serialization.IXmlSerializable.ReadXml(System.Xml.XmlReader) method
		/// </returns>
		public XmlSchema GetSchema()
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// Generates an object from its XML representation
		/// </summary>
		/// <param name="reader">The System.Xml.XmlReader stream from which the object is deserialized</param>
		public void ReadXml(XmlReader reader)
		{
			if (reader == null)
				throw new ArgumentNullException("reader");

			this.From = TimeSpan.ParseExact(reader.GetAttribute("from"), "T", null);
			this.To = TimeSpan.ParseExact(reader.GetAttribute("to"), "T", null);
		}

		/// <summary>
		/// Converts an object into its XML representation
		/// </summary>
		/// <param name="writer">The System.Xml.XmlWriter stream to which the object is serialized</param>
		public void WriteXml(XmlWriter writer)
		{
			if (null == writer) throw new ArgumentNullException("writer");

			writer.WriteAttributeString("from", this.From.ToString());
			writer.WriteAttributeString("to", this.To.ToString());
		}

		#endregion

		#region Equality Operations

		public override bool Equals(object obj)
		{
			return Equals(obj as BreakHours);
		}

		public bool Equals(BreakHours obj)
		{
			if (object.ReferenceEquals(obj, null))
			{
				return false;
			}
			return BreakHours.Equals(this, obj);
		}

		public static bool Equals(BreakHours obj1, BreakHours obj2)
		{
			if (object.ReferenceEquals(obj1, null) && object.ReferenceEquals(obj2, null))
			{
				return true;
			}

			if (object.ReferenceEquals(obj1, null) || object.ReferenceEquals(obj2, null))
			{
				return false;
			}

			return obj1.From == obj2.From
				&& obj1.To == obj2.To;
		}

		public static bool operator ==(BreakHours obj1, BreakHours obj2)
		{
			return BreakHours.Equals(obj1, obj2);
		}

		public static bool operator !=(BreakHours obj1, BreakHours obj2)
		{
			return !BreakHours.Equals(obj1, obj2);
		}

		public override int GetHashCode()
		{
			return this.From.GetHashCode()
				^ this.To.GetHashCode();
		}

		#endregion
	}
}