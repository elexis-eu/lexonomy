const path=require("path");
const fs=require("fs-extra");
const xmldom=require("xmldom"); //https://www.npmjs.com/package/xmldom
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
const markdown = require("markdown").markdown; //https://www.npmjs.com/package/markdown
const xmlsplit = require("xmlsplit"); //https://www.npmjs.com/package/xmlsplit

module.exports={
  siteconfig: {}, //populated by lexonomy.js on startup

  dictExists: function(dictID){
    return fs.existsSync(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"));
  },
  suggestDictID: function(callnext){
    var id;
    do{ id=generateDictID(); } while(prohibitedDictIDs.indexOf(id)>-1 || module.exports.dictExists(id));
    callnext(id);
  },
  makeDict: function(dictID, template, title, blurb, email, callnext){
    if(!title) title="?";
    if(!blurb) blurb="Yet another Lexonomy dictionary.";
    if(prohibitedDictIDs.indexOf(dictID)>-1 || module.exports.dictExists(dictID)){
      callnext(false);
    } else {
      fs.copy(path.join(module.exports.siteconfig.dataDir, "dictTemplates/"+template+".sqlite"), path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), function(err){
        var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE);
        var users={}; users[email]={"canEdit": true, "canConfig": true, "canDownload": true, "canUpload": true};
        db.run("update configs set json=$json where id='users'", {$json: JSON.stringify(users, null, "\t")}, function(err){ if(err) console.log(err);
          var ident={"title": title, "blurb": blurb};
          db.run("update configs set json=$json where id='ident'", {$json: JSON.stringify(ident, null, "\t")}, function(err){ if(err) console.log(err);
            db.close();
            module.exports.attachDict(dictID, function(){
              callnext(true);
            });
          });
        });
      });
    }
  },
  renameDict: function(oldDictID, newDictID, callnext){
    if(prohibitedDictIDs.indexOf(newDictID)>-1 || module.exports.dictExists(newDictID)){
      callnext(false);
    } else {
      fs.move(path.join(module.exports.siteconfig.dataDir, "dicts/"+oldDictID+".sqlite"), path.join(module.exports.siteconfig.dataDir, "dicts/"+newDictID+".sqlite"), function(err){
        var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
        db.run("delete from dicts where id=$dictID", {$dictID: oldDictID}, function(err){ if(err) console.log(err);
          db.close();
          module.exports.attachDict(newDictID, function(){
            callnext(true);
          });
        });
      });
    }
  },
  attachDict: function(dictID, callnext){
    module.exports.readDictConfigs(dictID, function(configs){
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
      db.run("delete from dicts where id=$dictID", {$dictID: dictID}, function(err){ if(err) console.log(err);
        var title=configs.ident.title;
        db.run("insert into dicts(id, title) values ($dictID, $title)", {$dictID: dictID, $title: title}, function(err){ if(err) console.log(err);
          db.run("delete from user_dict where dict_id=$dictID", {$dictID: dictID}, function(err){ if(err) console.log(err);
            for(var email in configs.users){
              db.run("insert into user_dict(dict_id, user_email) values ($dictID, $email)", {$dictID: dictID, $email: email}, function(err){ if(err) console.log(err); });
            }
            db.close();
            callnext();
          });
        });
      });
    });
  },
  destroyDict: function(dictID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from dicts where id=$dictID", {$dictID: dictID}, function(err){ if(err) console.log(err);
      db.run("delete from user_dict where dict_id=$dictID", {$dictID: dictID}, function(err){ if(err) console.log(err);
        db.close(function(){
          fs.remove(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), function(){
            callnext();
          });
        });
      });
    });
  },

  readSiteConfig: function(callnext){
    fs.readFile("siteconfig.json", "utf8", function(err, content){
      var siteconfig=JSON.parse(content);
      callnext(siteconfig);
    });
  },
  readDictConfigs: function(dictID, callnext){
    fs.readFile("siteconfig.json", "utf8", function(err, content){
      var configs={};
      configs.siteconfig=JSON.parse(content);
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
      db.all("select * from configs", {}, function(err, rows){
        for(var i=0; i<rows.length; i++) configs[rows[i].id]=JSON.parse(rows[i].json);
        db.close();
        callnext(configs);
      });
    });
  },
  readDictConfig: function(dictID, configID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from configs where id=$id", {$id: configID}, function(err, row){
      var config=JSON.parse(row.json);
      db.close();
      callnext(config);
    });
  },
  updateDictConfig: function(dictID, configID, json, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update configs set json=$json where id=$id", {$id: configID, $json: JSON.stringify(json, null, "\t")}, function(err){ if(err) console.log(err);
      db.close();
      if(configID=="ident" || configID=="users"){
        module.exports.attachDict(dictID, function(){
          callnext(json, false);
        });
      } else if(configID=="titling" || configID=="searchability"){
        module.exports.flagForResave(dictID, function(resaveNeeded){
          callnext(json, resaveNeeded);
        });
      } else {
        callnext(json, false);
      }
    });
  },
  readRandomOne: function(dictID, callnext){
    var sql_random="select id, title, xml from entries where id in (select id from entries order by random() limit 1)"
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.get(sql_random, {}, function(err, row){
      db.close();
      if(row){
        callnext({id: row.id, title: row.title, xml: row.xml});
      } else {
        callnext({id: 0, title: "", xml: ""});
      }
    });
  },
  flagForResave: function(dictID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update entries set needs_resave=1", {}, function(err){ if(err) console.log(err);
      var resaveNeeded=(this.changes>0);
      db.close();
      callnext(resaveNeeded);
    });
  },

  readEntry: function(dictID, entryID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from entries where id=$id", {$id: entryID}, function(err, row){
      if(row) {
        var entryID=row.id;
        var xml=row.xml;
        var title=row.title;
      } else {
        var entryID=0;
        var xml="";
        var title="";
      }
      db.close();
      callnext(entryID, xml, title);
    });
  },
  deleteEntry: function(dictID, entryID, email, historiography, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from entries where id=$id", {
      $id: entryID,
    }, function(err){
      db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
        $entry_id: entryID,
        $action: "delete",
        $when: (new Date()).toISOString(),
        $email: email,
        $xml: null,
        $historiography: JSON.stringify(historiography),
      }, function(err){});
      db.close();
      callnext();
    });
  },
  createEntry: function(dictID, entryID, xml, email, historiography, callnext){
    module.exports.readDictConfigs(dictID, function(configs){
      var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
      var abc=configs.titling.abc; if(!abc || abc.length==0) abc=configs.module.exports.siteconfig.defaultAbc;
      xml=(new xmldom.XMLSerializer()).serializeToString(doc);
      var sql="insert into entries(xml, title, sortkey) values($xml, $title, $sortkey)";
      var params={
        $xml: xml,
        $title: module.exports.getEntryTitle(doc, configs.titling),
        $sortkey: module.exports.toSortkey(module.exports.getEntryTitle(doc, configs.titling, true), abc),
      };
      if(entryID) {
        sql="insert into entries(id, xml, title, sortkey) values($id, $xml, $title, $sortkey)";
        params.$id=entryID;
      }
      db.run(sql, params, function(err){ if(err) console.log(err);
        if(!entryID) entryID=this.lastID;
        db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
          $entry_id: entryID,
          $action: "create",
          $when: (new Date()).toISOString(),
          $email: email,
          $xml: xml,
          $historiography: JSON.stringify(historiography),
        }, function(err){ if(err) console.log(err); });
        var searchables=module.exports.getEntrySearchables(doc, configs.searchability, configs.titling);
        var headword=module.exports.getEntryHeadword(doc, configs.titling);
        for(var i=0; i<searchables.length; i++){
          db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
            $entry_id: entryID,
            $txt: searchables[i],
            $level: (searchables[i]==headword ? 1 : 2),
          }, function(err){ if(err) console.log(err); });
        }
        db.close();
        callnext(this.lastID, xml);
      });
    })
  },
  updateEntry: function(dictID, entryID, xml, email, historiography, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.get("select id from entries where id=$id", {$id: entryID}, function(err, row){
      if(!row) { //an entry with that ID does not exist: recreate it with that ID:
        module.exports.createEntry(dictID, entryID, xml, email, historiography, callnext);
      } else { //an entry with that ID exists: update it
        module.exports.readDictConfigs(dictID, function(configs){
          var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
          var abc=configs.titling.abc; if(!abc || abc.length==0) abc=configs.module.exports.siteconfig.defaultAbc;
          db.run("update entries set xml=$xml, title=$title, sortkey=$sortkey where id=$id", {
            $id: entryID,
            $xml: xml,
            $title: module.exports.getEntryTitle(doc, configs.titling),
            $sortkey: module.exports.toSortkey(module.exports.getEntryTitle(doc, configs.titling, true), abc),
          }, function(err){
            db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
              $entry_id: entryID,
              $action: "update",
              $when: (new Date()).toISOString(),
              $email: email,
              $xml: xml,
              $historiography: JSON.stringify(historiography),
            }, function(err){});
            db.run("delete from searchables where entry_id=$entry_id", {$entry_id: entryID}, function(err){
              var searchables=module.exports.getEntrySearchables(doc, configs.searchability, configs.titling);
              var headword=module.exports.getEntryHeadword(doc, configs.titling);
              for(var i=0; i<searchables.length; i++){
                db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
                  $entry_id: entryID,
                  $txt: searchables[i],
                  $level: (searchables[i]==headword ? 1 : 2),
                });
              }
              db.close();
              callnext(entryID, xml);
            });
          });
        })
      }
    });
  },

  getDictStats: function(dictID, callnext){
    var ret={entryCount: 0, needResave: 0};
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.get("select count(*) as entryCount from entries", {}, function(err, row){
      if(row) ret.entryCount=row.entryCount;
      db.get("select count(*) as needResave from entries where needs_resave=1", {}, function(err, row){
        if(row) ret.needResave=row.needResave;
        db.close();
        callnext(ret);
      });
    });
  },
  resave: function(dictID, callnext){
    module.exports.readDictConfigs(dictID, function(configs){
      var abc=configs.titling.abc; if(!abc || abc.length==0) abc=configs.module.exports.siteconfig.defaultAbc;
      const domparser=new xmldom.DOMParser();
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE);
      db.all("select id, xml from entries where needs_resave=1 limit 12", {}, function(err, rows){
        for(var i=0; i<rows.length; i++){
          var entryID=rows[i].id;
          var xml=rows[i].xml;
          var doc=domparser.parseFromString(xml, 'text/xml');
          (function(entryID, doc){
            db.run("update entries set needs_resave=0, title=$title, sortkey=$sortkey where id=$id", {
              $id: entryID,
              $title: module.exports.getEntryTitle(doc, configs.titling),
              $sortkey: module.exports.toSortkey(module.exports.getEntryTitle(doc, configs.titling, true), abc),
            }, function(err){ if(err) console.log(err); });

            db.run("delete from searchables where entry_id=$entry_id", {$entry_id: entryID}, function(err){ if(err) console.log(err);
              var searchables=module.exports.getEntrySearchables(doc, configs.searchability, configs.titling);
              var headword=module.exports.getEntryHeadword(doc, configs.titling);
              for(var y=0; y<searchables.length; y++){
                db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {
                  $entry_id: entryID,
                  $txt: searchables[y],
                  $level: (searchables[y]==headword ? 1 : 2),
                }, function(err){ if(err) console.log(err);  });
              }
             });
          })(entryID, doc);

        }
      });
      db.close(function(){
        callnext();
      });
    });
  },

  listEntries: function(dictID, searchtext, howmany, callnext){
    var sql1=`select s.txt, min(s.level) as level, e.id, e.title
      from searchables as s
      inner join entries as e on e.id=s.entry_id
      where s.txt like $like
      group by e.id
      order by e.sortkey, s.level
      limit $howmany`;
    var sql2=`select count(distinct s.entry_id) as total
      from searchables as s
      where s.txt like $like`;
    var like="%"+searchtext+"%";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, {$howmany: howmany, $like: like}, function(err, rows){
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].title};
        if(rows[i].level>1) item.title="<span class='redirector'>"+rows[i].txt+"</span> → "+item.title;
        entries.push(item);
      }
      db.get(sql2, {$like: like}, function(err, row){
        var total=row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },

  getEntryTitle: function(xml, titling, plaintext){
    if(typeof(xml)=="string") var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml'); else doc=xml;
    if(plaintext) var ret=module.exports.getEntryHeadword(doc, titling); else var ret="<span class='headword'>"+module.exports.getEntryHeadword(doc, titling)+"</span>";
    if(titling.headwordAnnotations) for(var i=0; i<titling.headwordAnnotations.length; i++){
      var els=doc.getElementsByTagName(titling.headwordAnnotations[i]);
      for(var y=0; y<els.length; y++){
        var txt=els[y].textContent;
        if(txt!="") {
          if(ret!="") ret+=" ";
          ret+=txt;
        }
      }
    }
    return ret;
  },
  getEntryHeadword: function(xml, titling){
    if(typeof(xml)=="string") var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml'); else doc=xml;
    var ret="";
    var els=doc.getElementsByTagName(titling.headword);
    for(var y=0; y<els.length; y++){
      var txt=els[y].textContent;
      if(txt!="") {if(ret!="") ret+=" "; ret+=txt;}
    }
    if(ret==""){
      var els=doc.getElementsByTagName("*");
      for(var y=0; y<els.length; y++){
        var hasTextNode=false; for(var i=0; i<els[y].childNodes.length; i++) if(els[y].childNodes[i].nodeType==3) hasTextNode=true;
        if(hasTextNode) { ret=els[y].textContent; break; }
      }
    }
    if(ret=="") ret="?";
    if(ret.length>255) ret=ret.substring(0, 255); //keeping headwords under 255 characters is probably a reeasonable limitation
    return ret;
  },
  toSortkey: function(s, abc){
    const keylength=5;
    var ret=s.replace(/\<[\<\>]+>/g, "").toLowerCase();
    //replace any numerals:
    var pat=new RegExp("[0-9]{1,"+keylength+"}", "g");
    ret=ret.replace(pat, function(x){while(x.length<keylength+1) x="0"+x; return x;});
    //prepare characters:
    var chars=[];
    var count=0;
    for(var pos=0; pos<abc.length; pos++){
      var key=(count++).toString(); while(key.length<keylength) key="0"+key; key="_"+key;
      for(var i=0; i<abc[pos].length; i++){
        if(i>0) count++;
        chars.push({char: abc[pos][i], key: key});
      }
    }
    chars.sort(function(a,b){ if(a.char.length>b.char.length) return -1; if(a.char.length<b.char.length) return 1; return 0; });
    //replace characters:
    for(var i=0; i<chars.length; i++){
      if(!/^[0-9]$/.test(chars[i].char)) { //skip chars that are actually numbers
        while(ret.indexOf(chars[i].char)>-1) ret=ret.replace(chars[i].char, chars[i].key);
      }
    }
    //remove any remaining characters that aren't a number or an underscore:
    ret=ret.replace(/[^0-9_]/g, "");
    return ret;
  },
  getEntrySearchables: function(xml, searchability, titling){
    if(typeof(xml)=="string") var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml'); else doc=xml;
    var ret=[];
    ret.push(module.exports.getEntryHeadword(doc, titling));
    if(searchability.searchableElements) for(var i=0; i<searchability.searchableElements.length; i++){
      var els=doc.getElementsByTagName(searchability.searchableElements[i]);
      for(var y=0; y<els.length; y++){
        var txt=els[y].textContent;
        if(txt!="" && ret.indexOf(txt)==-1) ret.push(txt);
      }
    }
    return ret;
  },

  readNabesByEntryID: function(dictID, entryID, callnext){
    var sql_before=`select e1.id, e1.title
      from entries as e1
      where e1.sortkey<=(select sortkey from entries where id=$id)
      order by e1.sortkey desc
      limit 8`;
    var sql_after=`select e1.id, e1.title
      from entries as e1
      where e1.sortkey>(select sortkey from entries where id=$id)
      order by e1.sortkey asc
      limit 15`;
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    var nabes=[];
    db.all(sql_before, {$id: entryID}, function(err, rows){
      for(var i=0; i<rows.length; i++){
        nabes.unshift({id: rows[i].id, title: rows[i].title});
      }
      db.all(sql_after, {$id: entryID}, function(err, rows){
        for(var i=0; i<rows.length; i++){
          nabes.push({id: rows[i].id, title: rows[i].title});
        }
        db.close();
        callnext(nabes);
      });
    });
  },
  readNabesByText: function(dictID, text, callnext){
    module.exports.readDictConfigs(dictID, function(configs){
      var sql_before=`select e1.id, e1.title
        from entries as e1
        where e1.sortkey<=$sortkey
        order by e1.sortkey desc
        limit 8`;
      var sql_after=`select e1.id, e1.title
        from entries as e1
        where e1.sortkey>$sortkey
        order by e1.sortkey asc
        limit 15`;
      var abc=configs.titling.abc; if(!abc || abc.length==0) abc=configs.module.exports.siteconfig.defaultAbc;
      var sortkey=module.exports.toSortkey(text, abc);
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
      var nabes=[];
      db.all(sql_before, {$sortkey: sortkey}, function(err, rows){
        for(var i=0; i<rows.length; i++){
          nabes.unshift({id: rows[i].id, title: rows[i].title});
        }
        db.all(sql_after, {$sortkey: sortkey}, function(err, rows){
          for(var i=0; i<rows.length; i++){
            nabes.push({id: rows[i].id, title: rows[i].title});
          }
          db.close();
          callnext(nabes);
        });
      });
    });
  },
  readRandoms: function(dictID, callnext){
    var limit=75;
    var sql_randoms="select id, title from entries where id in (select id from entries order by random() limit $limit) order by sortkey"
    var sql_total="select count(*) as total from entries";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    var randoms=[];
    var more=false;
    db.all(sql_randoms, {$limit: limit}, function(err, rows){
      for(var i=0; i<rows.length; i++){
        randoms.push({id: rows[i].id, title: rows[i].title});
      }
      db.get(sql_total, {}, function(err, row){
        if(row.total>limit) more=true;
        db.close();
        callnext(more, randoms);
      });
    });
  },
  listEntriesPublic: function(dictID, searchtext, callnext){
    var howmany=100;
    var sql_list=`select s.txt, min(s.level) as level, e.id, e.title,
      case when s.txt=$searchtext then 1 else 2 end as priority
      from searchables as s
      inner join entries as e on e.id=s.entry_id
      where s.txt like $like
      group by e.id
      order by priority, level, e.sortkey, s.level
      limit $howmany`;
    var like="%"+searchtext+"%";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql_list, {$howmany: howmany, $like: like, $searchtext: searchtext}, function(err, rows){
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].title, exactMatch: (rows[i].level==1 && rows[i].priority==1)};
        if(rows[i].level>1) item.title="<span class='redirector'>"+rows[i].txt+"</span> → "+item.title;
        entries.push(item);
      }
      db.close();
      callnext(entries);
    });
  },
  exportEntryXml: function(baseUrl, dictID, entryID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from entries where id=$id", {$id: entryID}, function(err, row){
      if(!row) {
        var entryID=0;
        var xml="";
        db.close();
        callnext(entryID, xml);
      } else {
        var entryID=row.id;
        var xml=row.xml;
        var attribs=" this=\""+baseUrl+dictID+"/"+row.id+".xml"+"\"";
        var sql_after=`select e1.id, e1.title
            from entries as e1
            where e1.sortkey>(select sortkey from entries where id=$id)
            order by e1.sortkey asc
            limit 15`;
        db.get(sql_after, {$id: entryID}, function(err, row){
          if(row) attribs+=" next=\""+baseUrl+dictID+"/"+row.id+".xml"+"\"";
          var sql_before=`select e1.id, e1.title
            from entries as e1
            where e1.sortkey<(select sortkey from entries where id=$id)
            order by e1.sortkey desc
            limit 1`;
            db.get(sql_before, {$id: entryID}, function(err, row){
              if(row) attribs+=" previous=\""+baseUrl+dictID+"/"+row.id+".xml"+"\"";
              xml="<lexonomy"+attribs+">"+xml+"</lexonomy>";
              db.close();
              callnext(entryID, xml);
            });
        });
      }
    });
  },
  download: function(dictID, res){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    res.setHeader("content-type", "text/xml; charset=utf-8");
    res.setHeader("content-disposition", "attachment; filename="+dictID+".xml");
    res.write("<"+dictID+">\n");
    db.each("select id, xml from entries", {}, function(err, row){
      var xml=row.xml.replace(/^\<[^\s\>]+/, function(found){return found+" xmlns:lxnm='http://www.lexonomy.eu/' lxnm:entryID='"+row.id+"'"});
      res.write(xml+"\n");
    }, function(err, rowCount){
      res.write("</"+dictID+">\n");
      res.end();
      db.close();
    });
  },
  purge: function(dictID, email, historiography, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', $when, $email, xml, $historiography from entries", {
      $when: (new Date()).toISOString(),
      $email: email,
      $historiography: JSON.stringify(historiography),
    }, function(err){
      db.run("delete from entries", {}, function(err){
        callnext();
      });
    });
  },
  import: function(dictID, filepath, offset, email, historiography, callnext){
    var regexOpeningTag=new RegExp("\<[^\!\?\>\<][^\>\<]*\>");
    var readStream=fs.createReadStream(filepath).setEncoding("utf8");
    var tempFilePath=filepath+"_temp";
    fs.writeFileSync(tempFilePath, "");
    var extract="";
    var lengthRead=0;
    var parseError=false;
    var domparser=new xmldom.DOMParser({ errorHandler: {warning: function(){parseError=true;}, error: function(){parseError=true;}, fatalError: function(){parseError=true;} }});
    var serializer=new xmldom.XMLSerializer();
    var tagName="";
    readStream.on("data", function(chunk){
      //console.log(`incoming data: ${lengthRead} + ${chunk.length} = ${lengthRead+chunk.length}`);
      for(var pos=0; pos<chunk.length; pos++){
        lengthRead++;
        if(lengthRead>=offset) {
          extract+=chunk[pos]; if(extract.length>255) extract=extract.substring(extract.length-255);
          if(offset==0){
            if(regexOpeningTag.test(extract)){ offset=lengthRead+1; extract=""; }
          } else {
            if(tagName==""){
              var found=extract.match(/^\s*\<\s*([^\<\>\s\/]+)[\/\>\s]/);
              if(found) tagName=found[1];
            }
            fs.appendFileSync(tempFilePath, chunk[pos]);
            if(extract.endsWith("</"+tagName+">") || extract.endsWith("<"+tagName+"/>")) {
              var xml=fs.readFileSync(tempFilePath, "utf8").trim().replace(/\>[\r\n]+\s*\</g, "><");
              parseError=false;
              var doc=domparser.parseFromString(xml, 'text/xml');
              if(!parseError && doc.getElementsByTagName("*")[0]) {
                var success=true;
                var finished=false;
                offset=lengthRead+1;
                readStream.destroy();

                var root=doc.getElementsByTagName("*")[0];
                var entryID=parseInt(root.getAttributeNS("http://www.lexonomy.eu/", "entryID"));
                root.removeAttributeNS("http://www.lexonomy.eu/", "entryID");
                xml=serializer.serializeToString(doc);
                doc=null;
                //console.log(xml.substring(0, 10)+"..."+xml.substring(xml.length-10));
                if(entryID) {
                  //console.log("about to update entry");
                  module.exports.updateEntry(dictID, entryID, xml, email, historiography, function(){
                    //console.log("entry updated");
                    callnext(offset, success, finished);
                  });
                } else {
                  //console.log("about to create entry");
                  module.exports.createEntry(dictID, null, xml, email, historiography, function(){
                    //console.log("entry created");
                    callnext(offset, success, finished);
                  });
                }

                break;
              }
            }
          }
        }
      }
      //console.log("incoming data done");
    });
    readStream.on("end", function(){
      readStream.destroy();
      fs.remove(filepath, function(){
        fs.remove(tempFilePath, function(){
          var success=false;
          var finished=true;
          callnext(offset, success, finished);
        });
      });
    });
  },

  login: function(email, password, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    var hash=sha1(password);
    db.get("select email from users where email=$email and passwordHash=$hash", {$email: email, $hash: hash}, function(err, row){
      if(!row){
        db.close();
        callnext(false, "", "");
      } else {
        email=row.email;
        var key=generateKey();
        var now=(new Date()).toISOString();
        db.run("update users set sessionKey=$key, sessionLast=$now where email=$email", {$key: key, $now: now, $email: email}, function(err, row){
          db.close();
          callnext(true, email, key);
        });
      }
    });
  },
  changePwd: function(email, password, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    var hash=sha1(password);
    db.run("update users set passwordHash=$hash where email=$email", {$hash: hash, $email: email}, function(err, row){
      db.close();
      callnext(true);
    });
  },
  verifyLogin: function(email, sessionkey, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          module.exports.readSiteConfig(function(siteconfig){
            callnext({loggedin: true, email: email, isAdmin: (siteconfig.admins.indexOf(email)>-1)});
          });
        });
      }
    });
  },
  verifyLoginAndDictAccess: function(email, sessionkey, dictID, callnext){
    var yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and sessionKey=$key and sessionLast>=$yesterday", {$email: email, $key: sessionkey, $yesterday: yesterday}, function(err, row){
      if(!row){
        db.close();
        callnext({loggedin: false, email: null});
      } else {
        email=row.email;
        var now=(new Date()).toISOString();
        db.run("update users set sessionLast=$now where email=$email", {$now: now, $email: email}, function(err, row){
          db.close();
          module.exports.readDictConfigs(dictID, function(configs){
            if(!configs.users[email] && configs.module.exports.siteconfig.admins.indexOf(email)==-1){
              callnext({loggedin: true, email: email, dictAccess: false, isAdmin: false});
            } else {
              var canEdit=(configs.siteconfig.admins.indexOf(email)>-1 ? true : configs.users[email].canEdit);
              var canConfig=(configs.siteconfig.admins.indexOf(email)>-1 ? true : configs.users[email].canConfig);
              var canDownload=(configs.siteconfig.admins.indexOf(email)>-1 ? true : configs.users[email].canDownload);
              var canUpload=(configs.siteconfig.admins.indexOf(email)>-1 ? true : configs.users[email].canUpload);
              callnext({loggedin: true, email: email, dictAccess: true, isAdmin: (configs.siteconfig.admins.indexOf(email)>-1), canEdit: canEdit, canConfig: canConfig, canDownload: canDownload, canUpload: canUpload});
            }
          });
        });
      }
    });
  },
  logout: function(email, sessionkey, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.run("update users set sessionKey=null where email=$email and sessionKey=$key", {$email: email, $key: sessionkey}, function(err, row){
      db.close();
      callnext();
    });
  },
  getDictsByUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    var sql="select d.id, d.title from dicts as d inner join user_dict as ud on ud.dict_id=d.id where ud.user_email=$email order by d.title"
    db.all(sql, {$email: email}, function(err, rows){
      var dicts=[];
      if(rows) for(var i=0; i<rows.length; i++) dicts.push({id: rows[i].id, title: rows[i].title});
      db.close();
      callnext(dicts);
    });
  },
  verifyUserApiKey: function(email, apikey, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
    db.get("select email from users where email=$email and apiKey=$key", {$email: email, $key: apikey}, function(err, row){
      if(!row){
        db.close();
        callnext({valid: false});
      } else {
        email=row.email;
        db.close();
        callnext({valid: true, email: email});
      }
    });
  },

  getDoc: function(docID, callnext){
    var doc={id: docID, title: "", html: ""};
    fs.readFile("docs/"+docID+".md", "utf8", function(err, content){
      if(!err) {
        var tree=markdown.parse(content);
        doc.title=tree[1][2];
        doc.html=markdown.renderJsonML(markdown.toHTMLTree(tree));
      }
      callnext(doc);
    });
  },
  markdown: function(str){
    var tree=markdown.parse(str);
    str=markdown.renderJsonML(markdown.toHTMLTree(tree));
    str=str.replace("<a href=\"http", "<a target=\"_blank\" href=\"http");
    return str;
  },

  listUsers: function(searchtext, howmany, callnext){
    var sql1=`select * from users where email like $like order by email limit $howmany`;
    var sql2=`select count(*) as total from users where email like $like`;
    var like="%"+searchtext+"%";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, {$howmany: howmany, $like: like}, function(err, rows){
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].email, title: rows[i].email};
        entries.push(item);
      }
      db.get(sql2, {$like: like}, function(err, row){
        var total=row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },
  readUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from users where email=$email", {$email: email}, function(err, row){
      if(!row) callnext("", ""); else {
        email=row.email;
        var lastSeen=""; if(row.sessionLast) lastSeen=row.sessionLast;
        db.all("select d.id, d.title from user_dict as ud inner join dicts as d on d.id=ud.dict_id  where ud.user_email=$email order by d.title", {$email: email}, function(err, rows){
          xml="<user"; if(lastSeen) xml+=" lastSeen='"+lastSeen+"'"; xml+=">";
          for(var i=0; i<rows.length; i++){
            xml+="<dict id='"+rows[i].id+"' title='"+clean4xml(rows[i].title)+"'/>";
          }
          xml+="</user>";
          db.close();
          callnext(email, xml);
        });
      }
    });
  },
  deleteUser: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("delete from users where email=$email", {
      $email: email,
    }, function(err){
      db.close();
      callnext();
    });
  },
  createUser: function(xml, callnext){
    var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
    var email=doc.documentElement.getAttribute("email");
    var passwordHash=sha1(doc.documentElement.getAttribute("password"));
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
      $email: email,
      $passwordHash: passwordHash,
    }, function(err){
      db.close();
      module.exports.readUser(email, function(email, xml){ callnext(email, xml); });
    });
  },
  updateUser: function(email, xml, callnext){
    var doc=(new xmldom.DOMParser()).parseFromString(xml, 'text/xml');
    if(!doc.documentElement.getAttribute("password")){
      module.exports.readUser(email, function(email, xml){ callnext(email, xml); });
    } else {
      var passwordHash=sha1(doc.documentElement.getAttribute("password"));
      var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
      db.run("update users set passwordHash=$passwordHash where email=$email", {
        $email: email,
        $passwordHash: passwordHash,
      }, function(err){
        db.close();
        module.exports.readUser(email, function(email, xml){
          callnext(email, xml);
        });
      });
    }
  },
  readUserApiKey: function(email, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select apiKey from users where email=$email", {$email: email}, function(err, row){
      if(!row) callnext(""); else {
        db.close();
        callnext(row.apiKey);
      }
    });
  },
  updateUserApiKey: function(email, apikey, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.run("update users set apiKey=$apiKey where email=$email", {
      $email: email,
      $apiKey: apikey,
    }, function(err){
      db.close();
      callnext();
    });
  },

  listDicts: function(searchtext, howmany, callnext){
    var sql1=`select * from dicts where id like $like or title like $like order by id limit $howmany`;
    var sql2=`select count(*) as total from dicts where id like $like or title like $like`;
    var like="%"+searchtext+"%";
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.all(sql1, {$howmany: howmany, $like: like}, function(err, rows){
      var entries=[];
      for(var i=0; i<rows.length; i++){
        var item={id: rows[i].id, title: rows[i].title};
        entries.push(item);
      }
      db.get(sql2, {$like: like}, function(err, row){
        var total=row.total;
        db.close();
        callnext(total, entries);
      });
    });
  },
  readDict: function(dictID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READONLY);
    db.get("select * from dicts where id=$dictID", {$dictID: dictID}, function(err, row){
      if(!row) callnext("", ""); else {
        var id=row.id;
        var title=row.title;
        db.all("select u.email from user_dict as ud inner join users as u on u.email=ud.user_email where ud.dict_id=$dictID order by u.email", {$dictID: dictID}, function(err, rows){
          xml="<dict id='"+clean4xml(id)+"' title='"+clean4xml(title)+"'>";
          for(var i=0; i<rows.length; i++){
            xml+="<user email='"+rows[i].email+"'/>";
          }
          xml+="</dict>";
          db.close();
          callnext(id, xml);
        });
      }
    });
  },

  readDictHistory: function(dictID, entryID, callnext){
    var db=new sqlite3.Database(path.join(module.exports.siteconfig.dataDir, "dicts/"+dictID+".sqlite"), sqlite3.OPEN_READONLY);
    db.all("select * from history where entry_id=$entryID order by [when] desc", {$entryID: entryID}, function(err, rows){
      var history=[];
      for(var i=0; i<rows.length; i++) {
        var row=rows[i];
        history.push({
          "entry_id": row.entry_id,
          "revision_id": row.id,
          "content": row.xml,
          "action": row.action,
          "when": row.when,
          "email": row.email,
          "historiography": JSON.parse(row.historiography)
        });
      }
      db.close();
      callnext(history);
    });
  },

}; //end of module.exports

function clean4xml(txt){
  return txt
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
function generateKey(){
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key="";
  while(key.length<32) {
    var i=Math.floor(Math.random() * alphabet.length);
    key+=alphabet[i]
  }
  return key;
}
function generateDictID(){
  var alphabet="abcdefghijkmnpqrstuvwxy23456789";
  var id="";
  while(id.length<8) {
    var i=Math.floor(Math.random() * alphabet.length);
    id+=alphabet[i]
  }
  return "z"+id;
}

const prohibitedDictIDs=["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "dicts", "oneclick"];
