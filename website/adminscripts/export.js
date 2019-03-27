#!/usr/bin/node

if (process.argv.length < 3) {
    console.log("Usage: export.js PATH_TO_DICTIONARY.sqlite")
    process.exit(1);
}

response = {
    setHeader: function() {},
    write: function(str) {process.stdout.write(str)},
    end: function() {}
}

const ops = require("../ops");
const sqlite3 = require('sqlite3');
const path = require("path");

var db_path = process.argv[2];
var dictID = path.basename(db_path, ".sqlite");
var db = new sqlite3.Database(db_path, sqlite3.OPEN_READONLY, function (err) {
    if (err) {
        console.log("Failed to open database at " + db_path);
        console.log(err);
        process.exit(2);
    }
});
ops.download(db, dictID, response);
