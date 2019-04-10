#!/usr/bin/node

if (process.argv.length < 4) {
    console.log("Usage: import.js [-p] PATH_TO_DICTIONARY.sqlite FILE_TO_IMPORT.xml [AUTHOR_EMAIL]")
    console.log("       -p   purge dictionary before importing")
    process.exit(1);
}
console.log("PID " + process.pid)
console.log("Import started. Please wait...")
process.argv.shift() // node
process.argv.shift() // import.js
var purge = false
if (process.argv[0] == "-p") {
  purge = true
  process.argv.shift() // -p
}

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const sax = require('sax')
const path = require('path');
const ops = require("../ops");
const util = require("util");

var dbname = process.argv[0]
var filename = process.argv[1]
var email=process.argv[2] || "IMPORT@LEXONOMY"

var db=new sqlite3.Database(dbname, sqlite3.OPEN_READWRITE);
var dictID = path.basename(dbname, ".sqlite")
var historiography={importStart: new Date().toISOString(), filename: path.basename(filename)}
var input = fs.readFileSync(filename).toString();

if (purge) {
  ops.purge(db, dictID, email, historiography, function() {
    console.log("Dictionary purged.")
    checkEntry();
  })
} else
  checkEntry();

// first pass -- check what is entry and how many entries we have

function checkEntry() {
  var saxParser = sax.parser(true, {trim: true, strictEntities: false, xmlns: true, position: true, normalize: true, lowercase: false})
  saxParser.onerror = function (e) {
    console.error(e.toString().split("\n").slice(0,4))
    saxParser.error = null
    saxParser.resume()
  }
  var rootTag, entryTag;
  saxParser.onopentagstart = function (node) {
    if (!rootTag)
      rootTag = node.name
    else if (!entryTag)
      entryTag = node.name
    else // we know both, just remove this handler
      saxParser.onopentag = undefined
  }
  var entryTagCount = 0;
  saxParser.onclosetag = function (node) {
    if (node == entryTag)
      entryTagCount++
  }
  saxParser.onend = function (e) {
    console.log("Detected %d entries in '%s' element", entryTagCount, entryTag)
    importDictionary(entryTag, entryTagCount);
  }
  saxParser.write(input).close()
}

// second pass, we know what the entry is and can import that

function importDictionary(entryTag, entryTotal) {
  var saxParser = sax.parser(true, {trim: false, strictEntities: false, xmlns: true, position: true, normalize: false, lowercase: false})
  var tagNameLength = entryTag.length + 2
  var currBeg;
  db.run("BEGIN TRANSACTION")
  saxParser.onerror = function (e) {
    saxParser.error = null
    saxParser.resume()
  }
  saxParser.onopentagstart = function (node) {
    if (node.name == entryTag)
      currBeg = saxParser.position - tagNameLength;
  }
  saxParser.onclosetag = function (node) {
    if (node == entryTag) {
      entry = input.substring(currBeg, saxParser.position).replace(/\>[\r\n]+\s*\</g, "><").trim()
      importEntry(entry, entryTotal)
    }
  }
  saxParser.write(input).close()
}

var entryInserted = 0
function importEntry(entryXML, entryTotal) {
  var found=entryXML.match(/^<[^>]*\s+lxnm:(sub)?entryID=['"]([0-9]+)["']/);
  var entryID=null;
  if(found) {
    entryID=parseInt(found[2]);
    ops.updateEntry(db, dictID, entryID, entryXML, email.toLowerCase(), historiography, function(newentryID, xml){
      process.stdout.write(util.format("\r%s%% (%d/%d entries imported)",(++entryInserted / entryTotal * 100).toFixed(), entryInserted, entryTotal))
      if (entryTotal == entryInserted) {
        db.run("COMMIT");
        db.close();
      }
    });
  } else {
    ops.createEntry(db, dictID, entryID, entryXML, email.toLowerCase(), historiography, function(newentryID, xml){
      process.stdout.write(util.format("\r%s%% (%d/%d entries imported)",(++entryInserted / entryTotal * 100).toFixed(), entryInserted, entryTotal))
      if (entryTotal == entryInserted) {
        db.run("COMMIT");
        db.close();
      }
    });
  }
}
