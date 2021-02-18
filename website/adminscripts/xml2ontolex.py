#!/usr/bin/python3

import os
import os.path
import sqlite3
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import ops

if len(sys.argv) < 2:
    print("Usage: ./xml2ontolex DB.sqlite")
    sys.exit()

dbname = sys.argv[1]
dictID = os.path.basename(dbname).replace(".sqlite", "")
dictDB = sqlite3.connect(dbname)
dictDB.row_factory = sqlite3.Row
configs = ops.readDictConfigs(dictDB)

for line in ops.listOntolexEntries(dictDB, dictID, configs, configs["xema"]["root"], ""):
    sys.stdout.write(line)                                                                                                                                 
