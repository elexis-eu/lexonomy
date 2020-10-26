#!/usr/bin/env python3

import sys, os, os.path

if len(sys.argv) < 3 or len(sys.argv) > 5:
    print("Usage: ./add.py PATH_TO_DICTIONARY.sqlite EMAIL [TITLE [BLURB]]")
    print("This script adds an existing dictionary SQLITE DB file to the main Lexonomy database and grants all access rights for user identified by EMAIL")
    sys.exit(1)

srcDB = os.path.abspath(sys.argv[1])
sys.path.insert(0, os.path.split(os.path.dirname(os.path.abspath(sys.argv[0])))[0])
os.chdir("..")
from ops import makeDict

title = ""
blurb = ""
if len(sys.argv) > 3:
    title = sys.argv[3]
    if len(sys.argv) > 4:
        blurb = sys.argv[4]

dictID, sqlite_ext = os.path.splitext(os.path.basename(srcDB))
makeDict(dictID, srcDB, title, blurb, sys.argv[2])
