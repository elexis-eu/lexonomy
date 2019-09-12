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
  suggestDictID: function (callnext) {
    var id;
    do { id = generateDictID() } while (prohibitedDictIDs.indexOf(id) > -1 || module.exports.dictExists(id));
    callnext(id);
  },
  makeDict: function (dictID, template, title, blurb, email, callnext) {
    if (!title) title = "?";
    if (!blurb) blurb = "Yet another Lexonomy dictionary.";
    if (prohibitedDictIDs.indexOf(dictID) > -1 || module.exports.dictExists(dictID)) {
      callnext(false);
    } else {
      fs.copy("dictTemplates/" + template + ".sqlite", path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"), function (err) {
        var users = {}; users[email] = { "canEdit": true, "canConfig": true, "canDownload": true, "canUpload": true };
        var dictDB = module.exports.getDB(dictID);
        dictDB.run("update configs set json=$json where id='users'", { $json: JSON.stringify(users, null, "\t") }, function (err) {
          if (err) console.log(err);
          var ident = { "title": title, "blurb": blurb };
          dictDB.run("update configs set json=$json where id='ident'", { $json: JSON.stringify(ident, null, "\t") }, function (err) {
            if (err) console.log(err);
            module.exports.attachDict(dictDB, dictID, function () {
              dictDB.close();
              callnext(true);
            });
          });
        });
      });
    }
  },
  renameDict: function (oldDictID, newDictID, callnext) {
    if (prohibitedDictIDs.indexOf(newDictID) > -1 || module.exports.dictExists(newDictID)) {
      callnext(false);
    } else {
      fs.move(path.join(siteconfig.dataDir, "dicts/" + oldDictID + ".sqlite"), path.join(siteconfig.dataDir, "dicts/" + newDictID + ".sqlite"), function (err) {
        var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
        db.run("delete from dicts where id=$dictID", { $dictID: oldDictID }, function (err) {
          if (err) console.log(err);
          db.close();
          var dictDB = module.exports.getDB(newDictID);
          module.exports.attachDict(dictDB, newDictID, function () {
            dictDB.close();
            callnext(true);
          });
        });
      });
    }
  },
  attachDict: function (dictDB, dictID, callnext) {
    module.exports.readDictConfigs(dictDB, dictID, function (configs) {
      var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
      db.run("delete from dicts where id=$dictID", { $dictID: dictID }, function (err) {
        if (err) console.log(err);
        var title = configs.ident.title;
        db.run("insert into dicts(id, title) values ($dictID, $title)", { $dictID: dictID, $title: title }, function (err) {
          if (err) console.log(err);
          db.run("delete from user_dict where dict_id=$dictID", { $dictID: dictID }, function (err) {
            if (err) console.log(err);
            for (var email in configs.users) {
              db.run("insert into user_dict(dict_id, user_email) values ($dictID, $email)", { $dictID: dictID, $email: email.toLowerCase() }, function (err) { if (err) console.log(err); });
            }
            db.close();
            callnext();
          });
        });
      });
    });
  },
  destroyDict: function (dictID, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
    db.run("delete from dicts where id=$dictID", { $dictID: dictID }, function (err) {
      if (err) console.log(err);
      db.run("delete from user_dict where dict_id=$dictID", { $dictID: dictID }, function (err) {
        if (err) console.log(err);
        db.close(function () {
          fs.remove(path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"), function () {
            callnext();
          });
        });
      });
    });
  },
  cloneDict: function (dictID, email, callnext) {
    module.exports.suggestDictID(function (cloneDictID) {
      fs.copy(path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"), path.join(siteconfig.dataDir, "dicts/" + cloneDictID + ".sqlite"), function (err) {
        var cloneDictDB = module.exports.getDB(cloneDictID);
        cloneDictDB.get("select json from configs where id='ident'", {}, function (err, row) {
          var ident = { "title": "?", "blurb": "?" };
          if (!err) {
            ident = JSON.parse(row.json);
            ident["title"] = "Clone of " + ident["title"];
          }
          cloneDictDB.run("update configs set json=$json where id='ident'", { $json: JSON.stringify(ident, null, "\t") }, function (err) {
            if (err) console.log(err);
            module.exports.attachDict(cloneDictDB, cloneDictID, function () {
              cloneDictDB.close();
              callnext(true, cloneDictID, ident["title"]);
            });
          });
        });
      });
    });
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
  updateDictConfig: function (db, dictID, configID, json, callnext) {
    db.get("select id from configs where id=$id", { $id: configID }, function (err, row) {
      if (row) {
        db.run("update configs set json=$json where id=$id", { $id: configID, $json: JSON.stringify(json, null, "\t") }, function (err) {
          afterwards();
        });
      } else {
        db.run("delete from configs where id=$id", { $id: configID }, function (err) {
          db.run("insert into configs(id, json) values($id, $json)", { $id: configID, $json: JSON.stringify(json, null, "\t") }, function (err) {
            afterwards();
          });
        });
      }
    });
    var afterwards = function () {
      if (configID == "ident" || configID == "users") {
        db.dictConfigs = null;
        module.exports.attachDict(db, dictID, function () {
          callnext(json, false);
        });
      } else if (configID == "titling" || configID == "titling" || configID == "searchability") {
        module.exports.flagForResave(db, dictID, function (resaveNeeded) {
          callnext(json, resaveNeeded);
        });
      } else if (configID == "subbing") {
        module.exports.flagForRefac(db, dictID, function (resaveNeeded) {
          callnext(json, resaveNeeded);
        });
      } else {
        callnext(json, false);
      }
    };
  },
  readRandomOne: function (db, dictID, callnext) {
    module.exports.readDictConfig(db, dictID, "xema", function (xema) {
      var sql_random = "select id, title, xml from entries where id in (select id from entries where doctype=$doctype order by random() limit 1)";
      db.get(sql_random, { $doctype: xema.root }, function (err, row) {
        if (row) {
          callnext({ id: row.id, title: row.title, xml: row.xml });
        } else {
          callnext({ id: 0, title: "", xml: "" });
        }
      });
    });
  },
  flagForResave: function (db, dictID, callnext) {
    db.run("update entries set needs_resave=1", {}, function (err) {
      if (err) console.log(err);
      var resaveNeeded = (this.changes > 0);
      callnext(resaveNeeded);
    });
  },
  flagForRefac: function (db, dictID, callnext) {
    db.run("update entries set needs_refac=1", {}, function (err) {
      if (err) console.log(err);
      var resaveNeeded = (this.changes > 0);
      callnext(resaveNeeded);
    });
  },
  readDoctypesUsed: function (db, dictID, callnext) {
    db.all("select doctype from entries group by doctype order by count(*) desc", {}, function (err, rows) {
      var doctypes = (!err && rows) ? rows.map(row => row.doctype) : [];
      callnext(doctypes);
    });
  },

  readEntry: function (db, dictID, entryID, callnext) {
    db.get("select * from entries where id=$id", { $id: entryID }, function (err, row) {
      if (!row) {
        var entryID = 0;
        var xml = "";
        var title = "";
        callnext(entryID, xml, title);
      } else {
        module.exports.readDictConfig(db, dictID, "subbing", function (subbing) {
          var entryID = row.id;
          var xml = row.xml;
          var title = row.title;
          xml = setHousekeepingAttributes(entryID, xml, subbing);
          module.exports.addSubentryParentTags(db, entryID, xml, function (xml) {
            callnext(entryID, xml, title);
          });
        });
      }
    });
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
  flagEntry: function (db, dictID, entryID, flag, email, historiography, callnext) {
    db.get("select id, xml from entries where id=$id", { $id: entryID }, function (err, row) {
      module.exports.readDictConfigs(db, dictID, function (configs) {
        var abc = configs.titling.abc; if (!abc || abc.length == 0) abc = configs.siteconfig.defaultAbc;
        var xml = (row ? row.xml : "").replace(/ xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']/g, "").replace(/(\=)\"([^\"]*)\"/g, "$1'$2'").replace(/ lxnm:(sub)?entryID='[0-9]+'/g, "");
        xml = addFlag(entryID, xml, flag, configs.flagging);

        // tell my parents that they need a refresh:
        db.run("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=$child_id)", { $child_id: entryID }, function (err) {
          // update me:
          db.run("update entries set doctype=$doctype, xml=$xml, title=$title, sortkey=$sortkey, needs_refac=$needs_refac, needs_resave=$needs_resave where id=$id", {
            $id: entryID,
            $title: module.exports.getEntryTitle(xml, configs.titling),
            $sortkey: module.exports.toSortkey(module.exports.getSortTitle(xml, configs.titling), abc),
            $xml: xml,
            $doctype: getDoctype(xml),
            $needs_refac: Object.keys(configs.subbing).length > 0 ? 1 : 0,
            $needs_resave: configs.searchability.searchableElements && configs.searchability.searchableElements.length > 0 ? 1 : 0
          }, function (err) {
            // tell history that I have been updated:
            db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
              $entry_id: entryID,
              $action: "update",
              $when: (new Date()).toISOString(),
              $email: email,
              $xml: xml,
              $historiography: JSON.stringify(historiography)
            }, function (err) {});
            callnext(entryID, xml);
          });
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

  getDictStats: function (db, dictID, callnext) {
    var ret = { entryCount: 0, needResave: 0 };
    db.get("select count(*) as entryCount from entries", {}, function (err, row) {
      if (row) ret.entryCount = row.entryCount;
      db.get("select count(*) as needResave from entries where needs_resave=1 or needs_refresh=1 or needs_refac=1", {}, function (err, row) {
        if (row) ret.needResave = row.needResave;
        callnext(ret);
      });
    });
  },
  refac: function (db, dictID, callnext) { // takes the first entry that needs refactoring and extracts subentries from it
    module.exports.readDictConfigs(db, dictID, function (configs) {
      // get the oldest entry that needs refactoring:
      db.get("select e.id, e.xml, h.email from entries as e left outer join history as h on h.entry_id=e.id where e.needs_refac=1 order by h.[when] asc limit 1", function (err, row) {
        if (!row) { // if no such entry, pass the buck:
          callnext(false);
        } else { // if we have found an entry that needs refactoring; this becomes our current entry:
          const domparser = new xmldom.DOMParser();
          const serializer = new xmldom.XMLSerializer();
          var entryID = row.id; var xml = row.xml; var email = row.email || "";
          var doc = domparser.parseFromString(xml, "text/xml");
          doc.documentElement.setAttributeNS("http://www.lexonomy.eu/", "lxnm:entryID", entryID);

          // in the current entry, remove all <lxnm:subentryParent>:
          var _els = doc.getElementsByTagNameNS("http://www.lexonomy.eu/", "subentryParent");
          var els = []; for (var i = 0; i < _els.length; i++) els.push(_els[i]);
          for (var i = 0; i < els.length; i++) els[i].parentNode.removeChild(els[i]);

          // in the current entry, find elements which are subentries, and are not contained inside other subentries:
          var els = [];
          for (var doctype in configs.subbing) {
            var _els = doc.getElementsByTagName(doctype);
            for (var i = 0; i < _els.length; i++) {
              var el = _els[i];
              if (el.parentNode && el.parentNode.nodeType == 1) {
                var isSubSub = false; var p = el.parentNode;
                while (p.parentNode && p.parentNode.nodeType == 1) {
                  if (configs.subbing[p.tagName]) isSubSub = true;
                  p = p.parentNode;
                }
                if (!isSubSub) els.push(el);
              }
            }
          }

          db.run("delete from sub where parent_id=$parent_id", { $parent_id: entryID }, function (err) {
            // keep saving subentries of the current entry until there are no more subentries to save:
            var saveNextEl = function () {
              if (els.length > 0) { // yes, there are subentries in the current entry that we haven't saved yet
                var el = els.pop(); // this is the subentry we'll save now
                var subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID");
                xml = serializer.serializeToString(el);
                if (subentryID) {
                  module.exports.updateEntry(db, dictID, subentryID, xml, email.toLowerCase(), { refactoredFrom: entryID }, function (subentryID, adjustedXml, changed) {
                    el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", subentryID);
                    db.run("insert into sub(parent_id, child_id) values($parent_id, $child_id)", { $parent_id: entryID, $child_id: subentryID }, function (err) {
                    // tell all parents of the subentry (excluding the current entry) that they need a refresh:
                      if (changed) {
                        db.run("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=$child_id) and id<>$parentID", { $child_id: subentryID, $parentID: entryID }, function (err) {
                          saveNextEl();
                        });
                      } else {
                        saveNextEl();
                      }
                    });
                  });
                } else {
                  module.exports.createEntry(db, dictID, null, xml, email.toLowerCase(), { refactoredFrom: entryID }, function (subentryID) {
                    el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", subentryID);
                    db.run("insert into sub(parent_id, child_id) values($parent_id, $child_id)", { $parent_id: entryID, $child_id: subentryID }, function (err) {
                    // tell all parents of the subentry (including the current entry) that they need a refresh:
                      db.run("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=$child_id)", { $child_id: subentryID }, function (err) {
                        saveNextEl();
                      });
                    });
                  });
                }
              } else { // no, there are no more subentries in the current entry that we haven't saved yet
                xml = serializer.serializeToString(doc);
                // tell the current entry that it doesn't need refactoring any more:
                db.run("update entries set xml=$xml, needs_refac=0 where id=$id", { $id: entryID, $xml: xml }, function (err) {
                  callnext(true);
                });
              }
            };
            saveNextEl();
          });
        }
      });
    });
  },
  refresh: function (db, dictID, callnext) { // takes one entry that needs refreshing and sucks into it the latest versions of its subentries
    module.exports.readDictConfigs(db, dictID, function (configs) {
      // get one entry that needs refreshing where none of its children needs refreshing:
      db.get("select pe.id, pe.xml from entries as pe left outer join sub as s on s.parent_id=pe.id left join entries as ce on ce.id=s.child_id where pe.needs_refresh=1 and (ce.needs_refresh is null or ce.needs_refresh=0) limit 1", function (err, row) {
        if (!row) { // if no such entry, pass the buck:
          callnext(false);
        } else {
          const domparser = new xmldom.DOMParser();
          const serializer = new xmldom.XMLSerializer();
          var parentID = row.id; var parentXml = row.xml;
          var parentDoc = domparser.parseFromString(parentXml, "text/xml");

          // this will be called repeatedly till exhaustion
          var go = function () {
            // find an element which is a subentry and which we haven't sucked in yet:
            var el = null;
            for (var doctype in configs.subbing) {
              var els = parentDoc.documentElement.getElementsByTagName(doctype);
              for (var i = 0; i < els.length; i++) {
                var el = els[i];
                if (el && !el.hasAttributeNS("http://www.lexonomy.eu/", "subentryID")) el = null;
                if (el && el.hasAttributeNS("http://www.lexonomy.eu/", "done")) el = null;
                if (el) break;
              }
              if (el) break;
            }
            if (el) { // if such en element exists
              var subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID");
              // get the subentry from the database and inject it into the parent's xml:
              db.get("select xml from entries where id=$id", { $id: subentryID }, function (err, row) {
                if (!row) {
                  el.parentNode.removeChild(el);
                } else {
                  var childXml = row.xml;
                  var childDoc = domparser.parseFromString(childXml, "text/xml");
                  var elNew = childDoc.documentElement;
                  el.parentNode.replaceChild(elNew, el);
                  elNew.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", subentryID);
                  elNew.setAttributeNS("http://www.lexonomy.eu/", "lxnm:done", "1");
                }
                go(); // recursion to the next subentry in the parent entry
              });
            } else { // if no such element exists: we are done
              var els = parentDoc.documentElement.getElementsByTagName("*");
              for (var i = 0; i < els.length; i++) els[i].removeAttributeNS("http://www.lexonomy.eu/", "done");
              parentXml = serializer.serializeToString(parentDoc);
              // save the parent's xml (into which all subentries have been injected by now) and tell it that it needs a resave:
              db.run("update entries set xml=$xml, needs_refresh=0, needs_resave=1 where id=$id", { $id: parentID, $xml: parentXml }, function () {
                callnext(true);
              });
            }
          };
          go();
        }
      });
    });
  },
  resave: function (db, dictID, callnext) { // updates an entry's display title, search keys and so on
    module.exports.readDictConfigs(db, dictID, function (configs) {
      var abc = configs.titling.abc; if (!abc || abc.length == 0) abc = configs.siteconfig.defaultAbc;
      const domparser = new xmldom.DOMParser();
      db.all("select id, xml from entries where needs_resave=1 limit 12", {}, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
          var entryID = rows[i].id; var xml = rows[i].xml;
          // console.log("resaving: "+entryID);
          var doc = domparser.parseFromString(xml, "text/xml");
          (function (entryID, doc) {
            db.run("update entries set needs_resave=0, title=$title, sortkey=$sortkey where id=$id", {
              $id: entryID,
              $title: module.exports.getEntryTitle(doc, configs.titling),
              $sortkey: module.exports.toSortkey(module.exports.getSortTitle(doc, configs.titling), abc)
            }, function (err) { if (err) console.log(err); });

            db.run("delete from searchables where entry_id=$entry_id", { $entry_id: entryID }, function (err) {
              if (err) console.log(err);
              db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
                $entry_id: entryID,
                $txt: module.exports.getEntryTitle(doc, configs.titling, true),
                $level: 1
              }, function () {
                var searchables = module.exports.getEntrySearchables(doc, configs.searchability, configs.titling);
                var headword = module.exports.getEntryHeadword(doc, configs.titling.headword);
                for (var y = 0; y < searchables.length; y++) {
                  if (searchables[y] != headword) {
                    db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
                      $entry_id: entryID,
                      $txt: searchables[y],
                      $level: 2
                    });
                  }
                }
              });
            });
          })(entryID, doc);
        }
      });
      callnext();
    });
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
  listEntriesById: function (db, dictID, entryID, callnext) {
    var sql = "select e.id, e.title, e.xml from entries as e where e.id=$entryID";
    var params = { $entryID: entryID };
    module.exports.readDictConfig(db, dictID, "subbing", function (subbing) {
      db.all(sql, params, function (err, rows) {
        if (err || !rows) rows = [];
        var entries = [];
        for (var i = 0; i < rows.length; i++) {
          rows[i].xml = setHousekeepingAttributes(rows[i].id, rows[i].xml, subbing);
          var item = { id: rows[i].id, title: rows[i].title, xml: rows[i].xml };
          entries.push(item);
        }
        callnext(entries);
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

  readNabesByEntryID: function (db, dictID, entryID, callnext) {
    module.exports.readDictConfig(db, dictID, "xema", function (xema) {
      var sql_before = `select e1.id, e1.title
        from entries as e1
        where e1.doctype=$doctype and e1.sortkey<=(select sortkey from entries where id=$id)
        order by e1.sortkey desc
        limit 8`;
      var sql_after = `select e1.id, e1.title
        from entries as e1
        where e1.doctype=$doctype and e1.sortkey>(select sortkey from entries where id=$id)
        order by e1.sortkey asc
        limit 15`;
      var nabes = [];
      db.all(sql_before, { $id: entryID, $doctype: xema.root }, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
          nabes.unshift({ id: rows[i].id, title: rows[i].title });
        }
        db.all(sql_after, { $id: entryID, $doctype: xema.root }, function (err, rows) {
          for (var i = 0; i < rows.length; i++) {
            nabes.push({ id: rows[i].id, title: rows[i].title });
          }
          callnext(nabes);
        });
      });
    });
  },
  readNabesByText: function (db, dictID, text, callnext) {
    module.exports.readDictConfigs(db, dictID, function (configs) {
      var sql_before = `select e1.id, e1.title
        from entries as e1
        where doctype=$doctype and e1.sortkey<=$sortkey
        order by e1.sortkey desc
        limit 8`;
      var sql_after = `select e1.id, e1.title
        from entries as e1
        where doctype=$doctype and e1.sortkey>$sortkey
        order by e1.sortkey asc
        limit 15`;
      var abc = configs.titling.abc; if (!abc || abc.length == 0) abc = configs.siteconfig.defaultAbc;
      var sortkey = module.exports.toSortkey(text, abc);
      var nabes = [];
      db.all(sql_before, { $sortkey: sortkey, $doctype: configs.xema.root }, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
          nabes.unshift({ id: rows[i].id, title: rows[i].title });
        }
        db.all(sql_after, { $sortkey: sortkey, $doctype: configs.xema.root }, function (err, rows) {
          for (var i = 0; i < rows.length; i++) {
            nabes.push({ id: rows[i].id, title: rows[i].title });
          }
          callnext(nabes);
        });
      });
    });
  },
  readRandoms: function (db, dictID, callnext) {
    module.exports.readDictConfig(db, dictID, "xema", function (xema) {
      var limit = 75;
      var sql_randoms = "select id, title from entries where doctype=$doctype and id in (select id from entries order by random() limit $limit) order by sortkey";
      var sql_total = "select count(*) as total from entries";
      var randoms = [];
      var more = false;
      db.all(sql_randoms, { $limit: limit, $doctype: xema.root }, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
          randoms.push({ id: rows[i].id, title: rows[i].title });
        }
        db.get(sql_total, {}, function (err, row) {
          if (row.total > limit) more = true;
          callnext(more, randoms);
        });
      });
    });
  },
  listEntriesPublic: function (db, dictID, searchtext, callnext) {
    module.exports.readDictConfig(db, dictID, "xema", function (xema) {
      var howmany = 100;
      var sql_list = `select s.txt, min(s.level) as level, e.id, e.title,
        case when s.txt=$searchtext then 1 else 2 end as priority
        from searchables as s
        inner join entries as e on e.id=s.entry_id
        where s.txt like $like and e.doctype=$doctype
        group by e.id
        order by priority, level, e.sortkey, s.level
        limit $howmany`;
      var like = "%" + searchtext + "%";
      db.all(sql_list, { $howmany: howmany, $like: like, $searchtext: searchtext, $doctype: xema.root }, function (err, rows) {
        var entries = [];
        for (var i = 0; i < rows.length; i++) {
          var item = { id: rows[i].id, title: rows[i].title, exactMatch: (rows[i].level == 1 && rows[i].priority == 1) };
          if (rows[i].level > 1) item.title += " ← <span class='redirector'>" + rows[i].txt + "</span>";
          entries.push(item);
        }
        callnext(entries);
      });
    });
  },
  exportEntryXml: function (baseUrl, db, dictID, entryID, callnext) {
    db.get("select * from entries where id=$id", { $id: entryID }, function (err, row) {
      if (!row) {
        var entryID = 0;
        var xml = "";
        callnext(entryID, xml);
      } else {
        module.exports.readDictConfig(db, dictID, "subbing", function (subbing) {
          var entryID = row.id;
          var xml = row.xml;
          xml = setHousekeepingAttributes(entryID, xml, subbing);
          var attribs = " this=\"" + baseUrl + dictID + "/" + row.id + ".xml" + "\"";
          var sql_after = `select e1.id, e1.title
              from entries as e1
              where e1.sortkey>(select sortkey from entries where id=$id)
              order by e1.sortkey asc
              limit 15`;
          db.get(sql_after, { $id: entryID }, function (err, row) {
            if (row) attribs += " next=\"" + baseUrl + dictID + "/" + row.id + ".xml" + "\"";
            var sql_before = `select e1.id, e1.title
              from entries as e1
              where e1.sortkey<(select sortkey from entries where id=$id)
              order by e1.sortkey desc
              limit 1`;
            db.get(sql_before, { $id: entryID }, function (err, row) {
              if (row) attribs += " previous=\"" + baseUrl + dictID + "/" + row.id + ".xml" + "\"";
              xml = "<lexonomy" + attribs + ">" + xml + "</lexonomy>";
              callnext(entryID, xml);
            });
          });
        });
      }
    });
  },
  download: function (db, dictID, res) {
    module.exports.readDictConfig(db, dictID, "subbing", function (subbing) {
      res.setHeader("content-type", "text/xml; charset=utf-8");
      res.setHeader("content-disposition", "attachment; filename=" + dictID + ".xml");
      res.write("<" + dictID + ">\n");
      db.each("select id, xml from entries", {}, function (err, row) {
        var xml = row.xml.replace(/></g, ">\n<");
        xml = setHousekeepingAttributes(row.id, xml, subbing);
        res.write(xml + "\n");
      }, function (err, rowCount) {
        res.write("</" + dictID + ">\n");
        res.end();
      });
    });
  },
  purge: function (db, dictID, email, historiography, callnext) {
    db.run("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', $when, $email, xml, $historiography from entries", {
      $when: (new Date()).toISOString(),
      $email: email.toLowerCase(),
      $historiography: JSON.stringify(historiography)
    }, function (err) {
      db.run("delete from entries; vacuum", {}, function (err) {
        callnext();
      });
    });
  },

  checkImportStatus: function (pidfile, errfile, callnext) {
    fs.readFile(pidfile, function (err, pid_data) {
      if (err) { callnext({ progressMessage: "Import failed", finished: true, errors: false }) } else {
        pid_data = pid_data.toString().trim().split(/[\n\r]/);
        var progress = pid_data[pid_data.length - 1];
        var errors = false;
        fs.stat(errfile, function (err, stats) {
          if (!err && stats.size) { errors = true }
          find_process("pid", pid_data[0].substr(4))
            .then(function (list) {
              callnext({ progressMessage: progress, finished: list.length == 0, errors: errors });
            }, function (err) {
              console.log(err.stack || err);
            });
        });
      }
    });
  },

  showImportErrors: function (filepath, truncate, callnext) {
    fs.readFile(filepath + ".err", "utf8", function (err, content) {
      if (err) { content = "Failed to read error file" }
      if (truncate) { content = content.substring(0, truncate) }
      callnext({ errorData: content, truncated: truncate });
    });
  },

  import: function (dictID, filepath, email, callnext) {
    var pidfile = filepath + ".pid";
    var errfile = filepath + ".err";
    if (fs.existsSync(pidfile)) { // = import is in progress, just check status
      module.exports.checkImportStatus(pidfile, errfile, callnext);
    } else { // = start import
      let pidfile_fd;
      let errfile_fd;
      try {
        pidfile_fd = fs.openSync(pidfile, "wx");
        errfile_fd = fs.openSync(errfile, "w");
      } catch (e) {
        // somebody created the pidfile meanwhile, the import is probably underway
        module.exports.checkImportStatus(pidfile, errfile, callnext);
      }
      var dbpath = path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite");
      fork("adminscripts/import.js", [dbpath, filepath, email], { detached: true, stdio: ["ignore", pidfile_fd, errfile_fd, "ipc"] });
      callnext({ progressMessage: "Import started. Please wait...", finished: false, errors: false });
    }
  },

  login: function (email, password, callnext) {
    if (siteconfig.readonly) {
      callnext(false, "", "");
    } else {
      var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
      var hash = sha1(password);
      db.get("select email from users where email=$email and passwordHash=$hash", { $email: email.toLowerCase(), $hash: hash }, function (err, row) {
        if (!row) {
          db.close();
          callnext(false, "", "");
        } else {
          email = row.email || "";
          var key = generateKey();
          var now = (new Date()).toISOString();
          db.run("update users set sessionKey=$key, sessionLast=$now where email=$email", { $key: key, $now: now, $email: email }, function (err, row) {
            db.close();
            callnext(true, email, key);
          });
        }
      });
    }
  },
  changePwd: function (email, password, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    var hash = sha1(password);
    db.run("update users set passwordHash=$hash where email=$email", { $hash: hash, $email: email.toLowerCase() }, function (err, row) {
      db.close();
      callnext(true);
    });
  },
  changeSkeUserName: function (email, ske_userName, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set ske_username=$ske_userName where email=$email", { $ske_userName: ske_userName, $email: email.toLowerCase() }, function (err, row) {
      db.close();
      callnext(true);
    });
  },
  changeSkeApiKey: function (email, ske_apiKey, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set ske_apiKey=$ske_apiKey where email=$email", { $ske_apiKey: ske_apiKey, $email: email.toLowerCase() }, function (err, row) {
      db.close();
      callnext(true);
    });
  },
  setConsent: function (email, consent, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set consent=$consent where email=$email", { $consent: consent, $email: email.toLowerCase() }, function (err, row) {
      db.close();
      callnext(true);
    });
  },
  sendSignupToken: function (email, remoteip, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email", { $email: email.toLowerCase() }, function (err, row) {
      if (row == undefined) {
        var expireDate = (new Date()); expireDate.setHours(expireDate.getHours() + 48);
        expireDate = expireDate.toISOString();
        var token = sha1(sha1(Math.random()));
        var tokenurl = siteconfig.baseUrl + "createaccount/" + token;
        var mailSubject = "Lexonomy signup";
        var mailText = "Dear Lexonomy user,\n\n";
        mailText += `Somebody (hopefully you, from the address ${remoteip}) requested to create a new Lexonomy account. Please follow the link below to create your account:\n\n`;
        mailText += `${tokenurl}\n\n`;
        mailText += `For security reasons this link is only valid for two days (until ${expireDate}). If you did not request an account, you can safely ignore this message. \n\n`;
        mailText += "Yours,\nThe Lexonomy team";
        db.run("insert into register_tokens (email, requestAddress, token, expiration) values ($email, $remoteip, $token, $expire)", { $email: email.toLowerCase(), $expire: expireDate, $remoteip: remoteip, $token: token }, function (err, row) {
          module.exports.mailtransporter.sendMail({ from: siteconfig.mailconfig.from, to: email, subject: mailSubject, text: mailText }, (err, info) => {});
          db.close();
          callnext(true);
        });
      } else {
        db.close();
        callnext(false);
      }
    });
  },
  sendToken: function (email, remoteip, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email", { $email: email.toLowerCase() }, function (err, row) {
      if (row) {
        var expireDate = (new Date()); expireDate.setHours(expireDate.getHours() + 48);
        expireDate = expireDate.toISOString();
        var token = sha1(sha1(Math.random()));
        var tokenurl = siteconfig.baseUrl + "recoverpwd/" + token;
        var mailSubject = "Lexonomy password reset";
        var mailText = "Dear Lexonomy user,\n\n";
        mailText += `Somebody (hopefully you, from the address ${remoteip}) requested a new password for the Lexonomy account ${email}. You can reset your password by clicking the link below:\n\n`;
        mailText += `${tokenurl}\n\n`;
        mailText += `For security reasons this link is only valid for two days (until ${expireDate}). If you did not request a password reset, you can safely ignore this message. No changes have been made to your account.\n\n`;
        mailText += "Yours,\nThe Lexonomy team";
        db.run("insert into recovery_tokens (email, requestAddress, token, expiration) values ($email, $remoteip, $token, $expire)", { $email: email.toLowerCase(), $expire: expireDate, $remoteip: remoteip, $token: token }, function (err, row) {
          module.exports.mailtransporter.sendMail({ from: siteconfig.mailconfig.from, to: email, subject: mailSubject, text: mailText }, (err, info) => {});
          db.close();
          callnext(true);
        });
      } else {
        db.close();
        callnext(false);
      }
    });
  },
  verifyToken: function (token, type, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from " + type + "_tokens where token=$token and expiration>=datetime('now') and usedDate is null", { $token: token }, function (err, row) {
      db.close();
      if (!row) callnext(false); else callnext(true);
    });
  },
  createAccount: function (token, password, remoteip, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from register_tokens where token=$token and expiration>=datetime('now') and usedDate is null", { $token: token }, function (err, row) {
      if (row) {
        var email = row.email || "";
        db.get("select * from users where email=$email", { $email: email }, function (err, row) {
          if (row == undefined) {
            var hash = sha1(password);
            db.run("insert into users (email,passwordHash) values ($email,$hash)", { $hash: hash, $email: email }, function (err, row) {
              db.run("update register_tokens set usedDate=datetime('now'), usedAddress=$remoteip where token=$token", { $remoteip: remoteip, $token: token }, function (err, row) {
                db.close();
                callnext(true);
              });
            });
          } else {
            callnext(false);
          }
        });
      }
    });
  },
  resetPwd: function (token, password, remoteip, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select * from recovery_tokens where token=$token and expiration>=datetime('now') and usedDate is null", { $token: token }, function (err, row) {
      if (row) {
        var email = row.email || "";
        var hash = sha1(password);
        db.run("update users set passwordHash=$hash where email=$email", { $hash: hash, $email: email }, function (err, row) {
          db.run("update recovery_tokens set usedDate=datetime('now'), usedAddress=$remoteip where token=$token", { $remoteip: remoteip, $token: token }, function (err, row) {
            db.close();
            callnext(true);
          });
        });
      }
    });
  },
  processJWT: function (user, jwtData, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    if (user.loggedin) {
      // user logged in = save SkE ID in database
      var key = generateKey();
      var now = (new Date()).toISOString();
      db.run("update users set ske_id=$ske_id, ske_username=$ske_username, ske_apiKey=$ske_apiKey, sessionKey=$key, sessionLast=$now where email=$email", { $ske_id: jwtData.user.id, $ske_username: jwtData.user.username, $email: user.email.toLowerCase(), $key: key, $now: now, $ske_apiKey: jwtData.user.api_key }, function (err, row) {
        db.close();
        callnext(true, user.email.toLowerCase(), key);
      });
    } else {
      // user not logged in =
      // if SkE ID in database = log in user
      // if SkE ID not in database = register and log in user
      db.get("select email from users where ske_id=$ske_id", { $ske_id: jwtData.user.id }, function (err, row) {
        if (!row) {
          var email = jwtData.user.email.toLowerCase();
          db.get("select * from users where email=$email", { $email: email }, function (err, row) {
            if (row == undefined) {
              var key = generateKey();
              var now = (new Date()).toISOString();
              db.run("insert into users (email, passwordHash, ske_id, ske_username, ske_apiKey, sessionKey, sessionLast) values ($email, null, $ske_id, $ske_username, $ske_apiKey, $key, $now)", { $ske_id: jwtData.user.id, $ske_username: jwtData.user.username, $ske_apiKey: jwtData.user.api_key, $email: email, $key: key, $now: now }, function (err, row) {
                db.close();
                callnext(true, email, key);
              });
            } else {
              db.close();
              callnext(false, "user already exists " + email, "");
            }
          });
        } else {
          var email = row.email || "";
          var key = generateKey();
          var now = (new Date()).toISOString();
          db.run("update users set ske_apiKey=$ske_apiKey, sessionKey=$key, sessionLast=$now where ske_id=$ske_id", { $key: key, $now: now, $ske_id: jwtData.user.id, $ske_apiKey: jwtData.user.api_key }, function (err, row) {
            db.close();
            callnext(true, email, key);
          });
        }
      });
    }
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
  getDictsByUser: function (email, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    var sql = "select d.id, d.title from dicts as d inner join user_dict as ud on ud.dict_id=d.id where ud.user_email=$email order by d.title";
    var dicts = [];
    db.all(sql, { $email: email }, function (err, rows) {
      if (rows) for (var i = 0; i < rows.length; i++) dicts.push({ id: rows[i].id, title: rows[i].title });
      db.close();
      lookup();
    });
    function lookup () {
      for (var i = 0; i < dicts.length; i++) {
        if (dicts[i].currentUserCanDelete === undefined && module.exports.dictExists(dicts[i].id)) {
          var dictDB = module.exports.getDB(dicts[i].id, true);
          module.exports.readDictConfig(dictDB, dicts[i].id, "users", function (users) {
            dictDB.close();
            dicts[i].currentUserCanDelete = !!((users[email] && users[email].canConfig));
            lookup();
          });
          break;
        }
      }
      if (i >= dicts.length) {
        callnext(dicts);
      }
    }
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
  prepareApiKeyForSke: function (email, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select apiKey, ske_username, ske_apiKey from users where email=$email", { $email: email.toLowerCase() }, function (err, row) {
      if (!row || siteconfig.readonly) {
        db.close();
        callnext(false);
      } else {
        var lexonomyApiKey;
        if (row.apiKey == "" || row.apiKey == null) {
          // generate new key
          var key = "";
          var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          while (key.length < 32) {
            var i = Math.floor(Math.random() * alphabet.length);
            key += alphabet[i];
          }
          db.run("update users set apiKey=$apiKey where email=$email", { $email: email.toLowerCase(), $apiKey: key });
          lexonomyApiKey = key;
        } else {
          lexonomyApiKey = row.apiKey;
        }
        callnext(lexonomyApiKey);
      }
    });
  },
  sendApiKeyToSke: function (email, apiKey, ske_username, ske_apiKey, callnext) {
    console.log("send API key to SkE");
    if (ske_username != "" && ske_apiKey != "") {
      var data = JSON.stringify({
        options: {
          settings_lexonomyApiKey: apiKey,
          settings_lexonomyEmail: email.toLowerCase()
        }
      });
      var queryData = querystring.stringify({ "username": ske_username, "api_key": ske_apiKey, "json": data });
      var options = {
        "host": "api.sketchengine.eu",
        "path": "/bonito/run.cgi/set_user_options?" + queryData,
        "method": "GET"
      };
      var req = https.request(options, function (response) {
        var str = "";
        response.on("data", function (chunk) {
          str += chunk;
        });
        response.on("end", function () {
          console.log(str);
        });
      });
      req.on("error", function (e) {
        console.log("problem with request: " + e.message);
      });
      req.end();
    }
  },
  getDoc: function (docID, callnext) {
    var doc = { id: docID, title: "", html: "" };
    fs.readFile("docs/" + docID + ".md", "utf8", function (err, content) {
      if (!err) {
        var tree = markdown.parse(content);
        doc.title = tree[1][2];
        doc.html = markdown.renderJsonML(markdown.toHTMLTree(tree));
      }
      callnext(doc);
    });
  },
  markdown: function (str) {
    var tree = markdown.parse(str);
    str = markdown.renderJsonML(markdown.toHTMLTree(tree));
    str = str.replace("<a href=\"http", "<a target=\"_blank\" href=\"http");
    return str;
  },

  listUsers: function (searchtext, howmany, callnext) {
    var sql1 = "select * from users where email like $like order by email limit $howmany";
    var sql2 = "select count(*) as total from users where email like $like";
    var like = "%" + searchtext + "%";
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, { $howmany: howmany, $like: like }, function (err, rows) {
      var entries = [];
      for (var i = 0; i < rows.length; i++) {
        var item = { id: rows[i].email, title: rows[i].email };
        entries.push(item);
      }
      db.get(sql2, { $like: like }, function (err, row) {
        var total = row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },
  readUser: function (email, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from users where email=$email", { $email: email.toLowerCase() }, function (err, row) {
      if (!row) callnext("", ""); else {
        email = row.email || "";
        var lastSeen = ""; if (row.sessionLast) lastSeen = row.sessionLast;
        db.all("select d.id, d.title from user_dict as ud inner join dicts as d on d.id=ud.dict_id  where ud.user_email=$email order by d.title", { $email: email }, function (err, rows) {
          var xml = "<user"; if (lastSeen) xml += " lastSeen='" + lastSeen + "'"; xml += ">";
          for (var i = 0; i < rows.length; i++) {
            xml += "<dict id='" + rows[i].id + "' title='" + clean4xml(rows[i].title) + "'/>";
          }
          xml += "</user>";
          db.close();
          callnext(email, xml);
        });
      }
    });
  },
  deleteUser: function (email, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
    db.run("delete from users where email=$email", {
      $email: email.toLowerCase()
    }, function (err) {
      db.close();
      callnext();
    });
  },
  createUser: function (xml, callnext) {
    var doc = (new xmldom.DOMParser()).parseFromString(xml, "text/xml");
    var email = doc.documentElement.getAttribute("email");
    var passwordHash = sha1(doc.documentElement.getAttribute("password"));
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
    db.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
      $email: email.toLowerCase(),
      $passwordHash: passwordHash
    }, function (err) {
      db.close();
      module.exports.readUser(email, function (email, xml) { callnext(email, xml) });
    });
  },
  updateUser: function (email, xml, callnext) {
    var doc = (new xmldom.DOMParser()).parseFromString(xml, "text/xml");
    if (!doc.documentElement.getAttribute("password")) {
      module.exports.readUser(email, function (email, xml) { callnext(email, xml) });
    } else {
      var passwordHash = sha1(doc.documentElement.getAttribute("password"));
      var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function () { db.run("PRAGMA foreign_keys=on") });
      db.run("update users set passwordHash=$passwordHash where email=$email", {
        $email: email.toLowerCase(),
        $passwordHash: passwordHash
      }, function (err) {
        db.close();
        module.exports.readUser(email, function (email, xml) {
          callnext(email, xml);
        });
      });
    }
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

  listDicts: function (searchtext, howmany, callnext) {
    var sql1 = "select * from dicts where id like $like or title like $like order by id limit $howmany";
    var sql2 = "select count(*) as total from dicts where id like $like or title like $like";
    var like = "%" + searchtext + "%";
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, { $howmany: howmany, $like: like }, function (err, rows) {
      var entries = [];
      for (var i = 0; i < rows.length; i++) {
        var item = { id: rows[i].id, title: rows[i].title };
        entries.push(item);
      }
      db.get(sql2, { $like: like }, function (err, row) {
        var total = row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },
  readDict: function (dictID, callnext) {
    var db = new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from dicts where id=$dictID", { $dictID: dictID }, function (err, row) {
      if (!row) callnext("", ""); else {
        var id = row.id;
        var title = row.title;
        db.all("select u.email from user_dict as ud inner join users as u on u.email=ud.user_email where ud.dict_id=$dictID order by u.email", { $dictID: dictID }, function (err, rows) {
          var xml = "<dict id='" + clean4xml(id) + "' title='" + clean4xml(title) + "'>";
          for (var i = 0; i < rows.length; i++) {
            xml += "<user email='" + rows[i].email + "'/>";
          }
          xml += "</dict>";
          db.close();
          callnext(id, xml);
        });
      }
    });
  },

  readDictHistory: function (db, dictID, entryID, callnext) {
    module.exports.readDictConfig(db, dictID, "subbing", function (subbing) {
      db.all("select * from history where entry_id=$entryID order by [when] desc", { $entryID: entryID }, function (err, rows) {
        var history = [];
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (row.xml) row.xml = setHousekeepingAttributes(row.entry_id, row.xml, subbing);
          history.push({
            "entry_id": row.entry_id,
            "revision_id": row.id,
            "content": row.xml,
            "action": row.action,
            "when": row.when,
            "email": row.email || "",
            "historiography": JSON.parse(row.historiography)
          });
        }
        callnext(history);
      });
    });
  },

  getLastEditedEntry: function (db, dictID, email, callnext) {
    db.all("select entry_id from history where email=$email order by [when] desc limit 1", { $email: email }, function (err, rows) {
      if (rows.length > 0) { callnext(rows[0].entry_id) } else { callnext() }
    });
  }
}; // end of module.exports

function clean4xml (txt) {
  return txt
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function generateKey () {
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key = "";
  while (key.length < 32) {
    var i = Math.floor(Math.random() * alphabet.length);
    key += alphabet[i];
  }
  return key;
}
function generateDictID () {
  var alphabet = "abcdefghijkmnpqrstuvwxy23456789";
  var id = "";
  while (id.length < 8) {
    var i = Math.floor(Math.random() * alphabet.length);
    id += alphabet[i];
  }
  return "z" + id;
}

function addFlag (entryID, xml, flag, flagconfig) {
  var el = flagconfig.flag_element;
  var re = new RegExp("<" + el + "[^>]*>[^<]*</" + el + ">");
  var flag_exists = false;
  xml = xml.replace(re, function (found, $1) { // try replacing existing flag
    flag_exists = true;
    if (flag) { return "<" + el + ">" + flag + "</" + el + ">" } else { return "" }
  });
  if (flag_exists) { return xml }
  return xml.replace(/^<([^>]+>)/, function (found, $1) { // or add new flag
    return "<" + $1 + "<" + el + ">" + flag + "</" + el + ">";
  });
}

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
