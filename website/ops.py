#!/usr/bin/python3

import datetime
import json
import os
import os.path
import sqlite3
from this import s
import mysql.connector
import hashlib
import random
import string
import smtplib, ssl
import urllib
import jwt
import shutil
import markdown
import re
import secrets
from collections import defaultdict
from icu import Locale, Collator
import logging
import sys


siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))
DB = siteconfig['db']
mainDB = None
linksDB = None
dictDB = {}
ques = '%s' if DB == 'mysql' else '?'
SQL_SEP = '`' if DB == 'mysql' else '['
SQL_SEP_C = '`' if DB == 'mysql' else ']'

i18n = json.load(open(os.environ.get("LEXONOMY_LANG",
                                           "lang/" + siteconfig["lang"] + ".json"), encoding="utf-8"))

defaultDictConfig = {"editing": {"xonomyMode": "nerd", "xonomyTextEditor": "askString" },
                     "searchability": {"searchableElements": []},
                     "xema": {"elements": {}},
                     "titling": {"headwordAnnotations": []},
                     "flagging": {"flag_element": "", "flags": []}}

prohibitedDictIDs = ["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "dicts", "oneclick", "recoverpwd", "createaccount", "consent", "userprofile", "dictionaries", "about", "list", "lemma", "json", "ontolex", "tei"];

# db management
def getDB(dictID):
    if DB == 'mysql': 
        global dictDB
        try:
            if dictID not in dictDB or not dictDB[dictID].is_connected():
                dictDB[dictID] = mysql.connector.connect(
                    host=os.environ['MYSQL_DB_HOST'],
                    user=os.environ['MYSQL_DB_USER'],
                    database="lexo_" + dictID,
                    password=os.environ['MYSQL_DB_PASSWORD'],
                    autocommit=True
                )
            conn = dictDB[dictID].cursor(dictionary=True, buffered=True)
        except:
            dictDB[dictID] = mysql.connector.connect(
                host=os.environ['MYSQL_DB_HOST'],
                user=os.environ['MYSQL_DB_USER'],
                database="lexo_" + dictID,
                password=os.environ['MYSQL_DB_PASSWORD'],
                autocommit=True
            )
            conn = dictDB[dictID].cursor(dictionary=True, buffered=True)
        return conn
    elif os.path.isfile(os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite")):
        conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite"))
        conn.row_factory = sqlite3.Row
        conn.executescript("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=on")
        return conn
    else:
        return None

def getMainDB():
    if DB == 'mysql':
        global mainDB
        try:
            if mainDB == None or not mainDB.is_connected():
                mainDB = mysql.connector.connect(
                    host=os.environ['MYSQL_DB_HOST'],
                    user=os.environ['MYSQL_DB_USER'],
                    database="lexo",
                    password=os.environ['MYSQL_DB_PASSWORD'],
                    autocommit=True
                )
            conn = mainDB.cursor(dictionary=True, buffered=True)
        except:
            mainDB = mysql.connector.connect(
                host=os.environ['MYSQL_DB_HOST'],
                user=os.environ['MYSQL_DB_USER'],
                database="lexo",
                password=os.environ['MYSQL_DB_PASSWORD'],
                autocommit=True
            )
            conn = mainDB.cursor(dictionary=True, buffered=True)
        return conn
    else:
        conn = sqlite3.connect(os.path.join(
            siteconfig["dataDir"], 'lexonomy.sqlite'))
        conn.row_factory = sqlite3.Row
        return conn

def getLinkDB():
    if DB == 'mysql': 
        global linksDB
        try:
            if linksDB == None or not linksDB.is_connected():
                linksDB = mysql.connector.connect(
                    host=os.environ['MYSQL_DB_HOST'],
                    user=os.environ['MYSQL_DB_USER'],
                    database="lexo_crossref",
                    password=os.environ['MYSQL_DB_PASSWORD'],
                    autocommit=True
                )
            conn = linksDB.cursor(dictionary=True)
        except:
            linksDB = mysql.connector.connect(
                host=os.environ['MYSQL_DB_HOST'],
                user=os.environ['MYSQL_DB_USER'],
                database="lexo_crossref",
                password=os.environ['MYSQL_DB_PASSWORD'],
                autocommit=True
            )
            conn = linksDB.cursor(dictionary=True, buffered=True)
        return conn
    else:
        conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], 'crossref.sqlite'))
        conn.row_factory = sqlite3.Row
        return conn

# SMTP
# SMTP
def sendmail(mailTo, mailSubject, mailText):
    if siteconfig["mailconfig"] and siteconfig["mailconfig"]["host"] and siteconfig["mailconfig"]["port"]:
        message = "Subject: " + mailSubject + "\n\n" + mailText
        if siteconfig["mailconfig"]["ttl"]:
            context = ssl.create_default_context()
            with smtplib.SMTP(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"]) as server:
                server.ehlo()  # Can be omitted
                server.starttls(context=context)
                server.ehlo()  # Can be omitted
                server.login(siteconfig["mailconfig"]["from"], siteconfig["mailconfig"]["password"])
                server.sendmail(siteconfig["mailconfig"]["from"], mailTo, message)
                server.quit()
        elif siteconfig["mailconfig"]["secure"]:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"], context=context)
            server.sendmail(siteconfig["mailconfig"]["from"], mailTo, message)
            server.quit()
        else:
            server = smtplib.SMTP(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"])
            server.sendmail(siteconfig["mailconfig"]["from"], mailTo, message)
            server.quit()
        
# config
def readDictConfigs(dictDB):
    configs = {"siteconfig": siteconfig}
    c = dictDB.execute("select * from configs")
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        configs[r["id"]] = json.loads(r["json"])
    for conf in ["ident", "publico", "users", "kex", "titling", "flagging",
                 "searchability", "xampl", "thes", "collx", "defo", "xema",
                 "xemplate", "editing", "subbing", "download", "links", "autonumber", "gapi"]:
        if not conf in configs:
            configs[conf] = defaultDictConfig.get(conf, {})

    users = {}
    for email in configs["users"]:
        users[email.lower()] = configs["users"][email]
    configs["users"] = users

    for key in configs.keys():
        if type(configs[key]) is dict:
            configs[key] = defaultdict(lambda: None, configs[key])

    return configs

def addSubentryParentTags(db, entryID, xml):
    from xml.dom import minidom, Node
    doc = minidom.parseString(xml)
    els = []
    _els = doc.getElementsByTagName("*")
    els.append(_els[0])
    for i in range(1, len(_els)):
        if _els[i].getAttributeNS("http://www.lexonomy.eu/", "subentryID"):
            els.append(_els[i])
    for el in els:
        subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID")
        if el.parentNode.nodeType != Node.ELEMENT_NODE:
            subentryID = entryID
        c = db.execute(f"select s.parent_id, e.title from sub as s inner join entries as e on e.id=s.parent_id where s.child_id={ques}", (subentryID,))
        c = c if c else db
        for r in c.fetchall() if c else []:
            pel = doc.createElementNS("http://www.lexonomy.eu/", "lxnm:subentryParent")
            pel.setAttribute("id", str(r["parent_id"]))
            pel.setAttribute("title", r["title"])
            el.appendChild(pel)
    return doc.toxml()

def removeSubentryParentTags(xml):
    return re.sub(r"<lxnm:subentryParent[^>]*>", "", xml)

# auth
def verifyLogin(email, sessionkey):
    conn = getMainDB()
    now = datetime.datetime.utcnow()
    yesterday = now - datetime.timedelta(days=1)
    email = email.lower()
    c = conn.execute(f"select email, ske_apiKey, ske_username, apiKey, consent from users where email={ques} and sessionKey={ques} and sessionLast>={ques}", (email, sessionkey, yesterday))
    c = c if c else conn
    user = c.fetchone() if c else None
    if not user:
        return {"loggedin": False, "email": None}
    conn.execute(f"update users set sessionLast={ques} where email={ques}", (now, email))
    close_db(conn, shouldclose=False)
    ret = {"loggedin": True, "email": email, "isAdmin": email in siteconfig["admins"],
           "ske_username": user["ske_username"], "ske_apiKey": user["ske_apiKey"],
           "apiKey": user["apiKey"], "consent": user["consent"] == 1}
    return ret

def verifyLoginAndDictAccess(email, sessionkey, dictDB):
    ret = verifyLogin(email, sessionkey)
    configs = readDictConfigs(dictDB)
    dictAccess = configs["users"].get(email)
    if ret["loggedin"] == False or (not dictAccess and not ret["isAdmin"]):
        return {"loggedin": ret["loggedin"], "email": email, "dictAccess": False, "isAdmin": False}, configs
    ret["dictAccess"] = dictAccess
    for r in ["canEdit", "canConfig", "canDownload", "canUpload"]:
        ret[r] = ret.get("isAdmin") or (dictAccess and dictAccess[r])
    return ret, configs

def deleteEntry(db, entryID, email):
    # tell my parents that they need a refresh:
    db.execute (f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id={ques})", (entryID,))
    # delete me:
    db.execute (f"delete from entries where id={ques}", (entryID,))
    # tell history that I have been deleted:
    db.execute (f"insert into history(entry_id, action, {SQL_SEP}when{SQL_SEP_C}, email, xml) values({ques},{ques},{ques},{ques},{ques})",
                (entryID, "delete", datetime.datetime.utcnow(), email, None))
    close_db(db)

def readEntry(db, configs, entryID):
    c = db.execute(f"select * from entries where id={ques}", (entryID,))
    c = c if c else db
    row = c.fetchone() if c else None
    if not row:
        return 0, "", ""
    xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
    if configs["subbing"]:
        xml = addSubentryParentTags(db, entryID, xml)
    if configs["links"]:
        xml = updateEntryLinkables(db, entryID, xml, configs, False, False)
    return entryID, xml, row["title"]

def createEntry(dictDB, configs, entryID, xml, email, historiography):
    xml = setHousekeepingAttributes(entryID, xml, configs["subbing"])
    xml = removeSubentryParentTags(xml)
    title = getEntryTitle(xml, configs["titling"])
    sortkey = getSortTitle(xml, configs["titling"])
    doctype = getDoctype(xml)
    needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
    needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0
    # entry title already exists?
    c = dictDB.execute(f"select id from entries where title = {ques} and id <> {ques}", (title, entryID))
    c = c if c else dictDB
    r = c.fetchone() if c else None
    feedback = {"type": "saveFeedbackHeadwordExists", "info": r["id"]} if r else None
    if entryID:
        sql = f"insert into entries(id, xml, title, sortkey, needs_refac, needs_resave, doctype) values({ques}, {ques}, {ques}, {ques}, {ques}, {ques}, {ques})"
        params = (entryID, xml, title, sortkey, needs_refac, needs_resave, doctype)
    else:
        sql = f"insert into entries(xml, title, sortkey, needs_refac, needs_resave, doctype) values({ques}, {ques}, {ques}, {ques}, {ques}, {ques})"
        params = (xml, title, sortkey, needs_refac, needs_resave, doctype)
    c = dictDB.execute(sql, params)
    c = c if c else dictDB
    entryID = c.lastrowid
    dictDB.execute(f"insert into searchables(entry_id, txt, level) values({ques}, {ques}, {ques})", (entryID, getEntryTitle(xml, configs["titling"], True), 1))
    dictDB.execute(f"insert into history(entry_id, action, {SQL_SEP}when{SQL_SEP_C}, email, xml, historiography) values({ques}, {ques}, {ques}, {ques}, {ques}, {ques})", (entryID, "create", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
    close_db(dictDB, shouldclose=False)
    return entryID, xml, feedback

def updateEntry(dictDB, configs, entryID, xml, email, historiography):
    c = dictDB.execute(f"select id, xml from entries where id={ques}", (entryID, ))
    c = c if c else dictDB
    row = c.fetchone() if c else None
    xml = setHousekeepingAttributes(entryID, xml, configs["subbing"])
    xml = removeSubentryParentTags(xml)
    newxml = re.sub(r" xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']", "", xml)
    newxml = re.sub(r"(\=)\"([^\"]*)\"", r"\1'\2'", newxml)
    newxml = re.sub(r" lxnm:(sub)?entryID='[0-9]+'", "", newxml)
    newxml = re.sub(r" lxnm:linkable='[^']+'", "", newxml)
    if not row:
        adjustedEntryID, adjustedXml, feedback = createEntry(dictDB, configs, entryID, xml, email, historiography)
        if configs["links"]:
            adjustedXml = updateEntryLinkables(dictDB, adjustedEntryID, adjustedXml, configs, True, True)
        return adjustedEntryID, adjustedXml, True, feedback
    else:
        oldxml = row["xml"]
        oldxml = re.sub(r" xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']", "", oldxml)
        oldxml = re.sub(r"(\=)\"([^\"]*)\"", r"\1'\2'", oldxml)
        oldxml = re.sub(r" lxnm:(sub)?entryID='[0-9]+'", "", oldxml)
        oldxml = re.sub(r" lxnm:linkable='[^']+'", "", oldxml)
        if oldxml == newxml:
            return entryID, xml, False, None
        else:
            dictDB.execute(f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id={ques})", (entryID,))
            title = getEntryTitle(xml, configs["titling"])
            sortkey = getSortTitle(xml, configs["titling"])
            doctype = getDoctype(xml)
            needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
            needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0
            # entry title already exists?
            c = dictDB.execute(f"select id from entries where title = {ques} and id <> {ques}", (title, entryID))
            c = c if c else dictDB
            r = c.fetchone() if c else None
            feedback = {"type": "saveFeedbackHeadwordExists", "info": r["id"]} if r else None
            dictDB.execute(f"update entries set doctype={ques}, xml={ques}, title={ques}, sortkey={ques}, needs_refac={ques}, needs_resave={ques} where id={ques}", (doctype, xml, title, sortkey, needs_refac, needs_resave, entryID))
            dictDB.execute(f"update searchables set txt={ques} where entry_id={ques} and level=1", (getEntryTitle(xml, configs["titling"], True), entryID))
            dictDB.execute(f"insert into history(entry_id, action, {SQL_SEP}when{SQL_SEP_C}, email, xml, historiography) values({ques}, {ques}, {ques}, {ques}, {ques}, {ques})", (entryID, "update", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
            close_db(dictDB, shouldclose=False)
            if configs["links"]:
                xml = updateEntryLinkables(dictDB, entryID, xml, configs, True, True)
            return entryID, xml, True, feedback

def getEntryTitle(xml, titling, plaintext=False):
    if titling.get("headwordXpath", False):
        from lxml import etree as ET
        root = ET.fromstring(xml)
        result = root.xpath(titling.get("headwordXpath"));
        ret = str(result[0]) if len(result) > 0 else ''
        return ret
    elif titling.get("headwordAnnotationsType") == "advanced" and not plaintext:
        ret = titling["headwordAnnotationsAdvanced"]
        advancedUsed = False
        for el in re.findall(r"%\([^)]+\)", titling["headwordAnnotationsAdvanced"]):
            text = ""
            extract = extractText(xml, el[2:-1])
            if len(extract) > 0:
                text = extract[0]
                advancedUsed = True
            ret = ret.replace(el, text)
        if advancedUsed:
            return ret
    ret = getEntryHeadword(xml, titling.get("headword"))
    if not plaintext:
        ret = "<span class='headword'>" + ret + "</span>"
    if titling.get("headwordAnnotations"):
        for hw in titling.get("headwordAnnotations"):
            ret += " " if ret != "" else ""
            ret += " ".join(extractText(xml, hw))
    return ret

def getEntryTitleID(dictDB, configs, entry_id, plaintext=False):
    eid, xml, title = readEntry(dictDB, configs, entry_id)
    return getEntryTitle(xml, configs["titling"], plaintext)

def getEntryHeadword(xml, headword_elem):
    ret = "?"
    arr = extractText(xml, headword_elem)
    if len(arr)>0:
        ret = arr[0]
    else:
        ret = extractFirstText(xml)
    if len(ret) > 255:
        ret = ret[0:255]
    return ret

def getDoctype(xml):
    pat = r"^<([^>\/\s]+)"
    for match in re.findall(pat, xml):
        return match
    return ""

def getSortTitle(xml, titling):
    if titling.get("headwordSorting"):
        return getEntryHeadword(xml, titling.get("headwordSorting"))
    if titling.get("headwordXpath", False):
        return getEntryTitle(xml, titling);
    return getEntryHeadword(xml, titling.get("headword"))

def generateKey(size=32):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(size))

def generateDictId(size=8):
    return ''.join(random.choice("abcdefghijkmnpqrstuvwxy23456789") for _ in range(size))

def login(email, password):
    if siteconfig["readonly"]:
        return {"success": False}
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    c = conn.execute(f"select email from users where email={ques} and passwordHash={ques}", (email.lower(), passhash))
    c = c if c else conn
    user = c.fetchone() if c else None
    if not user:
        return {"success": False}
    key = generateKey()
    now = datetime.datetime.utcnow()
    conn.execute(f"update users set sessionKey={ques}, sessionLast={ques} where email={ques}", (key, now, email))
    close_db(conn)
    return {"success": True, "email": user["email"], "key": key}

def logout(user):
    conn = getMainDB()
    if DB == 'sqlite':
        conn.execute(f"update users set sessionKey='', sessionLast='' where email={ques}", (user["email"],))
    else:
        conn.execute(f"update users set sessionKey='', sessionLast=NULL where email={ques}", (user["email"],))
    close_db(conn)
    return True

def sendSignupToken(email, remoteip):
    if siteconfig["readonly"]:
        return False    
    conn = getMainDB()
    c = conn.execute(f"select email from users where email={ques}", (email.lower(),))
    c = c if c else conn
    user = c.fetchone() if c else None
    if not user:
        token = secrets.token_hex()
        tokenurl = siteconfig["baseUrl"] + "createaccount/" + token
        expireDate = datetime.datetime.now() + datetime.timedelta(days=2)
        mailSubject = "Lexonomy signup"
        mailText = "Dear Lexonomy user,\n\n"
        mailText += "Somebody (hopefully you, from the address "+remoteip+") requested to create a new Lexonomy account. Please follow the link below to create your account:\n\n"
        mailText += tokenurl + "\n\n"
        mailText += "For security reasons this link is only valid for two days (until "+expireDate.isoformat()+"). If you did not request an account, you can safely ignore this message. \n\n"
        mailText += "Yours,\nThe Lexonomy team"
        conn.execute(f"insert into register_tokens (email, requestAddress, token, expiration) values ({ques}, {ques}, {ques}, {ques})", (email, remoteip, token, expireDate))
        close_db(conn)
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def sendToken(email, remoteip):
    if siteconfig["readonly"]:
        return False    
    conn = getMainDB()
    c = conn.execute(f"select email from users where email={ques}", (email.lower(),))
    c = c if c else conn
    user = c.fetchone() if c else None
    if user:
        token = secrets.token_hex()
        tokenurl = siteconfig["baseUrl"] + "recoverpwd/" + token
        expireDate = datetime.datetime.now() + datetime.timedelta(days=2)
        mailSubject = "Lexonomy password reset"
        mailText = "Dear Lexonomy user,\n\n"
        mailText += "Somebody (hopefully you, from the address "+remoteip+") requested a new password for the Lexonomy account "+email+". You can reset your password by clicking the link below:\n\n";
        mailText += tokenurl + "\n\n"
        mailText += "For security reasons this link is only valid for two days (until "+expireDate.isoformat()+"). If you did not request a password reset, you can safely ignore this message. \n\n"
        mailText += "Yours,\nThe Lexonomy team"
        conn.execute(f"insert into recovery_tokens (email, requestAddress, token, expiration) values ({ques}, {ques}, {ques}, {ques})", (email, remoteip, token, expireDate))
        close_db(conn)
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def verifyToken(token, tokenType):
    conn = getMainDB()
    c = conn.execute(f"select * from "+tokenType+f"_tokens where token={ques} and expiration>=datetime('now') and usedDate is null", (token,))
    c = c if c else conn
    row = c.fetchone() if c else None
    if row:
        return True
    else:
        return False

def createAccount(token, password, remoteip):
    conn = getMainDB()
    c = conn.execute(f"select * from register_tokens where token={ques} and expiration>=datetime('now') and usedDate is null", (token,))
    c = c if c else conn
    row = c.fetchone() if c else None
    if row:
        c2 = conn.execute(f"select * from users where email={ques}", (row["email"],))
        row2 = c2.fetchone() if c2 else None
        if not row2:
            passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
            conn.execute(f"insert into users (email,passwordHash) values ({ques},{ques})", (row["email"], passhash))
            conn.execute(f"update register_tokens set usedDate=datetime('now'), usedAddress={ques} where token={ques}", (remoteip, token))
            close_db(conn)
            return True
        else:
            return False
    else:
        return False

def resetPwd(token, password, remoteip):
    conn = getMainDB()
    c = conn.execute(f"select * from recovery_tokens where token={ques} and expiration>=datetime('now') and usedDate is null", (token,))
    c = c if c else conn
    row = c.fetchone() if c else None
    if row:
        passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
        conn.execute(f"update users set passwordHash={ques} where email={ques}", (passhash, row["email"]))
        conn.execute(f"update recovery_tokens set usedDate=datetime('now'), usedAddress={ques} where token={ques}", (remoteip, token))
        close_db(conn)
        return True
    else:
        return False

def setConsent(email, consent):
    conn = getMainDB()
    conn.execute(f"update users set consent={ques} where email={ques}", (consent, email))
    close_db(conn)
    return True

def changePwd(email, password):
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    conn.execute(f"update users set passwordHash={ques} where email={ques}", (passhash, email))
    close_db(conn)
    return True

def changeSkeUserName(email, ske_userName):
    conn = getMainDB()
    conn.execute(f"update users set ske_username={ques} where email={ques}", (ske_userName, email))
    close_db(conn)
    return True

def changeSkeApiKey(email, ske_apiKey):
    conn = getMainDB()
    conn.execute(f"update users set ske_apiKey={ques} where email={ques}", (ske_apiKey, email))
    close_db(conn)
    return True

def updateUserApiKey(user, apiKey):
    conn = getMainDB()
    conn.execute(f"update users set apiKey={ques} where email={ques}", (apiKey, user["email"]))
    close_db(conn)
    sendApiKeyToSke(user, apiKey)
    return True

def sendApiKeyToSke(user, apiKey):
    if user["ske_username"] and user["ske_apiKey"]:
        data = json.dumps({"options": {"settings_lexonomyApiKey": apiKey, "settings_lexonomyEmail": user["email"].lower()}})
        queryData = urllib.parse.urlencode({ "username": user["ske_username"], "api_key": user["ske_apiKey"], "json": data })
        url = "https://api.sketchengine.eu/bonito/run.cgi/set_user_options?" + queryData
        res = urllib.request.urlopen(url)
    return True

def prepareApiKeyForSke(email):
    conn = getMainDB()
    c = conn.execute(f"select * from users where email={ques}", (email,))
    c = c if c else conn
    row = c.fetchone() if c else None
    if row:
        if row["apiKey"] == None or row["apiKey"] == "":
            lexapi = generateKey()
            conn.execute(f"update users set apiKey={ques} where email={ques}", (lexapi, email))
            close_db(conn)
        else:
            lexapi = row["apiKey"]
        sendApiKeyToSke(row, lexapi)
    return True
    

def processJWT(user, jwtdata):
    conn = getMainDB()
    c = conn.execute(f"select * from users where ske_id={ques}", (jwtdata["user"]["id"],))
    c = c if c else conn
    row = c.fetchone() if c else None
    key = generateKey()
    now = datetime.datetime.utcnow()
    if row:
        #if SkE ID in database = log in user
        conn.execute(f"update users set sessionKey={ques}, sessionLast={ques} where email={ques}", (key, now, row["email"]))
        close_db(conn)
        prepareApiKeyForSke(row["email"])
        return {"success": True, "email": row["email"], "key": key}
    else:
        if user["loggedin"]:
            #user logged in = save SkE ID in database
            conn.execute(f"update users set ske_id={ques}, ske_username={ques}, ske_apiKey={ques}, sessionKey={ques}, sessionLast={ques} where email={ques}", (jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, user["email"]))
            close_db(conn)
            prepareApiKeyForSke(user["email"])
            return {"success": True, "email": user["email"], "key": key}
        else:
            #user not logged in = register and log in
            email = jwtdata["user"]["email"].lower()
            c2 = conn.execute(f"select * from users where email={ques}", (email,))
            row2 = c2.fetchone() if c2 else None
            if not row2:
                lexapi = generateKey()
                conn.execute(f"insert into users (email, passwordHash, ske_id, ske_username, ske_apiKey, sessionKey, sessionLast, apiKey) values ({ques}, null, {ques}, {ques}, {ques}, {ques}, {ques}, {ques})", (email, jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, lexapi))
                close_db(conn)
                prepareApiKeyForSke(email)
                return {"success": True, "email": email, "key": key}
            else:
                return {"success": False, "error": "user with email " + email + " already exists. Log-in and connect account to SkE."}


def dictExists(dictID):
    if DB == 'sqlite':
        return os.path.isfile(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    elif DB == 'mysql':
        conn = mysql.connector.connect(
            host=os.environ['MYSQL_DB_HOST'],
            user=os.environ['MYSQL_DB_USER'],
            password=os.environ['MYSQL_DB_PASSWORD']
        )
        mycursor = conn.cursor()
        mycursor.execute("SHOW DATABASES LIKE %s", ('lexo_' + dictID,))
        c = mycursor.fetchone()
        conn.close()
        return True if c else False

def suggestDictId():
    dictid = generateDictId()
    while dictid in prohibitedDictIDs or dictExists(dictid):
        dictid = generateDictId()
    return dictid

def makeDict(dictID, template, title, blurb, email):
    if title == "":
        title = "?"
    if blurb == "":
        blurb = i18n["Yet another Lexonomy dictionary."]
    if dictID in prohibitedDictIDs or dictExists(dictID):
        return False
    if DB == 'sqlite':
        if not template.startswith("/"):
            template = "dictTemplates/" + template + ".sqlite"
        shutil.copy(template, os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    elif DB == 'mysql':
        import subprocess
        p = subprocess.call(["adminscripts/copyMysqlDb.sh", template, dictID], start_new_session=True, close_fds=True)

    users = {email: {"canEdit": True, "canConfig": True, "canDownload": True, "canUpload": True}}
    dictDB = getDB(dictID)
    dictDB.execute(f"update configs set json={ques} where id='users'", (json.dumps(users),))
    ident = {"title": title, "blurb": blurb}
    dictDB.execute(f"update configs set json={ques} where id='ident'", (json.dumps(ident),))
    close_db(dictDB, shouldclose=False)
    attachDict(dictDB, dictID)
    return True

def attachDict(dictDB, dictID):
    configs = readDictConfigs(dictDB)
    conn = getMainDB()
    conn.execute(f"delete from dicts where id={ques}", (dictID,))
    conn.execute(f"delete from user_dict where dict_id={ques}", (dictID,))
    title = configs["ident"]["title"]
    conn.execute(f"insert into dicts(id, title) values ({ques}, {ques})", (dictID, title))
    for email in configs["users"]:
        conn.execute(f"insert into user_dict(dict_id, user_email) values ({ques}, {ques})", (dictID, email.lower()))
    close_db(conn)

def cloneDict(dictID, email):
    newID = suggestDictId()
    shutil.copy(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts/" + newID + ".sqlite"))
    newDB = getDB(newID)
    res = newDB.execute("select json from configs where id='ident'")
    row = res.fetchone() if res else None
    ident = {"title": "?", "blurb": "?"}
    if row:
        ident = json.loads(row["json"])
        ident["title"] = i18n["Clone of "] + ident["title"]
    newDB.execute(f"update configs set json={ques} where id='ident'", (json.dumps(ident),))
    close_db(newDB)
    attachDict(newDB, newID)
    return {"success": True, "dictID": newID, "title": ident["title"]}

def destroyDict(dictID):
    conn = getMainDB()
    conn.execute(f"delete from dicts where id={ques}", (dictID,))
    conn.execute(f"delete from user_dict where dict_id={ques}", (dictID,))
    close_db(conn)
    os.remove(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    return True

def moveDict(oldID, newID):
    if newID in prohibitedDictIDs or dictExists(newID):
        return False
    shutil.move(os.path.join(siteconfig["dataDir"], "dicts/" + oldID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts/" + newID + ".sqlite"))
    conn = getMainDB()
    conn.execute(f"delete from dicts where id={ques}", (oldID,))
    close_db(conn)
    dictDB = getDB(newID)
    attachDict(dictDB, newID)
    return True

def getDoc(docID):
    if os.path.isfile("docs/"+docID+".md"):
        doc = {"id": docID, "title":"", "html": ""}
        html = markdown.markdown(open("docs/"+docID+".md").read())
        title = re.search('<h1>([^<]*)</h1>', html)
        if title:
            doc["title"] = re.sub('<\/?h1>','', title.group(0))
        doc["html"] = html
        return doc
    else:
        return False

def getDictsByUser(email):
    dicts = []
    email = str(email).lower()
    conn = getMainDB()
    c = conn.execute(f"select d.id, d.title from dicts as d inner join user_dict as ud on ud.dict_id=d.id where ud.user_email={ques} order by d.title", (email,))
    c = c if c else conn
    for r in c.fetchall() if c else []:
        info = {"id": r["id"], "title": r["title"], "hasLinks": False}
        try:
            configs = readDictConfigs(getDB(r["id"]))
            if configs["users"][email] and configs["users"][email]["canConfig"]:
                info["currentUserCanDelete"] = True
            if configs["links"] and len(configs["links"])>0:
                info["hasLinks"] = True
        except:
            info["broken"] = True
        dicts.append(info)
    return dicts

def getLangList():
    langs = []
    codes = get_iso639_1()
    conn = getMainDB()
    c = conn.execute("SELECT DISTINCT language FROM dicts WHERE language!='' ORDER BY language")
    c = c if c else conn
    for r in c.fetchall() if c else []:
        lang = next((item for item in codes if item["code"] == r["language"]), {})
        langs.append({"code": r["language"], "language": lang.get("lang")})
    return langs

def getDictList(lang, withLinks):
    dicts = []
    conn = getMainDB()
    if lang:
        c = conn.execute(f"SELECT * FROM dicts WHERE language={ques} ORDER BY title", (lang, ))
        c = c if c else conn
    else:
        c = conn.execute("SELECT * FROM dicts ORDER BY title")
        c = c if c else conn
    for r in c.fetchall() if c else []:
        info = {"id": r["id"], "title": r["title"], "language": r["language"], "hasLinks": False}
        try:
            configs = readDictConfigs(getDB(r["id"]))
            if configs["links"] and len(configs["links"])>0:
                info["hasLinks"] = True
        except:
            info["broken"] = True
        if not withLinks or (withLinks == True and info["hasLinks"] == True):
            dicts.append(info)
    return dicts

def getLinkList(headword, sourceLang, sourceDict, targetLang):
    links = []
    linkDB = getLinkDB()
    if sourceDict and sourceDict != "":
        dicts = [{"id": sourceDict}]
    else:
        dicts = getDictList(sourceLang, True)

    for d in dicts:
        dictDB = getDB(d["id"])
        if dictDB:
            query = f"SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND s.txt LIKE {ques} AND s.level=1"
            c = dictDB.execute(query, (headword+"%", ))
            c = c if c else dictDB
            for entry in c.fetchall() if c else []:
                info0 = {"sourceDict": d["id"], "sourceHeadword": entry["hw"]}
                if entry["entry_id"] and entry["entry_id"] != "":
                    info0["sourceID"] = entry["entry_id"]
                if entry["link_el"] == "sense" and "_" in entry["link_id"]:
                    lia = entry["link_id"].split("_")
                    info0["sourceSense"] = lia[1]
                    if not info0["sourceID"]:
                        info0["sourceID"] = lia[0]
                info0["sourceURL"] = siteconfig["baseUrl"] + info0["sourceDict"] + "/" + str(info0["sourceID"])
                # first, find links with searched dict as source
                if targetLang:
                    targetDicts = []
                    for td in getDictList(targetLang, True):
                        targetDicts.append(td["id"])
                    query2 = f"SELECT * FROM links WHERE source_dict={ques} AND source_id={ques} AND target_dict IN "+"('"+"','".join(targetDicts)+"')"
                else:
                    query2 = f"SELECT * FROM links WHERE source_dict={ques} AND source_id={ques}"
                data2 = (d["id"], entry["link_id"])
                c2 = linkDB.execute(query2, data2)
                for r2 in c2.fetchall() if c2 else []:
                    info = info0.copy()
                    info["targetDict"] = r2["target_dict"]
                    info["confidence"] = r2["confidence"]
                    targetDB = getDB(r2["target_dict"])
                    if targetDB:
                        info["targetLang"] = readDictConfigs(targetDB)['ident']['lang']
                        info["targetDictConcept"] = False
                        if r2["target_element"] == "sense" and "_" in r2["target_id"]:
                            lia = r2["target_id"].split("_")
                            info["targetSense"] = lia[1]
                        query3 = f"SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt={ques} AND s.level=1"
                        c3 = targetDB.execute(query3, (r2["target_id"],))
                        for r3 in c3.fetchall() if c3 else []:
                            info["targetHeadword"] = r3["hw"]
                            info["targetID"] = r3["entry_id"]
                            info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                            links.append(info)
                    else:
                        info["targetHeadword"] = r2["target_id"]
                        info["targetID"] = r2["target_id"]
                        info["targetDictConcept"] = True
                        info["targetURL"] = ""
                        info["targetSense"] = ""
                        info["targetLang"] = ""
                        links.append(info)
                # second, find links with search dict as target
                if targetLang:
                    query2 = f"SELECT * FROM links WHERE target_dict={ques} AND target_id={ques} AND source_dict IN "+"('"+"','".join(targetDicts)+"')"
                else:
                    query2 = f"SELECT * FROM links WHERE target_dict={ques} AND target_id={ques}"
                data2 = (d["id"], entry["link_id"])
                c2 = linkDB.execute(query2, data2)
                for r2 in c2.fetchall() if c2 else []:
                    info = info0.copy()
                    info["targetDict"] = r2["source_dict"]
                    info["confidence"] = r2["confidence"]
                    sourceDB = getDB(r2["source_dict"])
                    if sourceDB:
                        info["targetLang"] = readDictConfigs(sourceDB)['ident']['lang']
                        info["targetDictConcept"] = False
                        if r2["source_element"] == "sense" and "_" in r2["source_id"]:
                            lia = r2["source_id"].split("_")
                            info["targetSense"] = lia[1]
                        query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                        c3 = sourceDB.execute(query3, (r2["source_id"],))
                        for r3 in c3.fetchall():
                            info["targetHeadword"] = r3["hw"]
                            info["targetID"] = r3["entry_id"]
                            info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                            links.append(info)
                    else:
                        info["targetHeadword"] = r2["source_id"]
                        info["targetID"] = r2["source_id"]
                        info["targetDictConcept"] = True
                        info["targetURL"] = ""
                        info["targetSense"] = ""
                        info["targetLang"] = ""
                        links.append(info)
        else:
            # source dictionary is "concept", use headword as target_id
            info0 = {"sourceDict": d["id"], "sourceHeadword": headword, "sourceID": headword, "sourceDictConcept": True, "sourceURL": "", "sourceSense": ""}
            # first, find links with searched dict as source
            if targetLang:
                targetDicts = []
                for td in getDictList(targetLang, True):
                    targetDicts.append(td["id"])
                query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=? AND target_dict IN "+"('"+"','".join(targetDicts)+"')"
            else:
                query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=?"
            data2 = (d["id"], headword)
            c2 = linkDB.execute(query2, data2)
            for r2 in c2.fetchall():
                info = info0.copy()
                info["targetDict"] = r2["target_dict"]
                info["confidence"] = r2["confidence"]
                targetDB = getDB(r2["target_dict"])
                if targetDB:
                    info["targetLang"] = readDictConfigs(targetDB)['ident']['lang']
                    info["targetDictConcept"] = False
                    if r2["target_element"] == "sense" and "_" in r2["target_id"]:
                        lia = r2["target_id"].split("_")
                        info["targetSense"] = lia[1]
                    query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                    c3 = targetDB.execute(query3, (r2["target_id"],))
                    for r3 in c3.fetchall():
                        info["targetHeadword"] = r3["hw"]
                        info["targetID"] = r3["entry_id"]
                        info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                        links.append(info)
                else:
                    info["targetHeadword"] = r2["target_id"]
                    info["targetID"] = r2["target_id"]
                    info["targetDictConcept"] = True
                    info["targetURL"] = ""
                    info["targetSense"] = ""
                    info["targetLang"] = ""
                    links.append(info)
            # second, find links with search dict as target
            if targetLang:
                query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=? AND source_dict IN "+"('"+"','".join(targetDicts)+"')"
            else:
                query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=?"
            data2 = (d["id"], headword)
            c2 = linkDB.execute(query2, data2)
            for r2 in c2.fetchall():
                info = info0.copy()
                info["targetDict"] = r2["source_dict"]
                info["confidence"] = r2["confidence"]
                sourceDB = getDB(r2["source_dict"])
                if sourceDB:
                    info["targetLang"] = readDictConfigs(sourceDB)['ident']['lang']
                    info["targetDictConcept"] = False
                    if r2["source_element"] == "sense" and "_" in r2["source_id"]:
                        lia = r2["source_id"].split("_")
                        info["targetSense"] = lia[1]
                    query3 = f"SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt={ques} AND s.level=1"
                    c3 = sourceDB.execute(query3, (r2["source_id"],))
                    for r3 in c3.fetchall() if c3 else []:
                        info["targetHeadword"] = r3["hw"]
                        info["targetID"] = r3["entry_id"]
                        info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                        links.append(info)
                else:
                    info["targetHeadword"] = r2["source_id"]
                    info["targetID"] = r2["source_id"]
                    info["targetDictConcept"] = True
                    info["targetURL"] = ""
                    info["targetSense"] = ""
                    info["targetLang"] = ""
                    links.append(info)

    return links

def listUsers(searchtext, howmany):
    conn = getMainDB()
    c = conn.execute(f"select * from users where email like {ques} order by email limit {howmany}", ("%"+searchtext+"%",))
    c = c if c else conn
    users = []
    for r in c.fetchall() if c else []:
        users.append({"id": r["email"], "title": r["email"]})
    c = conn.execute(f"select count(*) as total from users where email like {ques}", (f"%"+searchtext+"%", ))
    c = c if c else conn
    r = c.fetchone() if c else None
    total = r["total"]
    return {"entries":users, "total": total}

def createUser(xml):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    email = root.attrib["email"]
    passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
    conn = getMainDB()
    conn.execute(f"insert into users(email, passwordHash) values({ques}, {ques})", (email.lower(), passhash))
    close_db(conn)
    return {"entryID": email, "adjustedXml": readUser(email)["xml"]}

def updateUser(email, xml):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    if root.attrib['password']:
        passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
        conn = getMainDB()
        conn.execute(f"update users set passwordHash={ques} where email={ques}", (passhash, email.lower()))
        close_db(conn)
    return readUser(email)

def deleteUser(email):
    conn = getMainDB()
    conn.execute(f"delete from users where email={ques}", (email.lower(),))
    close_db(conn)
    return True

def readUser(email):
    conn = getMainDB()
    c = conn.execute(f"select * from users where email={ques}", (email.lower(), ))
    c = c if c else conn
    r = c.fetchone() if c else None
    if r:
        if r["sessionLast"]:
            xml =  "<user lastSeen='"+str(r["sessionLast"])+"'>"
        else:
            xml =  "<user>"
        c2 = conn.execute(f"select d.id, d.title from user_dict as ud inner join dicts as d on d.id=ud.dict_id  where ud.user_email={ques} order by d.title", (r["email"], ))
        for r2 in c2.fetchall() if c2 else []:
            xml += "<dict id='" + r2["id"] + "' title='" + clean4xml(r2["title"]) + "'/>"
        xml += "</user>"
        return {"email": r["email"], "xml": xml}
    else:
        return {"email":"", "xml":""}

def listDicts(searchtext, howmany):
    conn = getMainDB()
    c = conn.execute(f"select * from dicts where id like {ques} or title like {ques} order by id limit {howmany}", (f"%"+searchtext+"%", "%"+searchtext+"%"))
    c = c if c else conn
    dicts = []
    for r in c.fetchall() if c else []:
        dicts.append({"id": r["id"], "title": r["title"]})
    c = conn.execute(f"select count(*) as total from dicts where id like {ques} or title like {ques}", (f"%"+searchtext+"%", "%"+searchtext+"%"))
    c = c if c else conn
    r = c.fetchone() if c else None
    total = r["total"]
    return {"entries": dicts, "total": total}

def readDict(dictId):
    conn = getMainDB()
    c = conn.execute(f"select * from dicts where id={ques}", (dictId, ))
    c = c if c else conn
    r = c.fetchone() if c else None
    if r:
        xml =  "<dict id='"+clean4xml(r["id"])+"' title='"+clean4xml(r["title"])+"'>"
        c2 = conn.execute(f"select u.email from user_dict as ud inner join users as u on u.email=ud.user_email where ud.dict_id={ques} order by u.email", (r["id"], ))
        for r2 in c2.fetchall() if c2 else []:
            xml += "<user email='" + r2["email"] + "'/>"
        xml += "</dict>"
        return {"id": r["id"], "xml": xml}
    else:
        return {"id":"", "xml":""}

def clean4xml(text):
    return text.replace("&", "&amp;").replace('"', "&quot;").replace("'", "&apos;").replace("<", "&lt;").replace(">", "&gt;");

def markdown_text(text):
    return markdown.markdown(text).replace("<a href=\"http", "<a target=\"_blank\" href=\"http")

def setHousekeepingAttributes(entryID, xml, subbing):
    entryID = str(entryID)
    #delete any housekeeping attributes and elements that already exist in the XML
    xml = re.sub(r"^(<[^>\/]*)\s+xmlns:lxnm=['\"]http:\/\/www\.lexonomy\.eu\/[\"']", r"\1", xml)
    xml = re.sub(r"^(<[^>\/]*)\s+lxnm:entryID=['\"][^\"\']*[\"']", r"\1", xml)
    xml = re.sub(r"^(<[^>\/]*)\s+lxnm:subentryID=['\"][^\"\']*[\"']", r"\1", xml)
    xml = re.sub(r"^(<[^>\/]*)\s+lxnm:linkable=['\"][^\"\']*[\"']", r"\1", xml)
    #get name of the top-level element
    root = ""
    root = re.search(r"^<([^\s>\/]+)", xml, flags=re.M).group(1)
    #set housekeeping attributes
    if root in subbing:
        xml = re.sub(r"^<([^\s>\/]+)", r"<\1 lxnm:subentryID='"+entryID+"'", xml)
    else:
        xml = re.sub(r"^<([^\s>\/]+)", r"<\1 lxnm:entryID='"+entryID+"'", xml)
    xml = re.sub(r"^<([^\s>\/]+)", r"<\1 xmlns:lxnm='http://www.lexonomy.eu/'", xml)
    return xml

def exportEntryXml(dictDB, dictID, entryID, configs, baseUrl):
    c = dictDB.execute(f"select * from entries where id={ques}", (entryID,))
    c = c if c else dictDB
    row = c.fetchone() if c else None
    if row:
        xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
        attribs = " this=\"" + baseUrl + dictID + "/" + str(row["id"]) + ".xml\""
        c2 = dictDB.execute(f"select e1.id, e1.title from entries as e1 where e1.sortkey<(select sortkey from entries where id={ques}) order by e1.sortkey desc limit 1", (entryID, ))
        r2 = c2.fetchone() if c2 else None
        if r2:
            attribs += " previous=\"" + baseUrl + dictID + "/" + str(r2["id"]) + ".xml\""
        c2 = dictDB.execute(f"select e1.id, e1.title from entries as e1 where e1.sortkey>(select sortkey from entries where id={ques}) order by e1.sortkey asc limit 1", (entryID, ))
        r2 = c2.fetchone() if c2 else None
        if r2:
            attribs += " next=\"" + baseUrl + dictID + "/" + str(r2["id"]) + ".xml\""
        xml = "<lexonomy" + attribs + ">" + xml + "</lexonomy>"
        return {"entryID": row["id"], "xml": xml}
    else:
        return {"entryID": 0, "xml": ""}

def readNabesByEntryID(dictDB, dictID, entryID, configs):
    nabes_before = []
    nabes_after = []
    nabes = []
    c = dictDB.execute(f"select e1.id, e1.title, e1.sortkey from entries as e1 where e1.doctype={ques} ", (configs["xema"]["root"],))
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        nabes.append({"id": str(r["id"]), "title": r["title"], "sortkey": r["sortkey"]})

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    nabes.sort(key=lambda x: collator.getSortKey(x['sortkey']))
   
    #select before/after entries 
    entryID_seen = False
    for n in nabes:
        if not entryID_seen:
            nabes_before.append(n)
        else:
            nabes_after.append(n)
        if n["id"] == entryID:
            entryID_seen = True
    return nabes_before[-8:] + nabes_after[0:15]

def readNabesByText(dictDB, dictID, configs, text):
    nabes_before = []
    nabes_after = []
    nabes = []
    c = dictDB.execute(f"select e1.id, e1.title, e1.sortkey from entries as e1 where e1.doctype={ques} ", (configs["xema"]["root"],))
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        nabes.append({"id": str(r["id"]), "title": r["title"], "sortkey": r["sortkey"]})

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    nabes.sort(key=lambda x: collator.getSortKey(x['sortkey']))
    
    #select before/after entries 
    for n in nabes:
        if collator.getSortKey(n["sortkey"]) <= collator.getSortKey(text):
            nabes_before.append(n)
        else:
            nabes_after.append(n)
    return nabes_before[-8:] + nabes_after[0:15]

def readRandoms(dictDB):
    configs = readDictConfigs(dictDB)
    limit = 75
    more = False
    randoms = []
    if DB == 'sqlite':
        c = dictDB.execute(f"select id, title, sortkey from entries where doctype={ques} and id in (select id from entries order by random() limit {limit})", (configs["xema"]["root"],))
    elif DB == 'mysql':
        c = dictDB.execute(f"select id, title, sortkey from entries where doctype={ques} order by RAND() limit {limit}", (configs["xema"]["root"],))
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        randoms.append({"id": r["id"], "title": r["title"], "sortkey": r["sortkey"]})

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    randoms.sort(key=lambda x: collator.getSortKey(x['sortkey']))

    c = dictDB.execute("select count(*) as total from entries")
    c = c if c else dictDB
    r = c.fetchone() if c else None
    if r["total"] > limit:
        more = True
    return {"entries": randoms, "more": more}

def readRandomOne(dictDB, dictID, configs):
    if DB == 'sqlite':
        c = dictDB.execute(f"select id, title, xml from entries where id in (select id from entries where doctype={ques} order by random() limit 1)", (configs["xema"]["root"], ))
    elif DB == 'mysql':
        c = dictDB.execute(
            f"select id, title, xml from entries where doctype={ques} order by RAND() limit 1", (configs["xema"]["root"], ))
    c = c if c else dictDB
    r = c.fetchone() if c else None
    if r:
        return {"id": r["id"], "title": r["title"], "xml": r["xml"]}
    else:
        return {"id": 0, "title": "", "xml": ""}

def download_xslt(configs):
    if 'download' in configs and 'xslt' in configs['download'] and configs['download']['xslt'].strip != "" and len(configs['download']['xslt']) > 0 and configs['download']['xslt'][0] == "<": 
        import lxml.etree as ET
        try:
            xslt_dom = ET.XML(configs["download"]["xslt"].encode("utf-8"))
            xslt = ET.XSLT(xslt_dom)
        except (ET.XSLTParseError, ET.XMLSyntaxError) as e:
            return "Failed to parse XSL: {}".format(e), False

        def transform(xml_txt):
            try:
                dom = ET.XML(xml_txt)
                xml_transformed_dom = xslt(dom)
                xml_transformed_byt = ET.tostring(xml_transformed_dom, xml_declaration=False, encoding="utf-8")
                xml_transformed = xml_transformed_byt.decode('utf-8')
                return xml_transformed, True
            except ET.XMLSyntaxError as e:
                return "Failed to parse content: {}".format(e), False
            except ET.XSLTParseError as e:
                return "Failed to use XSL: {}".format(e), False
    else:
        def transform(xml_text):
            return re.sub("><",">\n<",xml_text), True

    return transform


def download(dictDB, dictID, configs):
    rootname = dictID.lstrip(" 0123456789")
    if rootname == "":
        rootname = "lexonomy"
    yield "<"+rootname+">\n"
    c = dictDB.execute("select id, xml from entries")
    c = c if c else dictDB

    transform = download_xslt(configs)

    for r in c.fetchall() if c else []:
        xml = setHousekeepingAttributes(r["id"], r["xml"], configs["subbing"])
        xml_xsl, success = transform(xml)
        if not success:
            return xml_xsl, 400

        yield xml_xsl
        yield "\n"

    yield "</"+rootname+">\n"

def purge(dictDB, email, historiography):
    dictDB.execute(f"insert into history(entry_id, action, {SQL_SEP}when{SQL_SEP_C}, email, xml, historiography) select id, 'purge', {ques}, {ques}, xml, {ques} from entries", (str(datetime.datetime.utcnow()), email, json.dumps(historiography)))
    dictDB.execute("delete from entries")
    close_db(dictDB, True)
    if DB == 'sqlite':
        dictDB.execute("vacuum")
    close_db(dictDB)
    return True

def showImportErrors(filename, truncate):
    with open(filename+".err", "r") as content_file:
        content = content_file.read()
    if (truncate):
        content = content[0:truncate].replace("<", "&lt;")
        return {"errorData": content, "truncated": truncate}
    else:
        return content

def importfile(dictID, filename, email):
    import subprocess
    pidfile = filename + ".pid";
    errfile = filename + ".err";
    if os.path.isfile(pidfile):
        return checkImportStatus(pidfile, errfile)
    pidfile_f = open(pidfile, "w")
    errfile_f = open(errfile, "w")
    if DB == 'sqlite': 
        dbpath = os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite")
        p = subprocess.Popen(["adminscripts/import.py", dbpath, filename, email], stdout=pidfile_f, stderr=errfile_f, start_new_session=True, close_fds=True)
    else:
        p = subprocess.Popen(["adminscripts/importMysql.py", dictID, filename, email], stdout=pidfile_f, stderr=errfile_f, start_new_session=True, close_fds=True)
    return {"progressMessage": "Import started. Please wait...", "finished": False, "errors": False}

def checkImportStatus(pidfile, errfile):
    content = ''
    while not content:
        with open(pidfile, "r") as content_file:
            content = content_file.read()
    pid_data = re.split(r"[\n\r]", content)
    finished = False
    if len(pid_data) > 1:
        if pid_data[-1] == "":
            progress = pid_data[-2]
        else:
            progress = pid_data[-1]
        if "100%" in progress:
            finished = True
    else:
        progress = "Import started. Please wait..."
    errors = False
    if os.path.isfile(errfile) and os.stat(errfile).st_size:
        errors = True
    return {"progressMessage": progress, "finished": finished, "errors": errors}

def readDoctypesUsed(dictDB):
    c = dictDB.execute("select doctype from entries group by doctype order by count(*) desc")
    c = c if c else dictDB
    doctypes = []
    for r in c.fetchall() if c else []:
        doctypes.append(r["doctype"])
    return doctypes

def getLastEditedEntry(dictDB, email):
    c = dictDB.execute(f"select entry_id from history where email={ques} order by {SQL_SEP}when{SQL_SEP_C} desc limit 1", (email, ))
    c = c if c else dictDB
    r = c.fetchone() if c else None
    if r:
        return str(r["entry_id"])
    else:
        return ""

def listEntriesById(dictDB, entryID, configs):
    c = dictDB.execute(f"select e.id, e.title, e.xml from entries as e where e.id={ques}", (entryID,))
    c = c if c else dictDB
    entries = []
    for r in c.fetchall() if c else []:
        xml = setHousekeepingAttributes(r["id"], r["xml"], configs["subbing"])
        entries.append({"id": r["id"], "title": r["title"], "xml": xml})
    return entries

def listEntries(dictDB, dictID, configs, doctype, searchtext="", modifier="start", howmany=10, sortdesc=False, reverse=False, fullXML=False):
    # fast initial loading, for large dictionaries without search
    if searchtext == "":
        sqlc = "select count(*) as total from entries"
        cc = dictDB.execute(sqlc)
        cc = cc if cc else dictDB
        rc = cc.fetchone() if cc else None
        if int(rc["total"]) > 1000:
            sqlf = "select * from entries order by sortkey limit 200"
            cf = dictDB.execute(sqlf)
            cf = cf if cf else dictDB
            entries = []
            for rf in cf.fetchall() if cf else []:
                item = {"id": rf["id"], "title": rf["title"], "sortkey": rf["sortkey"]}
                entries.append(item)
            return rc["total"], entries, True

    lowertext = searchtext.lower()
    if type(sortdesc) == str:
        if sortdesc == "true":
            sortdesc = True
        else:
            sortdesc = False
    if "flag_element" in configs["flagging"] or fullXML:
        entryXML = ", e.xml "
    else:
        entryXML = ""
    if "headwordSortDesc" in configs["titling"]:
        reverse = configs["titling"]["headwordSortDesc"]
    if reverse:
        sortdesc = not sortdesc

    if modifier == "start":
        sql1 = f"select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + f" from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or s.txt like {ques}) group by e.id order by s.level"
        params1 = (doctype, lowertext+"%", searchtext+"%")
        sql2 = f"select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or s.txt like {ques})"
        params2 = (doctype, lowertext+"%", searchtext+"%")
    elif modifier == "wordstart":
        sql1 = f"select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + f" from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or LOWER(s.txt) like {ques} or s.txt like {ques} or s.txt like {ques}) group by e.id order by s.level"
        params1 = (doctype, lowertext + "%", "% " + lowertext + "%", searchtext + "%", "% " + searchtext + "%")
        sql2 = f"select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or LOWER(s.txt) like {ques} or s.txt like {ques} or s.txt like {ques})"
        params2 = (doctype, lowertext + "%", "% " + lowertext + "%", searchtext + "%", "% " + searchtext + "%")
    elif modifier == "substring":
        sql1 = f"select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + f" from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or s.txt like {ques}) group by e.id order by s.level"
        params1 = (doctype, "%" + lowertext + "%", "%" + searchtext + "%")
        sql2 = f"select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and (LOWER(s.txt) like {ques} or s.txt like {ques})"
        params2 = (doctype, "%" + lowertext + "%", "%" + searchtext + "%")
    elif modifier == "exact":
        sql1 = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + f" from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and s.txt={ques} group by e.id order by s.level"
        params1 = (doctype, searchtext)
        sql2 = f"select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and s.txt={ques}"
        params2 = (doctype, searchtext)
    c1 = dictDB.execute(sql1, params1)
    c1 = c1 if c1 else dictDB
    entries = []
    for r1 in c1.fetchall() if c1 else []:
        item = {"id": r1["id"], "title": r1["title"], "sortkey": r1["sortkey"]}
        if "flag_element" in configs["flagging"]:
            item["flag"] = extractText(r1["xml"], configs["flagging"]["flag_element"])
        if fullXML:
            item["xml"] = setHousekeepingAttributes(r1["id"], r1["xml"], configs["subbing"])
        if r1["level"] > 1:
            item["title"] += " ← <span class='redirector'>" + r1["txt"] + "</span>"
        entries.append(item)

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    entries.sort(key=lambda x: collator.getSortKey(x['sortkey']), reverse=sortdesc)
    # and limit
    entries = entries[0:int(howmany)]

    c2 = dictDB.execute(sql2, params2)
    c2 = c2 if c2 else dictDB
    r2 = c2.fetchone() if c2 else None
    total = r2["total"]
    return total, entries, False

def listEntriesPublic(dictDB, dictID, configs, searchtext):
    howmany = 100
    sql_list = f"select s.txt, min(s.level) as level, e.id, e.title, e.sortkey, case when s.txt={ques} then 1 else 2 end as priority from searchables as s inner join entries as e on e.id=s.entry_id where s.txt like {ques} and e.doctype={ques} group by e.id order by priority, level, s.level"
    # c1 = dictDB.execute(sql_list, ("%"+searchtext+"%", "%"+searchtext+"%", configs["xema"].get("root")))
    c1 = dictDB.execute(sql_list, (searchtext, searchtext, configs["xema"].get("root")))
    
    c1 = c1 if c1 else dictDB
    entries = []
    for r1 in c1.fetchall() if c1 else []:
        item = {"id": r1["id"], "title": r1["title"], "sortkey": r1["sortkey"], "exactMatch": (r1["level"] == 1 and r1["priority"] == 1)}
        if r1["level"] > 1:
            item["title"] += " ← <span class='redirector'>" + r1["txt"] + "</span>"
        entries.append(item)

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    entries.sort(key=lambda x: collator.getSortKey(x['sortkey']))
    # and limit
    entries = entries[0:int(howmany)]

    return entries

def extractText(xml, elName):
    elName = str(elName)
    if elName == "":
        return []
    pat = r"<" + elName + "[^>]*>([^<]*)</" + elName + ">"
    return re.findall(pat, xml)

def extractFirstText(xml):
    pat = r"<([^\s>]+)[^>]*>([^<>]*?)</([^\s>]+)>"
    for match in re.findall(pat, xml):
        if match[0] == match[2] and match[1].strip() != "":
            return match[1].strip()
    return ""

def getDictStats(dictDB):
    res = {"entryCount": 0, "needResave": 0}
    c = dictDB.execute("select count(*) as entryCount from entries")
    c = c if c else dictDB
    r = c.fetchone() if c else None
    res["entryCount"] = r["entryCount"]
    c = dictDB.execute("select count(*) as needResave from entries where needs_resave=1 or needs_refresh=1 or needs_refac=1")
    c = c if c else dictDB
    r = c.fetchone() if c else None
    res["needResave"] = r["needResave"]
    return res

def updateDictConfig(dictDB, dictID, configID, content):
    dictDB.execute(f"delete from configs where id={ques}", (configID, ))
    dictDB.execute(f"insert into configs(id, json) values({ques}, {ques})", (configID, json.dumps(content)))
    close_db(dictDB, shouldclose=False)
    
    if configID == "ident":
        attachDict(dictDB, dictID)
        if content.get('lang'):
            lang = content.get('lang')
            conn = getMainDB()
            conn.execute(f"UPDATE dicts SET language={ques} WHERE id={ques}", (lang, dictID))
            close_db(conn, shouldclose=False)
        return content, False
    elif configID == 'users':
        attachDict(dictDB, dictID)
        return content, False
    elif configID == "titling" or configID == "searchability":
        resaveNeeded = flagForResave(dictDB)
        return content, resaveNeeded
    elif configID == "links":
        resaveNeeded = flagForResave(dictDB)
        if DB == 'sqlite':
            c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='linkables'")
            if not c.fetchone():
                dictDB.execute("CREATE TABLE linkables (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER REFERENCES entries (id) ON DELETE CASCADE, txt TEXT, element TEXT, preview TEXT)")
                dictDB.execute("CREATE INDEX link ON linkables (txt)")
        return content, resaveNeeded
    elif configID == "subbing":
        refacNeeded = flagForRefac(dictDB)
        return content, refacNeeded
    else:
        return content, False

def flagForResave(dictDB):
    c = dictDB.execute("update entries set needs_resave=1")
    c = c if c else dictDB
    close_db(dictDB)
    return (c.rowcount > 0)

def flagForRefac(dictDB):
    c = dictDB.execute("update entries set needs_refac=1")
    c = c if c else dictDB
    close_db(dictDB)
    return (c.rowcount > 0)

def makeQuery(lemma):
    words = []
    for w in lemma.split(" "):
        if w != "":
            words.append('[lc="'+w+'"+|+lemma_lc="'+w+'"]')
    ret = re.sub(" ","+", lemma) + ";q=aword," + "".join(words) + ";q=p+0+0>0+1+[ws(\".*\",+\"definitions\",+\".*\")];exceptmethod=PREV-CONC"
    return ret

def clearRefac(dictDB):
    dictDB.execute("update entries set needs_refac=0, needs_refresh=0")
    close_db(dictDB, shouldclose=False)


def refac(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    if len(configs['subbing']) == 0:
        return False
    c = dictDB.execute(f"select e.id, e.xml, h.email from entries as e left outer join history as h on h.entry_id=e.id where e.needs_refac=1 order by h.{SQL_SEP}when{SQL_SEP_C} asc limit 1")
    c = c if c else dictDB
    r = c.fetchone() if c else None
    if not r:
        return False
    entryID = r["id"]
    xml = r["xml"]
    email = r["email"] or ""
    doc = minidom.parseString(xml)
    doc.documentElement.setAttributeNS("http://www.lexonomy.eu/", "lxnm:entryID", str(entryID))
    #in the current entry, remove all <lxnm:subentryParent>
    _els = doc.getElementsByTagNameNS("http://www.lexonomy.eu/", "subentryParent")
    for el in _els:
        el.parentNode.removeChild(el)
    # in the current entry, find elements which are subentries, and are not contained inside other subentries
    els = []
    for doctype in configs["subbing"]:
        _els = doc.getElementsByTagName(doctype)
        for el in _els:
            if el.parentNode and el.parentNode.nodeType == 1:
                isSubSub = False
                p = el.parentNode
                while p.parentNode and p.parentNode.nodeType == 1:
                    if p.tagName in configs["subbing"]:
                        isSubSub = True
                    p = p.parentNode
                if not isSubSub:
                    els.append(el)
    dictDB.execute(f"delete from sub where parent_id={ques}", (entryID, ))
    # keep saving subentries of the current entry until there are no more subentries to save:
    if len(els) > 0:
        for el in els:
            subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID")
            xml = el.toxml()
            if subentryID:
                subentryID, adjustedXml, changed, feedback = updateEntry(dictDB, configs, subentryID, xml, email.lower(), {"refactoredFrom":entryID})
                el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", str(subentryID))
                dictDB.execute(f"insert into sub(parent_id, child_id) values({ques},{ques})", (entryID, subentryID))
                if changed:
                    dictDB.execute(f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id={ques}) and id<>{ques}", (subentryID, entryID))
            else:
                subentryID, adjustedXml, feedback = createEntry(dictDB, configs, None, xml, email.lower(), {"refactoredFrom":entryID})
                el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", str(subentryID))
                subentryID, adjustedXml, changed, feedback = updateEntry(dictDB, configs, subentryID, el.toxml(), email.lower(), {"refactoredFrom":entryID})
                dictDB.execute(f"insert into sub(parent_id, child_id) values({ques},{ques})", (entryID, subentryID))
                if DB == 'mysql':
                    dictDB.execute(f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id={subentryID})", multi=True )
                else:
                    dictDB.execute(f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (subentryID, ))
    xml = doc.toxml().replace('<?xml version="1.0" ?>', '').strip()
    dictDB.execute(f"update entries set xml={ques}, needs_refac=0 where id={ques}", (xml, entryID))
    close_db(dictDB, shouldclose= False)

def refresh(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    if len(configs['subbing']) == 0:
        return False
    # takes one entry that needs refreshing and sucks into it the latest versions of its subentries
    # get one entry that needs refreshing where none of its children needs refreshing
    c = dictDB.execute("select pe.id, pe.xml from entries as pe left outer join sub as s on s.parent_id=pe.id left join entries as ce on ce.id=s.child_id where pe.needs_refresh=1 and (ce.needs_refresh is null or ce.needs_refresh=0) limit 1")
    c = c if c else dictDB
    r = c.fetchone() if c else None
    if not r:
        return False
    parentID = r["id"]
    parentXml = r["xml"]
    if not "xmlns:lxnm" in parentXml:
        parentXml = re.sub(r"<([^>^ ]*) ", r"<\1 xmlns:lxnm='http://www.lexonomy.eu/' ", parentXml)
    parentDoc = minidom.parseString(parentXml)
    # this will be called repeatedly till exhaustion
    while True:
        # find an element which is a subentry and which we haven't sucked in yet:
        el = None
        for doctype in configs["subbing"]:
            els = parentDoc.documentElement.getElementsByTagName(doctype)
            for el in els:
                if el and not el.hasAttributeNS("http://www.lexonomy.eu/", "subentryID"):
                    el = None
                if el and el.hasAttributeNS("http://www.lexonomy.eu/", "done"):
                    el = None
                if el:
                    break
            if el:
                break
        if el: #if such en element exists
            subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID")
            # get the subentry from the database and inject it into the parent's xml:
            c = dictDB.execute(f"select xml from entries where id={ques}", (subentryID, ))
            c = c if c else dictDB
            r = c.fetchone() if c else None
            if not r:
                el.parentNode.removeChild(el)
            else:
                childXml = r["xml"]
                childDoc = minidom.parseString(childXml)
                elNew = childDoc.documentElement
                el.parentNode.replaceChild(elNew, el)
                elNew.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", subentryID)
                elNew.setAttributeNS("http://www.lexonomy.eu/", "lxnm:done", "1")
        else: #if no such element exists: we are done
            els = parentDoc.documentElement.getElementsByTagName("*")
            for el in els:
                if el.hasAttributeNS("http://www.lexonomy.eu/", "done"):
                    el.removeAttributeNS("http://www.lexonomy.eu/", "done")
            parentXml = parentDoc.toxml().replace('<?xml version="1.0" ?>', '').strip()
            # save the parent's xml (into which all subentries have been injected by now) and tell it that it needs a resave:
            dictDB.execute(f"update entries set xml={ques}, needs_refresh=0, needs_resave=1 where id={ques}", (parentXml, parentID))
            return True

def resave(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    c = dictDB.execute("select id, xml from entries where needs_resave=1")
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        entryID = r["id"]
        xml = r["xml"]
        xml = re.sub(r"\s+xmlns:lxnm=['\"]http:\/\/www\.lexonomy\.eu\/[\"']", "", xml)
        xml = re.sub(r"^<([^>^ ]*) ", r"<\1 xmlns:lxnm='http://www.lexonomy.eu/' ", xml)
        dictDB.execute(f"update entries set needs_resave=0, title={ques}, sortkey={ques} where id={ques}", (getEntryTitle(xml, configs["titling"]), getSortTitle(xml, configs["titling"]), entryID))
        dictDB.execute(f"delete from searchables where entry_id={ques}", (entryID,))
        dictDB.execute(f"insert into searchables(entry_id, txt, level) values({ques}, {ques}, {ques})", (entryID, getEntryTitle(xml, configs["titling"], True), 1))
        dictDB.execute(f"insert into searchables(entry_id, txt, level) values({ques}, {ques}, {ques})", (entryID, getEntryTitle(xml, configs["titling"], True).lower(), 1))
        headword = getEntryHeadword(xml, configs["titling"].get("headword"))
        for searchable in getEntrySearchables(xml, configs):
            if searchable != headword:
                dictDB.execute(f"insert into searchables(entry_id, txt, level) values({ques},{ques},{ques})", (entryID, searchable, 2))
        if configs["links"]:
            updateEntryLinkables(dictDB, entryID, xml, configs, True, True)
    close_db(dictDB, shouldclose=False)
    return True

def getEntryLinks(dictDB, dictID, entryID):
    ret = {"out": [], "in": []}
    if DB == 'sqlite':
        cl = dictDB.execute("SELECT count(*) as count FROM sqlite_master WHERE type='table' and name='linkables'")
        rl = cl.fetchone() if cl else None
    if DB != 'sqlite' or rl['count'] > 0:
        c = dictDB.execute(f"SELECT * FROM linkables WHERE entry_id={ques}", (entryID,))
        c = c if c else dictDB
        conn = getLinkDB()
        for r in c.fetchall() if c else []:
            ret["out"] = ret["out"] + links_get(dictID, r["element"], r["txt"], "", "", "")
            ret["in"] = ret["in"] + links_get("", "", "", dictID, r["element"], r["txt"])
    return ret

def updateEntryLinkables(dictDB, entryID, xml, configs, save=True, save_xml=True):
    from xml.dom import minidom, Node
    doc = minidom.parseString(xml)
    ret = []
    # table may not exists for older dictionaries
    if DB == 'sqlite':
        c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='linkables'")
        if not c.fetchone():
            dictDB.execute("CREATE TABLE linkables (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER REFERENCES entries (id) ON DELETE CASCADE, txt TEXT, element TEXT, preview TEXT)")
            dictDB.execute("CREATE INDEX link ON linkables (txt)")

    for linkref in configs["links"].values():
        for el in doc.getElementsByTagName(linkref["linkElement"]):
            identifier = linkref["identifier"]
            for pattern in re.findall(r"%\([^)]+\)", linkref["identifier"]):
                text = ""
                extract = extractText(el.toxml(), pattern[2:-1])
                extractfull = extractText(xml, pattern[2:-1])
                if len(extract) > 0:
                    text = extract[0]
                elif len(extractfull) > 0:
                    text = extractfull[0]
                identifier = identifier.replace(pattern, text)
            el.setAttribute('lxnm:linkable', identifier)
            preview = linkref["preview"]
            for pattern in re.findall(r"%\([^)]+\)", linkref["preview"]):
                text = ""
                extract = extractText(el.toxml(), pattern[2:-1])
                extractfull = extractText(xml, pattern[2:-1])
                if len(extract) > 0:
                    text = extract[0]
                elif len(extractfull) > 0:
                    text = extractfull[0]
                preview = preview.replace(pattern, text)
            ret.append({'element': linkref["linkElement"], "identifier": identifier, "preview": preview})
    xml = doc.toxml().replace('<?xml version="1.0" ?>', '').strip()
    if save:
        dictDB.execute(f"delete from linkables where entry_id={ques}", (entryID,))
        for linkable in ret:
            dictDB.execute(f"insert into linkables(entry_id, txt, element, preview) values({ques},{ques},{ques},{ques})", (entryID, linkable["identifier"], linkable["element"], linkable["preview"]))
    if save_xml and len(ret)>0:
        dictDB.execute(f"update entries set xml={ques} where id={ques}", (xml, entryID))
    close_db(dictDB)
    return xml

def getEntrySearchables(xml, configs):
    ret = []
    ret.append(getEntryHeadword(xml, configs["titling"].get("headword")))
    if configs["searchability"].get("searchableElements"):
        for sel in configs["searchability"].get("searchableElements"):
            for txt in extractText(xml, sel):
                if txt != "" and txt not in ret:
                    ret.append(txt)
    return ret

def flagEntry(dictDB, dictID, configs, entryID, flag, email, historiography):
    c = dictDB.execute(f"select id, xml from entries where id={ques}", (entryID,))
    c = c if c else dictDB
    row = c.fetchone() if c else None
    xml = row["xml"] if row else ""
    xml = re.sub(r" xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']", "", xml)
    xml = re.sub(r"\=\"([^\"]*)\"", r"='\1'", xml)
    xml = re.sub(r" lxnm:(sub)?entryID='[0-9]+'", "", xml)
    xml = addFlag(xml, flag, configs["flagging"], configs["xema"])

    # tell my parents that they need a refresh:
    dictDB.execute(f"update entries set needs_refresh=1 where id in (select parent_id from sub where child_id={ques})", (entryID, ))
    # update me
    needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
    needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0
    dictDB.execute(f"update entries set doctype={ques}, xml={ques}, title={ques}, sortkey=$sortkey, needs_refac={ques}, needs_resave={ques} where id={ques}", (getDoctype(xml), xml, getEntryTitle(xml, configs["titling"]), getSortTitle(xml, configs["titling"]), needs_refac, needs_resave, entryID))
    dictDB.execute(f"insert into history(entry_id, action, {SQL_SEP}when{SQL_SEP_C}, email, xml, historiography) values({ques}, {ques}, {ques}, {ques}, {ques}, {ques})", (entryID, "update", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
    close_db(dictDB)
    return entryID


def addFlag(xml, flag, flagconfig, xemaconfig):
    flag_element = flagconfig["flag_element"]

    path = getFlagElementPath(xemaconfig, flag_element)
    loc1, loc2 = getFlagElementInString(path, xml)

    return "{0}<{1}>{2}</{1}>{3}".format(
            xml[:loc1], flag_element, flag, xml[loc2:])
           
            
def getFlagElementPath(xema, flag_element):
    result = getFlagElementPath_recursive(xema, flag_element, xema["root"])
    if result is not None:
        result.insert(0, xema["root"])
    return result


def getFlagElementPath_recursive(xema, flag_element, current_element):
    # try all children
    for child_props in xema["elements"][current_element]["children"]:
        next_el = child_props["name"]

        # if we get to the flag element, return!
        if next_el == flag_element:
            return [flag_element]

        # else, recursive search, depth first
        path = getFlagElementPath_recursive(xema, flag_element, next_el)

        # if returned is not None, then we found what we need, just prepend to the returned path
        if path is not None:
            return [next_el] + path

    # nothing useful found, return None
    return None


def getFlagElementInString(path, xml):
    start_out, end_out = 0, len(xml)
    start_in, end_in = 0, len(xml)

    # find each element in path to flag element, start with outmost one
    for path_element in path:
        regex = re.compile("<{}[^>]*>([\s\S]*?)</{}>".format(path_element, path_element))
        match = regex.search(xml, start_in, end_in)

        # we can not find the element, just return to the beginning of outer element
        if match is None:
            return (start_in, start_in)

        start_out = match.start(0)
        end_out = match.end(0)
        start_in = match.start(1)
        end_in = match.end(1)

    # we found it! Return the span where flag element exists in xml
    return (start_out, end_out)


def readDictHistory(dictDB, dictID, configs, entryID):
    history = []
    c = dictDB.execute(f"select * from history where entry_id={ques} order by {SQL_SEP}when{SQL_SEP_C} desc", (entryID,))
    c = c if c else dictDB
    for row in c.fetchall() if c else []:
        xml = row["xml"]
        if row["xml"]:
            xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
        history.append({"entry_id": row["entry_id"], "revision_id": row["id"], "content": xml, "action": row["action"], "when": row["when"], "email": row["email"] or "", "historiography": json.loads(row["historiography"])})
    return history

def verifyUserApiKey(email, apikey):
    conn = getMainDB()
    if email == '':
        c = conn.execute("select email from users where apiKey=?", (apikey,))
        c = c if c else conn
        row = c.fetchone()
    else:
        c = conn.execute(f"select email from users where email={ques} and apiKey={ques}", (email, apikey))
        c = c if c else conn
        row = c.fetchone()

    if not row or siteconfig["readonly"]:
        return {"valid": False}
    else:
        return {"valid": True, "email": email or ""}

def links_add(source_dict, source_el, source_id, target_dict, target_el, target_id, confidence=0, conn=None):
    if not conn:
        conn = getLinkDB()
    c = conn.execute(f"SELECT * FROM links WHERE source_dict={ques} AND source_element={ques} AND source_id={ques} AND target_dict={ques} AND target_element={ques} AND target_id={ques}", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    c = c if c else conn
    row = c.fetchone() if c else None
    if not row:
        conn.execute(f"INSERT INTO links (source_dict, source_element, source_id, target_dict, target_element, target_id, confidence) VALUES ({ques},{ques},{ques},{ques},{ques},{ques},{ques})", (source_dict, source_el, source_id, target_dict, target_el, target_id, confidence))
        close_db(conn)
    c = conn.execute(f"SELECT * FROM links WHERE source_dict={ques} AND source_element={ques} AND source_id={ques} AND target_dict={ques} AND target_element={ques} AND target_id={ques}", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    c = c if c else conn
    row = c.fetchone() if c else None
    return {"link_id": row["link_id"], "source_dict": row["source_dict"], "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_el": row["target_element"], "target_id": row["target_id"], "confidence": row["confidence"]}

def links_delete(dictID, linkID):
    conn = getLinkDB()
    conn.execute(f"DELETE FROM links WHERE source_dict={ques} AND link_id={ques}", (dictID, linkID))
    close_db(conn)
    c = conn.execute(f"select * from links where link_id={ques}", (linkID, ))
    c = c if c else conn
    rows = c.fetchall() if c else []
    if len(rows) > 0 :
        return False
    else:
        return True

def links_get(source_dict, source_el, source_id, target_dict, target_el, target_id):
    params = []
    where = []
    if source_dict != "":
        where.append(f"source_dict={ques}")
        params.append(source_dict)
    if source_el != "":
        where.append(f"source_element={ques}")
        params.append(source_el)
    if source_id != "":
        where.append(f"source_id={ques}")
        params.append(source_id)
    if target_dict != "":
        where.append(f"target_dict={ques}")
        params.append(target_dict)
    if target_el != "":
        where.append(f"target_element={ques}")
        params.append(target_el)
    if target_id != "":
        where.append(f"target_id={ques}")
        params.append(target_id)
    query = "SELECT * FROM links"
    if len(where) > 0:
        query += " WHERE " + " AND ".join(where)
    conn = getLinkDB()
    c = conn.execute(query, tuple(params))
    c = c if c else conn
    res = []
    #first, get all dictionaries in results
    dbs = {}
    dbconfigs = {}
    for row in c.fetchall() if c else []:
        if not row["source_dict"] in dbs:
            dbs[row["source_dict"]] = getDB(row["source_dict"])
            dbconfigs[row["source_dict"]] = readDictConfigs(dbs[row["source_dict"]])
        if not row["target_dict"] in dbs:
            try:
                dbs[row["target_dict"]] = getDB(row["target_dict"])
                dbconfigs[row["target_dict"]] = readDictConfigs(dbs[row["target_dict"]])
            except:
                dbconfigs[row["target_dict"]] = None
    #now the actual results
    c = conn.execute(query, tuple(params))
    c = c if c else conn
    for row in c.fetchall() if c else []:
        sourceDB = dbs[row["source_dict"]]
        sourceConfig = dbconfigs[row["source_dict"]]
        targetDB = dbs[row["target_dict"]]
        targetConfig = dbconfigs[row["target_dict"]]
        source_entry = ""
        source_hw = ""
        try:
            # test if source DB has linkables tables
            ress = sourceDB.execute(f"SELECT entry_id FROM linkables WHERE txt={ques}", (row["source_id"],))
            rows = ress.fetchone() if ress else None
            if rows:
                source_entry = rows["entry_id"]
        except:
            source_entry = ""
        # fallback for ontolex ids
        if source_entry == "" and re.match(r"^[0-9]+_[0-9]+$", row["source_id"]):
            source_entry = row["source_id"].split("_")[0]
        if source_entry != "":
            source_hw = getEntryTitleID(sourceDB, sourceConfig, source_entry, True)
        target_entry = ""
        target_hw = ""
        try:
            # test if target DB has linkables tables
            rest = targetDB.execute(f"SELECT entry_id FROM linkables WHERE txt={ques}", (row["target_id"],))
            rowt = rest.fetchone() if rest else None
            if rowt:
                target_entry = rowt["entry_id"]
        except:
            target_entry = ""
        # fallback for ontolex ids and CILI
        if target_entry == "" and re.match(r"^[0-9]+_[0-9]+$", row["target_id"]):
            target_entry = row["target_id"].split("_")[0]
        if target_entry != "":
            target_hw = getEntryTitleID(targetDB, targetConfig, target_entry, True)
        if target_dict == "CILI":
            target_entry = row["target_id"]
            target_hw = row["target_id"]

        res.append({"link_id": row["link_id"], "source_dict": row["source_dict"], "source_entry": str(source_entry), "source_hw": source_hw, "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_entry": str(target_entry), "target_hw": target_hw, "target_el": row["target_element"], "target_id": row["target_id"], "confidence": row["confidence"]})
    return res

def getDictLinkables(dictDB):
    ret = []
    if DB == 'sqlite':
        cl = dictDB.execute("SELECT count(*) as count FROM sqlite_master WHERE type='table' and name='linkables'")
        rl = cl.fetchone() if cl else None
    if DB != 'sqlite' or rl['count'] > 0:
        c = dictDB.execute("SELECT * FROM linkables ORDER BY entry_id, element, txt")
        c = c if c else dictDB
        for r in c.fetchall() if c else []:
            ret.append({"element": r["element"], "link": r["txt"], "entry": r["entry_id"], "preview": r["preview"]})
    return ret

def isrunning(dictDB, bgjob, pid=None):
    if not pid:
        c = dictDB.execute(f"SELECT pid FROM bgjobs WHERE id={ques}", (bgjob,))
        c = c if c else dictDB
        job = c.fetchone() if c else None
        if not job:
            return False
        pid = job["pid"]
    if pid < 0:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

def linkNAISC(dictDB, dictID, configs, otherdictDB, otherdictID, otherconfigs):
    import subprocess
    res = isLinking(dictDB)
    if "otherdictID" in res:
        return res
    c = dictDB.execute(f"INSERT INTO bgjobs (type, data) VALUES ('naisc-local', {ques})", (otherdictID,))
    c = c if c else dictDB
    close_db(dictDB)
    jobid = c.lastrowid
    errfile = open("/tmp/linkNAISC-%s-%s.err" % (dictID, otherdictID), "w")
    outfile = open("/tmp/linkNAISC-%s-%s.out" % (dictID, otherdictID), "w")
    bgjob = subprocess.Popen(['adminscripts/linkNAISC.sh', siteconfig["dataDir"], dictID, otherdictID, siteconfig["naiscCmd"], str(jobid)],
        start_new_session=True, close_fds=True, stderr=errfile, stdout=outfile, stdin=subprocess.DEVNULL)
    dictDB.execute(f"UPDATE bgjobs SET pid={ques} WHERE id={ques}", (bgjob.pid, jobid))
    close_db(dictDB)
    return {"bgjob": jobid}

def autoImage(dictDB, dictID, configs, addElem, addNumber):
    import subprocess
    res = isAutoImage(dictDB)
    if res["bgjob"] and res["bgjob"] > 0:
        return res
    c = dictDB.execute("INSERT INTO bgjobs (type, data) VALUES ('autoimage', 'autoimage')")
    c = c if c else dictDB
    close_db(dictDB)
    jobid = c.lastrowid
    errfile = open("/tmp/autoImage-%s.err" % (dictID), "w")
    outfile = open("/tmp/autoImage-%s.out" % (dictID), "w")
    bgjob = subprocess.Popen(['adminscripts/autoImage.py', siteconfig["dataDir"], dictID, addElem, str(addNumber), str(jobid)],
        start_new_session=True, close_fds=True, stderr=errfile, stdout=outfile, stdin=subprocess.DEVNULL)
    dictDB.execute(f"UPDATE bgjobs SET pid={ques} WHERE id={ques}", (bgjob.pid, jobid))
    close_db(dictDB)
    return {"bgjob": jobid}


def isLinking(dictDB):
    c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bgjobs'")
    c = c if c else dictDB
    cc = c.fetchone() if c else None
    if cc:
        dictDB.execute("CREATE TABLE bgjobs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, data TEXT, finished INTEGER DEFAULT -1, pid DEFAULT -1)")
        close_db(dictDB)
    c = dictDB.execute("SELECT * FROM bgjobs WHERE finished=-1")
    c = c if c else dictDB
    job = c.fetchone() if c else None
    if job:
        pid = job["pid"]
        if isrunning(dictDB, job["id"], pid):
            return {"bgjob": job["id"], "otherdictID": job["data"]}
        else: # mark as dead
            c = dictDB.execute(f"UPDATE bgjobs SET finished=-2 WHERE pid={ques}", (pid,))
            c = c if c else dictDB
    return {"bgjob": -1}

def isAutoImage(dictDB):
    c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bgjobs'")
    c = c if c else dictDB
    cc = c.fetchone() if c else None
    if cc:
        dictDB.execute("CREATE TABLE bgjobs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, data TEXT, finished INTEGER DEFAULT -1, pid DEFAULT -1)")
        close_db(dictDB)
    c = dictDB.execute("SELECT * FROM bgjobs WHERE finished=-1 AND data='autoimage'")
    c = c if c else dictDB
    job = c.fetchone() if c else None
    if job:
        pid = job["pid"]
        if isrunning(dictDB, job["id"], pid):
            return {"bgjob": job["id"]}
        else: # mark as dead
            c = dictDB.execute(f"UPDATE bgjobs SET finished=-2 WHERE pid={ques}", (pid,))
            c = c if c else dictDB
    return {"bgjob": -1}

def getNAISCstatus(dictDB, dictID, otherdictID, bgjob):
    try:
        err = open("/tmp/linkNAISC-%s-%s.err" % (dictID, otherdictID))
    except:
        return None
    if "[COMPLETED] Done\n" in err.readlines():
        return {"status": "finished"}
    if isrunning(dictDB, bgjob):
        return {"status": "linking"}
    else:
        return {"status": "failed"}

def autoImageStatus(dictDB, dictID, bgjob):
    try:
        out = open("/tmp/autoImage-%s.out" % (dictID))
    except:
        return None
    if "COMPLETED\n" in out.readlines():
        return {"status": "finished"}
    if isrunning(dictDB, bgjob):
        return {"status": "working"}
    else:
        return {"status": "failed"}

def addAutoNumbers(dictDB, dictID, countElem, storeElem):
    from xml.dom import minidom, Node
    isAttr = False
    if storeElem[0] == '@':
        isAttr = True
        storeElem = storeElem[1:]
    c = dictDB.execute("select id, xml from entries")
    c = c if c else dictDB
    process = 0
    for r in c.fetchall() if c else []:
        entryID = r["id"]
        xml = r["xml"]
        doc = minidom.parseString(xml)
        allEmpty = True
        for el in doc.getElementsByTagName(countElem):
            if isAttr:
                if el.getAttribute(storeElem) != "":
                    allEmpty = False
            else:
                for sel in el.getElementsByTagName(storeElem):
                    if sel.firstChild != None and sel.firstChild.nodeValue != "":
                        allEmpty = False
        if allEmpty:
            count = 0
            for el in doc.getElementsByTagName(countElem):
                count += 1
                if isAttr:
                    el.setAttribute(storeElem, str(count))
                else:
                    for sel in el.getElementsByTagName(storeElem):
                        el.removeChild(sel)
                    n_elem = doc.createElement(storeElem)
                    el.appendChild(n_elem)
                    n_elem.appendChild(doc.createTextNode(str(count)))
            process += 1
            xml = doc.toxml().replace('<?xml version="1.0" ?>', '').strip()
            dictDB.execute(f"update entries set xml={ques}, needs_refac=0 where id={ques}", (xml, entryID))
    close_db(dictDB)
    return process

def get_iso639_1():
    codes = []
    for line in open("libs/iso-639-3.tab").readlines():
        la = line.split("\t")
        if la[3] != "" and la[3] != "Part1":
            codes.append({'code':la[3], 'lang':la[6]})
    return codes

def get_locales():
    codes = []
    for code in Locale().getAvailableLocales():
        codes.append({'code': code, 'lang': Locale(code).getDisplayName()})
    return codes

def getLocale(configs):
    locale = 'ar'
    if "locale" in configs["titling"] and configs["titling"]["locale"] != "":
        locale = configs["titling"]["locale"]
    return locale

def preprocessLex0(entryXml):
    from xml.dom import minidom, Node
    doc = minidom.parseString(entryXml)
    headword = None
    for el in doc.getElementsByTagName("form"):
        if el.getAttribute("type") == "lemma":
            for el2 in el.getElementsByTagName("orth"):
                headword = el2.firstChild.nodeValue
    if headword and headword != "":
        he = doc.createElement("headword")
        het = doc.createTextNode(headword)
        doc.documentElement.appendChild(he)
        he.appendChild(het)
    return doc.toxml().replace('<?xml version="1.0" ?>', '').strip()

def listOntolexEntries(dictDB, dictID, configs, doctype, searchtext=""):
    from lxml import etree as ET
    if searchtext == "":
        sql = f"select id, title, sortkey, xml from entries where doctype={ques} order by id"
        params = (doctype, )
    else:
        sql = f"select s.txt, min(s.level) as level, e.id, e.sortkey, e.title, e.xml from searchables as s inner join entries as e on e.id=s.entry_id where doctype={ques} and s.txt like {ques} group by e.id order by e.id"
        params = (doctype, searchtext+"%")
    c = dictDB.execute(sql, params)
    c = c if c else dictDB
    for r in c.fetchall() if c else []:
        headword = getEntryHeadword(r["xml"], configs["titling"].get("headword"))
        headword = headword.replace('"', "'")
        item = {"id": r["id"], "title": headword}
        if configs["ident"].get("lang"):
            lang = configs["ident"].get("lang")
        else:
            lang = siteconfig["lang"] if siteconfig["lang"] else "en";
        entryId = re.sub("[\W_]", "",  headword) + "_" + str(r["id"])
        line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ."
        yield line; yield "\n"
        line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/2000/01/rdf-schema#label> \"" + headword + "\"@" + lang + " ."
        yield line; yield "\n"

        #just guessing and hoping
        root = ET.fromstring(r["xml"])
        num = 0
        for sense in root.findall("sense"):
            senseDef = sense.find("def")
            if senseDef != None and senseDef.text:
                defText = re.sub(r'[\r\n]', ' ', senseDef.text)
            elif sense.text:
                defText = re.sub(r'[\r\n]', ' ', sense.text)
            else:
                defText = ""
            if defText != "":
                num += 1
                defText = defText.replace('"', "'")
                senseId = 'sense:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        for sense in root.findall("meaning"):
            senseDef = sense.find("def")
            senseDesc = sense.find("semDescription")
            if senseDef != None and senseDef.text:
                defText = re.sub(r'[\r\n]', ' ', senseDef.text)
            elif senseDesc != None and senseDesc.text:
                defText = re.sub(r'[\r\n]', ' ', senseDesc.text)
            elif sense.text:
                defText = re.sub(r'[\r\n]', ' ', sense.text)
            else:
                defText = ""
            if defText != "":
                num += 1
                defText = defText.replace('"', "'")
                senseId = 'meaning:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        for sense in root.findall("def"):
            if sense.text:
                num += 1
                defText = re.sub(r'[\r\n]', ' ', sense.text)
                defText = defText.replace('"', "'")
                senseId = 'def:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        # no sense detected, copy headword
        if num == 0:
            defText = re.sub(r'[\r\n]', ' ', headword)
            defText = defText.replace('"', "'")
            senseId = 'entry:' + str(r["id"]) + "_1"
            line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
            yield line; yield "\n"
            line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
            yield line; yield "\n"

def close_db(db, shouldclose = True):
    if DB == 'sqlite':
        db.commit()
    elif DB == 'mysql' and shouldclose:
        db.close()
def elexisDictAbout(dictID):
    dictDB = getDB(dictID)
    if dictDB:
        info = {"id": dictID}
        configs = readDictConfigs(dictDB)
        info["sourceLang"] = configs['ident'].get('lang')
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
            info["license"] = configs["publico"]["licence"]
            if siteconfig["licences"][configs["publico"]["licence"]]:
                info["license"] = siteconfig["licences"][configs["publico"]["licence"]]["url"]
        else:
            info["release"] = "PRIVATE"
        info["creator"] = []
        for user in configs["users"]:
            info["creator"].append({"email": user})
        return info
    else:
        return None

def elexisLemmaList(dictID, limit=None, offset=0):
    dictDB = getDB(dictID)
    if dictDB:
        info = {"language": "", "release": "PRIVATE"}
        configs = readDictConfigs(dictDB)
        info["language"] = configs['ident'].get('lang')
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
        lemmas = []
        query = "SELECT id, xml FROM entries"
        if limit != None and limit != "":
            query += " LIMIT "+str(int(limit))
        if offset != "" and int(offset) > 0:
            query += " OFFSET "+str(int(offset))
        c = dictDB.execute(query)
        for r in c.fetchall():
            lemma = {"release": info["release"], "language": info["language"], "formats": ["tei"]}
            lemma["id"] = str(r["id"])
            lemma["lemma"] = getEntryHeadword(r["xml"], configs["titling"].get("headword"))
            pos = elexisGuessPOS(r["xml"])
            if pos != "":
                lemma["partOfSpeech"] = [pos]
            lemmas.append(lemma)
        return lemmas
    else:
        return None

def elexisGetLemma(dictID, headword, limit=None, offset=0):
    dictDB = getDB(dictID)
    if dictDB:
        info = {"language": "", "release": "PRIVATE"}
        configs = readDictConfigs(dictDB)
        info["language"] = configs['ident'].get('lang')
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
        lemmas = []
        query = "SELECT e.id, e.xml FROM searchables AS s INNER JOIN entries AS e on e.id=s.entry_id WHERE doctype=? AND s.txt=? GROUP BY e.id ORDER by s.level"
        params = (configs["xema"]["root"], headword)
        if limit != None and limit != "":
            query += " LIMIT "+str(int(limit))
        if offset != "" and int(offset) > 0:
            query += " OFFSET "+str(int(offset))
        c = dictDB.execute(query, params)
        for r in c.fetchall():
            lemma = {"release": info["release"], "language": info["language"], "formats": ["tei"]}
            lemma["id"] = str(r["id"])
            lemma["lemma"] = getEntryHeadword(r["xml"], configs["titling"].get("headword"))
            pos = elexisGuessPOS(r["xml"])
            if pos != "":
                lemma["partOfSpeech"] = [pos]
            lemmas.append(lemma)
        return lemmas
    else:
        return None

def elexisGuessPOS(xml):
    # try to guess frequent PoS element
    pos = ""
    if "</pos>" in xml:
        arr = extractText(xml, "pos")
        if arr[0] and arr[0] != "":
            pos = arr[0]
    if "<partOfSpeech>" in xml:
        arr = extractText(xml, "partOfSpeech")
        if arr[0] and arr[0] != "":
            pos = arr[0]
    if 'type="pos"' in xml:
        pat = r'<gram[^>]*type="pos"[^>]*>([^<]*)</gram>'
        arr = re.findall(pat, xml)
        if arr[0] and arr[0] != "":
            pos = arr[0]
    return pos

def elexisGetEntry(dictID, entryID):
    dictDB = getDB(dictID)
    if dictDB:
        query = "SELECT id, xml FROM entries WHERE id=?"
        c = dictDB.execute(query, (entryID, ))
        r = c.fetchone()
        if not r:
            return None
        else:
            return r["xml"]
    else:
        return None

# the decorator
def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)

    return _enable_cors
