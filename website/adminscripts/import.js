const fs=require("fs-extra");
const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3

const filepath="/home/mbm/Downloads/vojta/dk_ipa.xml";
var readStream=fs.createReadStream(filepath).setEncoding("utf8");

const dbpath="/home/mbm/lexonomy/data/dicts/zg6iqmitk.sqlite";
var db=new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE);

var entryCount=0;

//db.serialize();
db.exec("delete from entries; delete from history; delete from searchables; delete from sub; delete from sqlite_sequence", function(err){
  console.log(`database emptied`);
  db.run("BEGIN TRANSACTION");
  var buffer="";
  readStream.on("data", function(chunk){
    for(var pos=0; pos<chunk.length; pos++){
      buffer+=chunk[pos];
      if(buffer.endsWith("<entry>")){
        buffer="<entry>";
      }
      if(buffer.endsWith("</entry>")){
        entryCount++;
        insertEntry(entryCount, buffer);
      }
    }
  });
  readStream.on("end", function(){
    db.run("COMMIT");
    db.close();
    readStream.destroy();
  });
});

//---

function insertEntry(entryID, buffer){
  var xml=buffer.replace(/\>[\r\n]+\s*\</g, "><"); buffer="";
  var headword=""; xml.replace(/\<headword\>(.*)\<\/headword\>/, function(s, $1){headword=$1});
  var status=""; xml.replace(/\<status\>(.*)\<\/status\>/, function(s, $1){status=$1});
  var pos=""; xml.replace(/\<partOfSpeech\>(.*)\<\/partOfSpeech\>/, function(s, $1){status+=" "+$1});
  var title=headword+" "+status;
  var titleHtml="<span class='headword'>"+headword+"</span> "+status;
  var sortkey=toSortkey(title, abc);
  db.run("insert into entries(id, doctype, xml, title, sortkey) values($id, $doctype, $xml, $title, $sortkey)", {$id: entryID, $doctype: "entry", $xml: xml, $title: titleHtml, $sortkey: sortkey}, function(err){
    if(err) console.log(err);
    console.log(`entryID ${entryID} inserted into table entries`);
  });
  db.run("insert into searchables(entry_id, txt, level) values($entry_id, $txt, $level)", {$entry_id: entryID, $txt: headword, $level: 1}, function(err){
    if(err) console.log(err);
    console.log(`entryID ${entryID} inserted into table searchables`);
  });
  db.run("insert into history(entry_id, action, [when], email, xml, historiography) values($entry_id, $action, $when, $email, $xml, $historiography)", {
    $entry_id: entryID,
    $action: "create",
    $when: (new Date()).toISOString(),
    $email: "valselob@gmail.com",
    $xml: xml,
    $historiography: JSON.stringify({}),
  }, function(err){
    if(err) console.log(err);
    console.log(`entryID ${entryID} inserted into table history`);
  });
}

//----

function toSortkey(s, abc){
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
}

const abc=[
    [
      "a",
      "á",
      "à",
      "â",
      "ä",
      "ă",
      "ā",
      "ã",
      "å",
      "ą",
      "æ"
    ],
    [
      "b"
    ],
    [
      "c",
      "ć",
      "ċ",
      "ĉ",
      "č",
      "ç"
    ],
    [
      "d",
      "ď",
      "đ"
    ],
    [
      "e",
      "é",
      "è",
      "ė",
      "ê",
      "ë",
      "ě",
      "ē",
      "ę"
    ],
    [
      "f"
    ],
    [
      "g",
      "ġ",
      "ĝ",
      "ğ",
      "ģ"
    ],
    [
      "h",
      "ĥ",
      "ħ"
    ],
    [
      "i",
      "ı",
      "í",
      "ì",
      "i",
      "î",
      "ï",
      "ī",
      "į"
    ],
    [
      "j",
      "ĵ"
    ],
    [
      "k",
      "ĸ",
      "ķ"
    ],
    [
      "l",
      "ĺ",
      "ŀ",
      "ľ",
      "ļ",
      "ł"
    ],
    [
      "m"
    ],
    [
      "n",
      "ń",
      "ň",
      "ñ",
      "ņ"
    ],
    [
      "o",
      "ó",
      "ò",
      "ô",
      "ö",
      "ō",
      "õ",
      "ő",
      "ø",
      "œ"
    ],
    [
      "p"
    ],
    [
      "q"
    ],
    [
      "r",
      "ŕ",
      "ř",
      "ŗ"
    ],
    [
      "s",
      "ś",
      "ŝ",
      "š",
      "ş",
      "ș",
      "ß"
    ],
    [
      "t",
      "ť",
      "ţ",
      "ț"
    ],
    [
      "u",
      "ú",
      "ù",
      "û",
      "ü",
      "ŭ",
      "ū",
      "ů",
      "ų",
      "ű"
    ],
    [
      "v"
    ],
    [
      "w",
      "ẃ",
      "ẁ",
      "ŵ",
      "ẅ"
    ],
    [
      "x"
    ],
    [
      "y",
      "ý",
      "ỳ",
      "ŷ",
      "ÿ"
    ],
    [
      "z",
      "ź",
      "ż",
      "ž"
    ]
  ]
