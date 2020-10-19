#!/usr/bin/python3

import datetime
import json
import os
import os.path
import sqlite3
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

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))

defaultDictConfig = {"editing": {"xonomyMode": "nerd", "xonomyTextEditor": "askString" },
                     "searchability": {"searchableElements": []},
                     "xema": {"elements": {}},
                     "titling": {"headwordAnnotations": []},
                     "flagging": {"flag_element": "", "flags": []}}

prohibitedDictIDs = ["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "dicts", "oneclick", "recoverpwd", "createaccount", "consent", "userprofile"];

# db management
def getDB(dictID):
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite"))
    conn.row_factory = sqlite3.Row
    conn.executescript("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=on")
    return conn

def getMainDB():
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], 'lexonomy.sqlite'))
    conn.row_factory = sqlite3.Row
    return conn

def getLinkDB():
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], 'crossref.sqlite'))
    conn.row_factory = sqlite3.Row
    return conn

# SMTP
def sendmail(mailTo, mailSubject, mailText):
    if siteconfig["mailconfig"] and siteconfig["mailconfig"]["host"] and siteconfig["mailconfig"]["port"]:
        if siteconfig["mailconfig"]["secure"]:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"], context=context)
        else:
            server = smtplib.SMTP(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"])
        message = "Subject: " + mailSubject + "\n\n" + mailText
        server.sendmail(siteconfig["mailconfig"]["from"], mailTo, message)
        server.quit()
        

# config
def readDictConfigs(dictDB):
    configs = {"siteconfig": siteconfig}
    c = dictDB.execute("select * from configs")
    for r in c.fetchall():
        configs[r["id"]] = json.loads(r["json"])
    for conf in ["ident", "publico", "users", "kex", "titling", "flagging",
                 "searchability", "xampl", "thes", "collx", "defo", "xema",
                 "xemplate", "editing", "subbing", "download", "links", "autonumber"]:
        if not conf in configs:
            configs[conf] = defaultDictConfig.get(conf, {})

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
        c = db.execute("select s.parent_id, e.title from sub as s inner join entries as e on e.id=s.parent_id where s.child_id=?", (subentryID,))
        for r in c.fetchall():
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
    c = conn.execute("select email, ske_apiKey, ske_username, apiKey, consent from users where email=? and sessionKey=? and sessionLast>=?", (email, sessionkey, yesterday))
    user = c.fetchone()
    if not user:
        return {"loggedin": False, "email": None}
    conn.execute("update users set sessionLast=? where email=?", (now, email))
    conn.commit()
    ret = {"loggedin": True, "email": email, "isAdmin": email in siteconfig["admins"],
           "ske_username": user["ske_username"], "ske_apiKey": user["ske_apiKey"],
           "apiKey": user["apiKey"], "consent": user["consent"] == 1}
    return ret

def verifyLoginAndDictAccess(email, sessionkey, dictDB):
    ret = verifyLogin(email, sessionkey)
    configs = readDictConfigs(dictDB)
    dictAccess = configs["users"].get(email)
    if ret["loggedin"] == False or (not dictAccess and (not "isAdmin" in ret or not ret["isAdmin"])):
        return {"loggedin": ret["loggedin"], "email": email, "dictAccess": False, "isAdmin": False}, configs
    ret["dictAccess"] = dictAccess
    for r in ["canEdit", "canConfig", "canDownload", "canUpload"]:
        ret[r] = ret.get("isAdmin") or (dictAccess and dictAccess[r])
    return ret, configs

def deleteEntry(db, entryID, email):
    # tell my parents that they need a refresh:
    db.execute ("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (entryID,))
    # delete me:
    db.execute ("delete from entries where id=?", (entryID,))
    # tell history that I have been deleted:
    db.execute ("insert into history(entry_id, action, [when], email, xml) values(?,?,?,?,?)",
                (entryID, "delete", datetime.datetime.utcnow(), email, None))
    db.commit()

def readEntry(db, configs, entryID):
    c = db.execute("select * from entries where id=?", (entryID,))
    row = c.fetchone()
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
    c = dictDB.execute("select id from entries where title = ? and id <> ?", (title, entryID))
    r = c.fetchone()
    feedback = {"type": "saveFeedbackHeadwordExists", "info": r["id"]} if r else None
    if entryID:
        sql = "insert into entries(id, xml, title, sortkey, needs_refac, needs_resave, doctype) values(?, ?, ?, ?, ?, ?, ?)"
        params = (entryID, xml, title, sortkey, needs_refac, needs_resave, doctype)
    else:
        sql = "insert into entries(xml, title, sortkey, needs_refac, needs_resave, doctype) values(?, ?, ?, ?, ?, ?)"
        params = (xml, title, sortkey, needs_refac, needs_resave, doctype)
    c = dictDB.execute(sql, params)
    entryID = c.lastrowid
    dictDB.execute("insert into searchables(entry_id, txt, level) values(?, ?, ?)", (entryID, getEntryTitle(xml, configs["titling"], True), 1))
    dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, "create", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
    dictDB.commit()
    return entryID, xml, feedback

def updateEntry(dictDB, configs, entryID, xml, email, historiography):
    c = dictDB.execute("select id, xml from entries where id=?", (entryID, ))
    row = c.fetchone()
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
            dictDB.execute("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (entryID,))
            title = getEntryTitle(xml, configs["titling"])
            sortkey = getSortTitle(xml, configs["titling"])
            doctype = getDoctype(xml)
            needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
            needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0
            # entry title already exists?
            c = dictDB.execute("select id from entries where title = ? and id <> ?", (title, entryID))
            r = c.fetchone()
            feedback = {"type": "saveFeedbackHeadwordExists", "info": r["id"]} if r else None
            dictDB.execute("update entries set doctype=?, xml=?, title=?, sortkey=?, needs_refac=?, needs_resave=? where id=?", (doctype, xml, title, sortkey, needs_refac, needs_resave, entryID))
            dictDB.execute("update searchables set txt=? where entry_id=? and level=1", (getEntryTitle(xml, configs["titling"], True), entryID))
            dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, "update", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
            dictDB.commit()
            if configs["links"]:
                xml = updateEntryLinkables(dictDB, entryID, xml, configs, True, True)
            return entryID, xml, True, feedback

def getEntryTitle(xml, titling, plaintext=False):
    if titling.get("headwordAnnotationsType") == "advanced" and not plaintext:
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
    c = conn.execute("select email from users where email=? and passwordHash=?", (email.lower(), passhash))
    user = c.fetchone()
    if not user:
        return {"success": False}
    key = generateKey()
    now = datetime.datetime.utcnow()
    conn.execute("update users set sessionKey=?, sessionLast=? where email=?", (key, now, email))
    conn.commit()
    return {"success": True, "email": user["email"], "key": key}

def logout(user):
    conn = getMainDB()
    conn.execute("update users set sessionKey='', sessionLast='' where email=?", (user["email"],))
    conn.commit()
    return True

def sendSignupToken(email, remoteip):
    if siteconfig["readonly"]:
        return False    
    conn = getMainDB()
    c = conn.execute("select email from users where email=?", (email.lower(),))
    user = c.fetchone()
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
        conn.execute("insert into register_tokens (email, requestAddress, token, expiration) values (?, ?, ?, ?)", (email, remoteip, token, expireDate))
        conn.commit()
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def sendToken(email, remoteip):
    if siteconfig["readonly"]:
        return False    
    conn = getMainDB()
    c = conn.execute("select email from users where email=?", (email.lower(),))
    user = c.fetchone()
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
        conn.execute("insert into recovery_tokens (email, requestAddress, token, expiration) values (?, ?, ?, ?)", (email, remoteip, token, expireDate))
        conn.commit()
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def verifyToken(token, tokenType):
    conn = getMainDB()
    c = conn.execute("select * from "+tokenType+"_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        return True
    else:
        return False

def createAccount(token, password, remoteip):
    conn = getMainDB()
    c = conn.execute("select * from register_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        c2 = conn.execute("select * from users where email=?", (row["email"],))
        row2 = c2.fetchone()
        if not row2:
            passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
            conn.execute("insert into users (email,passwordHash) values (?,?)", (row["email"], passhash))
            conn.execute("update register_tokens set usedDate=datetime('now'), usedAddress=? where token=?", (remoteip, token))
            conn.commit()
            return True
        else:
            return False
    else:
        return False

def resetPwd(token, password, remoteip):
    conn = getMainDB()
    c = conn.execute("select * from recovery_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
        conn.execute("update users set passwordHash=? where email=?", (passhash, row["email"]))
        conn.execute("update recovery_tokens set usedDate=datetime('now'), usedAddress=? where token=?", (remoteip, token))
        conn.commit()
        return True
    else:
        return False

def setConsent(email, consent):
    conn = getMainDB()
    conn.execute("update users set consent=? where email=?", (consent, email))
    conn.commit()
    return True

def changePwd(email, password):
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    conn.execute("update users set passwordHash=? where email=?", (passhash, email))
    conn.commit()
    return True

def changeSkeUserName(email, ske_userName):
    conn = getMainDB()
    conn.execute("update users set ske_username=? where email=?", (ske_userName, email))
    conn.commit()
    return True

def changeSkeApiKey(email, ske_apiKey):
    conn = getMainDB()
    conn.execute("update users set ske_apiKey=? where email=?", (ske_apiKey, email))
    conn.commit()
    return True

def updateUserApiKey(user, apiKey):
    conn = getMainDB()
    conn.execute("update users set apiKey=? where email=?", (apiKey, user["email"]))
    conn.commit()
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
    c = conn.execute("select * from users where email=?", (email,))
    row = c.fetchone()
    if row:
        if row["apiKey"] == None or row["apiKey"] == "":
            lexapi = generateKey()
            conn.execute("update users set apiKey=? where email=?", (lexapi, email))
            conn.commit()
        else:
            lexapi = row["apiKey"]
        sendApiKeyToSke(row, lexapi)
    return True
    

def processJWT(user, jwtdata):
    conn = getMainDB()
    c = conn.execute("select * from users where ske_id=?", (jwtdata["user"]["id"],))
    row = c.fetchone()
    key = generateKey()
    now = datetime.datetime.utcnow()
    if row:
        #if SkE ID in database = log in user
        conn.execute("update users set sessionKey=?, sessionLast=? where email=?", (key, now, row["email"]))
        conn.commit()
        prepareApiKeyForSke(row["email"])
        return {"success": True, "email": row["email"], "key": key}
    else:
        if user["loggedin"]:
            #user logged in = save SkE ID in database
            conn.execute("update users set ske_id=?, ske_username=?, ske_apiKey=?, sessionKey=?, sessionLast=? where email=?", (jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, user["email"]))
            conn.commit()
            prepareApiKeyForSke(user["email"])
            return {"success": True, "email": user["email"], "key": key}
        else:
            #user not logged in = register and log in
            email = jwtdata["user"]["email"].lower()
            c2 = conn.execute("select * from users where email=?", (email,))
            row2 = c2.fetchone()
            if not row2:
                lexapi = generateKey()
                conn.execute("insert into users (email, passwordHash, ske_id, ske_username, ske_apiKey, sessionKey, sessionLast, apiKey) values (?, null, ?, ?, ?, ?, ?, ?)", (email, jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, lexapi))
                conn.commit()
                prepareApiKeyForSke(email)
                return {"success": True, "email": email, "key": key}
            else:
                return {"success": False, "error": "user with email " + email + " already exists. Log-in and connect account to SkE."}


def dictExists(dictID):
    return os.path.isfile(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))

def suggestDictId():
    dictid = generateDictId()
    while dictid in prohibitedDictIDs or dictExists(dictid):
        dictid = generateDictId()
    return dictid

def makeDict(dictID, template, title, blurb, email):
    if title == "":
        title = "?"
    if blurb == "":
        blurb = "Yet another Lexonomy dictionary."
    if dictID in prohibitedDictIDs or dictExists(dictID):
        return False
    if not template.startswith("/"):
        template = "dictTemplates/" + template + ".sqlite"
    shutil.copy(template, os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    users = {email: {"canEdit": True, "canConfig": True, "canDownload": True, "canUpload": True}}
    dictDB = getDB(dictID)
    dictDB.execute("update configs set json=? where id='users'", (json.dumps(users),))
    ident = {"title": title, "blurb": blurb}
    dictDB.execute("update configs set json=? where id='ident'", (json.dumps(ident),))
    dictDB.commit()
    attachDict(dictDB, dictID)
    return True

def attachDict(dictDB, dictID):
    configs = readDictConfigs(dictDB)
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (dictID,))
    conn.execute("delete from user_dict where dict_id=?", (dictID,))
    title = configs["ident"]["title"]
    conn.execute("insert into dicts(id, title) values (?, ?)", (dictID, title))
    for email in configs["users"]:
        conn.execute("insert into user_dict(dict_id, user_email) values (?, ?)", (dictID, email.lower()))
    conn.commit()

def cloneDict(dictID, email):
    newID = suggestDictId()
    shutil.copy(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts/" + newID + ".sqlite"))
    newDB = getDB(newID)
    res = newDB.execute("select json from configs where id='ident'")
    row = res.fetchone()
    ident = {"title": "?", "blurb": "?"}
    if row:
        ident = json.loads(row["json"])
        ident["title"] = "Clone of " + ident["title"]
    newDB.execute("update configs set json=? where id='ident'", (json.dumps(ident),))
    newDB.commit()
    attachDict(newDB, newID)
    return {"success": True, "dictID": newID, "title": ident["title"]}

def destroyDict(dictID):
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (dictID,))
    conn.execute("delete from user_dict where dict_id=?", (dictID,))
    conn.commit()
    os.remove(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    return True

def moveDict(oldID, newID):
    if newID in prohibitedDictIDs or dictExists(newID):
        return False
    shutil.move(os.path.join(siteconfig["dataDir"], "dicts/" + oldID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts/" + newID + ".sqlite"))
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (oldID,))
    conn.commit()
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
    conn = getMainDB()
    c = conn.execute("select d.id, d.title from dicts as d inner join user_dict as ud on ud.dict_id=d.id where ud.user_email=? order by d.title", (email,))
    for r in c.fetchall():
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

def listUsers(searchtext, howmany):
    conn = getMainDB()
    c = conn.execute("select * from users where email like ? order by email limit ?", ("%"+searchtext+"%", howmany))
    users = []
    for r in c.fetchall():
        users.append({"id": r["email"], "title": r["email"]})
    c = conn.execute("select count(*) as total from users where email like ?", ("%"+searchtext+"%", ))
    r = c.fetchone()
    total = r["total"]
    return {"entries":users, "total": total}

def createUser(xml):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    email = root.attrib["email"]
    passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
    conn = getMainDB()
    conn.execute("insert into users(email, passwordHash) values(?, ?)", (email.lower(), passhash))
    conn.commit()
    return {"entryID": email, "adjustedXml": readUser(email)["xml"]}

def updateUser(email, xml):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    if root.attrib['password']:
        passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
        conn = getMainDB()
        conn.execute("update users set passwordHash=? where email=?", (passhash, email.lower()))
        conn.commit()
    return readUser(email)

def deleteUser(email):
    conn = getMainDB()
    conn.execute("delete from users where email=?", (email.lower(),))
    conn.commit()
    return True

def readUser(email):
    conn = getMainDB()
    c = conn.execute("select * from users where email=?", (email.lower(), ))
    r = c.fetchone()
    if r:
        if r["sessionLast"]:
            xml =  "<user lastSeen='"+r["sessionLast"]+"'>"
        else:
            xml =  "<user>"
        c2 = conn.execute("select d.id, d.title from user_dict as ud inner join dicts as d on d.id=ud.dict_id  where ud.user_email=? order by d.title", (r["email"], ))
        for r2 in c2.fetchall():
            xml += "<dict id='" + r2["id"] + "' title='" + clean4xml(r2["title"]) + "'/>"
        xml += "</user>"
        return {"email": r["email"], "xml": xml}
    else:
        return {"email":"", "xml":""}

def listDicts(searchtext, howmany):
    conn = getMainDB()
    c = conn.execute("select * from dicts where id like ? or title like ? order by id limit ?", ("%"+searchtext+"%", "%"+searchtext+"%", howmany))
    dicts = []
    for r in c.fetchall():
        dicts.append({"id": r["id"], "title": r["title"]})
    c = conn.execute("select count(*) as total from dicts where id like ? or title like ?", ("%"+searchtext+"%", "%"+searchtext+"%"))
    r = c.fetchone()
    total = r["total"]
    return {"entries": dicts, "total": total}

def readDict(dictId):
    conn = getMainDB()
    c = conn.execute("select * from dicts where id=?", (dictId, ))
    r = c.fetchone()
    if r:
        xml =  "<dict id='"+clean4xml(r["id"])+"' title='"+clean4xml(r["title"])+"'>"
        c2 = conn.execute("select u.email from user_dict as ud inner join users as u on u.email=ud.user_email where ud.dict_id=? order by u.email", (r["id"], ))
        for r2 in c2.fetchall():
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
    c = dictDB.execute("select * from entries where id=?", (entryID,))
    row = c.fetchone()
    if row:
        xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
        attribs = " this=\"" + baseUrl + dictID + "/" + str(row["id"]) + ".xml\""
        c2 = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.sortkey<(select sortkey from entries where id=?) order by e1.sortkey desc limit 1", (entryID, ))
        r2 = c2.fetchone()
        if r2:
            attribs += " previous=\"" + baseUrl + dictID + "/" + str(r2["id"]) + ".xml\""
        c2 = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.sortkey>(select sortkey from entries where id=?) order by e1.sortkey asc limit 1", (entryID, ))
        r2 = c2.fetchone()
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
    c = dictDB.execute("select e1.id, e1.title, e1.sortkey from entries as e1 where e1.doctype=? ", (configs["xema"]["root"],))
    for r in c.fetchall():
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
    c = dictDB.execute("select e1.id, e1.title, e1.sortkey from entries as e1 where e1.doctype=? ", (configs["xema"]["root"],))
    for r in c.fetchall():
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
    c = dictDB.execute("select id, title, sortkey from entries where doctype=? and id in (select id from entries order by random() limit ?)", (configs["xema"]["root"], limit))
    for r in c.fetchall():
        randoms.append({"id": r["id"], "title": r["title"], "sortkey": r["sortkey"]})

    # sort by selected locale
    collator = Collator.createInstance(Locale(getLocale(configs)))
    randoms.sort(key=lambda x: collator.getSortKey(x['sortkey']))

    c = dictDB.execute("select count(*) as total from entries")
    r = c.fetchone()
    if r["total"] > limit:
        more = True
    return {"entries": randoms, "more": more}

def readRandomOne(dictDB, dictID, configs):
    c = dictDB.execute("select id, title, xml from entries where id in (select id from entries where doctype=? order by random() limit 1)", (configs["xema"]["root"], ))
    r = c.fetchone()
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

    transform = download_xslt(configs)

    for r in c.fetchall():
        xml = setHousekeepingAttributes(r["id"], r["xml"], configs["subbing"])
        xml_xsl, success = transform(xml)
        if not success:
            return xml_xsl, 400

        yield xml_xsl
        yield "\n"

    yield "</"+rootname+">\n"

def purge(dictDB, email, historiography):
    dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', ?, ?, xml, ? from entries", (str(datetime.datetime.utcnow()), email, json.dumps(historiography)))
    dictDB.execute("delete from entries")
    dictDB.commit()
    dictDB.execute("vacuum")
    dictDB.commit()
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
    try:
        pidfile_f = open(pidfile, "w")
        errfile_f = open(errfile, "w")
    except:
        return checkImportStatus(pidfile, errfile)
    dbpath = os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite")
    p = subprocess.Popen(["adminscripts/import.py", dbpath, filename, email], stdout=pidfile_f, stderr=errfile_f, start_new_session=True, close_fds=True)
    return {"progressMessage": "Import started. Please wait...", "finished": False, "errors": False}

def checkImportStatus(pidfile, errfile):
    with open(pidfile, "r") as content_file:
        content = content_file.read()
    pid_data = re.split(r"[\n\r]", content)
    if pid_data[-1] == "":
        progress = pid_data[-2]
    else:
        progress = pid_data[-1]
    finished = False
    if "100%" in progress:
        finished = True
    errors = False
    if os.path.isfile(errfile) and os.stat(errfile).st_size:
        errors = True
    return {"progressMessage": progress, "finished": finished, "errors": errors}

def readDoctypesUsed(dictDB):
    c = dictDB.execute("select doctype from entries group by doctype order by count(*) desc")
    doctypes = []
    for r in c.fetchall():
        doctypes.append(r["doctype"])
    return doctypes

def getLastEditedEntry(dictDB, email):
    c = dictDB.execute("select entry_id from history where email=? order by [when] desc limit 1", (email, ))
    r = c.fetchone()
    if r:
        return str(r["entry_id"])
    else:
        return ""

def listEntriesById(dictDB, entryID, configs):
    c = dictDB.execute("select e.id, e.title, e.xml from entries as e where e.id=?", (entryID,))
    entries = []
    for r in c.fetchall():
        xml = setHousekeepingAttributes(r["id"], r["xml"], configs["subbing"])
        entries.append({"id": r["id"], "title": r["title"], "xml": xml})
    return entries

def listEntries(dictDB, dictID, configs, doctype, searchtext="", modifier="start", howmany=10, sortdesc=False, reverse=False, fullXML=False):
    searchtext = searchtext.lower()
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
        sql1 = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + " from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt like ? group by e.id order by s.level"
        params1 = (doctype, searchtext+"%")
        sql2 = "select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt like ?"
        params2 = (doctype, searchtext+"%")
    elif modifier == "wordstart":
        sql1 = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + " from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and (s.txt like ? or s.txt like ?) group by e.id order by s.level"
        params1 = (doctype, searchtext + "%", "% " + searchtext + "%")
        sql2 = "select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and (s.txt like ? or s.txt like ?)"
        params2 = (doctype, searchtext + "%", "% " + searchtext + "%")
    elif modifier == "substring":
        sql1 = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + " from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt like ? group by e.id order by s.level"
        params1 = (doctype, "% " + searchtext + "%")
        sql2 = "select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt like ?"
        params2 = (doctype, "% " + searchtext + "%")
    elif modifier == "exact":
        sql1 = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title" + entryXML + " from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt=? group by e.id order by s.level"
        params1 = (doctype, searchtext)
        sql2 = "select count(distinct s.entry_id) as total from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt=?"
        params2 = (doctype, searchtext)
    c1 = dictDB.execute(sql1, params1)
    entries = []
    for r1 in c1.fetchall():
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
    r2 = c2.fetchone()
    total = r2["total"]
    return total, entries

def listEntriesPublic(dictDB, dictID, configs, searchtext):
    howmany = 100
    sql_list = "select s.txt, min(s.level) as level, e.id, e.title, e.sortkey, case when s.txt=? then 1 else 2 end as priority from searchables as s inner join entries as e on e.id=s.entry_id where s.txt like ? and e.doctype=? group by e.id order by priority, level, s.level"
    c1 = dictDB.execute(sql_list, ("%"+searchtext+"%", "%"+searchtext+"%", configs["xema"].get("root")))
    entries = []
    for r1 in c1.fetchall():
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
    r = c.fetchone()
    res["entryCount"] = r["entryCount"]
    c = dictDB.execute("select count(*) as needResave from entries where needs_resave=1 or needs_refresh=1 or needs_refac=1")
    r = c.fetchone()
    res["needResave"] = r["needResave"]
    return res

def updateDictConfig(dictDB, dictID, configID, content):
    dictDB.execute("delete from configs where id=?", (configID, ))
    dictDB.execute("insert into configs(id, json) values(?, ?)", (configID, json.dumps(content)))
    dictDB.commit()
    
    if configID == "ident" or configID == "users":
        attachDict(dictDB, dictID)
        return content, False
    elif configID == "titling" or configID == "searchability":
        resaveNeeded = flagForResave(dictDB)
        return content, resaveNeeded
    elif configID == "links":
        resaveNeeded = flagForResave(dictDB)
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
    dictDB.commit()
    return (c.rowcount > 0)

def flagForRefac(dictDB):
    c = dictDB.execute("update entries set needs_refac=1")
    dictDB.commit()
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
    dictDB.commit()


def refac(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    if len(configs['subbing']) == 0:
        return False
    c = dictDB.execute("select e.id, e.xml, h.email from entries as e left outer join history as h on h.entry_id=e.id where e.needs_refac=1 order by h.[when] asc limit 1")
    r = c.fetchone()
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
    dictDB.execute("delete from sub where parent_id=?", (entryID, ))
    # keep saving subentries of the current entry until there are no more subentries to save:
    if len(els) > 0:
        for el in els:
            subentryID = el.getAttributeNS("http://www.lexonomy.eu/", "subentryID")
            xml = el.toxml()
            if subentryID:
                subentryID, adjustedXml, changed, feedback = updateEntry(dictDB, configs, subentryID, xml, email.lower(), {"refactoredFrom":entryID})
                el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", str(subentryID))
                dictDB.execute("insert into sub(parent_id, child_id) values(?,?)", (entryID, subentryID))
                if changed:
                    dictDB.execute("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?) and id<>?", (subentryID, entryID))
            else:
                subentryID, adjustedXml, feedback = createEntry(dictDB, configs, None, xml, email.lower(), {"refactoredFrom":entryID})
                el.setAttributeNS("http://www.lexonomy.eu/", "lxnm:subentryID", str(subentryID))
                subentryID, adjustedXml, changed, feedback = updateEntry(dictDB, configs, subentryID, el.toxml(), email.lower(), {"refactoredFrom":entryID})
                dictDB.execute("insert into sub(parent_id, child_id) values(?,?)", (entryID, subentryID))
                dictDB.execute("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (subentryID, ))
    xml = doc.toxml().replace('<?xml version="1.0" ?>', '').strip()
    dictDB.execute("update entries set xml=?, needs_refac=0 where id=?", (xml, entryID))
    dictDB.commit()

def refresh(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    if len(configs['subbing']) == 0:
        return False
    # takes one entry that needs refreshing and sucks into it the latest versions of its subentries
    # get one entry that needs refreshing where none of its children needs refreshing
    c = dictDB.execute("select pe.id, pe.xml from entries as pe left outer join sub as s on s.parent_id=pe.id left join entries as ce on ce.id=s.child_id where pe.needs_refresh=1 and (ce.needs_refresh is null or ce.needs_refresh=0) limit 1")
    r = c.fetchone()
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
            c = dictDB.execute("select xml from entries where id=?", (subentryID, ))
            r = c.fetchone()
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
                if el.getAttributeNS("http://www.lexonomy.eu/", "done"):
                    el.removeAttributeNS("http://www.lexonomy.eu/", "done")
                parentXml = parentDoc.toxml().replace('<?xml version="1.0" ?>', '').strip()
                # save the parent's xml (into which all subentries have been injected by now) and tell it that it needs a resave:
                dictDB.execute("update entries set xml=?, needs_refresh=0, needs_resave=1 where id=?", (parentXml, parentID))
                return True

def resave(dictDB, dictID, configs):
    from xml.dom import minidom, Node
    c = dictDB.execute("select id, xml from entries where needs_resave=1")
    for r in c.fetchall():
        entryID = r["id"]
        xml = r["xml"]
        xml = re.sub(r"\s+xmlns:lxnm=['\"]http:\/\/www\.lexonomy\.eu\/[\"']", "", xml)
        xml = re.sub(r"^<([^>^ ]*) ", r"<\1 xmlns:lxnm='http://www.lexonomy.eu/' ", xml)
        dictDB.execute("update entries set needs_resave=0, title=?, sortkey=? where id=?", (getEntryTitle(xml, configs["titling"]), getSortTitle(xml, configs["titling"]), entryID))
        dictDB.execute("delete from searchables where entry_id=?", (entryID,))
        dictDB.execute("insert into searchables(entry_id, txt, level) values(?, ?, ?)", (entryID, getEntryTitle(xml, configs["titling"], True), 1))
        dictDB.execute("insert into searchables(entry_id, txt, level) values(?, ?, ?)", (entryID, getEntryTitle(xml, configs["titling"], True).lower(), 1))
        headword = getEntryHeadword(xml, configs["titling"].get("headword"))
        for searchable in getEntrySearchables(xml, configs):
            if searchable != headword:
                dictDB.execute("insert into searchables(entry_id, txt, level) values(?,?,?)", (entryID, searchable, 2))
        if configs["links"]:
            updateEntryLinkables(dictDB, entryID, xml, configs, True, True)
    dictDB.commit()
    return True

def getEntryLinks(dictDB, dictID, entryID):
    ret = {"out": [], "in": []}
    c = dictDB.execute("SELECT * FROM linkables WHERE entry_id=?", (entryID,))
    conn = getLinkDB()
    for r in c.fetchall():
        ret["out"] = ret["out"] + links_get(dictID, r["element"], r["txt"], "", "", "")
        ret["in"] = ret["in"] + links_get("", "", "", dictID, r["element"], r["txt"])
    return ret
        

def updateEntryLinkables(dictDB, entryID, xml, configs, save=True, save_xml=True):
    from xml.dom import minidom, Node
    doc = minidom.parseString(xml)
    ret = []
    # table may not exists for older dictionaries
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
        dictDB.execute("delete from linkables where entry_id=?", (entryID,))
        for linkable in ret:
            dictDB.execute("insert into linkables(entry_id, txt, element, preview) values(?,?,?,?)", (entryID, linkable["identifier"], linkable["element"], linkable["preview"]))
    if save_xml and len(ret)>0:
        dictDB.execute("update entries set xml=? where id=?", (xml, entryID))
    dictDB.commit()
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
    c = dictDB.execute("select id, xml from entries where id=?", (entryID,))
    row = c.fetchone()
    xml = row["xml"] if row else ""
    xml = re.sub(r" xmlns:lxnm=[\"\']http:\/\/www\.lexonomy\.eu\/[\"\']", "", xml)
    xml = re.sub(r"\=\"([^\"]*)\"", r"='\1'", xml)
    xml = re.sub(r" lxnm:(sub)?entryID='[0-9]+'", "", xml)
    xml = addFlag(xml, flag, configs["flagging"], configs["xema"])

    # tell my parents that they need a refresh:
    dictDB.execute("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (entryID, ))
    # update me
    needs_refac = 1 if len(list(configs["subbing"].keys())) > 0 else 0
    needs_resave = 1 if configs["searchability"].get("searchableElements") and len(configs["searchability"].get("searchableElements")) > 0 else 0
    dictDB.execute("update entries set doctype=?, xml=?, title=?, sortkey=$sortkey, needs_refac=?, needs_resave=? where id=?", (getDoctype(xml), xml, getEntryTitle(xml, configs["titling"]), getSortTitle(xml, configs["titling"]), needs_refac, needs_resave, entryID))
    dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, "update", str(datetime.datetime.utcnow()), email, xml, json.dumps(historiography)))
    dictDB.commit()
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
    c = dictDB.execute("select * from history where entry_id=? order by [when] desc", (entryID,))
    for row in c.fetchall():
        xml = row["xml"]
        if row["xml"]:
            xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
        history.append({"entry_id": row["entry_id"], "revision_id": row["id"], "content": xml, "action": row["action"], "when": row["when"], "email": row["email"] or "", "historiography": json.loads(row["historiography"])})
    return history

def verifyUserApiKey(email, apikey):
    conn = getMainDB()
    c = conn.execute("select email from users where email=? and apiKey=?", (email, apikey))
    row = c.fetchone()
    if not row or siteconfig["readonly"]:
        return {"valid": False}
    else:
        return {"valid": True, "email": email or ""}

def links_add(source_dict, source_el, source_id, target_dict, target_el, target_id):
    conn = getLinkDB()
    c = conn.execute("select * from links where source_dict=? and source_element=? and source_id=? and target_dict=? and target_element=? and target_id=?", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    row = c.fetchone()
    if not row:
        conn.execute("insert into links (source_dict, source_element, source_id, target_dict, target_element, target_id) values (?,?,?,?,?,?)", (source_dict, source_el, source_id, target_dict, target_el, target_id))
        conn.commit()
    c = conn.execute("select * from links where source_dict=? and source_element=? and source_id=? and target_dict=? and target_element=? and target_id=?", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    row = c.fetchone()
    return {"link_id": row["link_id"], "source_dict": row["source_dict"], "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_el": row["target_element"], "target_id": row["target_id"]}

def links_delete(dictID, linkID):
    conn = getLinkDB()
    conn.execute("delete from links where source_dict=? and link_id=?", (dictID, linkID))
    conn.commit()
    c = conn.execute("select * from links where link_id=?", (linkID, ))
    if len(c.fetchall()) > 0:
        return False
    else:
        return True

def links_get(source_dict, source_el, source_id, target_dict, target_el, target_id):
    params = []
    where = []
    if source_dict != "":
        where.append("source_dict=?")
        params.append(source_dict)
    if source_el != "":
        where.append("source_element=?")
        params.append(source_el)
    if source_id != "":
        where.append("source_id=?")
        params.append(source_id)
    if target_dict != "":
        where.append("target_dict=?")
        params.append(target_dict)
    if target_el != "":
        where.append("target_element=?")
        params.append(target_el)
    if target_id != "":
        where.append("target_id=?")
        params.append(target_id)
    query = "select * from links"
    if len(where) > 0:
        query += " where " + " and ".join(where)
    conn = getLinkDB()
    c = conn.execute(query, tuple(params))
    res = []
    for row in c.fetchall():
        res.append({"link_id": row["link_id"], "source_dict": row["source_dict"], "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_el": row["target_element"], "target_id": row["target_id"]})
    return res

def getDictLinkables(dictDB):
    ret = []
    c = dictDB.execute("SELECT * FROM linkables ORDER BY entry_id, element, txt")
    for r in c.fetchall():
        ret.append({"element": r["element"], "link": r["txt"], "entry": r["entry_id"], "preview": r["preview"]})
    return ret

def addAutoNumbers(dictDB, dictID, countElem, storeElem):
    from xml.dom import minidom, Node
    isAttr = False
    if storeElem[0] == '@':
        isAttr = True
        storeElem = storeElem[1:]
    c = dictDB.execute("select id, xml from entries")
    process = 0
    for r in c.fetchall():
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
            dictDB.execute("update entries set xml=?, needs_refac=0 where id=?", (xml, entryID))
    dictDB.commit()
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
    locale = 'en'
    if "locale" in configs["titling"] and configs["titling"]["locale"] != "":
        locale = configs["titling"]["locale"]
    return locale

