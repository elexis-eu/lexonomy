#!/usr/bin/python3

import os.path
import sqlite3
import sys
import datetime
import json
import xml.sax

if len(sys.argv) < 3:
    print("Usage: ./import.py [-p] PATH_TO_DICTIONARY.sqlite FILE_TO_IMPORT.xml [AUTHOR_EMAIL]")
    print("       -p   purge dictionary before importing")
    sys.exit()

print("Import started. Please wait...")
args = sys.argv[1:]
purge = False
if args[0] == "-p":
    purge = True
    args.pop(0)


dbname = args[0]
filename = args[1]
email = args[2] if len(args)>2 else "IMPORT@LEXONOMY"
dictID = os.path.basename(dbname).replace(".sqlite", "")
db = sqlite3.connect(dbname)
historiography={"importStart": str(datetime.datetime.utcnow()), "filename": os.path.basename(filename)}

if purge:
    db.execute("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', ?, ?, xml, ? from entries", (str(datetime.datetime.utcnow()), email, json.dumps(historiography)))
    db.execute("delete from entries")
    db.commit()
    db.execute("vacuum")
    db.commit()

# first pass -- check what is entry and how many entries we have
rootTag = ''
entryTag = ''
entryCount = 0

class handlerFirst(xml.sax.ContentHandler):
    def __init__(self):
        xml.sax.ContentHandler.__init__(self)
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

class handlerSecond(xml.sax.ContentHandler):
    def __init__(self):
        xml.sax.ContentHandler.__init__(self)
    def startElement( self, name, attrs):
        loc = self._locator
        print(loc.getColumnNumber())
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


xmldata = open(filename, 'r').read()
try:
    saxParser = xml.sax.parseString(xmldata, handlerFirst())
except xml.sax._exceptions.SAXParseException as e:
    xmldata = "<fakeroot>"+xmldata+"</fakeroot>"
    rootTag = ""
    entryTag = ""
    entryCount = 0
    saxParser = xml.sax.parseString(xmldata, handlerFirst())

print("Detected %d entries in '%s' element" % (entryCount, entryTag))

# second pass, we know what the entry is and can import that
import xml.dom.pulldom
import re
doc = xml.dom.pulldom.parseString(xmldata)
entryInserted = 0
for event, node in doc:
    if event == xml.dom.pulldom.START_ELEMENT and node.tagName == entryTag:
        doc.expandNode(node)
        entry = re.sub(r"\>[\r\n]+\s*\<","><", node.toxml())
        pat = r'^<[^>]*\s+lxnm:(sub)?entryID=[\'"]([0-9]+)["\']'
        entryID = None
        action = "create"
        if re.match(pat, entry):
            entryID = re.match(pat, entry).group(2)
            c = db.execute("select id from entries where id=?", (entryID,))
            if not c.fetchone():
                sql = "insert into entries(id, xml, needs_refac, needs_resave, needs_refresh, doctype) values(?, ?, 1, 1, 1, ?)"
                params = (entryID, entry, entryTag)
            else:
                sql = "update entries set doctype=?, xml=?, needs_refac=1, needs_resave=1, needs_refresh=1 where id=?"
                params = (entryTag, entry, entryID)
                action = "update"
        else:
            sql = "insert into entries(xml, needs_refac, needs_resave, needs_refresh, doctype) values(?, 1, 1, 1, ?)"
            params = (entry, entryTag)
        c = db.execute(sql, params)
        if entryID == None:
            entryID = c.lastrowid
        db.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, action, str(datetime.datetime.utcnow()), email, entry, json.dumps(historiography)))

        entryInserted += 1
        print("\r%.2d%% (%d/%d entries imported)" % ((entryInserted/entryCount*100), entryInserted, entryCount))

db.commit() 

