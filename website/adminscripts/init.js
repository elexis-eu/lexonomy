const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1
const siteconfig = require("../siteconfig").load();

var dbFile = path.join(siteconfig.dataDir, siteconfig.dbFile);

// Prepare to initialise the DB
var db = new sqlite3.Database(dbFile, function(err){
  if (err) {
      console.log(err)
      return
  }
  console.log('Connected to ' + dbFile + ' database.')
});
// Read the DB Schema into a String
var dbSchema = fs.readFileSync(path.join(siteconfig.dataDir, siteconfig.dbSchemaFile), 'utf8');
// Initialise the DB (in case it already exists this will print warninigs)
db.exec(dbSchema, function(err){
    if (err) {
        console.log(err);
        console.log("Likely the DB has already been created.");
    } else {
        console.log("Initialised " + siteconfig.dbFile + " with: \n" + dbSchema);
    }
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

var password=Math.random().toString(36).slice(-10);
var passwordHash=sha1(password);
for(var i=0; i<siteconfig.admins.length; i++){
  var email=siteconfig.admins[i];
  insertUser(db, email, password, passwordHash);
}
db.close();
