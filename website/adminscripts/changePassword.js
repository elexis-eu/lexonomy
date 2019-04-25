const path = require("path");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
const siteconfig = require("../siteconfig").load();

if (process.argv.length != 3) {
    console.log("This tool changes the password for user with a given email")
    console.log(`Usage: node changePassword.js email`);
    process.exit(1);
}

var dbFile = path.join(siteconfig.dataDir, siteconfig.dbFile);
var db = new sqlite3.Database(dbFile, function(err){
  if (err) {
      console.log("ERR!", err)
      return
  }
  console.log('Connected to ' + dbFile + ' database.')
});

var email = process.argv[2];
var password = Math.random().toString(36).slice(-10);
var passwordHash = sha1(password);

db.run(
  "update users set passwordHash = $passwordHash where email = $email",
  { $email: email, $passwordHash: passwordHash },
  function(err) {
    if(err) {
      console.log("Could not update password for user with email: ", email);
    }
    else {
      console.log("User with email ", email, " now has a new password: ", password);
    }
  }
);

db.close();
