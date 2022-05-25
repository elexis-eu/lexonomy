#!/usr/bin/env python3

import mysql.connector
import json
import sys
import os.path
import hashlib
import random
import string

if len(sys.argv) != 2:
    print("This tool changes the password for user with a given email")
    print("Usage: ./adminscripts/changePassword.py email")
    sys.exit()

conn = mysql.connector.connect(
    host=os.environ['MYSQL_DB_HOST'],
    user="lexo",
    database="lexo",
    password=os.environ['MYSQL_DB_PASSWORD']
)
cur = conn.cursor(dictionary=True, buffered=True)

print("Connected to database: lexo")

email = sys.argv[1];
password = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))
passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
try:
    cur.execute("update users set passwordHash=%s where email=%s", (passhash, email))
    conn.commit()
    print("User %s now has a new password: %s" % (email, password))
except :
    print("Could not update password for user %s. Database error: %s" % (email, e))

conn.close() 

