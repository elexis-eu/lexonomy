const express=require("express");
const app=express();
const path=require("path");
const fs=require("fs");
var siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8"));
const https=require("https");
const ops=require("./ops");
 ops.siteconfig=siteconfig;
const xemplatron=require("./widgets/xemplatron.js");
const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.json({ limit: '50mb' })); //for parsing application/json
const cookieParser = require('cookie-parser');
  app.use(cookieParser());
const multer = require('multer');
const upload = multer({ dest: path.join(siteconfig.dataDir, "uploads/") });
const url=require("url");
const querystring=require("querystring");
const libxslt=require("libxslt"); //https://www.npmjs.com/package/libxslt
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const nodemailer = require('nodemailer');
  ops.mailtransporter = nodemailer.createTransport(siteconfig.mailconfig);
const PORT=process.env.PORT||siteconfig.port||80;
const jwt = require("jsonwebtoken");

//Do this for each request:
app.use(function (req, res, next) {
  if(!/^\/(widgets|furniture|libs)\//.test(req.url) && !/^\/docs\/.*\.[a-zA-Z0-9]+$/.test(req.url)) { //skip if the request is for a static file
    //Reload my siteconfig:
    siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8"));
    ops.siteconfig=siteconfig;
    //Log the request:
    if(siteconfig.verbose){
      var bodyCopy={}; for(var key in req.body) { bodyCopy[key]=req.body[key]; if(key=="password") bodyCopy[key]="******"; }
      var delim="\t"; if(siteconfig.verbose.multiline) {delim="\n";}
      var str=req.method+delim+req.url+delim+"COOKIES: "+JSON.stringify(req.cookies)+delim+"REQUEST BODY: "+JSON.stringify(bodyCopy)+"\n";
      if(siteconfig.verbose.multiline && siteconfig.verbose.filename) str+="\n";
      if(siteconfig.verbose.filename) fs.appendFile(siteconfig.verbose.filename, str, function(err){});
      else console.log(str);
    }
  }
  next();
});

//Paths to our static files:
app.use(siteconfig.rootPath+"widgets", express.static(path.join(__dirname, "widgets")));
app.use(siteconfig.rootPath+"furniture", express.static(path.join(__dirname, "furniture")));
app.use(siteconfig.rootPath+"libs", express.static(path.join(__dirname, "libs")));
app.use(siteconfig.rootPath+"docs", express.static(path.join(__dirname, "docs")));

//Path to our views:
app.set('views', path.join(__dirname, "views")); app.set('view engine', 'ejs') //http://ejs.co/

//REDIRECT OLD URLS FROM BETA VERSION:
app.get(siteconfig.rootPath+"_en/", function(req, res){ res.redirect("/"); });
app.get(siteconfig.rootPath+"_info/", function(req, res){ res.redirect("/docs/intro/"); });
app.get(siteconfig.rootPath+":dictID/en/", function(req, res){ res.redirect("/"+req.params.dictID+"/"); });

//SITEWIDE UI:
app.get(siteconfig.rootPath, function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if (user.loggedin && !user.consent) {
      res.redirect(siteconfig.baseUrl + 'consent/');
    }
    ops.getDictsByUser(user.email, function(dicts){
      var error = null;
      if (req.cookies.jwt_error) {
        error = req.cookies.jwt_error;
        res.clearCookie('jwt_error');
      }
      res.render("home.ejs", {siteconfig: siteconfig, user: user, dicts: dicts, error: error});
    });
  });
});
app.get(siteconfig.rootPath+"consent/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if (!user.loggedin) res.redirect(siteconfig.baseUrl);
    res.render("consent.ejs", {user: user, siteconfig: siteconfig});
  });
});
app.get(siteconfig.rootPath+"login/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(/\/login\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.render("login.ejs", {user: user, redirectUrl: req.headers.referer || siteconfig.baseUrl, siteconfig: siteconfig});
  });
});
app.get(siteconfig.rootPath+"logout/", function(req, res){
  ops.logout(req.cookies.email, req.cookies.sessionkey, function(){
    res.clearCookie("email");
    res.clearCookie("sessionkey");
    if(/\/logout\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.redirect(req.headers.referer || siteconfig.baseUrl);
  });
});
app.get(siteconfig.rootPath+"make/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect("/"); else {
      ops.suggestDictID(function(suggested){
        res.render("make.ejs", {user: user, siteconfig: siteconfig, suggested: suggested});
      });
    }
  });
});
app.get(siteconfig.rootPath+"signup/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    res.render("signup.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig});
  });
});
app.get(siteconfig.rootPath+"forgotpwd/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    res.render("forgotpwd.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig});
  });
});
app.get(siteconfig.rootPath+"createaccount/:token/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.verifyToken(req.params.token, "register", function(valid){
      var tokenValid = valid;
      res.render("createaccount.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig, token: req.params.token, tokenValid: tokenValid});
    });
  });
});
app.get(siteconfig.rootPath+"recoverpwd/:token/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.verifyToken(req.params.token, "recovery", function(valid){
      var tokenValid = valid;
      res.render("recoverpwd.ejs", {user: user, redirectUrl: siteconfig.baseUrl, siteconfig: siteconfig, token: req.params.token, tokenValid: tokenValid});
    });
  });
});
app.get(siteconfig.rootPath+"changepwd/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(/\/changepwd\/$/.test(req.headers.referer)) req.headers.referer=null;
    res.render("changepwd.ejs", {user: user, redirectUrl: req.headers.referer || siteconfig.baseUrl, siteconfig: siteconfig});
  });
});

//SITEWIDE UI, JSON endpoints:
app.post(siteconfig.rootPath+"login.json", function(req, res){
  ops.login(req.body.email, req.body.password, function(success, email, sessionkey){
    if(success) {
      //const oneday=86400000; //86,400,000 miliseconds = 24 hours
      // res.cookie("email", email, {expires: new Date(Date.now() + oneday)});
      // res.cookie("sessionkey", sessionkey, {expires: new Date(Date.now() + oneday)});
      res.cookie("email", email, {});
      res.cookie("sessionkey", sessionkey, {});
      res.json({success: true, sessionkey: sessionkey});
    } else {
      res.json({success: false});
    }
  });
});
app.post(siteconfig.rootPath+"consent.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if (user.loggedin) {
      ops.setConsent(user.email, req.body.consent, function(success) {
        res.json({success: success});
      });
    }
  });
});
app.post(siteconfig.rootPath+"make.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect(siteconfig.baseUrl); else {
      ops.makeDict(req.body.url, req.body.template, req.body.title, "", user.email, function(success){
        res.json({success: success});
      });
    }
  });
});
app.post(siteconfig.rootPath+"changepwd.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect(siteconfig.baseUrl); else {
      ops.changePwd(user.email, req.body.password, function(success){
        res.json({success: success});
      });
    }
  });
});
app.post(siteconfig.rootPath+"signup.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.sendSignupToken(req.body.email, remoteip, function(success){
    res.json({success: success});
  });
});
app.post(siteconfig.rootPath+"forgotpwd.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.sendToken(req.body.email, remoteip, function(success){
    res.json({success: success});
  });
});
app.post(siteconfig.rootPath+"createaccount.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.createAccount(req.body.token, req.body.password, remoteip, function(success){
    res.json({success: success});
  });
});
app.post(siteconfig.rootPath+"recoverpwd.json", function(req, res){
  var remoteip = ops.getRemoteAddress(req);
  ops.resetPwd(req.body.token, req.body.password, remoteip, function(success){
    res.json({success: success});
  });
});

//DOCS:
app.get(siteconfig.rootPath+"docs/:docID/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    ops.getDoc(req.params.docID, function(doc){
      res.render("doc.ejs", {user: user, siteconfig: siteconfig, doc: doc});
    });
  });
});

//USERS UI, navigator and editor:
app.get(siteconfig.rootPath+"users/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect(siteconfig.baseUrl); else {
      res.render("users.ejs", {user: user, siteconfig: siteconfig});
    }
  });
});
app.get(siteconfig.rootPath+"users/editor/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect("about:blank"); else {
      res.render("usereditor.ejs", {user: user, siteconfig: siteconfig});
    }
  });
});

//USERS UI, JSON endpoints:
app.post(siteconfig.rootPath+"users/userlist.json", function(req, res){ //console.log(req.body.criteria, req.body.searchtext, req.body.howmany);
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.listUsers(req.body.searchtext, req.body.howmany, function(total, entries){
        res.json({success: true, total: total, entries: entries});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/usercreate.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.createUser(req.body.content, function(entryID, adjustedXml){
        res.json({success: true, id: entryID, content: adjustedXml});
      })
    }
  });
});
app.post(siteconfig.rootPath+"users/userread.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.readUser(req.body.id, function(adjustedEntryID, xml){
        res.json({success: (adjustedEntryID!=""), id: adjustedEntryID, content: xml});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/userupdate.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.updateUser(req.body.id, req.body.content, function(adjustedEntryID, adjustedXml){
        res.json({success: true, id: adjustedEntryID, content: adjustedXml});
      });
    }
  });
});
app.post(siteconfig.rootPath+"users/userdelete.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.deleteUser(req.body.id, function(){
        res.json({success: true, id: req.body.id});
      });
    }
  });
});

//DICTIONARIES UI, navigator and editor:
app.get(siteconfig.rootPath+"dicts/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect(siteconfig.baseUrl); else {
      res.render("dicts.ejs", {user: user, siteconfig: siteconfig});
    }
  });
});
app.get(siteconfig.rootPath+"dicts/editor/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.redirect("about:blank"); else {
      res.render("dicteditor.ejs", {user: user, siteconfig: siteconfig});
    }
  });
});

//DICTIONARIES UI, JSON endpoints:
app.post(siteconfig.rootPath+"dicts/dictlist.json", function(req, res){ //console.log(req.body.criteria, req.body.searchtext, req.body.howmany);
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.listDicts(req.body.searchtext, req.body.howmany, function(total, entries){
        res.json({success: true, total: total, entries: entries});
      });
    }
  });
});
app.post(siteconfig.rootPath+"dicts/dictread.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.isAdmin) res.json({success: false}); else {
      ops.readDict(req.body.id, function(adjustedEntryID, xml){
        res.json({success: (adjustedEntryID!=""), id: adjustedEntryID, content: xml});
      });
    }
  });
});

//SKETCHENGINE LOGIN JSON endpoint:
app.get(siteconfig.rootPath+"skelogin.json/:token", function(req, res){
  //var token = req.headers.authorization.replace('Bearer ', '');
  var token = req.params.token;
  var secret = siteconfig.sketchengineKey;
  jwt.verify(token, secret, {audience:'lexonomy.eu'}, function(err, decoded) {
    if (err == null) {
      console.log(decoded)
      ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
        ops.processJWT(user, decoded, function(success, email, sessionkey){
          if (success) {
            res.cookie("email", email, {});
            res.cookie("sessionkey", sessionkey, {});
            res.redirect(siteconfig.baseUrl)
          } else {
            res.cookie("jwt_error", email, {});
            res.redirect(siteconfig.baseUrl)
          }
        });
      });
    } else {
      //JWT not verified, error
      res.cookie("jwt_error",err.message,{})
      res.redirect(siteconfig.baseUrl)
    }
  });
});

//ONE-CLICK UI and JSON endpoints:
app.get(siteconfig.rootPath+"oneclick/", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.redirect(siteconfig.baseUrl); else {
      res.render("oneclick.ejs", {user: user, siteconfig: siteconfig});
    }
  });
});
app.post(siteconfig.rootPath+"oneclickread.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.json({success: false}); else {
      ops.readUserApiKey(user.email, function(apikey){
        res.json({success: true, id: "oneclick", content: {apikey: apikey} });
      });
    }
  });
});
app.post(siteconfig.rootPath+"oneclickupdate.json", function(req, res){
  ops.verifyLogin(req.cookies.email, req.cookies.sessionkey, function(user){
    if(!user.loggedin) res.json({success: false}); else {
      //req.body.id, req.body.content
      var adjustedEntryID=req.body.id;
      var json=JSON.parse(req.body.content);
      ops.updateUserApiKey(user.email, json.apikey, function(){
        res.json({success: true, id: adjustedEntryID, content: json});
      });
    }
  });
});

//PUSH API:
app.get(siteconfig.rootPath+"push.api", function(req, res){
  res.render("pushapi.ejs", {siteconfig: siteconfig});
});
app.post(siteconfig.rootPath+"push.api", function(req, res){
  var json=req.body;
  var email=json.email;
  var apikey=json.apikey;
  ops.verifyUserApiKey(email, apikey, function(user){
    if(!user.valid){
      res.json({success: false});
    } else {
      if(json.command=="makeDict"){
        ops.suggestDictID(function(dictID){
          var dictTitle=json.dictTitle.replace(/^\s+/g, "").replace(/\s+$/g, ""); if(!dictTitle) dictTitle=dictID;
          var dictBlurb=json.dictBlurb;
          var poses=json.poses;
          var labels=json.labels;
          ops.makeDict(dictID, "push", dictTitle, dictBlurb, email, function(success){
            if(!success) res.json({success: false}); else {
              var db=ops.getDB(dictID);
              ops.readDictConfig(db, dictID, "xema", function(xema){
                if(xema.elements["partOfSpeech"]) for(var i=0; i<poses.length; i++) xema.elements["partOfSpeech"].values.push({value: poses[i], caption: ""});
                if(xema.elements["collocatePartOfSpeech"]) for(var i=0; i<poses.length; i++) xema.elements["collocatePartOfSpeech"].values.push({value: poses[i], caption: ""});
                if(xema.elements["label"]) for(var i=0; i<labels.length; i++) xema.elements["label"].values.push({value: labels[i], caption: ""});
                ops.updateDictConfig(db, dictID, "xema", xema, function(){
                  db.close();
                  res.json({success: true, dictID: dictID});
                });
              });
            }
          });
        });
      } else if(json.command=="createEntries"){
        var dictID=json.dictID;
        var entryXmls=json.entryXmls;
        var db=ops.getDB(dictID);
        db.run("BEGIN TRANSACTION");
        db.serialize(function(){
          var doneCount=0;
          for(var i=0; i<entryXmls.length; i++){
            var xml=entryXmls[i];
            ops.createEntry(db, dictID, null, xml, email, {apikey: apikey}, function(){
              doneCount++;
              if(doneCount>=entryXmls.length){
                db.run("COMMIT");
                db.close(function(){
                  res.json({success: true});
                });
              }
            });
          }
        });
      } else {
        res.json({success: false});
      }
    }
  });
});

//PUBLIC DICTIONARY UI:
app.get(siteconfig.rootPath+":dictID/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readDictConfigs(db, req.params.dictID, function(configs){
      db.close();
      var blurb=ops.markdown(configs.ident.blurb);
      res.render("dict.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, dictBlurb: blurb, publico: configs.publico, siteconfig: configs.siteconfig});
    });
  });
});
app.get(siteconfig.rootPath+":dictID/:entryID(\\d+)/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readDictConfigs(db, req.params.dictID, function(configs){
      if(!configs.publico.public) res.redirect(siteconfig.baseUrl+req.params.dictID+"/"); else {
        ops.readEntry(db, req.params.dictID, req.params.entryID, function(adjustedEntryID, xml, title){
          if(adjustedEntryID==0) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
          ops.readNabesByEntryID(db, req.params.dictID, req.params.entryID, function(nabes){
            db.close();
            var html="";
            if(configs.xemplate._xsl) {
              html=libxslt.parse(configs.xemplate._xsl).apply(xml);
            } else if(configs.xemplate._css) {
              html=xml;
            } else {
              var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
              html=xemplatron.xml2html(doc, configs.xemplate, configs.xema);
            }
            res.render("dict-entry.ejs", {
              user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, dictBlurb: configs.ident.blurb,
              publico: configs.publico, siteconfig: configs.siteconfig, entryID: adjustedEntryID, nabes: nabes, html: html,
              title: title, css: configs.xemplate._css
            });
          });
        });
      }
    });
  });
});
app.get(siteconfig.rootPath+":dictID/:entryID(\\d+).xml", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    if(!configs.publico.public) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
    if(!configs.siteconfig.licences[configs.publico.licence].canDownloadXml) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
    ops.exportEntryXml(configs.siteconfig.baseUrl, db, req.params.dictID, req.params.entryID, function(adjustedEntryID, xml){
      db.close();
      if(adjustedEntryID==0) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
      res.setHeader("content-type", "text/xml; charset=utf-8"); //human-readable; application/xml = human-unreadable
      res.end(xml);
    });
  });
});
app.post(siteconfig.rootPath+":dictID/random.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    if(!configs.publico.public) res.json({more: false, entries: []}); else {
      ops.readRandoms(db, req.params.dictID, function(more, entries){
        db.close();
        res.json({more: more, entries: entries});
      });
    }
  });
});
app.get(siteconfig.rootPath+":dictID/search/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readDictConfigs(db, req.params.dictID, function(configs){
      if(!configs.publico.public) res.redirect(siteconfig.baseUrl+req.params.dictID+"/"); else {
        ops.listEntriesPublic(db, req.params.dictID, req.query.q, function(entries){
          if(entries.length==1 && entries[0].exactMatch) {
            db.close();
            res.redirect("../"+entries[0].id+"/");
          } else {
            ops.readNabesByText(db, req.params.dictID, req.query.q, function(nabes){
              db.close();
              res.render("dict-search.ejs", {
                user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, dictBlurb: configs.ident.blurb,
                publico: configs.publico, siteconfig: configs.siteconfig,
                q: req.query.q, entries: entries, nabes: nabes
              });
            });
          }
        });
      }
    });
  });
});

//EDITING UI, navigator and editor:
app.get(siteconfig.rootPath+":dictID/edit/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfig(db, req.params.dictID, "xema", function(xema){
    db.close();
    res.redirect(xema.root+"/");
  });
});
app.get(siteconfig.rootPath+":dictID/edit/:doctype/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.dictAccess) {
      db.close();
      res.redirect(siteconfig.baseUrl+req.params.dictID+"/");
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        ops.readDoctypesUsed(db, req.params.dictID, function(doctypesUsed){
          db.close();
          var doctypes=[configs.xema.root];
          for(var doctype in configs.subbing) if(doctypes.indexOf(doctype)==-1) doctypes.push(doctype);
          doctypesUsed.map(doctype => {if(doctypes.indexOf(doctype)==-1) doctypes.push(doctype)});
          res.render("edit.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, flagging: configs.flagging, siteconfig: siteconfig, doctypes: doctypes, doctype: req.params.doctype, xonomyMode: configs.editing.xonomyMode});
        });
      });
    }
  });
});
app.get(siteconfig.rootPath+":dictID/:doctype/entryeditor/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.dictAccess) {
      db.close();
      res.redirect("about:blank");
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        db.close();
        if(configs.xemplate._xsl) configs.xemplate._xsl="dummy";
        configs.xema._root=configs.xema.root; if(configs.xema.elements[req.params.doctype]) configs.xema.root=req.params.doctype;
        res.render("entryeditor.ejs", { user: user, dictID: req.params.dictID, doctype: req.params.doctype, xema: configs.xema, xemplate: configs.xemplate, kex: configs.kex, xampl: configs.xampl, thes: configs.thes, collx: configs.collx, defo: configs.defo, titling: configs.titling, flagging: configs.flagging, siteconfig: siteconfig, css: configs.xemplate._css, editing: configs.editing, subbing: configs.subbing});
      });
    }
  });
});

//EDITING UI, JSON endpoints:
app.post(siteconfig.rootPath+":dictID/:doctype/entrylist.json", function(req, res){ //console.log(req.body.criteria, req.body.searchtext, req.body.howmany);
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.dictAccess) {
      db.close();
      res.json({success: false});
    } else {
      if(req.body.id) {
        ops.listEntriesById(db, req.params.dictID, req.body.id, function(entries){
          db.close();
          res.json({success: true, entries: entries});
        });
      } else {
        ops.listEntries(db, req.params.dictID, req.params.doctype, req.body.searchtext, req.body.modifier, req.body.howmany, function(total, entries){
          db.close();
          res.json({success: true, total: total, entries: entries});
        });
      }
    }
  });
});
app.post(siteconfig.rootPath+":dictID/entrycreate.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        ops.createEntry(db, req.params.dictID, null, req.body.content, user.email, {}, function(entryID, adjustedXml){
          db.close();
          var html="";
          if(configs.xemplate._xsl) {
            html=libxslt.parse(configs.xemplate._xsl).apply(adjustedXml);
          } else if(configs.xemplate._css) {
            html=adjustedXml;
          } else {
            var doc=(new xmldom.DOMParser()).parseFromString(adjustedXml, 'text/xml');
            html=xemplatron.xml2html(doc, configs.xemplate, configs.xema);
          }
          res.json({success: true, id: entryID, content: adjustedXml, contentHtml: html});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/entryread.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.dictAccess) {
      db.close();
      res.json({success: false});
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        ops.readEntry(db, req.params.dictID, req.body.id, function(adjustedEntryID, xml){
          db.close();
          var html="";
          if(xml){
            if(configs.xemplate._xsl) {
              html=libxslt.parse(configs.xemplate._xsl).apply(xml);
            } else if(configs.xemplate._css) {
              html=xml;
            } else {
              var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
              html=xemplatron.xml2html(doc, configs.xemplate, configs.xema);
            }
          }
          res.json({success: (adjustedEntryID>0), id: adjustedEntryID, content: xml, contentHtml: html});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/entryflag.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        ops.flagEntry(db, req.params.dictID, req.body.id, req.body.flag, user.email, {}, function(){
          db.close();
          res.json({success: true, id: req.body.id});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/entryupdate.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      ops.readDictConfigs(db, req.params.dictID, function(configs){
        ops.updateEntry(db, req.params.dictID, req.body.id, req.body.content, user.email, {}, function(adjustedEntryID, adjustedXml, changed){
          db.close();
          var html="";
          if(configs.xemplate._xsl) {
            html=libxslt.parse(configs.xemplate._xsl).apply(adjustedXml);
          } else if(configs.xemplate._css) {
            html=adjustedXml;
          } else {
            var doc=(new xmldom.DOMParser()).parseFromString(adjustedXml, 'text/xml');
            html=xemplatron.xml2html(doc, configs.xemplate, configs.xema);
          }
          res.json({success: true, id: adjustedEntryID, content: adjustedXml, contentHtml: html});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/entrydelete.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      ops.deleteEntry(db, req.params.dictID, req.body.id, user.email, {}, function(){
        db.close();
        res.json({success: true, id: req.body.id});
      });
    }
  });
});

//RESAVING:
app.get(siteconfig.rootPath+":dictID/resave/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canConfig && !user.canEdit && !user.canUpload) {
        db.close();
        res.redirect(siteconfig.baseUrl+req.params.dictID+"/edit/");
      } else {
        ops.getDictStats(db, req.params.dictID, function(stats){
          db.close();
          res.render("resave.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, awayUrl: "../../"+req.params.dictID+"/edit/", todo: stats.entryCount, siteconfig: siteconfig});
        });
      }
    });
  });
});
app.post(siteconfig.rootPath+":dictID/resave.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  db.run("BEGIN TRANSACTION");
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig && !user.canEdit && !user.canUpload) {
      db.run("COMMIT");
      db.close();
      res.json({todo: 0});
    } else {
      var counter=0;
      go();
      function go(){
        ops.refac(db, req.params.dictID, function(any){
          ops.refresh(db, req.params.dictID, function(any){
            ops.resave(db, req.params.dictID, function(){
              ops.getDictStats(db, req.params.dictID, function(stats){
                counter++;
                if(stats.needResave && counter<=127) {
                  go();
                } else {
                  db.run("COMMIT");
                  db.close(function(){ res.json({todo: stats.needResave}); });
                }
              });
            });
          });
        });
      }
    }
  });
});

//CONFIG UI: Screenful.Editor:
app.get(siteconfig.rootPath+":dictID/config/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canConfig) {
        db.close();
        res.redirect(siteconfig.baseUrl+req.params.dictID+"/edit/");
      } else {
        ops.getDictStats(db, req.params.dictID, function(stats){
          db.close();
          res.render("config.ejs", {
            user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, needResave: stats.needResave, siteconfig: siteconfig,
            hasXemaOverride: (configs.xema._xonomyDocSpec!=null || configs.xema._dtd!=null),
            hasXemplateOverride: (configs.xemplate._xsl!=null || configs.xemplate._css!=null),
            hasEditingOverride: (configs.editing._js!=null),
          });
        });
      }
    });
  });
});
app.get(siteconfig.rootPath+":dictID/config/:page/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canConfig) {
        db.close();
        res.redirect(siteconfig.baseUrl+req.params.dictID+"/edit/");
      } else {
        db.close();
        res.render("config-"+req.params.page+".ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, xema: configs.xema, titling: configs.titling, flagging: configs.flagging, siteconfig: configs.siteconfig});
      }
    });
  });
});

//CONFIG UI: JSON endpoints
app.post(siteconfig.rootPath+":dictID/configread.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig) {
      db.close();
      res.json({success: false});
    } else {
      ops.readDictConfig(db, req.params.dictID, req.body.id, function(config){
        db.close();
        res.json({success: true, id: req.body.id, content: config});
      });
    }
  })
});
app.post(siteconfig.rootPath+":dictID/configupdate.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig) {
      db.close();
      res.json({success: false});
    } else {
      ops.updateDictConfig(db, req.params.dictID, req.body.id, JSON.parse(req.body.content), function(adjustedJson, resaveNeeded){
        db.close();
        var redirUrl=null; if(resaveNeeded) redirUrl="../../resave/";
        res.json({success: true, id: req.body.id, content: adjustedJson, redirUrl: redirUrl});
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/randomone.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig) {
      db.close();
      res.json({id: 0, title: "", xml: ""});
    } else {
      ops.readRandomOne(db, req.params.dictID, function(entry){
        db.close();
        res.json(entry);
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/destroy.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig) {
      db.close();
      res.json({success: false});
    } else {
      db.close(function(){
        ops.destroyDict(req.params.dictID, function(){
          res.json({success: true});
        });
      });
    }
  });
});
app.post(siteconfig.rootPath+":dictID/move.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canConfig) {
      db.close();
      res.json({success: false});
    } else {
      db.close(function(){
        ops.renameDict(req.params.dictID, req.body.url, function(success){
          res.json({success: success});
        });
      });
    }
  });
});

//DOWNLOAD:
app.get(siteconfig.rootPath+":dictID/download/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canDownload) {
        db.close();
        res.redirect("../edit/");
      } else {
        db.close();
        res.render("download.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, siteconfig: siteconfig});
      }
    });
  });
});
app.get(siteconfig.rootPath+":dictID/download.xml", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canDownload) {
        db.close();
        res.redirect("edit/");
      } else {
        ops.download(db, req.params.dictID, res);
        db.close();
      }
    });
  });
});

//UPLOAD & IMPORT:
app.get(siteconfig.rootPath+":dictID/upload/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canUpload) {
        db.close();
        res.redirect("../edit/");
      } else {
        db.close();
        res.render("upload.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, siteconfig: siteconfig});
      }
    });
  });
});
app.post(siteconfig.rootPath+":dictID/upload.html", upload.single("myfile"), function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canUpload) {
        db.close();
        res.redirect("edit/");
      } else {
        if(!req.file) {
          db.close();
          res.send("<html><body>false</body></html>");
        } else {
          var filename=path.basename(req.file.path);
          var uploadStart=(new Date()).toISOString();
          var purge=(req.body.purge=="on");
          if(purge) {
            var historiography={uploadStart: uploadStart, filename: filename};
            ops.purge(db, req.params.dictID, user.email, historiography, function(){
              db.close(function(){
                res.send("<html><body>../import/?file="+filename+"&amp;uploadStart="+uploadStart+"</body></html>");
              });
            });
          } else {
            db.close();
            res.send("<html><body>../import/?file="+filename+"&amp;uploadStart="+uploadStart+"</body></html>");
          }
        }
      }
    });
  });
});
app.get(siteconfig.rootPath+":dictID/import/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canUpload) {
        db.close();
        res.redirect("../edit/");
      } else {
        db.close();
        var parsedUrl=url.parse(req.url, true);
        var filename=parsedUrl.query.file;
        var uploadStart=parsedUrl.query.uploadStart;
        res.render("import.ejs", {user: user, dictID: req.params.dictID, dictTitle: configs.ident.title, siteconfig: siteconfig, filename: filename, uploadStart: uploadStart});
      }
    });
  });
});
app.post(siteconfig.rootPath+":dictID/import.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID);
  db.run("BEGIN TRANSACTION");
  ops.readDictConfigs(db, req.params.dictID, function(configs){
    ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
      if(!user.canUpload) {
        db.run("COMMIT");
        db.close();
        res.redirect("edit/");
      } else {
        var filename=req.body.filename;
        var uploadStart=req.body.uploadStart;
        var historiography={uploadStart: uploadStart, filename: filename};
        ops.import(db, req.params.dictID, path.join(siteconfig.dataDir, "uploads/"+filename), user.email, historiography, function(entryCount){
          //console.log("going to commit and close");
          db.run("COMMIT");
          db.close(function(){
            //console.log("committed and closed");
            var ret={
              progressMessage: "Entries imported: "+entryCount,
              finished: true,
              state: {filename: filename, uploadStart: uploadStart},
            };
            res.json(ret);
          });

        });
      }
    });
  });
});

//SKETCH ENGINE PROXY:
app.get(siteconfig.rootPath+":dictID/skeget/xampl/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      db.close();
      var url=req.query.url;
      url+="/view";
      url+="?corpname="+req.query.corpus;
      url+="&username="+req.query.username;
      url+="&api_key="+req.query.apikey;
      url+="&format=json";
      //url+="&q=q[lemma%3d%22"+encodeURIComponent(req.query.lemma)+"%22]";
      url+="&q="+encodeURIComponent(makeQ(req.query.lemma));
      url+="&viewmode=sen";
      url+="&gdex_enabled=1";
      url+="&attrs=word";
      if(req.query.fromp) url+="&"+req.query.fromp;
      https.get(url, function(getres){
        getres.setEncoding('utf8');
        var data="";
        getres.on("data", function(chunk) {data+=chunk});
        getres.on("end", function(){
          try { var json=JSON.parse(data); } catch (e) { json={}; }
          res.json(json);
        });
      });
      // res.json({Lines: [
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      // ]});
    }
    function makeQ(str){
      var ret="";
      str.split(' ').map(word => {
        if(word!="") ret+=`[lemma="${word}"|word="${word}"]`;
      });
      return "q"+ret;
    }
  });
});
app.get(siteconfig.rootPath+":dictID/skeget/thes/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      db.close();
      var url=req.query.url;
      url+="/thes";
      url+="?corpname="+req.query.corpus;
      url+="&username="+req.query.username;
      url+="&api_key="+req.query.apikey;
      url+="&format=json";
      url+="&lemma="+encodeURIComponent(req.query.lemma);
      if(req.query.fromp) url+="&"+req.query.fromp;
      https.get(url, function(getres){
        getres.setEncoding('utf8');
        var data="";
        getres.on("data", function(chunk) {data+=chunk});
        getres.on("end", function(){
          try { var json=JSON.parse(data); } catch (e) { json={}; }
          res.json(json);
        });
      });
      // res.json({Lines: [
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      // ]});
    }
  });
});
app.get(siteconfig.rootPath+":dictID/skeget/collx/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      db.close();
      var url=req.query.url;
      url+="/wsketch";
      url+="?corpname="+req.query.corpus;
      url+="&username="+req.query.username;
      url+="&api_key="+req.query.apikey;
      url+="&format=json";
      url+="&lemma="+encodeURIComponent(req.query.lemma);
      url+="&structured=0";
      if(req.query.fromp) url+="&"+req.query.fromp;
      https.get(url, function(getres){
        getres.setEncoding('utf8');
        var data="";
        getres.on("data", function(chunk) {data+=chunk});
        getres.on("end", function(){
          try { var json=JSON.parse(data); } catch (e) { json={}; }
          res.json(json);
        });
      });
      // res.json({Lines: [
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      // ]});
    }
  });
});
app.get(siteconfig.rootPath+":dictID/skeget/defo/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      db.close();
      var url=req.query.url;
      url+="/view";
      url+="?corpname="+req.query.corpus;
      url+="&username="+req.query.username;
      url+="&api_key="+req.query.apikey;
      url+="&format=json";
      //url+="&q=q[lemma%3d%22"+encodeURIComponent(req.query.lemma)+"%22]";
      url+="&iquery="+makeQ(req.query.lemma);
      url+="&viewmode=sen";
      //url+="&gdex_enabled=1";
      //url+="&attrs=word";
      if(req.query.fromp) url+="&"+req.query.fromp;
      https.get(url, function(getres){
        getres.setEncoding('utf8');
        var data="";
        getres.on("data", function(chunk) {data+=chunk});
        getres.on("end", function(){
          try { var json=JSON.parse(data); } catch (e) { json={}; }
          res.json(json);
        });
      });
      // res.json({Lines: [
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      //   {Left: [{str: "Lorem ipsum "}], Kwic: [{str: req.query.lemma}], Right: [{str: " lorem ipsum."}]},
      // ]});
    }
    function makeQ(str){
      var ret="";
      str.split(' ').map(word => {
        if(word!="") ret+=`[lc="${word}"+|+lemma_lc="${word}"]`;
      });
      ret=`${str.replace(/ /g, "+")};q=aword,`+ret+`;q=p+0+0>0+1+[ws(".*",+"definitions",+".*")];exceptmethod=PREV-CONC`;
      return ret;
    }
  });
});

//SUBENTRIES: JSON endpoint
app.get(siteconfig.rootPath+":dictID/subget/", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    if(!user.canEdit) {
      db.close();
      res.json({success: false});
    } else {
      ops.listEntries(db, req.params.dictID, req.query.doctype, req.query.lemma, "wordstart", 100, function(total, entries){
        db.close();
        res.json({success: true, total: total, entries: entries});
      });
      // res.json([
      //   {id: 123, title: "<span class='headword'>hello world 1</span> aha", xml: "<exampleContainer/>"},
      //   {id: 345, title: "<span class='headword'>hello world 2</span> aha", xml: "<exampleContainer/>"},
      // ]);

    }
  });
});

//HISTORY: JSON endpoint
app.post(siteconfig.rootPath+":dictID/history.json", function(req, res){
  if(!ops.dictExists(req.params.dictID)) {res.status(404).render("404.ejs", {siteconfig: siteconfig}); return; }
  var db=ops.getDB(req.params.dictID, true);
  ops.verifyLoginAndDictAccess(req.cookies.email, req.cookies.sessionkey, db, req.params.dictID, function(user){
    ops.readDictConfigs(db, req.params.dictID, function(configs){
      ops.readDictHistory(db, req.params.dictID, req.body.id, function(history){
        db.close();
        var stylesheet=null;
        var domparser=null;
        for(var i=0; i<history.length; i++){
          var xml=history[i].content;
          if(xml) {
            var html="";
            if(configs.xemplate._xsl) {
              if(!stylesheet) stylesheet=libxslt.parse(configs.xemplate._xsl);
              html=stylesheet.apply(xml);
            } else if(configs.xemplate._css) {
              html=xml;
            } else {
              if(!domparser) domparser=new xmldom.DOMParser();
              var doc=domparser.parseFromString(xml, 'text/xml');
              html=xemplatron.xml2html(doc, configs.xemplate, configs.xema);
            }
            history[i].contentHtml=html;
          }
        }
        res.json(history);
      });
    });
  })
});

app.use(function(req, res){ res.status(404).render("404.ejs", {siteconfig: siteconfig}); });
process.on('uncaughtException', (err) => {
  if(!ops.siteconfig) ops.siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8"));
  //Log the exception:
  if(ops.siteconfig.verbose){
    var str=`Caught exception: ${err}\n`;
    if(ops.siteconfig.verbose.multiline && ops.siteconfig.verbose.filename) str+="\n";
    if(ops.siteconfig.verbose.filename) fs.appendFile(ops.siteconfig.verbose.filename, str, function(err){});
    else console.log(str);
  }
});
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
