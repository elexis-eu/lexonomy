const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1

fs.readFile(path.join(__dirname, "../siteconfig.json"), "utf8", function(err, content){
  var siteconfig=JSON.parse(content);
  var password="lexonomy";
  var passwordHash=sha1(password);
  var db=new sqlite3.Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
  for(var i=0; i<siteconfig.admins.length; i++){
    var email=siteconfig.admins[i];
    insertUser(db, email, password, passwordHash);
  }
  db.close();
});

var insertUser=function(db, email, password, passwordHash){
  db.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
    $email: email,
    $passwordHash: passwordHash,
  }, function(err){
    if(err) {
      console.log("Creating a user account for "+email+" has failed. This could be because the account already exists.");
    } else {
      console.log("I have created a user account for "+email+". The password is: "+password);
    }
  });
};
