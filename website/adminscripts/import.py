#!/usr/bin/env python3

import os
import os.path
import sqlite3
import sys
import datetime
import json
import xml.sax
import re
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import ops

if len(sys.argv) < 3:
    print("Usage: ./import.py [-p] PATH_TO_DICTIONARY.sqlite FILE_TO_IMPORT.xml [AUTHOR_EMAIL]")
    print("       -p   purge dictionary before importing but keep backup in history")
    print("       -pp  like -p but do not keep purged content in history and purge any existing history as well")
    sys.exit()

print("PID "+ str(os.getpid()))
print("Import started. You may close the window, import will run in the background. Please wait...")
args = sys.argv[1:]
purge = False
purge_history = False
if args[0] == "-p":
    purge = True
    args.pop(0)
elif args[0] == "-pp":
    purge = True
    purge_history = True
    args.pop(0)


dbname = args[0]
filename = args[1]
email = args[2] if len(args)>2 else "IMPORT@LEXONOMY"
dictID = os.path.basename(dbname).replace(".sqlite", "")
db = sqlite3.connect(dbname)
db.row_factory = sqlite3.Row
historiography={"importStart": str(datetime.datetime.utcnow()), "filename": os.path.basename(filename)}

if purge:
    if purge_history:
        print("Purging history...")
        db.execute("delete from history")
    else:
        print("Copying all entries to history...")
        db.execute("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', ?, ?, xml, ? from entries", (str(datetime.datetime.utcnow()), email, json.dumps(historiography)))
    print("Purging entries...")
    db.execute("delete from entries")
    db.execute("delete from linkables")
    db.execute("delete from searchables")
    db.commit()
    print("Compressing database...")
    db.execute("vacuum")
    db.commit()

# first pass -- check what is entry and how many entries we have
rootTag = ''
entryTag = ''
entryCount = 0

class handlerFirst(xml.sax.ContentHandler):
    def startElement( self, name, attrs):
        global rootTag
        global entryTag
        if rootTag == "":
            rootTag = name
        elif entryTag == "":
            entryTag = name
        else:
            pass
    def endElement( self, name):
        global entryCount
        global entryTag
        if name == entryTag:
            entryCount += 1

xmldata = open(filename, 'rb').read().decode('utf-8-sig')
xmldata = re.sub(r'<\?xml[^?]*\?>', '', xmldata)
xmldata = re.sub(r'<!DOCTYPE[^>]*>', '', xmldata)
try:
    saxParser = xml.sax.parseString("<!DOCTYPE foo SYSTEM 'x.dtd'>\n"+xmldata, handlerFirst())
    xmldata = "<!DOCTYPE foo SYSTEM 'x.dtd'>\n"+xmldata
except xml.sax._exceptions.SAXParseException as e:
    if "junk after document element" in str(e):
        xmldata = "<!DOCTYPE foo SYSTEM 'x.dtd'>\n<fakeroot>"+xmldata+"</fakeroot>"
        rootTag = ""
        entryTag = ""
        entryCount = 0
        saxParser = xml.sax.parseString(xmldata, handlerFirst())
    else:
        if entryTag == "":
            print("Not possible to detect element name for entry, please fix errors:")
            print(e, file=sys.stderr)
            sys.exit()

# second pass, we know what the entry is and can import that
import re

entryCount = len(re.findall('<'+entryTag+'[ >]', xmldata))
entryInserted = 0
print("Detected %d entries in '%s' element" % (entryCount, entryTag))

configs = ops.readDictConfigs(db)
needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0

re_entry = re.compile(r'<'+entryTag+'[^>]*>.*?</'+entryTag+'>', re.MULTILINE|re.DOTALL|re.UNICODE)
for entry in re.findall(re_entry, xmldata):
    skip = False
    try:
        xml.sax.parseString(entry, xml.sax.handler.ContentHandler())
    except xml.sax._exceptions.SAXParseException as e:
        skip = True
        print("Skipping entry, XML parsing error: " + str(e), file=sys.stderr)
        print("Skipping entry, XML parsing error: " + str(e))
        print("Entry with error: " + entry, file=sys.stderr)
        entryInserted += 1
    if not skip:
        pat = r'^<[^>]*\s+lxnm:(sub)?entryID=[\'"]([0-9]+)["\']'
        entryID = None
        action = "create"
        title = ops.getEntryTitle(entry, configs["titling"])
        sortkey = ops.getSortTitle(entry, configs["titling"])
        if re.match(pat, entry):
            entryID = re.match(pat, entry).group(2)
            c = db.execute("select id from entries where id=?", (entryID,))
            if not c.fetchone():
                sql = "insert into entries(id, xml, needs_refac, needs_resave, needs_refresh, doctype, title, sortkey) values(?, ?, ?, ?, ?, ?, ?, ?)"
                params = (entryID, entry, needs_refac, needs_resave, 0, entryTag, title, sortkey)
            else:
                sql = "update entries set doctype=?, xml=?, needs_refac=?, needs_resave=?, needs_refresh=? , title=?, sortkey=? where id=?"
                params = (entryTag, entry, needs_refac, needs_resave, 0, title, sortkey, entryID)
                action = "update"
        else:
            sql = "insert into entries(xml, needs_refac, needs_resave, needs_refresh, doctype, title, sortkey) values(?, ?, ?, ?, ?, ?, ?)"
            params = (entry, needs_refac, needs_resave, 0, entryTag, title, sortkey)
        c = db.execute(sql, params)
        if entryID == None:
            entryID = c.lastrowid
        db.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, action, str(datetime.datetime.utcnow()), email, entry, json.dumps(historiography)))
        db.execute("delete from searchables where entry_id=? and level=?", (entryID, 1))
        searchTitle = ops.getEntryTitle(entry, configs["titling"], True)
        db.execute("insert into searchables(entry_id, txt, level) values(?, ?, ?)", (entryID, searchTitle, 1))
        db.execute("insert into searchables(entry_id, txt, level) values(?, ?, ?)", (entryID, searchTitle.lower(), 1))
        entryInserted += 1
        if entryInserted % 100 == 0:
            print("\r%.2d%% (%d/%d entries imported)" % ((entryInserted/entryCount*100), entryInserted, entryCount), end='')
print("\r%.2d%% (%d/%d entries imported)" % ((entryInserted/entryCount*100), entryInserted, entryCount))
        
db.commit() 

