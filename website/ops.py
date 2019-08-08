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

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))

defaultDictConfig = {"editing": {"xonomyMode": "nerd", "xonomyTextEditor": "askString" },
                     "searchability": {"searchableElements": []},
                     "xema": {"elements": {}},
                     "titling": {"headwordAnnotations": [], "abc": siteconfig["defaultAbc"]},
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

# SMTP
def sendmail(mailTo, mailSubject, mailText):
    if siteconfig["mailconfig"] and siteconfig["mailconfig"]["host"] and siteconfig["mailconfig"]["port"]:
        if siteconfig["mailconfig"]["secure"]:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"], context=context)
        else:
            server = smtplib.SMTP(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"])
        message = "Subject: " + mailSubject + "\n\n" + mailText
        print(message)
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
                 "xemplate", "editing", "subbing"]:
        if not conf in configs:
            configs[conf] = defaultDictConfig.get(conf, {})
    return configs

def setHousekeepingAttributes(entryID, xml, subbing):
    # delete any housekeeping attributes and elements that already exist in the XML:
    import re
    xml = re.sub('^(<[^>/]*)\s+xmlns:lxnm=[\'"]http://www\.lexonomy\.eu/["\']', "\g<1>", xml)
    xml = re.sub('^(<[^>/]*)\s+lxnm:entryID=[\'"][^"\']*["\']', "\g<1>", xml)
    xml = re.sub('^(<[^>/]*)\s+lxnm:subentryID=[\'"][^"\']*["\']', "\g<1>", xml)
    # get name of the top-level element:
    root = re.match('<([^\s>/]+)', xml).group(1)
    # set housekeeping attributes:
    if root in subbing:
        attr = "subentryID"
    else:
        attr = "entryID"
    xml = re.sub('^<[^\s>/]+', "\g<0> lxnm:%s='%s'" % (attr, entryID), xml)
    return re.sub('^<[^\s>/]+', "\g<0> xmlns:lxnm='http://www.lexonomy.eu/'", xml)

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
            pel.setAttribute("id", r["parent_id"])
            pel.setAttribute("title", r["title"])
            el.appendChild(pel)
    return doc.toxml()

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
    if not dictAccess and (not "isAdmin" in ret or not ret["isAdmin"]):
        return {"loggedin": True, "email": email, "dictAccess": False, "isAdmin": False}, configs
    ret["dictAccess"] = dictAccess
    for r in ["canEdit", "canConfig", "canDownload", "canUpload"]:
        ret[r] = ret["isAdmin"] or (dictAccess and dictAccess[r])
    return ret, configs

def deleteEntry (db, entryID, email):
    # tell my parents that they need a refresh:
    db.execute ("update entries set needs_refresh=1 where id in (select parent_id from sub where child_id=?)", (entryID,))
    # delete me:
    db.execute ("delete from entries where id=?", (entryID,))
    # tell history that I have been deleted:
    db.execute ("insert into history(entry_id, action, [when], email, xml) values(?,?,?,?,?)",
                (entryID, "delete", datetime.datetime.utcnow(), email, None))
    db.commit()

def readEntry (db, configs, entryID):
    c = db.execute("select * from entries where id=?", (entryID,))
    row = c.fetchone()
    if not row:
        return 0, "", ""
    xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
    if configs["subbing"]:
        xml = addSubentryParentTags(db, entryID, xml)
    return entryID, xml, row["title"]

def generateKey(size=32):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(size))

def generateDictId(size=8):
    return ''.join(random.choice("abcdefghijkmnpqrstuvwxy23456789") for _ in range(size))

def login(email, password):
    if siteconfig["readonly"]:
        return {"success": False}
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    print(passhash)
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
    print(user["email"])
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
        token = hashlib.sha1(hashlib.sha1(random.choice(string.ascii_uppercase).encode("utf-8")).hexdigest().encode("utf-8")).hexdigest()
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
        token = hashlib.sha1(hashlib.sha1(random.choice(string.ascii_uppercase).encode("utf-8")).hexdigest().encode("utf-8")).hexdigest()
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
        print("send API key to SKE")
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
    print(jwtdata)
    print(user)
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
    shutil.copy("dictTemplates/" + template + ".sqlite", os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
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
        info = {"id": r["id"], "title": r["title"]}
        configs = readDictConfigs(getDB(r["id"]))
        if configs["users"][email] and configs["users"][email]["canConfig"]:
            info["currentUserCanDelete"] = True
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
    #delete any housekeeping attributes and elements that already exist in the XML
    xml = re.sub(r"^(<[^>\/]*)\s+xmlns:lxnm=['\"]http:\/\/www\.lexonomy\.eu\/[\"']", r"\1", xml)
    xml = re.sub(r"^(<[^>\/]*)\s+lxnm:entryID=['\"][^\"\']*[\"']", r"\1", xml)
    xml = re.sub(r"^(<[^>\/]*)\s+lxnm:subentryID=['\"][^\"\']*[\"']", r"\1", xml)
    #get name of the top-level element
    root = ""
    root = re.match(r"^<([^\s>\/]+)", xml).group(1)
    #set housekeeping attributes
    if root in subbing:
        xml = re.sub(r"^<([^\s>\/]+)", r"<\1 lxnm:subentryID='"+entryID+"'", xml)
    else:
        xml = re.sub(r"^<([^\s>\/]+)", r"<\1 lxnm:entryID='"+entryID+"'", xml)
    xml = re.sub(r"^<([^\s>\/]+)", r"<\1 xmlns:lxnm='http://www.lexonomy.eu/'", xml)
    return xml

def readEntry(dictDB, dictID, entryID, configs):
    c = dictDB.execute("select * from entries where id=?", (entryID,))
    row = c.fetchone()
    if row:
        xml = setHousekeepingAttributes(entryID, row["xml"], configs["subbing"])
        return {"entryID": row["id"], "xml": xml,  "title": row["title"]}
    else:
        return {"entryID": 0, "xml": "",  "title": ""}

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
    nabes = []
    #before
    c = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.doctype=? and e1.sortkey<=(select sortkey from entries where id=?) order by e1.sortkey desc limit 8", (configs["xema"]["root"], entryID))
    for r in c.fetchall():
        nabes.insert(0, {"id": r["id"], "title": r["title"]})
    #after
    c = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.doctype=? and e1.sortkey>(select sortkey from entries where id=?) order by e1.sortkey asc limit 15", (configs["xema"]["root"], entryID))
    for r in c.fetchall():
        nabes.append({"id": r["id"], "title": r["title"]})
    return nabes

def readRandoms(dictDB):
    configs = readDictConfigs(dictDB)
    limit = 75
    more = False
    randoms = []
    c = dictDB.execute("select id, title from entries where doctype=? and id in (select id from entries order by random() limit ?) order by sortkey", (configs["xema"]["root"], limit))
    for r in c.fetchall():
        randoms.append({"id": r["id"], "title": r["title"]})
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
