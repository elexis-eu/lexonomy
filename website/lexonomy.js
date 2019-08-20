const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
var siteconfig = require("./siteconfig").load();
if (process.argv[2]) {
  siteconfig.baseUrl = process.argv[2];
}
const https = require("https");
const ops = require("./ops");
const xemplatron = require("./widgets/xemplatron.js");
const xmldom = require("xmldom"); // https://www.npmjs.com/package/xmldom
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: "50mb" })); // for parsing application/json
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const multer = require("multer");
const upload = multer({ dest: path.join(siteconfig.dataDir, "uploads/") });
const nodemailer = require("nodemailer");
ops.mailtransporter = nodemailer.createTransport(siteconfig.mailconfig);
const PORT = process.env.PORT || siteconfig.port || 80;
const jwt = require("jsonwebtoken");
const fluxslt = require("fluxslt");
const url = require("url");

// Log the request:
if (siteconfig.verbose) {
  app.use(function (req, res, next) {
    res.on("finish", function () {
      console.error("[NODEJS] - - [" +
                  new Date().toLocaleString("en", { hour12: false }).replace(",", "") +
                  '] "' + req.method + " " + req.url + " " + req.protocol + '" ' + res.statusCode + " " + res.getHeader("Content-Length"));
    });
    next();
  });
}

// Path to our views:
app.set("views", path.join(__dirname, "views")); app.set("view engine", "ejs"); // http://ejs.co/




app.use(function (req, res) { res.status(404).render("404.ejs", { siteconfig: siteconfig }) });
process.on("uncaughtException", (err) => {
  // Log the exception:
  if (siteconfig.verbose) {
    console.error(err);
    var str = `Caught exception: ${err}\n`;
    if (siteconfig.verbose.multiline && siteconfig.verbose.filename) str += "\n";
    if (siteconfig.verbose.filename) fs.appendFile(siteconfig.verbose.filename, str, function (err) {});
    else console.error(str);
  }
});
app.listen(PORT);
console.error("Process ID " + process.pid + " is now listening on port number " + PORT + ".");
