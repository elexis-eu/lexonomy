#!/usr/bin/env python3

import os
import os.path
import sqlite3
import sys
import datetime
import json
import xml.sax
import re
import argparse
from xml.parsers.expat import ParserCreate
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import ops

parser = argparse.ArgumentParser(description='Import an xml file into a Lexonomy database.')
parser.add_argument("-p", "--purge", help="Purge dictionary before importing [default false]", dest="purge", action="store_true")
parser.add_argument("--no-purge", dest="purge", action="store_false")
parser.set_defaults(purge=False)
parser.add_argument("-pp", "--purge-history", help="Purge the dicationary, and also purge the history. This will speed up future operations. [default false]", dest="purge_history", action="store_true")
parser.add_argument("--no-purge-history", dest="purge_history", action="store_false")
parser.set_defaults(purge_history=False)
parser.add_argument("-a", "--save-all-content", help="Also save non-entry content, such as enclosing structure and headers, etc. [default false]", dest="save_all_content", action="store_true")
parser.add_argument("--no-save-all-content", dest="save_all_content", action="store_false")
parser.set_defaults(save_all_content=False)
parser.add_argument("-u", "--user", help="Email of author (lexonomy account)", default="IMPORT@LEXONOMY")
parser.add_argument("database", help="Path to dictionary.sqlite, this should already exist.")
parser.add_argument("file", help="Path to file_to_import.xml")
args = parser.parse_args()


print("PID "+ str(os.getpid()))
print("Import started. Please wait...")

dictID = os.path.basename(args.database).replace(".sqlite", "")
db = sqlite3.connect(args.database, )
db.row_factory = sqlite3.Row
db.isolation_level=None
db.execute('PRAGMA synchronous = 0')
db.execute("PRAGMA cache_size = -100000") # about 100 megs
db.execute("begin")

historiography={"importStart": str(datetime.datetime.utcnow()), "filename": os.path.basename(args.file)}

if args.purge or args.purge_history:
    if args.purge_history: 
        print("Purging history...")
        db.execute("delete from history")
    else:
        print("Copying all entries to history...")
        db.execute("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', ?, ?, xml, ? from entries", (str(datetime.datetime.utcnow()), args.user, json.dumps(historiography)))

    # first delete from all related tables before deleting entries themselves - immense speadup due to faster constraint checking.
    print("Purging entries...")
    db.execute("delete from sub")
    db.execute("delete from searchables")
    db.execute("delete from linkables")
    db.execute("delete from sub")
    db.execute("delete from entries")
    db.commit()
    print("Compressing database...")
    db.execute("vacuum")
    db.commit()

# By default we assume the root of the defined document structure is an entry
# and not the root of the entire dictionary.
# (otherwise that would mean your entire dictionary would be stored in 1 entry)
configs: ops.Configs = ops.readDictConfigs(db)
xema: ops.ConfigXema = configs.get("xema", {})
entryTag: str = xema.get("root", "")
rootTag: str = "" # unused apart from entry tag detection code
xmldata: bytes = open(args.file, 'rb').read() # NOTE: do not decode into string, otherwise we cannot extract the entries because byte and char offsets will mismatch. What I think happens is  sax returns byte offsets, while if we decode into string here, slices on this string will interpret indices as char offsets.

if entryTag:
    print("Entry tag from xema: " + entryTag)

# If there is no document structure defined (the xema is empty?) 
# Then assume the dictionary looks like this, so detect the first child of the root, and set that as entryTag
# <dictionary> <!-- or whatever else -->
#   <entry>...</entry>
#   <entry>...</entry>
# </dictionary>
if not entryTag:
    # first pass -- check what is entry and how many entries we have
    class handlerFirst(xml.sax.ContentHandler):
        def startElement(self, name, attrs): # first element is the root, second element is the entry
            global rootTag
            global entryTag
            if rootTag == "":
                rootTag = name
            elif entryTag == "":
                entryTag = name
            else:
                pass
        def endElement(self, name):
            global entryCount
            global entryTag
            if name == entryTag:
                entryCount += 1

    # Remove leading declarations. (NOTE: ported from old code - why do we do this? does SAX report these as elements and we think they're the entry?)
    # Regex works on byte arrays, but all arguments must be bytes.
    xmldata = re.sub('<\?xml[^?]*\?>'.encode('utf-8'), b'', xmldata)
    xmldata = re.sub('<!DOCTYPE[^>]*>'.encode('utf-8'), b'', xmldata)
    try:
        saxParser = xml.sax.parseString(xmldata, handlerFirst())
    except xml.sax._exceptions.SAXParseException as e:
        if "junk after document element" in str(e):
            xmldata = "<fakeroot>"+xmldata+"</fakeroot>"
            rootTag = ""
            entryTag = ""
            entryCount = 0
            saxParser = xml.sax.parseString(xmldata, handlerFirst()) # if this errors too, just throw
        else:
            if entryTag == "":
                print("Not possible to detect element name for entry, please fix errors:")
                print(e, file=sys.stderr)
                sys.exit()

if not entryTag:
    print("Not possible to detect element name for entry, define a xema in the database, or fix errors in xml file")
    sys.exit()

p = ParserCreate("utf-8")
elementStarts: list[int] = []
addedUntil = 0
justClosedEntry = False
inEntry = False
restOfDocument: list[str] = []
entriesImported = 0
totalData = len(xmldata)

def indexEntry():
    global p
    global elementStarts
    global addedUntil
    global justClosedEntry
    global inEntry
    global restOfDocument
    global entriesImported
    if justClosedEntry:
        startOfEntry = elementStarts.pop()
        endOfEntry = p.CurrentByteIndex
        entrycontent = xmldata[startOfEntry:endOfEntry]
        justClosedEntry = False
        addedUntil = p.CurrentByteIndex

        id, xml, success, feedback = ops.createEntry(db, configs, entrycontent.decode("utf-8"), args.user)
        if success: 
            entriesImported = entriesImported + 1
            if args.save_all_content:
                restOfDocument.append(f"<lxnm:entry id=\"{id}\"/>")

        percent = int(addedUntil / totalData * 100)
        if ((entriesImported % 100) == 0):
            print(f"{percent}% - {entriesImported} entries imported so far...")

def indexInBetween():
    global p
    global elementStarts
    global addedUntil
    global justClosedEntry
    global inEntry
    global restOfDocument

    # something just closed
    # when do we need to add it?
    # that's all, now to add 
    if not args.save_all_content or justClosedEntry or inEntry:
        return
    content = xmldata[addedUntil:p.CurrentByteIndex]
    
    restOfDocument.append(content)
    addedUntil = p.CurrentByteIndex


# 3 handler functions
def start_element(name, attrs):
    global p
    global elementStarts
    global addedUntil
    global justClosedEntry
    global inEntry
    global restOfDocument
    indexEntry()
    indexInBetween()
    if name == entryTag:
        inEntry = True

    elementStarts.append(p.CurrentByteIndex)

def end_element(name):
    global p
    global elementStarts
    global addedUntil
    global justClosedEntry
    global inEntry
    global restOfDocument
    indexEntry()
    indexInBetween()
    if name == entryTag:
        justClosedEntry = True
        inEntry = False
    else:
        justClosedEntry = False
        elementStarts.pop()
    
def char_data(data: str):
    indexEntry()

p.StartElementHandler = start_element
p.EndElementHandler = end_element
p.CharacterDataHandler = char_data


p.Parse(xmldata)


# finished
db.commit()
db.close()
print(f"100% - {entriesImported} total entries imported.")
exit()
