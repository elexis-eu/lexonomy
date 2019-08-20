const path = require("path");
const fs = require("fs-extra");
const xmldom = require("xmldom"); // https://www.npmjs.com/package/xmldom
const sqlite3 = require("sqlite3").verbose(); // https://www.npmjs.com/package/sqlite3
const sha1 = require("sha1"); // https://www.npmjs.com/package/sha1
const markdown = require("markdown").markdown; // https://www.npmjs.com/package/markdown
const https = require("https");
const querystring = require("querystring");
const { fork } = require("child_process");
const find_process = require("find-process");
const siteconfig = require("./siteconfig");

module.exports = {
  mailtransporter: null,
  getDB: function (dictID, readonly) {
    var mode = (readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE);
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"), mode, function (err) {
      if (err) { throw new Error(err) }
    });
    if (!readonly) db.run("PRAGMA journal_mode=WAL");
    db.run("PRAGMA foreign_keys=on");
    return db;
  },
  // get request remote IP, if under proxy get real IP
  getRemoteAddress: function (request) {
    var remoteIp = request.connection.remoteAddress.replace("::ffff:", "");
    if (request.headers["x-forwarded-for"] != undefined) {
      remoteIp = request.headers["x-forwarded-for"];
    }
    if (request.headers["x-real-ip"] != undefined) {
      remoteIp = request.headers["x-real-ip"];
    }
    if (request.headers["x-real-ip"] != undefined) {
      remoteIp = request.headers["x-real-ip"];
    }
    return remoteIp;
  },

  dictExists: function (dictID) {
    return fs.existsSync(path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"));
  },
  readDictConfigs: function (db, dictID, callnext) {
    if (db.dictConfigs) { callnext(db.dictConfigs) } else {
      var configs = { siteconfig: siteconfig };
      db.all("select * from configs", {}, function (err, rows) {
        if (!err) for (var i = 0; i < rows.length; i++) configs[rows[i].id] = JSON.parse(rows[i].json);
        var ids = ["ident", "publico", "users", "kex", "titling", "flagging", "searchability", "xampl", "thes", "collx", "defo", "xema", "xemplate", "editing", "subbing"];
        ids.map(function (id) { if (!configs[id]) configs[id] = module.exports.defaultDictConfig(id); });
        db.dictConfigs = configs;
        callnext(configs);
      });
    }
  },
  readDictConfig: function (db, dictID, configID, callnext) {
    db.get("select * from configs where id=$id", { $id: configID }, function (err, row) {
      if (err || !row) var config = module.exports.defaultDictConfig(configID); else var config = JSON.parse(row.json);
      callnext(config);
    });
  },
  defaultDictConfig: function (id) {
    if (id == "editing") return { xonomyMode: "nerd", xonomyTextEditor: "askString" };
    if (id == "searchability") return { searchableElements: [] };
    if (id == "xema") return { elements: {} };
    if (id == "titling") return { headwordAnnotations: [], abc: siteconfig.defaultAbc };
    if (id == "flagging") return { flag_element: "", flags: [] };
    return {};
  },
  createEntry: function (db, dictID, entryID, xml, email, historiography, callnext) {
    module.exports.readDictConfigs(db, dictID, function (configs) {
      var abc = configs.titling.abc; if (!abc || abc.length == 0) abc = configs.siteconfig.defaultAbc;
      xml = setHousekeepingAttributes(entryID, xml, configs.subbing);
      xml = module.exports.removeSubentryParentTags(xml);
      var params = {
        $xml: xml,
        $title: module.exports.getEntryTitle(xml, configs.titling),
        $sortkey: module.exports.toSortkey(module.exports.getSortTitle(xml, configs.titling), abc),
        $doctype: getDoctype(xml),
        $needs_refac: Object.keys(configs.subbing).length > 0 ? 1 : 0,
        $needs_resave: configs.searchability.searchableElements && configs.searchability.searchableElements.length > 0 ? 1 : 0
      };

      // Check if entry title already exists
      var sql = "select id from entries where title = $title";
      db.all(sql, { $title: params.$title }, function (err, rows) {
        if (err) { throw new Error(err) }
        var feedback;
        if (rows.length > 0) {
          // Already exists. Make sure a warning is returned.
          feedback = {
            type: "saveFeedbackHeadwordExists",
            info: rows[0]["id"]
          };
        }

        var sql = "insert into entries(xml, title, sortkey, needs_refac, needs_resave, doctype) values($xml, $title, $sortkey, $needs_refac, $needs_resave, $doctype)";
        if (entryID) {
          sql = "insert into entries(id, xml, title, sortkey, needs_refac, needs_resave, doctype) values($id, $xml, $title, $sortkey, $needs_refac, $needs_resave, $doctype)";
          params.$id = entryID;
        }
        db.run(sql, params, function (err) {
          if (err) { throw new Error(err) }
          if (!entryID) entryID = this.lastID;
          db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
            $entry_id: entryID,
            $txt: module.exports.getEntryTitle(xml, configs.titling, true),
            $level: 1
          });
          db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
            $entry_id: entryID,
            $action: "create",
            $when: (new Date()).toISOString(),
            $email: email,
            $xml: xml,
            $historiography: JSON.stringify(historiography)
          }, function (err) {});
          // module.exports.addSubentryParentTags(db, entryID, xml, function(xml){
          callnext(entryID, xml, feedback);
          // });
        });
      });
    });
  },
  updateEntry: function (db, dictID, entryID, xml, email, historiography, callnext) {
    db.get("select id, xml from entries where id=$id", { $id: entryID }, function (err, row) {
      module.exports.readDictConfigs(db, dictID, function (configs) {
        var abc = configs.titling.abc; if (!abc || abc.length == 0) abc = configs.siteconfig.defaultAbc;
        xml = setHousekeepingAttributes(entryID, xml, configs.subbing);
        xml = module.exports.removeSubentryParentTags(xml);
        var newXml = xml.replace(/ xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']/g, "").replace(/(\=)\"([^\"]*)\"/g, "$1'$2'").replace(/ lxnm:(sub)?entryID='[0-9]+'/g, "");
        var oldXml = (row ? row.xml : "").replace(/ xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']/g, "").replace(/(\=)\"([^\"]*)\"/g, "$1'$2'").replace(/ lxnm:(sub)?entryID='[0-9]+'/g, "");
        if (!row) { // an entry with that ID does not exist: recreate it with that ID:
          module.exports.createEntry(db, dictID, entryID, xml, email, historiography, callnext);
        } else if (oldXml == newXml) {
          callnext(entryID, xml, false);
        } else {
          // tell my parents that they need a refresh:
          db.run("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=$child_id)", { $child_id: entryID }, function (err) {
            // update me:
            var params = {
              $id: entryID,
              $title: module.exports.getEntryTitle(xml, configs.titling),
              $sortkey: module.exports.toSortkey(module.exports.getSortTitle(xml, configs.titling), abc),
              $xml: xml,
              $doctype: getDoctype(xml),
              $needs_refac: Object.keys(configs.subbing).length > 0 ? 1 : 0,
              $needs_resave: configs.searchability.searchableElements && configs.searchability.searchableElements.length > 0 ? 1 : 0
            };
            // Check if entry title already existed
            var sql = "select id from entries where title = $title and id <> $id";
            db.all(sql, { $title: params.$title, $id: params.$id }, function (err, rows) {
              if (err) { throw new Error(err) }
              var feedback;
              if (rows.length > 0) {
                // Already exists. Make sure a warning is returned.
                feedback = {
                  type: "saveFeedbackHeadwordExists",
                  info: rows[0]["id"]
                };
              }

              db.run("update entries set doctype=$doctype, xml=$xml, title=$title, sortkey=$sortkey, needs_refac=$needs_refac, needs_resave=$needs_resave where id=$id", params, function (err) {
                db.run("update searchables set txt=$txt where entry_id=$entry_id and level=1", {
                  $entry_id: entryID,
                  $txt: module.exports.getEntryTitle(xml, configs.titling, true)
                }, function (err) {});
                // tell history that I have been updated:
                db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
                  $entry_id: entryID,
                  $action: "update",
                  $when: (new Date()).toISOString(),
                  $email: email,
                  $xml: xml,
                  $historiography: JSON.stringify(historiography)
                }, function (err) {});
                // module.exports.addSubentryParentTags(db, entryID, xml, function(xml){
                callnext(entryID, xml, true, feedback);
                // });
              });
            });
          });
        }
      });
    });
  },

  removeSubentryParentTags: function (xml) {
    xml = xml.replace(/<lxnm:subentryParent[^>]*>/g, "");
    return xml;
  },
  addSubentryParentTags: function (db, entryID, xml, callnext) {
    var doc = (new xmldom.DOMParser()).parseFromString(xml, "text/xml");
    var els = [];
    var _els = doc.getElementsByTagName("*"); els.push(_els[0]); for (var i = 1; i < _els.length; i++) {
      if (_els[i].getAttributeNS("http://www.lexonomy.eu/", "subentryID") != "") els.push(_els[i]);
    }
    var go = function () {
      if (els.length > 0) {
        var el = els.pop();
        var subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID");
        if (el.parentNode.nodeType != 1) subentryID = entryID;
        db.all("select s.parent_id, e.title from sub as s inner join entries as e on e.id=s.parent_id where s.child_id=$child_id", { $child_id: subentryID }, function (err, rows) {
          for (var i = 0; i < rows.length; i++) {
            var pel = doc.createElementNS("http://www.lexonomy.eu/", "lxnm:subentryParent");
            pel.setAttribute("id", rows[i].parent_id);
            pel.setAttribute("title", rows[i].title);
            el.appendChild(pel);
          }
          go();
        });
      } else {
        xml = (new xmldom.XMLSerializer()).serializeToString(doc);
        callnext(xml);
      }
    };
    go();
  },


  listEntries: function (db, dictID, doctype, searchtext, modifier, howmany, reversed, fullXML, callnext) {
    module.exports.readDictConfigs(db, dictID, function (configs) {
      if (!searchtext) searchtext = "";
      if (configs.flagging.flag_element || fullXML) { var entryXML = ", e.xml " } else { var entryXML = "" }
      var sortdesc = configs.titling.headwordSortDesc || false;
      if (reversed == "true") { sortdesc = !sortdesc }
      if (sortdesc) { sortdesc = " DESC " } else { sortdesc = "" }
      if (modifier == "start") {
        var sql1 = "select s.txt, min(s.level) as level, e.id, e.title" + entryXML +
          ` from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and s.txt like $like
          group by e.id
          order by e.sortkey` + sortdesc + `, s.level
          limit $howmany`;
        var params1 = { $howmany: howmany, $like: searchtext + "%", $doctype: doctype };
        var sql2 = `select count(distinct s.entry_id) as total
          from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and s.txt like $like`;
        var params2 = { $like: searchtext + "%", $doctype: doctype };
      } else if (modifier == "wordstart") {
        var sql1 = "select s.txt, min(s.level) as level, e.id, e.title" + entryXML +
          ` from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and (s.txt like $like1 or s.txt like $like2)
          group by e.id
          order by e.sortkey` + sortdesc + `, s.level
          limit $howmany`;
        var params1 = { $howmany: howmany, $like1: searchtext + "%", $like2: "% " + searchtext + "%", $doctype: doctype };
        var sql2 = `select count(distinct s.entry_id) as total
          from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and (s.txt like $like1 or s.txt like $like2)`;
        var params2 = { $like1: searchtext + "%", $like2: "% " + searchtext + "%", $doctype: doctype };
      } else if (modifier == "substring") {
        var sql1 = "select s.txt, min(s.level) as level, e.id, e.title" + entryXML +
          ` from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and s.txt like $like
          group by e.id
          order by e.sortkey` + sortdesc + `, s.level
          limit $howmany`;
        var params1 = { $howmany: howmany, $like: "%" + searchtext + "%", $doctype: doctype };
        var sql2 = `select count(distinct s.entry_id) as total
          from searchables as s
          inner join entries as e on e.id=s.entry_id
          where doctype=$doctype and s.txt like $like`;
        var params2 = { $like: "%" + searchtext + "%", $doctype: doctype };
      }
      db.all(sql1, params1, function (err, rows) {
        if (err || !rows) rows = [];
        var entries = [];
        for (var i = 0; i < rows.length; i++) {
          var item = { id: rows[i].id, title: rows[i].title };
          if (configs.flagging.flag_element) { item.flag = extractText(rows[i].xml, configs.flagging.flag_element)[0] || "" }
          if (fullXML) { item.xml = setHousekeepingAttributes(rows[i].id, rows[i].xml, configs.subbing) }
          if (rows[i].level > 1) item.title += " ← <span class='redirector'>" + rows[i].txt + "</span>";
          entries.push(item);
        }
        db.get(sql2, params2, function (err, row) {
          var total = (!err && row) ? row.total : 0;
          callnext(total, entries);
        });
      });
    });
  },

  getSortTitle: function (xml, titling) {
    if (titling.headwordSorting) { return module.exports.getEntryHeadword(xml, titling.headwordSorting) }
    return module.exports.getEntryHeadword(xml, titling.headword);
  },
  getEntryTitle: function (xml, titling, plaintext) {
    if (typeof (xml) != "string") xml = (new xmldom.XMLSerializer()).serializeToString(xml);
    if (titling.headwordAnnotationsType == "advanced") {
      var ret = titling.headwordAnnotationsAdvanced.replace(/%\([^)]+\)/g, function (el) {
        return extractText(xml, el.substring(2, el.length - 1));
      });
      return ret;
    }
    var ret = module.exports.getEntryHeadword(xml, titling.headword);
    if (!plaintext) { ret = "<span class='headword'>" + ret + "</span>" }
    if (titling.headwordAnnotations) {
      for (var i = 0; i < titling.headwordAnnotations.length; i++) {
        if (ret != "") ret += " ";
        ret += extractText(xml, titling.headwordAnnotations[i]).join(" ");
      }
    }
    return ret;
  },
  getEntryHeadword: function (xml, headword_elem) {
    if (typeof (xml) != "string") xml = (new xmldom.XMLSerializer()).serializeToString(xml);
    // if(typeof(xml)=="string") var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml'); else doc=xml;
    var ret = "";
    var arr = extractText(xml, headword_elem);
    if (arr.length > 0) ret = arr[0];
    if (ret == "") {
      ret = extractFirstText(xml);
    }
    if (ret == "") ret = "?";
    if (ret.length > 255) ret = ret.substring(0, 255); // keeping headwords under 255 characters is probably a reeasonable limitation
    // console.log(ret);
    return ret;
  },
  toSortkey: function (s, abc) {
    const keylength = 15;
    var ret = s.replace(/<[<>]+>/g, "").toLowerCase();
    // replace any numerals:
    var pat = new RegExp("[0-9]{1," + keylength + "}", "g");
    ret = ret.replace(pat, function (x) { while (x.length < keylength + 1) x = "0" + x; return x });
    // prepare characters:
    var chars = [];
    var count = 0;
    for (var pos = 0; pos < abc.length; pos++) {
      var key = (count++).toString(); while (key.length < keylength) key = "0" + key; key = "_" + key;
      for (var i = 0; i < abc[pos].length; i++) {
        if (i > 0) count++;
        chars.push({ char: abc[pos][i], key: key });
      }
    }
    chars.sort(function (a, b) { if (a.char.length > b.char.length) return -1; if (a.char.length < b.char.length) return 1; return 0 });
    // replace characters:
    for (var i = 0; i < chars.length; i++) {
      if (!/^[0-9]$/.test(chars[i].char)) { // skip chars that are actually numbers
        while (ret.indexOf(chars[i].char) > -1) ret = ret.replace(chars[i].char, chars[i].key);
      }
    }
    // remove any remaining characters that aren't a number or an underscore:
    ret = ret.replace(/[^0-9_]/g, "");
    return ret;
  },
  getEntrySearchables: function (xml, searchability, titling) {
    if (typeof (xml) != "string") xml = (new xmldom.XMLSerializer()).serializeToString(xml);
    // if(typeof(xml)=="string") var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml'); else doc=xml;
    var ret = [];
    ret.push(module.exports.getEntryHeadword(xml, titling.headword));
    if (searchability.searchableElements) {
      for (var i = 0; i < searchability.searchableElements.length; i++) {
        var arr = extractText(xml, searchability.searchableElements[i]);
        arr.map(txt => { if (txt != "" && ret.indexOf(txt) == -1) ret.push(txt); });
      }
    }
    // console.log(ret);
    return ret;
  },


  verifyLogin: function (email, sessionkey, callnext) {
    var yesterday = (new Date()); yesterday.setHours(yesterday.getHours() - 24); yesterday = yesterday.toISOString();
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    if (email != null) email = email.toLowerCase();
    db.get("select email, ske_username, ske_apiKey, apiKey, consent from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", { $email: email, $key: sessionkey, $yesterday: yesterday }, function (err, row) {
      if (!row || siteconfig.readonly) {
        db.close();
        callnext({ loggedin: false, email: "" });
      } else {
        email = row.email || "";
        var ske_username = row.ske_username;
        var ske_apiKey = row.ske_apiKey;
        var apiKey = row.apiKey;
        var consent = false;
        if (row.consent == 1) consent = true;
        var now = (new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", { $now: now, $email: email }, function (err, row) {
          db.close();
          callnext({ loggedin: true, email: email, ske_username: ske_username, ske_apiKey: ske_apiKey, apiKey: apiKey, consent: consent, isAdmin: (siteconfig.admins.indexOf(email) > -1) });
        });
      }
    });
  },
  verifyLoginAndDictAccess: function (email, sessionkey, dictDB, dictID, callnext) {
    var yesterday = (new Date()); yesterday.setHours(yesterday.getHours() - 24); yesterday = yesterday.toISOString();
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    if (email != undefined) email = email.toLowerCase();
    db.get("select email, ske_apiKey, ske_username from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", { $email: email, $key: sessionkey, $yesterday: yesterday }, function (err, row) {
      if (!row || siteconfig.readonly) {
        db.close();
        callnext({ loggedin: false, email: null });
      } else {
        email = row.email || "";
        var ske_apiKey = row.ske_apiKey;
        var ske_username = row.ske_username;
        var now = (new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", { $now: now, $email: email }, function (err, row) {
          db.close();
          module.exports.readDictConfigs(dictDB, dictID, function (configs) {
            if (!configs.users[email] && siteconfig.admins.indexOf(email) == -1) {
              callnext({ loggedin: true, email: email, dictAccess: false, isAdmin: false });
            } else {
              var canEdit = (configs.siteconfig.admins.indexOf(email) > -1 ? true : configs.users[email].canEdit);
              var canConfig = (configs.siteconfig.admins.indexOf(email) > -1 ? true : configs.users[email].canConfig);
              var canDownload = (configs.siteconfig.admins.indexOf(email) > -1 ? true : configs.users[email].canDownload);
              var canUpload = (configs.siteconfig.admins.indexOf(email) > -1 ? true : configs.users[email].canUpload);
              callnext({ loggedin: true, email: email, dictAccess: true, isAdmin: (configs.siteconfig.admins.indexOf(email) > -1), canEdit: canEdit, canConfig: canConfig, canDownload: canDownload, canUpload: canUpload, ske_username: ske_username, ske_apiKey: ske_apiKey });
            }
          });
        });
      }
    });
  },
  logout: function (email, sessionkey, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set sessionKey=null where email=$email and sessionKey=$key", { $email: email.toLowerCase(), $key: sessionkey }, function (err, row) {
      db.close();
      callnext();
    });
  },
  verifyUserApiKey: function (email, apikey, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and apiKey=$key", { $email: email.toLowerCase(), $key: apikey }, function (err, row) {
      if (!row || siteconfig.readonly) {
        db.close();
        callnext({ valid: false });
      } else {
        email = row.email || "";
        db.close();
        callnext({ valid: true, email: email });
      }
    });
  },
  markdown: function (str) {
    var tree = markdown.parse(str);
    str = markdown.renderJsonML(markdown.toHTMLTree(tree));
    str = str.replace("<a href=\"http", "<a target=\"_blank\" href=\"http");
    return str;
  },

  readUserApiKey: function (email, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select apiKey from users where email=$email", { $email: email.toLowerCase() }, function (err, row) {
      if (!row) callnext(""); else {
        db.close();
        callnext(row.apiKey);
      }
    });
  },
  updateUserApiKey: function (email, apikey, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
    db.run("update users set apiKey=$apiKey where email=$email", {
      $email: email.toLowerCase(),
      $apiKey: apikey
    }, function (err) {
      db.close();
      callnext();
    });
  },



}; // end of module.exports

function setHousekeepingAttributes (entryID, xml, subbing) {
  // delete any housekeeping attributes and elements that already exist in the XML:
  xml = xml.replace(/^(<[^>\/]*)\s+xmlns:lxnm=['"]http:\/\/www\.lexonomy\.eu\/["']/, function (found, $1) { return $1 });
  xml = xml.replace(/^(<[^>\/]*)\s+lxnm:entryID=['"][^\"\']*["']/, function (found, $1) { return $1 });
  xml = xml.replace(/^(<[^>\/]*)\s+lxnm:subentryID=['"][^\"\']*["']/, function (found, $1) { return $1 });
  // get name of the top-level element:
  var root = ""; xml.replace(/^<([^\s>\/]+)/, function (found, $1) { root = $1 });
  // set housekeeping attributes:
  if (subbing[root]) xml = xml.replace(/^<[^\s>\/]+/, function (found) { return found + " lxnm:subentryID='" + entryID + "'" });
  if (!subbing[root]) xml = xml.replace(/^<[^\s>\/]+/, function (found) { return found + " lxnm:entryID='" + entryID + "'" });
  xml = xml.replace(/^<[^\s>\/]+/, function (found) { return found + " xmlns:lxnm='http://www.lexonomy.eu/'" });
  return xml;
}

function getDoctype (xml) {
  var ret = "";
  xml = xml.replace(/^<([^>\/\s]+)/, function (found, $1) { ret = $1 });
  return ret;
}

function extractText (xml, elName) { // extract the text contents from thusly named elements, return as array of strings
  var ret = [];
  var pat = new RegExp("<" + elName + "[^>]*>([^<]*)</" + elName + ">", "g");
  xml.replace(pat, function (found, $1) {
    var s = $1.replace(/<[^>]*>/g, "").trim();
    if (s != "") ret.push(s);
  });
  return ret;
}
function extractFirstText (xml) { // extract the text content from the first element that has text content and no child nodes
  var ret = "";
  var pat = new RegExp("<([^\\s>]+)[^>]*>([^<>]*?)</([^\\s>]+)>", "g");
  xml.replace(pat, function (found, $1, $2, $3) {
    if (ret == "" && $1 == $3) {
      var s = $2.trim();
      if (s != "") ret = s;
    }
  });
  return ret;
}

const prohibitedDictIDs = ["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "dicts", "oneclick", "recoverpwd", "createaccount", "consent", "userprofile"];
