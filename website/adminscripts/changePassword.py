#!/usr/bin/env python3

import json
import sys
import os.path
import sqlite3
import hashlib
import random
import string

if len(sys.argv) != 2:
    print("This tool changes the password for user with a given email")
    print("Usage: ./adminscripts/changePassword.py email")
    sys.exit()

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))
path = os.path.join(siteconfig["dataDir"], 'lexonomy.sqlite')
conn = sqlite3.connect(path)
print("Connected to database: %s" % path)

email = sys.argv[1];
password = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))
passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
try:
    conn.execute("update users set passwordHash=? where email=?", (passhash, email))
    conn.commit()
    print("User %s now has a new password: %s" % (email, password))
except sqlite3.Error as e:
    print("Could not update password for user %s. Database error: %s" % (email, e))

conn.close() 

