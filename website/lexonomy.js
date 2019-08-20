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


// PUSH API:
app.get(siteconfig.rootPath + "push.api", function (req, res) {
  res.render("pushapi.ejs", { siteconfig: siteconfig });
});
app.post(siteconfig.rootPath + "push.api", function (req, res) {
  var json = req.body;
  var email = json.email;
  var apikey = json.apikey;
  ops.verifyUserApiKey(email, apikey, function (user) {
    if (!user.valid) {
      res.json({ success: false });
    } else {
      if (json.command == "makeDict") {
        ops.suggestDictID(function (dictID) {
          var dictTitle = json.dictTitle.replace(/^\s+/g, "").replace(/\s+$/g, ""); if (!dictTitle) dictTitle = dictID;
          var dictBlurb = json.dictBlurb;
          var poses = json.poses;
          var labels = json.labels;
          ops.makeDict(dictID, "push", dictTitle, dictBlurb, email, function (success) {
            if (!success) res.json({ success: false }); else {
              var db = ops.getDB(dictID);
              ops.readDictConfig(db, dictID, "xema", function (xema) {
                if (xema.elements["partOfSpeech"]) for (var i = 0; i < poses.length; i++) xema.elements["partOfSpeech"].values.push({ value: poses[i], caption: "" });
                if (xema.elements["collocatePartOfSpeech"]) for (var i = 0; i < poses.length; i++) xema.elements["collocatePartOfSpeech"].values.push({ value: poses[i], caption: "" });
                if (xema.elements["label"]) for (var i = 0; i < labels.length; i++) xema.elements["label"].values.push({ value: labels[i], caption: "" });
                ops.updateDictConfig(db, dictID, "xema", xema, function () {
                  db.close();
                  res.json({ success: true, dictID: dictID });
                });
              });
            }
          });
        });
      } else if (json.command == "createEntries") {
        var dictID = json.dictID;
        var entryXmls = json.entryXmls;
        var db = ops.getDB(dictID);
        db.run("BEGIN TRANSACTION");
        db.serialize(function () {
          var doneCount = 0;
          for (var i = 0; i < entryXmls.length; i++) {
            var xml = entryXmls[i];
            ops.createEntry(db, dictID, null, xml, email, { apikey: apikey }, function () {
              doneCount++;
              if (doneCount >= entryXmls.length) {
                db.run("COMMIT");
                db.close(function () {
                  res.json({ success: true });
                });
              }
            });
          }
        });
      } else {
        res.json({ success: false });
      }
    }
  });
});




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
