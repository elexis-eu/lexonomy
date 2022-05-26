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
    db.execute("delete from linkables")
    db.execute("delete from searchables")
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

# second pass, we know what the entry is and can import that
import re

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
