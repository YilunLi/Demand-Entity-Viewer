﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace test.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult HomePage()
        {
            ViewBag.UserName = Request.LogonUserIdentity.Name;

            return View("HomePage");
        }
    }
}