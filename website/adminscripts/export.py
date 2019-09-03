#!/usr/bin/python3

import os.path
import sqlite3
import sys

if len(sys.argv) != 2:
    print("Usage: ./adminscripts/export.py PATH_TO_DICTIONARY.sqlite")
    sys.exit()

db_path = sys.argv[1]
dictID = os.path.basename(db_path).replace(".sqlite", "")
try:
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    resxml = "<"+dictID+">\n"
    c = db.execute("select id, xml from entries")
    for r in c.fetchall():
        resxml += r["xml"]
        resxml += "\n"
    resxml += "</"+dictID+">"
    db.close()
    print(resxml)
except sqlite3.Error as e:
    print("Database error: %s" % e)
