using System.Web.Mvc;
using System.Xml;
using WeeklyScheduleExample.Models;

namespace WeeklyScheduleExample.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            //Create a weekly schedule from an example xml-file
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(Server.MapPath("~/WeeklyScheduleExample.xml"));
            WeekModel week = WeekModel.GetRecord(xmlDocument.OuterXml);

            return View(week);
        }
    }
}