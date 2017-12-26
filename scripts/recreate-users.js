const path=require("path");
const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const sha1 = require('sha1'); //https://www.npmjs.com/package/sha1

const passwordHash=sha1("3zDhTRmx6e");

var bigdb=new sqlite3.Database(path.join(__dirname, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){bigdb.run('PRAGMA foreign_keys=on')});
var dictFiles=fs.readdirSync(path.join(__dirname, "dicts"));
for(var i=0; i<dictFiles.length; i++){
  var dictFile=dictFiles[i];
  var dictID=dictFile.replace(/\.sqlite$/, "");
  (function(dictID){
    var db=new sqlite3.Database(path.join(__dirname, "dicts/"+dictFile), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
    db.get("select * from configs where id='ident'", {}, function(err, row){
      var ident=JSON.parse(row.json);
      var dictTitle=ident.title;
      console.log(dictID, dictTitle);
      bigdb.run("insert into dicts(id, title) values($id, $title)", {
        $id: dictID,
        $title: dictTitle,
      }, function(err){
        db.get("select * from configs where id='users'", {}, function(err, row){
          var users=JSON.parse(row.json);
          for(var email in users) {
            (function(dictID, email){
              console.log(dictID, email);
              bigdb.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
                $email: email,
                $passwordHash: passwordHash,
              }, function(err){
                bigdb.run("insert into user_dict(dict_id, user_email) values($dictID, $email)", {
                  $dictID: dictID,
                  $email: email,
                }, function(err){
                });
              });
            })(dictID, email);
          }

        });
      });
    });
  })(dictID);
}




// fs.readFile(path.join(__dirname, "siteconfig.json"), "utf8", function(err, content){
//   var siteconfig=JSON.parse(content);
//   var password="lexonomy";
//   var passwordHash=sha1(password);
//   var db=new sqlite3.Database(path.join(__dirname, "lexonomy.sqlite"), sqlite3.OPEN_READWRITE, function(){db.run('PRAGMA foreign_keys=on')});
//   for(var i=0; i<siteconfig.admins.length; i++){
//     var email=siteconfig.admins[i];
//     insertUser(db, email, password, passwordHash);
//   }
//   db.close();
// });
//
// var insertUser=function(db, email, password, passwordHash){
//   db.run("insert into users(email, passwordHash) values($email, $passwordHash)", {
//     $email: email,
//     $passwordHash: passwordHash,
//   }, function(err){
//     if(err) {
//       console.log("Creating a user account for "+email+" has failed. This could be because the account already exists.");
//     } else {
//       console.log("I have created a user account for "+email+". The password is: "+password);
//     }
//   });
// };
