#!/usr/bin/python3

import os
import sys
import functools
import ops
import re
import jwt
from ops import siteconfig

from bottle import (hook, route, get, post, run, template, error, request,
                    response, static_file, abort, redirect, install)

# configuration
my_url = "localhost:8000"
nodejs_url = siteconfig["baseUrl"].split("://")[1].rstrip("/")
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
    if sys.argv[1] in ["-h", "--help"] or len(sys.argv) != 3:
        print("Usage: %s SERVER:PORT LEXONOMY:PORT, which default to %s and %s" % (sys.argv[0], my_url, nodejs_url), file=sys.stderr)
        print(sys.argv, file=sys.stderr)
        sys.exit(1)
    my_url = sys.argv[1]
    nodejs_url = sys.argv[2]

# serve static files
@route('/<path:re:(widgets|furniture|libs).*>')
def server_static(path):
    return static_file(path, root="./")

# we propagate redirects from NodeJS back to client
import urllib.request
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
opener = urllib.request.build_opener(NoRedirect)
hop_by_hop = set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"])

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
def authDict(checkRights):
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
def auth(func):
    @functools.wraps(func)
    def wrapper_verifyLogin(*args, **kwargs):
        res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        if not res["loggedin"]:
            redirect("/")
        kwargs["user"] = res
        return func(*args, **kwargs)
    return wrapper_verifyLogin

@post(siteconfig["rootPath"] + "<dictID>/entrydelete.json")
@authDict(["canEdit"])
def entrydelete(dictID, user, dictDB, configs):
    ops.deleteEntry(dictDB, request.forms.id, user["email"])
    return {"success": True, "id": request.forms.id}

@post(siteconfig["rootPath"]+"<dictID>/entryread.json")
@authDict([])
def entryread(dictID, user, dictDB, configs):
    adjustedEntryID, xml, _title = ops.readEntry(dictDB, configs, request.forms.id)
    adjustedEntryID = int(adjustedEntryID)
    html = ""
    if xml:
        if configs["xemplate"].get("_xsl"):
            import lxml.etree as ET
            dom = ET.XML(xml.encode("utf-8"))
            xslt = ET.XML(configs["xemplate"]["_xsl"].encode("utf-8"))
            html = str(ET.XSLT(xslt)(dom))
        elif configs["xemplate"].get("_css"):
            html = xml
    return {"success": (adjustedEntryID > 0), "id": adjustedEntryID, "content": xml, "contentHtml": html}

@get(siteconfig["rootPath"] + "consent")
@auth
def consent(user):
    return template("consent.tpl", **{"user": user, "siteconfig": siteconfig})

@post(siteconfig["rootPath"] + "consent.json")
@auth
def save_consent(user):
    res = ops.setConsent(user["email"], request.forms.consent)
    return {"success": res}

@get(siteconfig["rootPath"] + "skeget/corpora")
@auth
def skeget_corpora(user):
    req = urllib.request.Request("https://api.sketchengine.eu/ca/api/corpora?username" + request.query.username,
                                  headers = {"Authorization": "Bearer " + request.query.apikey})
    return urllib.request.urlopen(req)

@get(siteconfig["rootPath"] + "login")
def login():
    res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if res["loggedin"]:
        return redirect("/")
    if not "Referer" in request.headers:
        referer = "/"
    elif re.search(r"/login/$",request.headers["Referer"]):
        referer = "/"
    else:
        referer = request.headers["Referer"]
    return template("login.tpl", **{"siteconfig": siteconfig, "redirectUrl": referer})

@post(siteconfig["rootPath"] + "login.json")
def check_login():
    res = ops.login(request.forms.email, request.forms.password)
    if res["success"]:
        response.set_cookie("email", res["email"], path="/")
        response.set_cookie("sessionkey", res["key"], path="/")
        return {"success": True, "sessionkey": res["key"]}
    else:
        return {"success": False}
    
@get(siteconfig["rootPath"] + "logout")
@auth
def logout(user):
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

@get(siteconfig["rootPath"] + "signup")
def signup():
    res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if res["loggedin"]:
        return redirect("/")
    return template("signup.tpl", **{"siteconfig": siteconfig, "redirectUrl": "/"})

@post(siteconfig["rootPath"] + "signup.json")
def send_signup():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.sendSignupToken(request.forms.email, client_ip)
    return {"success": res}

@get(siteconfig["rootPath"] + "createaccount/<token>")
def create_account(token):
    res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if res["loggedin"]:
        return redirect("/")
    valid = ops.verifyToken(token, "register")
    return template("createaccount.tpl", **{"siteconfig": siteconfig, "redirectUrl": "/", "token": token, "tokenValid": valid})

@post(siteconfig["rootPath"] + "createaccount.json")
def do_create_account():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.createAccount(request.forms.token, request.forms.password, client_ip)
    return {"success": res}

@get(siteconfig["rootPath"] + "forgotpwd")
def forgot():
    res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if res["loggedin"]:
        return redirect("/")
    return template("forgotpwd.tpl", **{"siteconfig": siteconfig, "redirectUrl": "/"})

@post(siteconfig["rootPath"] + "forgotpwd.json")
def forgotpwd():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.sendToken(request.forms.email, client_ip)
    return {"success": res}

@get(siteconfig["rootPath"] + "recoverpwd/<token>")
def recover_pwd(token):
    res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
    if res["loggedin"]:
        return redirect("/")
    valid = ops.verifyToken(token, "recovery")
    return template("recoverpwd.tpl", **{"siteconfig": siteconfig, "redirectUrl": "/", "token": token, "tokenValid": valid})

@post(siteconfig["rootPath"] + "recoverpwd.json")
def do_recover_pwd():
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR') or request.environ.get('REMOTE_ADDR')
    res = ops.resetPwd(request.forms.token, request.forms.password, client_ip)
    return {"success": res}

@get(siteconfig["rootPath"] + "userprofile")
@auth
def userprofile(user):
    if not "Referer" in request.headers:
        referer = "/"
    elif re.search(r"/userprofile/$",request.headers["Referer"]):
        referer = "/"
    else:
        referer = request.headers["Referer"]
    return template("userprofile.tpl", **{"siteconfig": siteconfig, "redirectUrl": referer, "user": user})

@get(siteconfig["rootPath"] + "make")
@auth
def makedict(user):
    return template("make.tpl", **{"siteconfig": siteconfig, "suggested": ops.suggestDictId(), "user": user})

@post(siteconfig["rootPath"] + "make.json")
@auth
def makedictjson(user):
    res = ops.makeDict(request.forms.url, request.forms.template, request.forms.title, "", user["email"])
    return {"success": res}

@post(siteconfig["rootPath"]+"<dictID>/clone.json")
@authDict(["canConfig"])
def clonedict(dictID, user, dictDB, configs):
    res = ops.cloneDict(dictID, user["email"])
    return res

@post(siteconfig["rootPath"]+"<dictID>/destroy.json")
@authDict(["canConfig"])
def destroydict(dictID, user, dictDB, configs):
    res = ops.destroyDict(dictID)
    return {"success": res}

@post(siteconfig["rootPath"]+"<dictID>/move.json")
@authDict(["canConfig"])
def movedict(dictID, user, dictDB, configs):
    res = ops.moveDict(dictID, request.forms.url)
    return {"success": res}

@post(siteconfig["rootPath"] + "changepwd.json")
@auth
def changepwd(user):
    res = ops.changePwd(user["email"], request.forms.password)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeskeusername.json")
@auth
def changeskeusername(user):
    res = ops.changeSkeUserName(user["email"], request.forms.ske_userName)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeskeapi.json")
@auth
def changeskeapi(user):
    res = ops.changeSkeApiKey(user["email"], request.forms.ske_apiKey)
    return {"success": res}

@post(siteconfig["rootPath"] + "changeoneclickapi.json")
@auth
def changeoneclickapi(user):
    res = ops.updateUserApiKey(user, request.forms.apiKey)
    return {"success": res}

@get(siteconfig["rootPath"] + "skelogin.json/<token>")
def skelogin(token):
    secret = siteconfig["sketchengineKey"]
    print(token, secret)
    try:
        jwtdata = jwt.decode(token, secret, audience="lexonomy.eu")
        user = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        res = ops.processJWT(user, jwtdata)
        if res["success"]:
            response.set_cookie("email", res["email"].lower(), path="/")
            response.set_cookie("sessionkey", res["key"], path="/")
            return redirect("/")
        else:
            print(res["error"])
            response.set_cookie("jwt_error", str(res["error"]), path="/")
            return redirect("/")
    except Exception as e:
        print(str(e))
        response.set_cookie("jwt_error", str(e), path="/")
        return redirect("/")

@get(siteconfig["rootPath"] + "docs/<file>")
def getdoc(file):
    resDoc = ops.getDoc(file)
    if resDoc:
        res = ops.verifyLogin(request.cookies.email, request.cookies.sessionkey)
        return template("doc.tpl", **{"siteconfig": siteconfig, "user": res, "doc": resDoc})
    else:
        return static_file("/docs/"+file, root="./")    
    

# anything we don't know we forward to NodeJS
nodejs_pid = None
@error(404)
def nodejs(error):
    url = "http://" + nodejs_url + request.path
    if request.query_string:
        url += "?%s" % request.query_string
    req = urllib.request.Request(url, headers=request.headers)
    if request.method == "POST":
        req.method = "POST"
        req.data = request.body
    try:
        res = opener.open(req)
    except urllib.error.HTTPError as e:
        res = e
    except urllib.error.URLError:
        print("----------- need to start NodeJS server -----------", file=sys.stderr)
        import subprocess, time
        global nodejs_pid
        nodejs_pid = subprocess.Popen(["node","run.js",my_base_url], start_new_session=True).pid
        time.sleep(5) # give it some time to come up
        res = opener.open(req)
    response.status = res.status
    for h, v in res.getheaders():
        if h.lower() not in hop_by_hop:
            response.add_header(h, v)
    return res

# deployment
debug=False
if "DEBUG" in os.environ:
    debug=True
host, port = my_url.split(":")
if cgi: # we are called as CGI script
    run(host=host, port=port, debug=debug, server="cgi")
else: # run a standalone server, prefer the paste server if available over the builtin one
    try:
        import paste
        run(host=host, port=port, debug=debug, reloader=debug, server='paste', interval=0.1)
    except ImportError:
        run(host=host, port=port, debug=debug, reloader=debug, interval=0.1)
    if nodejs_pid: # if we started NodeJS, we kill it now too
        import signal
        os.killpg(os.getpgid(nodejs_pid), signal.SIGTERM)

