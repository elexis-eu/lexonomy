#!/usr/bin/python3

import os
from sqlite3 import Connection
import sys
import functools
from typing import Any, TYPE_CHECKING
import ops
import re
import jwt
import json
import datetime
import urllib.request
from ops import siteconfig
import media
import bottle
from bottle import (hook, route, get, post, run, template, error, request,
                    response, static_file, abort, redirect, install)

from ops import Configs, User, get_entry_html

if TYPE_CHECKING:
    request: Any
    body: Any
    response: Any

# configuration
app = bottle.default_app()
app.config['autojson'] = True
bottle.BaseRequest.MEMFILE_MAX = 10 * 1024 * 1024 #10MB upload
my_url = siteconfig["baseUrl"].split("://")[1].rstrip("/")
cgi = False
if "SERVER_NAME" in os.environ and "SERVER_PORT" in os.environ:
    my_url = os.environ["SERVER_NAME"] + ":" + os.environ["SERVER_PORT"]
    cgi = True
if "HTTPS" in os.environ and os.environ["HTTPS"] == "on":
    my_base_url = "https://" + my_url + "/"
else:
    my_base_url = "http://" + my_url + "/"

# command-line arguments (unless CGI)
if not cgi and len(sys.argv) > 1:
    if sys.argv[1] in ["-h", "--help"] or len(sys.argv) != 2:
        print("Usage: %s SERVER:PORT, which default to %s" % (sys.argv[0], my_url), file=sys.stderr)
        print(sys.argv, file=sys.stderr)
        sys.exit(1)
    my_url = sys.argv[1]

# serve static files
@route('/<path:re:(widgets|furniture|libs|index.*\.html|config\.js|bundle\.js|bundle\.static\.js|bundle\.css|riot|img|js|css|docs|version\.txt).*>')
def server_static(path: str):
    return static_file(path, root="./")

# ignore trailing slashes, urldecode cookies
@hook('before_request')
def strip_path():
    request.environ['PATH_INFO'] = request.environ['PATH_INFO'].rstrip('/')
    from urllib.parse import unquote
    for c in request.cookies:
        request.cookies[c] = unquote(request.cookies[c])

# profiler
def profiler(callback):
    def wrapper(*args, **kwargs):
        if request.query.prof:
            import cProfile, pstats, io
            profile = cProfile.Profile()
            profile.enable()
        body = callback(*args, **kwargs)
        if request.query.prof:
            profile.disable()
            output = io.StringIO()
            profstats = pstats.Stats(profile, stream=output)
            output.write("<pre>")
            profstats.sort_stats('time','calls').print_stats(50)
            profstats.sort_stats('cumulative').print_stats(50)
            output.write("</pre>")
            return output.getvalue()
        return body
    return wrapper
install(profiler)

# authentication decorator
# use @authDict(["canEdit", "canConfig", "canUpload", "canDownload"]) before any handler
# to ensure that user has appropriate access to the dictionary. Empty list checks read access only.
# assumes <dictID> in route and "dictID", "user", "dictDB", "configs" as parameters in the decorated function
# <dictID> gets open and passed as dictDB alongside the configs
def authDict(checkRights: list[str], errorRedirect: bool=False):
    def wrap(func):
        @functools.wraps(func)
        def wrapper_verifyLoginAndDictAccess(*args, **kwargs):
            try:
                conn = ops.getDB(kwargs["dictID"])
            except IOError:
                abort(404, "No such dictionary")
            res, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, conn)
            for r in checkRights:
                if not res.get(r, False):
                    if errorRedirect:
                        redirect("/"+kwargs["dictID"])
                    else:
                        return res
            kwargs["user"] = res
            kwargs["dictDB"] = conn
            kwargs["configs"] = configs
            return func(*args, **kwargs)
        return wrapper_verifyLoginAndDictAccess
    return wrap

# authentication decorator
# use @auth to check that user is authenticated
# assumes that the decorated function has a "user" parameter which is used to pass the user info
def auth(func: Any):
    @functools.wraps(func)
    def wrapper_verifyLogin(*args, **kwargs):
        res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        if not res["loggedin"]:
            redirect("/")
        kwargs["user"] = res
        return func(*args, **kwargs)
    return wrapper_verifyLogin

# admin authentication decorator
# use @auth to check that user is authenticated and admin
# assumes that the decorated function has a "user" parameter which is used to pass the user info
def authAdmin(func: Any):
    @functools.wraps(func)
    def wrapper_verifyLoginAdmin(*args, **kwargs):
        res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        if not res["loggedin"] or not res["isAdmin"]:
            redirect("/")
        kwargs["user"] = res
        return func(*args, **kwargs)
    return wrapper_verifyLoginAdmin

#homepage
@get(siteconfig["rootPath"])
def home():
    return static_file("/index.html", root="./")

@get(siteconfig["rootPath"] + "siteconfigread.json")
def lexonomyconfig():
    configData = {
        "licences": siteconfig['licences'],
        "baseUrl": siteconfig['baseUrl']
    }
    if 'sketchengineLoginPage' in siteconfig:
        configData['sketchengineLoginPage'] = siteconfig['sketchengineLoginPage']
    if "consent" in siteconfig and siteconfig["consent"].get("terms") != "":
        configData["consent"] = siteconfig["consent"]
    return configData

@get(siteconfig["rootPath"] + "userdicts.json")
@auth
def listuserdicts(user: User):
    dicts = ops.getDictsByUser(user["email"])
    return {"dicts": dicts}

@get(siteconfig["rootPath"] + "<dictID>/stats.json")
@authDict(["canEdit"])
def getStats(dictID: str, user: User, dictDB: Connection, configs: Configs):
    return ops.getDictStats(dictDB)

@post(siteconfig["rootPath"] + "<dictID>/entrydelete.json")
@authDict(["canEdit"])
def entrydelete(dictID: str, user: User, dictDB: Connection, configs: Configs):
    entryID = int(request.forms.id)
    ops.deleteEntry(dictDB, configs, entryID, user["email"])
    return {"success": True, "id": entryID}

@post(siteconfig["rootPath"]+"<dictID>/entryread.json")
@authDict([])
def entryread(dictID: str, user: User, dictDB: Connection, configs: Configs):
    entryID = int(request.forms.id)
    entry = ops.readEntries(dictDB, configs, entryID, html = True, titlePlain = True)[0]
    if entry:
        # interop between database and old frontend code
        entry["success"] = True
        entry["contentHtml"] = entry["html"]
        entry["content"] = entry["xml"]

    return entry if entry else {"success": False, "id": entryID, "content": "", "contentHtml": ""}

@post(siteconfig["rootPath"]+"<dictID>/entryupdate.json")
@authDict(["canEdit"])
def entryupdate(dictID: str, user: User, dictDB: Connection, configs: Configs):
    entryID = int(request.forms.id ) if request.forms.id else None
    id, xml, success, feedback = ops.createEntry(dictDB, configs, xml = request.forms.content, email=user["email"], id=entryID)
    dictDB.commit()
    result = {"success": success, "id": id, "content": "", "contentHtml": "", "feedback": feedback}
    if success:
        entry = ops.readEntries(dictDB, configs, id, html = True, titlePlain = True)[0]
        # interop between database and old frontend code
        result["success"] = True
        result["content"] = entry["xml"]
        result["contentHtml"] = entry["html"]

    return result

@post(siteconfig["rootPath"]+"<dictID>/entrycreate.json")
@authDict(["canEdit"])
def entrycreate(dictID: str, user: User, dictDB: Connection, configs: Configs):
    id, xml, success, feedback = ops.createEntry(dictDB, configs, xml = request.forms.content, email=user["email"])
    dictDB.commit()
    result = {"success": success, "id": id, "content": "", "contentHtml": "", "feedback": feedback}
    if success:
        entry = ops.readEntries(dictDB, configs, id, html = True, titlePlain = True)[0]
        result["success"] = True
        result["content"] = entry["xml"]
        result["contentHtml"] = entry["html"]

    return result

@post(siteconfig["rootPath"]+"<dictID>/entryflag.json")
@authDict(["canEdit"])
def entryflag(dictID: str, user: User, dictDB: Connection, configs: Configs):
    entryID = int(request.forms.id)
    xml, feedback = ops.set_entry_flag(dictDB, entryID, request.forms.flag, configs, user["email"])
    dictDB.commit()
    return {"success": feedback is None, "id": entryID, "feedback": feedback}

@get(siteconfig["rootPath"]+"<dictID>/subget")
@authDict(["canEdit"])
def subget(dictID: str, user: User, dictDB: Connection, configs: Configs):
    """For use with searching for eligible subentries: given a doctype and a lemma, find matching entries. (it is implied the doctype allows the entry to become a subentry)"""
    entryIds = ops.searchEntries(dictDB, configs, request.query.doctype, request.query.lemma, "wordstart")
    total = len(entryIds)
    entryIds = entryIds[0:100]
    entries = ops.readEntries(dictDB, configs, entryIds, xml = False)
    return {"success": True, "total": total, "entries": entries}

@post(siteconfig["rootPath"]+"<dictID>/history.json")
def history(dictID: str):
    if not ops.dictExists(dictID):
        return redirect("/")
    user, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, ops.getDB(dictID))
    entryID = int(request.forms.id)
    history = ops.readDictHistory(ops.getDB(dictID), dictID, configs, entryID)
    return {"history":history}

@post(siteconfig["rootPath"] + "consent.json")
@auth
def save_consent(user: User):
    res = ops.setConsent(user["email"], request.forms.consent)
    return {"success": res}

@get(siteconfig["rootPath"] + "<dictID>/getmedia/<query>")
@authDict(["canEdit"])
def getmedia(dictID, query, user, dictDB, configs):
    res = media.get_images(configs, query)
    return {"images": res}

@get(siteconfig["rootPath"] + "skeget/corpora")
@auth
def skeget_corpora(user):
    import base64
    req = urllib.request.Request("https://api.sketchengine.eu/ca/api/corpora",
                                  headers = {"Authorization": "Basic " + base64.b64encode(str.encode(str(user['ske_username'])+':'+str(user['ske_apiKey']))).decode('ascii')})
    ske_response = urllib.request.urlopen(req)
    response.headers['Content-Type'] = ske_response.getheader('Content-Type')
    return ske_response

@get(siteconfig["rootPath"] + "<dictID>/skeget/xampl")
@authDict(["canEdit"])
def skeget_xampl(dictID, user, dictDB, configs):
    url: str = request.query.url
    url += "/first"
    url += "?corpname=" + urllib.parse.quote_plus(request.query.corpus)
    url += "&username=" + request.query.username
    url += "&api_key=" + request.query.apikey
    url += "&format=json"
    if request.query.querytype == "skesimple":
        url += "&iquery=" + urllib.parse.quote_plus(request.query.query)
    else:
        url += "&queryselector=cqlrow&cql=" + urllib.parse.quote_plus(request.query.query)
    url += "&viewmode=sen"
    url += "&gdex_enabled=1"
    if request.query.fromp:
        url += "&" + request.query.fromp
    req = urllib.request.Request(url, headers = {"Authorization": "Bearer " + request.query.apikey})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    return data

@get(siteconfig["rootPath"] + "<dictID>/skeget/thes")
@authDict(["canEdit"])
def skeget_thes(dictID, user, dictDB, configs):
    url: str = request.query.url
    url += "/thes"
    url += "?corpname=" + urllib.parse.quote_plus(request.query.corpus)
    url += "&username=" + request.query.username
    url += "&api_key=" + request.query.apikey
    url += "&format=json"
    url += "&lemma=" + urllib.parse.quote_plus(request.query.lemma)
    if request.query.fromp:
        url += "&" + request.query.fromp
    req = urllib.request.Request(url, headers = {"Authorization": "Bearer " + request.query.apikey})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    return data

@get(siteconfig["rootPath"] + "<dictID>/skeget/collx")
@authDict(["canEdit"])
def skeget_collx(dictID, user, dictDB, configs):
    url: str = request.query.url
    url += "/wsketch"
    url += "?corpname=" + urllib.parse.quote_plus(request.query.corpus)
    url += "&username=" + request.query.username
    url += "&api_key=" + request.query.apikey
    url += "&format=json"
    url += "&lemma=" + urllib.parse.quote_plus(request.query.lemma)
    url += "&structured=0"
    if request.query.fromp:
        url += "&" + request.query.fromp
    req = urllib.request.Request(url, headers = {"Authorization": "Bearer " + request.query.apikey})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    return data

@get(siteconfig["rootPath"] + "<dictID>/skeget/defo")
@authDict(["canEdit"])
def skeget_defo(dictID: str, user: User, dictDB: Connection, configs: Configs):
    url: str = request.query.url
    url += "/view"
    url += "?corpname=" + urllib.parse.quote_plus(request.query.corpus)
    url += "&username=" + request.query.username
    url += "&api_key=" + request.query.apikey
    url += "&format=json"
    url += "&iquery=" + ops.makeQuery(request.query.lemma)
    url += "&viewmode=sen"
    if request.query.fromp:
        url += "&" + request.query.fromp
    req = urllib.request.Request(url, headers = {"Authorization": "Bearer " + request.query.apikey})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    return data

@get(siteconfig["rootPath"] + "<dictID>/kontext/corpora")
@authDict([])
def kontext_corpora(dictID: str, user: User, dictDB: Connection, configs: Configs):
    kontexturl = "https://www.clarin.si/kontext/"
    if configs.get("kontext") and configs["kontext"].get("url") != "":
        kontexturl = configs["kontext"].get("url")
    kontexturl += "corpora/ajax_list_corpora?requestable=1"
    requrl = kontexturl
    loadmore = True
    corpus_list = []
    while loadmore:
        res = urllib.request.urlopen(requrl)
        data = json.loads(res.read())
        if data["nextOffset"] != None:
            requrl = kontexturl + "&offset=" + str(data["nextOffset"])
            corpus_list += data["rows"]
        else:
            loadmore = False
    return {"corpus_list": corpus_list}

@get(siteconfig["rootPath"] + "<dictID>/kontext/conc")
@authDict([])
def kontext_xampl(dictID: str, user: User, dictDB: Connection, configs: Configs):
    kontexturl = configs["kontext"].get("url") + "query_submit?format=json"
    corpus = configs["kontext"].get("corpus")
    if request.query.querytype == "kontextcql":
        cql = urllib.parse.quote_plus(request.query.query)
    else:
        cql = '[word=\"' + urllib.parse.quote_plus(request.query.query) + '\"]'
    request_data = {
        "type": "concQueryArgs",
        "maincorp": configs["kontext"].get("corpus"),
        "viewmode": "sen",
        "pagesize": 40,
        "fromp": 0,
        "queries": [{
            "qtype": "advanced",
            "corpname": configs["kontext"].get("corpus"),
            "query": cql,
            "pcq_pos_neg": "pos",
            "include_empty": False,
            "default_attr":"word"
        }],
        "text_types": {},
        "context":  {
            "fc_lemword_wsize": [-5, 5],
            "fc_lemword": "",
            "fc_lemword_type": "all",
            "fc_pos_wsize": [-5, 5],
            "fc_pos": [],
            "fc_pos_type": "all"
        },
        "async": False
    }
    if request.query.fromp:
        request_data['fromp'] = int(request.query.fromp)
    req = urllib.request.Request(kontexturl)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsondata = json.dumps(request_data)
    jsondataasbytes = jsondata.encode('utf-8')
    req.add_header('Content-Length', len(jsondataasbytes))
    res = urllib.request.urlopen(req, jsondataasbytes)
    data = json.loads(res.read())
    concurl = configs["kontext"].get("url") + 'view?corpname=' + configs["kontext"].get("corpus") + '&viewmode=sen&q=' + data['Q'][0]
    if request.query.fromp:
        concurl += '&fromp=' + request.query.fromp
    if request.query.redir and request.query.redir == '1':
        return redirect(concurl)
    concurl += '&format=json'
    res = urllib.request.urlopen(concurl)
    data = json.loads(res.read())
    return data

@post(siteconfig["rootPath"] + "login.json")
def check_login():
    if request.forms.email != "" and request.forms.password != "":
        res = ops.login(request.forms.email, request.forms.password)
        if res["success"]:
            #response.set_cookie("email", res["email"], path="/")
            #response.set_cookie("sessionkey", res["key"], path="/")
            response.add_header('Set-Cookie', "email=\""+res["email"]+"\"; Path=/; SameSite=None; Secure")
            response.add_header('Set-Cookie', "sessionkey="+res["key"]+"; Path=/; SameSite=None; Secure")
            return {"success": True, "email": res["email"], "sessionkey": res["key"], "ske_username": res["ske_username"], "ske_apiKey": res["ske_apiKey"], "apiKey": res["apiKey"], "consent": res["consent"]}
    if request.cookies.email != "" and request.cookies.sessionkey != "":
        res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        if res["loggedin"]:
            return {"success": True, "email": res["email"], "sessionkey": request.cookies.sessionkey, "ske_username": res["ske_username"], "ske_apiKey": res["ske_apiKey"], "apiKey": res["apiKey"], "consent": res["consent"]}
    return {"success": False}

@post(siteconfig["rootPath"] + "logout.json")
@auth
def do_logout(user: User):
    ops.logout(user)
    response.delete_cookie("email", path="/")
    response.delete_cookie("sessionkey", path="/")
    return {"success": False}

@get(siteconfig["rootPath"] + "logout")
@auth
def logout(user: User):
    ops.logout(user)
    if not "Referer" in request.headers:
        referer = "/"
    elif re.search(r"/logout/$",request.headers["Referer"]):
        referer = "/"
    else:
        referer = request.headers["Referer"]
    response.delete_cookie("email", path="/")
    response.delete_cookie("sessionkey", path="/")
    return redirect(referer)

@post(siteconfig["rootPath"] + "verifytoken.json")
def verify_token():
    valid = ops.verifyToken(request.forms.token, request.forms.type)
    return {"success": valid}

@post(siteconfig["rootPath"] + "signup.json")
def send_signup():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.sendSignupToken(request.forms.email, client_ip)
    return {"success": res}

@post(siteconfig["rootPath"] + "createaccount.json")
def do_create_account():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.createAccount(request.forms.token, request.forms.password, client_ip)
    return {"success": res}

@post(siteconfig["rootPath"] + "forgotpwd.json")
def forgotpwd():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.sendToken(request.forms.email, client_ip)
    return {"success": res}

@post(siteconfig["rootPath"] + "recoverpwd.json")
def do_recover_pwd():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.resetPwd(request.forms.token, request.forms.password, client_ip)
    return {"success": res}

@get(siteconfig["rootPath"] + "makesuggest.json")
@auth
def makedict(user: User):
    return {"baseUrl": siteconfig['baseUrl'], "suggested": ops.suggestDictId()}

@post(siteconfig["rootPath"] + "make.json")
@auth
def makedictjson(user: User):
    res = ops.makeDict(request.forms.url, request.forms.template, request.forms.title, "", user["email"])
    return {"success": res, "url": request.forms.url}

@post(siteconfig["rootPath"]+"<dictID>/clone.json")
@authDict(["canConfig"])
def clonedict(dictID: str, user: User, dictDB: Connection, configs: Configs):
    res = ops.cloneDict(dictID, user["email"])
    res["dicts"] = ops.getDictsByUser(user["email"])
    return res

@post(siteconfig["rootPath"]+"<dictID>/destroy.json")
@authDict(["canConfig"])
def destroydict(dictID: str, user: User, dictDB: Connection, configs: Configs):
    res = ops.destroyDict(dictID)
    return {"success": res, "dicts": ops.getDictsByUser(user["email"])}

@post(siteconfig["rootPath"]+"<dictID>/move.json")
@authDict(["canConfig"])
def movedict(dictID: str, user: User, dictDB: Connection, configs: Configs):
    res = ops.moveDict(dictID, request.forms.url)
    return {"success": res}

@post(siteconfig["rootPath"] + "changepwd.json")
@auth
def changepwd(user: User):
    res = ops.changePwd(user["email"], request.forms.password)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeskeusername.json")
@auth
def changeskeusername(user: User):
    res = ops.changeSkeUserName(user["email"], request.forms.ske_userName)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeskeapi.json")
@auth
def changeskeapi(user: User):
    res = ops.changeSkeApiKey(user["email"], request.forms.ske_apiKey)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeoneclickapi.json")
@auth
def changeoneclickapi(user: User):
    res = ops.updateUserApiKey(user, request.forms.apiKey)
    return {"success": res}

@get(siteconfig["rootPath"] + "skelogin.json/<token>")
def skelogin(token: str):
    secret = siteconfig["sketchengineKey"]
    try:
        jwtdata = jwt.decode(token, secret, audience="lexonomy.eu", algorithms="HS256")
        user = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        res = ops.processJWT(user, jwtdata)
        if res["success"]:
            response.set_cookie("email", res["email"].lower(), path="/")
            response.set_cookie("sessionkey", res["key"], path="/")
            return redirect("/")
        else:
            response.set_cookie("jwt_error", str(res["error"]), path="/")
            return redirect("/")
    except Exception as e:
        return redirect("/")

@post(siteconfig["rootPath"] + "users/userlist.json")
@authAdmin
def userelist(user: User):
    res = ops.listUsers(request.forms.searchtext, request.forms.howmany)
    return {"success": True, "entries": res["entries"], "total": res["total"]}

@post(siteconfig["rootPath"] + "users/userupdate.json")
@authAdmin
def userupdate(user: User):
    res = ops.updateUser(request.forms.id, request.forms.content)
    return {"success": True, "id": res["email"], "content": res["xml"]}

@post(siteconfig["rootPath"] + "users/usercreate.json")
@authAdmin
def usercreate(user: User):
    res = ops.createUser(request.forms.content)
    return {"success": True, "id": res["entryID"], "content": res["adjustedXml"]}

@post(siteconfig["rootPath"] + "users/userdelete.json")
@authAdmin
def userdelete(user: User):
    res = ops.deleteUser(request.forms.id)
    return {"success": True, "id": request.forms.id}

@post(siteconfig["rootPath"] + "users/userread.json")
@authAdmin
def userread(user: User):
    res = ops.readUser(request.forms.id)
    if res["email"] == "":
        return {"success": False}
    else:
        return {"success": True, "id": res["email"], "content": res["xml"]}

@post(siteconfig["rootPath"] + "dicts/dictlist.json")
@authAdmin
def dictlist(user: User):
    res = ops.listDicts(request.forms.searchtext, request.forms.howmany)
    return {"success": True, "entries": res["entries"], "total": res["total"]}

@post(siteconfig["rootPath"] + "dicts/dictread.json")
@authAdmin
def dictread(user: User):
    res = ops.readDict(request.forms.id)
    if res["id"] == "":
        return {"success": False}
    else:
        return {"success": True, "id": res["id"], "content": res["xml"]}

@get(siteconfig["rootPath"]+"<dictID>/config.json")
def dictconfig(dictID: str):
    if not ops.dictExists(dictID):
        return {"success": False}
    else:
        user, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, ops.getDB(dictID))
        doctypes = [configs["xema"]["root"]] + list(configs["subbing"].keys())
        doctypes = list(set(doctypes))
        res = {"success": True, "publicInfo": {**configs["ident"], **configs["publico"]}, "userAccess": user["dictAccess"], "configs": {"xema": configs["xema"], "xemplate": configs["xemplate"], "kex": configs["kex"], "kontext": configs["kontext"], "subbing": configs["subbing"], "xampl": configs["xampl"], "thes": configs["thes"], "collx": configs["collx"], "defo": configs["defo"], "titling": configs["titling"], "flagging": configs["flagging"], "linking": configs["links"], "editing": configs["editing"], "metadata": configs["metadata"], "gapi": configs["gapi"]}, "doctype": configs["xema"]["root"], "doctypes": doctypes}
        res["publicInfo"]["blurb"] = ops.markdown_text(str(configs["ident"]["blurb"] or ""))
        return res

@get(siteconfig["rootPath"]+"<dictID>/doctype.json")
def dictconfig(dictID: str):
    if not ops.dictExists(dictID):
        return {"success": False}
    else:
        user, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, ops.getDB(dictID))
        doctypes = [configs["xema"]["root"]] + list(configs["subbing"].keys())
        doctypes = list(set(doctypes))
        res = {"success": True, "doctype": configs["xema"]["root"], "doctypes": doctypes, "userAccess": user["dictAccess"]}
        return res

@get(siteconfig["rootPath"]+"<dictID>/<entryID:re:\d+>/nabes.json")
def publicentrynabes(dictID: str, entryID: int):
    dictDB = ops.getDB(dictID)
    user, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, dictDB)
    nabes = ops.readNabesByEntryID(dictDB, dictID, entryID, configs)
    return {"nabes": nabes}

@get(siteconfig["rootPath"]+"<dictID>/<entryID:re:\d+>.xml")
def publicentryxml(dictID: str, entryID: int):
    if not ops.dictExists(dictID):
        return redirect("/")
    dictDB = ops.getDB(dictID)
    user, configs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, dictDB)
    if not configs["publico"]["public"]:
        return redirect("/"+dictID)
    if not "licence" in configs["publico"] or not siteconfig["licences"][configs["publico"]["licence"]]["canDownloadXml"]:
        return redirect("/"+dictID)
    res = ops.exportEntryXml(dictDB, dictID, entryID, configs, siteconfig["baseUrl"])
    if res["entryID"] == 0:
        return redirect("/"+dictID)
    response.content_type = "text/xml; charset=utf-8"
    return res["xml"]

@post(siteconfig["rootPath"]+"<dictID>/random.json")
def publicrandom(dictID: str):
    if not ops.dictExists(dictID):
        return redirect("/")
    dictDB = ops.getDB(dictID)
    configs = ops.readDictConfigs(dictDB)
    if not configs["publico"]["public"]:
        return {"more": False, "entries": []}
    res = ops.readRandoms(dictDB)
    return res

@post(siteconfig["rootPath"]+"<dictID>/randomone.json")
@authDict(["canConfig"])
def randomone(dictID: str, user: User, dictDB: Connection, configs: Configs):
    return ops.readRandomOne(dictDB, dictID, configs)

@get(siteconfig["rootPath"]+"<dictID>/download.xml")
@authDict(["canDownload"], True)
def downloadxml(dictID: str, user: User, dictDB: Connection, configs: Configs):
    clean = False
    if request.query.clean and request.query.clean == "true":
        clean = True
    response.content_type = "text/xml; charset=utf-8"
    #response.set_header("Content-Disposition", "attachment; filename="+dictID+".xml")
    return ops.export(dictID, dictDB, configs, clean)

@post(siteconfig["rootPath"]+"<dictID>/upload.html")
@authDict(["canUpload"])
def uploadhtml(dictID: str, user: User, dictDB: Connection, configs: Configs):
    import tempfile
    if not request.files.get("myfile"):
        return {"success": False}
    else:
        upload = request.files.get("myfile")
        uploadStart = str(datetime.datetime.utcnow())
        temppath = tempfile.mkdtemp()
        upload.save(temppath)
        filepath = os.path.join(temppath, upload.filename)
        if request.forms.purge == "on":
            ops.purge(dictDB, user["email"], { "uploadStart": uploadStart, "filename": filepath })
        return {"file": filepath,  "uploadStart": uploadStart, "success": True}

@get(siteconfig["rootPath"]+"<dictID>/import.json")
@authDict(["canUpload"])
def importjson(dictID: str, user: User, dictDB: Connection, configs: Configs):
    truncate = 0
    if request.query.truncate:
        truncate = int(request.query.truncate)
    if request.query.showErrors:
        response.content_type = "text/plain; charset=utf-8"
        response.set_header("Content-Disposition", "attachment; filename=error.log")
        return ops.showImportErrors(request.query.filename, truncate)
    else:
        return ops.importfile(dictID, request.query.filename, user["email"])

@post(siteconfig["rootPath"]+"<dictID>/<doctype>/entrylist.json")
@authDict(["canEdit"])
def entrylist(dictID: str, doctype: str, user: User, dictDB: Connection, configs: Configs):
    if request.forms.id:
        if request.forms.id == "last":
            entryID = ops.getLastEditedEntry(dictDB, user["email"])
            return {"success": True, "entryID": entryID}
        else:
            entries = ops.readEntries(dictDB, configs, int(request.forms.id))
            return {"success": True, "entries": entries}
    else:
        entryIds = ops.searchEntries(dictDB, configs, doctype, request.forms.searchtext, request.forms.modifier, request.forms.sortdesc)
        total = len(entryIds)
        howmany = int(request.forms.howmany) if request.forms.howmany else 100
        entryIds = entryIds[0:howmany]
        entries = ops.readEntries(dictDB, configs, entryIds, xml=False)
        return {"success": True, "entries": entries, "total": total}

@post(siteconfig["rootPath"]+"<dictID>/search.json")
def publicsearch(dictID: str):
    dictDB = ops.getDB(dictID)
    configs = ops.readDictConfigs(dictDB)
    if not configs["publico"]["public"]:
        return {"success": False}

    modifier = request.forms.modifier or "start"
    howmany = request.forms.howmany or 100
    searchtext = request.forms.searchtext
    doctype = configs['xema']['root']

    entryIds = ops.searchEntries(dictDB, configs, doctype, searchtext, modifier, False)
    total = len(entryIds)
    entryIds = entryIds[0:howmany]
    return {"success": True, "entries": ops.readEntries(dictDB, configs, entryIds, titlePlain=True), "total": total}


@post(siteconfig["rootPath"]+"<dictID>/configread.json")
@authDict(["canConfig"])
def configread(dictID: str, user: User, dictDB: Connection, configs: Configs):
    if request.forms.id == 'ske':
        config_data: Any = {'kex': configs['kex'], 'collx': configs['collx'], 'xampl': configs['xampl'], 'thes': configs['thes'], 'defo': configs['defo']}
    else:
        config_data = configs[request.forms.id]
    if request.forms.id == 'ident':
        config_data['langs'] = ops.get_iso639_1()
    if request.forms.id == 'titling':
        config_data['locales'] = ops.get_locales()
    return {"success": True, "id": request.forms.id, "content": config_data}

@post(siteconfig["rootPath"]+"<dictID>/configupdate.json")
@authDict(["canConfig"])
def configupdate(dictID: str, user: User, dictDB: Connection, configs: Configs):
    if request.forms.id == 'ske':
        adjustedJson = {}
        jsonData = json.loads(request.forms.content)
        adjustedJson['kex'], resaveNeeded = ops.updateDictConfig(dictDB, dictID, 'kex', jsonData['kex'])
        adjustedJson['xampl'], resaveNeeded = ops.updateDictConfig(dictDB, dictID, 'xampl', jsonData['xampl'])
        adjustedJson['collx'], resaveNeeded = ops.updateDictConfig(dictDB, dictID, 'collx', jsonData['collx'])
        adjustedJson['defo'], resaveNeeded = ops.updateDictConfig(dictDB, dictID, 'defo', jsonData['defo'])
        adjustedJson['thes'], resaveNeeded = ops.updateDictConfig(dictDB, dictID, 'thes', jsonData['thes'])
        resaveNeeded = False
    else:
        adjustedJson, resaveNeeded = ops.updateDictConfig(dictDB, dictID, request.forms.id, json.loads(request.forms.content))
    if request.forms.id == 'users':
        ops.notifyUsers(configs['users'], adjustedJson, configs['ident'], dictID)
    if resaveNeeded:
        configs = ops.readDictConfigs(dictDB)
        ops.resave(dictDB, dictID, configs)
    return {"success": True, "id": request.forms.id, "content": adjustedJson}

@post(siteconfig["rootPath"]+"<dictID>/autonumber.json")
@authDict(["canConfig"])
def autonumber(dictID: str, user: User, dictDB: Connection, configs: Configs):
    process = ops.addAutoNumbers(dictDB, dictID, request.forms.countElem, request.forms.storeElem)
    return {"success": True, "processed": process}

@post(siteconfig["rootPath"]+"<dictID>/autoimage.json")
@authDict(["canEdit"])
def autoimage(dictID: str, user: User, dictDB: Connection, configs: Configs):
    res = ops.autoImage(dictDB, dictID, configs, request.forms.addElem, request.forms.addNumber)
    return res

@get(siteconfig["rootPath"]+"<dictID>/autoimageprogress.json")
@authDict([])
def autoimagestatus(dictID: str, user: User, dictDB: Connection, configs: Configs):
    res = ops.autoImageStatus(dictDB, dictID, request.query.jobid)
    if not res:
        abort(400, "Invalid job")
    return res

@post(siteconfig["rootPath"]+"<dictID>/resave.json")
@authDict(["canEdit","canConfig","canUpload"])
def resavejson(dictID: str, user: User, dictDB: Connection, configs: Configs):
    count = 0
    stats = ops.getDictStats(dictDB)
    while count < stats["needUpdate"] and count <= 127:
        entry = dictDB.execute("select id, xml from entries where needs_update=1 limit 1").fetchone()
        ops.createEntry(dictDB, configs, entry["xml"], "system@lexonomy", entry["id"])
        count += 1
    return {"todo": ops.getDictStats(dictDB)["needUpdate"]}

@post(siteconfig["rootPath"] + "<dictID>/<doctype>/ontolex.api")
def ontolex(dictID: str, doctype: str):
    data = json.loads(request.body.getvalue().decode('utf-8'))
    if not data.get("email") or not data.get("apikey"):
        return {"success": False, "message": "missing email or api key"}
    user = ops.verifyUserApiKey(data["email"], data["apikey"])
    if not user["valid"]:
        return {"success": False}
    else:
        if data.get("search"):
            search = data["search"]
        else:
            search = ""
        dictDB = ops.getDB(dictID)
        configs = ops.readDictConfigs(dictDB)
        dictAccess = configs["users"].get(user["email"]) or user["email"] in siteconfig["admins"]
        if not dictAccess:
            return {"success": False}
        else:
            response.headers['Content-Type'] = "text/plain; charset=utf-8"
            return ops.listOntolexEntries(dictDB, dictID, configs, doctype, search)

@get(siteconfig["rootPath"] + "api")
def apitest():
    return redirect("/#/api")

@post(siteconfig["rootPath"] + "api/listLang")
def apilistlang():
    data = json.loads(request.body.getvalue().decode('utf-8'))
    user = ops.verifyUserApiKey(data["email"], data["apikey"])
    if not user["valid"]:
        return {"success": False}
    else:
        langs = ops.getLangList()
        return {"languages": langs, "success": True}

@post(siteconfig["rootPath"] + "api/listDict")
def apilistdict():
    data = json.loads(request.body.getvalue().decode('utf-8'))
    user = ops.verifyUserApiKey(data["email"], data["apikey"])
    if not user["valid"]:
        return {"success": False}
    else:
        dicts = ops.getDictList(data.get('lang'), data.get('withLinks'), True)
        return {"dictionaries": dicts, "success": True}

@post(siteconfig["rootPath"] + "api/listLinks")
def apilistlink():
    data = json.loads(request.body.getvalue().decode('utf-8'))
    user = ops.verifyUserApiKey(data["email"], data["apikey"])
    if not user["valid"]:
        return {"success": False, "msg": "invalid user"}
    else:
        if data.get('headword') and (data.get('sourceLanguage') or data.get('sourceDict')):
            dicts = ops.getLinkList(data.get('headword'), data.get('sourceLanguage'), data.get('sourceDict'), data.get('targetLanguage'))
            return {"links": dicts, "success": True}
        else:
            return {"success": False, "msg": "missing parameters"}

@get(siteconfig["rootPath"] + "push.api")
def pushtest():
    return redirect("/#/api")

@app.route(siteconfig["rootPath"] + "push.api", 'OPTIONS')
def pushapioptions():
    return {}

@post(siteconfig["rootPath"] + "push.api")
def pushapi():
    data = json.loads(request.body.getvalue().decode('utf-8'))
    user = ops.verifyUserApiKey(data["email"], data["apikey"])
    if not user["valid"]:
        return {"success": False}
    else:
        if data["command"] == "makeDict":
            dictID = ops.suggestDictId()
            dictTitle = re.sub(r"^\s+", "", data["dictTitle"])
            if dictTitle == "":
                dictTitle = dictID
            dictBlurb = data["dictBlurb"]
            poses = []
            labels = []
            if "poses" in data:
                poses = data["poses"]
            if "labels" in data:
                labels = data["labels"]
            if data.get("format") == "teilex0":
                dictFormat = "teilex0"
            else:
                dictFormat = "push"
            res = ops.makeDict(dictID, dictFormat, dictTitle, dictBlurb, user["email"])
            if not res:
                return {"success": False}
            else:
                if dictFormat == "push":
                    dictDB = ops.getDB(dictID)
                    configs = ops.readDictConfigs(dictDB)
                    if configs["xema"]["elements"].get("partOfSpeech"):
                        for pos in poses:
                            configs["xema"]["elements"]["partOfSpeech"]["values"].append({"value": pos, "caption": ""})
                    if configs["xema"]["elements"].get("collocatePartOfSpeech"):
                        for pos in poses:
                            configs["xema"]["elements"]["collocatePartOfSpeech"]["values"].append({"value": pos, "caption":""})
                    if configs["xema"]["elements"].get("label"):
                        for label in labels:
                            configs["xema"]["elements"]["label"]["values"].append({"value":label, "caption": ""})
                    ops.updateDictConfig(dictDB, dictID, "xema", configs["xema"])
                return {"success": True, "dictID": dictID}
        elif data["command"] == "listDicts":
            dicts = ops.getDictsByUser(user["email"])
            return {"entries": dicts, "success": True}
        elif data["command"] == "createEntries":
            dictID = data["dictID"]
            entryXmls = data["entryXmls"]
            dictDB = ops.getDB(dictID)
            configs = ops.readDictConfigs(dictDB)
            dictAccess = configs["users"].get(user["email"])
            if dictAccess and (dictAccess["canEdit"] or dictAccess["canUpload"]):
                for entry in entryXmls:
                    if data.get("format") == "teilex0":
                        entry = ops.preprocessLex0(entry)
                    ops.createEntry(dictDB, configs, None, entry, user["email"], {"apikey": data["apikey"]})
                return {"success": True}
            else:
                return {"success": False}
        else:
            return {"success": False}

@get(siteconfig["rootPath"]+"publicdicts.json")
def publicdicts():
    dicts = ops.getPublicDicts()
    user = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if user["loggedin"] and user["isAdmin"]:
        [dic.update({'isAdmin': True}) for dic in dicts]
    return {"entries": dicts, "success": True}

@get(siteconfig["rootPath"] + "<dictID>/links/add")
@authDict(["canEdit"])
def linksadd(dictID, user, dictDB, configs):
    source_dict = dictID
    source_el = request.query.source_el
    source_id = request.query.source_id
    target_dict = request.query.target_dict
    target_el = request.query.target_el
    target_id = request.query.target_id
    confidence = request.query.confidence
    if source_dict == "" or source_id == "" or target_dict == "" or target_id == "" or source_el == "" or target_el == "":
        return {"success": False, "error": "missing parameters"}
    else:
        res = ops.links_add(source_dict, source_el, source_id, target_dict, target_el, target_id, confidence)
        return {"success": True, "links": res}

@get(siteconfig["rootPath"] + "<dictID>/links/delete/<linkID>")
@authDict(["canEdit"])
def linksdelete(dictID, linkID, user, dictDB, configs):
    res = ops.links_delete(dictID, linkID)
    return {"success": res}

@get(siteconfig["rootPath"] + "<dictID>/links.json")
@authDict([])
def linksdict(dictID, user, dictDB, configs):
    resto = ops.links_get(dictID, '', '', '', '', '')
    resfrom = ops.links_get('', '', '', dictID, '', '')
    return {"links": {"to": resto, "from": resfrom}}

@get(siteconfig["rootPath"] + "<dictID>/links/from")
@authDict([])
def linksfrom(dictID, user, dictDB, configs):
    source_el = request.query.source_el
    source_id = request.query.source_id
    target_dict = request.query.target_dict
    target_el = request.query.target_el
    target_id = request.query.target_id
    res = ops.links_get(dictID, source_el, source_id, target_dict, target_el, target_id)
    return {"links": res}

@get(siteconfig["rootPath"] + "<dictID>/links/to")
@authDict([])
def linksto(dictID, user, dictDB, configs):
    source_dict = request.query.source_dict
    source_el = request.query.source_el
    source_id = request.query.source_id
    target_el = request.query.target_el
    target_id = request.query.target_id
    res = ops.links_get(source_dict, source_el, source_id, dictID, target_el, target_id)
    return {"links": res}

@get(siteconfig["rootPath"]+"<dictID>/linkablelist.json")
@authDict([])
def linkablelist(dictID, user, dictDB, configs):
    res = ops.getDictLinkables(dictDB)
    return {"links": res}

@get(siteconfig["rootPath"]+"<dictID>/linknaisc.json")
@authDict([])
def linkNaisc(dictID, user, dictDB, configs):
    otherdictID = request.query.otherdictID
    if dictID == otherdictID:
        abort(400, "Linking dictionary to the same dictionary does not make any sense")
    try:
        otherconn = ops.getDB(otherdictID)
    except IOError:
        abort(404, "No such dictionary")
    _res, otherconfigs = ops.verifyLoginAndDictAccess(request.cookies.email, request.cookies.sessionkey, otherconn)
    res = ops.linkNAISC(dictDB, dictID, configs, otherconn, otherdictID, otherconfigs)
    return res

@get(siteconfig["rootPath"]+"<dictID>/naiscprogress.json")
@authDict([])
def checkNaisc(dictID, user, dictDB, configs):
    res = ops.getNAISCstatus(dictDB, dictID, request.query.otherdictID, request.query.jobid)
    if not res:
        abort(400, "Invalid job")
    return res

@get(siteconfig["rootPath"]+"<dictID>/linking.json")
@authDict([])
def linking(dictID, user, dictDB, configs):
    return ops.isLinking(dictDB)

@get(siteconfig["rootPath"]+"<dictID>/entrylinks.json")
@authDict([])
def entrylinks(dictID, user, dictDB, configs):
    res = ops.getEntryLinks(dictDB, dictID, request.query.id)
    return {"links": res}

@post(siteconfig["rootPath"] + "changefavdict.json")
@auth
def changefavdict(user):
    res = ops.changeFavDict(user['email'], request.forms.dictId, request.forms.status)
    return {"success": res}

@get(siteconfig["rootPath"]+"<dictID>")
def publicdict(dictID):
    if ops.dictExists(dictID):
        return redirect("/#" + dictID)
    else:
        return redirect("/")

@get(siteconfig["rootPath"]+"<dictID>/<entryID:re:\d+>")
def publicentry(dictID, entryID):
    if ops.dictExists(dictID):
        return redirect("/#" + dictID + '/' + entryID)
    else:
        return redirect("/")

@get(siteconfig["rootPath"]+"<dictID>/edit")
def dictedit(dictID):
    if ops.dictExists(dictID):
        return redirect("/#" + dictID + '/edit')
    else:
        return redirect("/")

@get(siteconfig["rootPath"]+"<dictID>/edit/<doctype>")
def dicteditdoc(dictID, doctype):
    if ops.dictExists(dictID):
        return redirect("/#" + dictID + '/edit/' + doctype)
    else:
        return redirect("/")

@get(siteconfig["rootPath"]+"docs/intro")
def docintro():
    return redirect("/#docs/intro")

# ELEXIS REST API https://elexis-eu.github.io/elexis-rest/
@get(siteconfig["rootPath"] + "dictionaries")
def elexlistdict():
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    else:
        dicts = list(map(lambda h: h['id'], ops.getDictList(None, None)))
        return {"dictionaries": dicts}

@get(siteconfig["rootPath"] + "about/<dictID>")
def elexaboutdict(dictID):
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    dictinfo = ops.elexisDictAbout(dictID)
    if dictinfo is None:
        abort(404, "Dictionary not found (identifier not known)")
    else:
        return dictinfo

@get(siteconfig["rootPath"] + "list/<dictID>")
def elexlistlemma(dictID):
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    lemmalist = ops.elexisLemmaList(dictID, request.query.limit, request.query.offset)
    if lemmalist is None:
        abort(404, "Dictionary not found (identifier not known)")
    else:
        return json.dumps(lemmalist)

@get(siteconfig["rootPath"] + "lemma/<dictID>/<headword>")
def elexgetlemma(dictID, headword):
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    lemmalist = ops.elexisGetLemma(dictID, headword, request.query.limit, request.query.offset)
    if lemmalist is None:
        abort(404, "Dictionary not found (identifier not known)")
    else:
        return json.dumps(lemmalist)

@get(siteconfig["rootPath"] + "tei/<dictID>/<entryID>")
def elexgetentry(dictID, entryID):
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    entry = ops.elexisGetEntry(dictID, entryID)
    if entry is None:
        abort(404, "No Entry Available")
    else:
        response.content_type = "text/xml; charset=utf-8"
        return entry

@get(siteconfig["rootPath"] + "json/<dictID>/<entryID>")
def elexgetentry(dictID, entryID):
    apikey = request.headers["X-API-KEY"]
    user = ops.verifyUserApiKey("", apikey)
    if not user["valid"]:
        abort(403, "Forbidden (API key not specified or not valid")
    entry = ops.elexisConvertTei(ops.elexisGetEntry(dictID, entryID))
    if entry is None:
        abort(404, "No Entry Available")
    else:
        return entry

@error(404)
def error404(error):
    if request.path.startswith("/about/") or request.path.startswith("/list/") or request.path.startswith("/lemma/") or request.path.startswith("/tei/") or request.path.startswith("/json/"):
        return error.body
    else:
        return redirect("/#/e404")

# deployment
debug=False
if "DEBUG" in os.environ:
    debug=True
if ":" in my_url:
    host, port = my_url.split(":")
elif siteconfig.get("port") and siteconfig["port"] > 0:
    host = my_url
    port = siteconfig["port"]
else:
    host = my_url
    port = 3000
if cgi: # we are called as CGI script
    run(host=host, port=port, debug=debug, server="cgi")
else: # run a standalone server, prefer the paste server if available over the builtin one
    try:
        import paste
        run(host=host, port=port, debug=debug, reloader=debug, server='paste', interval=0.1)
    except ImportError:
        run(host=host, port=port, debug=debug, reloader=debug, interval=0.1)

