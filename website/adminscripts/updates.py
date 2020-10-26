#!/usr/bin/env python3

# Script to upgrade the schema of Lexonomy's main database.

import json
import os.path
import sqlite3

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))
path = os.path.join(siteconfig["dataDir"], 'lexonomy.sqlite')
print("Updating lexonomy database: %s" % path)
conn = sqlite3.connect(path)
conn.row_factory = sqlite3.Row

print("Create table recovery_tokens")
try:
    conn.execute("CREATE TABLE IF NOT EXISTS recovery_tokens (email text, requestAddress text, token text, expiration datetime, usedDate datetime, usedAddress text)")
except sqlite3.Error as e:
    print("Database error: %s" % e)

print("Create table register_tokens")
try:
    conn.execute("CREATE TABLE IF NOT EXISTS register_tokens (email text, requestAddress text, token text, expiration datetime, usedDate datetime, usedAddress text)")
except sqlite3.Error as e:
    print("Database error: %s" % e)

print("Add column ske_id")
try:
    conn.execute("ALTER TABLE users ADD COLUMN ske_id INTEGER")
except sqlite3.Error as e:
    print("Database error: %s" % e)

print("Add column ske_username")
try:
    conn.execute("ALTER TABLE users ADD COLUMN ske_username TEXT")
except sqlite3.Error as e:
    print("Database error: %s" % e)

print("Add column consent")
try:
    conn.execute("ALTER TABLE users ADD COLUMN consent INTEGER")
except sqlite3.Error as e:
    print("Database error: %s" % e)

print("Add column ske_apiKey")
try:
    conn.execute("ALTER TABLE users ADD COLUMN ske_apiKey TEXT")
except sqlite3.Error as e:
    print("Database error: %s" % e)

conn.commit()
conn.close()
