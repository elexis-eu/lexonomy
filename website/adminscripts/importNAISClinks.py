#!/usr/bin/env python3

import os
import os.path
import sqlite3
import sys
import re
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import ops

if len(sys.argv) < 2:
    print("Usage: ./importNAISClinks.py PATH_TO_CROSSREF.sqlite < FILE_TO_IMPORT.links")
    sys.exit()

print("PID "+ str(os.getpid()))
print("Import started. Please wait...")
args = sys.argv[1:]

dbname = args[0]
dictID = os.path.basename(dbname).replace(".sqlite", "")
db = sqlite3.connect(dbname)
db.row_factory = sqlite3.Row

for line in sys.stdin:
    link = re.match(r'^<[^>]+/([^>]+)#([^>]+):([0-9_]+)> <[^>]+> <[^>]+/([^>]+)#([^>]+):([0-9_]+)> \. # ([01],[0-9]+)$', line)
    ops.links_add(link.group(1), link.group(2), link.group(3), link.group(4), link.group(5), link.group(6), link.group(7).replace(",","."), db)
