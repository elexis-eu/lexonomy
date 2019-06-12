#!/usr/bin/python3

import os, sys, json, sqlite3, os.path, datetime

siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           "siteconfig.json"), encoding="utf-8"))

defaultDictConfig = { "editing": {"xonomyMode": "nerd"},
                      "searchability": {"searchableElements": []},
                      "xema": {"elements": {}},
                      "titling": {"headwordAnnotations": [], "abc": siteconfig["defaultAbc"]},
                      "flagging": {"flag_element": "", "flags": []} }

# db management
def getDB(dictID):
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], "dicts/"+dictID+".sqlite"))
    conn.row_factory = sqlite3.Row
    conn.executescript("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=on")
    return conn
def getMainDB():
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"],'lexonomy.sqlite'))
    conn.row_factory = sqlite3.Row
    return conn

# config
def readDictConfigs(dictDB):
    configs = {"siteconfig": siteconfig};
    c = dictDB.execute("select * from configs")
    for r in c.fetchall():
        configs[r["id"]] = json.loads(r["json"])
    for conf in ["ident", "publico", "users", "kex", "titling", "flagging", "searchability", "xampl", "thes", "collx", "defo", "xema", "xemplate", "editing", "subbing"]:
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
    yesterday = now - datetime.timedelta(days = 1)
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
    if not dictAccess and not ret["isAdmin"]:
        return {"loggedin": True, "email": email, "dictAccess": False, "isAdmin": False}
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
