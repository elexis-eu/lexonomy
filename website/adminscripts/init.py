#!/usr/bin/python3

# Script to initialize database and users, from the siteconfig.json file

import json
import os.path
import sqlite3
import hashlib
import random
import string

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))
path = os.path.join(siteconfig["dataDir"], 'lexonomy.sqlite')

conn = sqlite3.connect(path)
print("Connected to database: %s" % path)

if siteconfig.get("dbSchemaFile") != "":
    schema = open(siteconfig.get("dbSchemaFile"), 'r').read()
    try:
        conn.executescript(schema)
        conn.commit()
        print("Initialized %s with: %s" % (path, siteconfig.get("dbSchemaFile")))
    except sqlite3.Error as e:
        print("Problem importing database schema. Likely the DB has already been created. Database error: %s" % e)
    
else:
    print("Unknown database schema, please add dbSchemaFile to siteconfig.json")

for user in siteconfig["admins"]:
    password = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    try:
        conn.execute("insert into users(email, passwordHash) values(?, ?)", (user, passhash))
        conn.commit()
        print("I have created a user account for %s. The password is: %s" % (user, password))
    except sqlite3.Error as e:
        print("Creating a user account for %s has failed. This could be because the account already exists." % user)

conn.close() 
