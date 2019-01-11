//A script to upgrade the schema of Lexonomy's main database.

const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3

fs.readFile(path.join(__dirname, "../siteconfig.json"), "utf8", function(err, content){
  var siteconfig=JSON.parse(content);
  var db=new sqlite3.Database(path.join("../",siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
  db.run("CREATE TABLE IF NOT EXISTS recovery_tokens (email text, requestAddress text, token text, expiration datetime, usedDate datetime, usedAddress text)", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log("Table recovery_tokens created.");
  });
  db.run("CREATE TABLE IF NOT EXISTS register_tokens (email text, requestAddress text, token text, expiration datetime, usedDate datetime, usedAddress text)", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log("Table register_tokens created.");
  });
  db.run("ALTER TABLE users ADD COLUMN ske_id INTEGER", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
  });
  db.run("ALTER TABLE users ADD COLUMN ske_username TEXT", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
  });
  db.run("ALTER TABLE users ADD COLUMN consent INTEGER", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
  });
  db.run("ALTER TABLE users ADD COLUMN ske_apiKey TEXT", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
  });
  db.close();
});
