#!/usr/bin/python3

from bottle import hook, route, get, post, run, template, error, request, response, static_file, abort, redirect
import os, sys, json, sqlite3, functools, ops
from ops import siteconfig

# configuration
my_url = "localhost:8000"
nodejs_url = siteconfig["baseUrl"].split("://")[1].rstrip("/")
cgi = False
if "SERVER_NAME" in os.environ and "SERVER_PORT" in os.environ:
    my_url = os.environ["SERVER_NAME"] + ":" + os.environ["SERVER_PORT"]
    cgi = True

# command-line arguments (unless CGI)
if not cgi and len(sys.argv) > 1:
    if sys.argv[1] in ["-h", "--help"] or len(sys.argv) != 3:
        print("Usage: %s SERVER:PORT LEXONOMY:PORT, which default to %s and %s" % (sys.argv[0], my_url, nodejs_url), file=sys.stderr)
        print(sys.argv, file=sys.stderr)
        sys.exit(1)
    my_url = sys.argv[1]
    nodejs_url = sys.argv[2]

# serve static files
@route('/<path:re:(widgets|furniture|libs|docs).*>')
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

# authentication decorator
# use @authDict(["canEdit", "canConfig", "canUpload", "canDownload"]) before any handler
# to ensure that user has appropriate access to the dictionary. Empty list checks read access only.
# assumes <dictID> in route and "user", "dictDB", "configs" as parameters in the decorated function
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
            del kwargs["dictID"]
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
def entrydelete(user, dictDB, configs):
    ops.deleteEntry(dictDB, request.forms.id, user["email"])
    return {"success": True, "id": request.forms.id}

@post(siteconfig["rootPath"]+"<dictID>/entryread.json")
@authDict([])
def entryread(user, dictDB, configs):
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

@get(siteconfig["rootPath"] + "skeget/corpora")
@auth
def skeget_corpora(user):
    req = urllib.request.Request("https://api.sketchengine.eu/ca/api/corpora?username" + request.query.username,
                                  headers = {"Authorization": "Bearer " + request.query.apikey})
    return urllib.request.urlopen(req)

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
        nodejs_pid = subprocess.Popen(["node","run.js"], start_new_session=True).pid
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
    run(host=host, port=port, debug=debug, reloader=debug, server='cgi', interval=0.1)
else: # run a standalone server, prefer the paste server if available over the builtin one
    try:
        import paste
        run(host=host, port=port, debug=debug, reloader=debug, server='paste', interval=0.1)
    except ModuleNotFoundError:
        run(host=host, port=port, debug=debug, reloader=debug, interval=0.1)
    if nodejs_pid: # if we started NodeJS, we kill it now too
        import signal
        os.killpg(os.getpgid(nodejs_pid), signal.SIGTERM)

