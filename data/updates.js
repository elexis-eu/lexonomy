const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3

fs.readFile(path.join(__dirname, "../website/siteconfig.json"), "utf8", function(err, content){
  var siteconfig=JSON.parse(content);
  var db=new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE);
  db.run("CREATE TABLE IF NOT EXISTS recovery_tokens (email text, requestAddress text, token text, expiration datetime, usedDate datetime, usedAddress text)", {}, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log("Table recovery_tokens created.");
  });
  db.close();
});

