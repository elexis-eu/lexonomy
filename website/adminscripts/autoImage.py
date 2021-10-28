#!/usr/bin/env python3

import os
import os.path
import sqlite3
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import ops
import media
from xml.dom import minidom, Node
import random

if len(sys.argv) < 6:
    print("Usage: ./autoImage.py dataDir dictID element number bgjob")
    sys.exit()

print("PID "+ str(os.getpid()))
args = sys.argv[1:]
print(args)
dataDir = args[0]
dictID = args[1]
element = args[2]
number = int(args[3])
bgjob = args[4]

dbname = dataDir + 'dicts/' + dictID + '.sqlite'
db = sqlite3.connect(dbname)
db.row_factory = sqlite3.Row
configs = ops.readDictConfigs(db)
c = db.execute("select id, xml from entries")
for r in c.fetchall():
    entryID = r["id"]
    xml = r["xml"]
    doc = minidom.parseString(xml)
    head = ops.getEntryHeadword(xml, configs['titling'].get('headword'))
    print('Processing entry ' + head)
    res = media.get_images(configs, head)
    for img in random.sample(res, number):
        n_elem = doc.createElement(element)
        n_elem.appendChild(doc.createTextNode(str(img['url'])))
        n_elem.setAttribute('licence', img['licence'])
        doc.documentElement.appendChild(n_elem)
        print('Add image ' + img['url'])
    xml = doc.toxml().replace('<?xml version="1.0" ?>', '').strip()
    db.execute("update entries set xml=? where id=?", (xml, entryID))
db.execute("UPDATE bgjobs SET finished=0 WHERE id=?", (bgjob,))
db.commit()
print("COMPLETED\n")

