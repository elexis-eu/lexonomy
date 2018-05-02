//A script to migrate all SQLite databases when the database schema has changed.

const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3

const blankPath=path.join(__dirname, "dictTemplates/blank.sqlite");
//migrateDBs(path.join(__dirname, "../data/dicts/"));
//migrateDBs(path.join(__dirname, "../website/dictTemplates/"));
migrateDB(path.join(__dirname, "../data/dicts/zdpcsy6gx.sqlite"), function(){});

function migrateDBs(dirPath){
  var filenames=fs.readdirSync(dirPath).filter(filename => /\.sqlite$/.test(filename) && filename!=path.basename(blankPath));
  var count=filenames.length;
  console.log(`${count} databases to do`);
  filenames.map(filename => {
    var filepath=path.join(dirPath, filename);
    migrateDB(filepath, function(){
      console.log(`${--count} databases remaining`);
    });
  });
}

function migrateDB(newPath, next){
  var dbName=path.basename(newPath);
  //console.log(`${dbName} BEGINS`);

  //rename old database to ".old" and open it:
  var oldPath=newPath+".old";
  fs.moveSync(newPath, oldPath);
  var oldDB=new sqlite3.Database(oldPath, sqlite3.OPEN_READONLY, function(){oldDB.run('PRAGMA journal_mode=OFF')});

  //create new database and open it:
  fs.copySync(blankPath, newPath);
  var newDB=new sqlite3.Database(newPath, sqlite3.OPEN_READWRITE, function(){newDB.run('PRAGMA journal_mode=OFF')});

  //migrate tables from old database to new database:
  migrateConfigs(function(){
    migrateEntries(function(){
      migrateHistory(function(){
        migrateSearchables(function(){
          oldDB.close();
          newDB.close();
          //console.log(`${dbName} ENDS`);
          if(next) next();
        })
      })
    })
  });

  function migrateConfigs(next){
    //console.log(`${dbName} [configs] BEGINS`);
    oldDB.each("select id, json from configs", function(err, row){
      newDB.serialize(function(){
        newDB.run("delete from configs where id=$id", {$id: row.id});
        newDB.run("insert into configs(id, json) values($id, $json)", {
          $id: row.id,
          $json: row.json
        });
      });
    }, function(){
      //console.log(`${dbName} [configs] ENDS`);
      next();
    });
  };

  function migrateEntries(next){
    //console.log(`${dbName} [entries] BEGINS`);
    oldDB.each("select id, xml, title, sortkey, needs_resave from entries", function(err, row){
      newDB.run("insert into entries(id, doctype, xml, title, sortkey, needs_resave) values($id, $doctype, $xml, $title, $sortkey, $needs_resave)", {
        $id: row.id,
        $doctype: getDoctype(row.xml),
        $xml: row.xml,
        $title: row.title,
        $sortkey: row.sortkey,
        $needs_resave: row.needs_resave
      });
    }, function(){
      //console.log(`${dbName} [entries] ENDS`);
      next();
    });
  };

  function migrateHistory(next){
    //console.log(`${dbName} [history] BEGINS`);
    oldDB.each("select id, entry_id, action, [when], email, xml, historiography from history", function(err, row){
      newDB.run("insert into history(id, entry_id, action, [when], email, xml, historiography) values($id, $entry_id, $action, $when, $email, $xml, $historiography)", {
        $id: row.id,
        $entry_id: row.entry_id,
        $action: row.action,
        $when: row.when,
        $email: row.email,
        $xml: row.xml,
        $historiography: row.historiography
      });
    }, function(){
      //console.log(`${dbName} [history] ENDS`);
      next();
    });
  };

  function migrateSearchables(next){
    //console.log(`${dbName} [searchables] BEGINS`);
    oldDB.each("select id, entry_id, txt, level from searchables", function(err, row){
      newDB.run("insert into searchables(id, entry_id, txt, level) values($id, $entry_id, $txt, $level)", {
        $id: row.id,
        $entry_id: row.entry_id,
        $txt: row.txt,
        $level: row.level,
      });
    }, function(){
      //console.log(`${dbName} [searchables] ENDS`);
      next();
    });
  };
};

function getDoctype(xml){
  var ret="";
  xml.replace(/^\<([^\>\/\s]+)/, function(found, $1){ ret=$1 });
  return ret;
}
