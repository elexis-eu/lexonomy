#!/usr/bin/python3

from bottle import route, run, template, error, request, response, static_file
import os, sys, json

# configuration
my_url = "localhost:8000"
siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG", "siteconfig.json")))
nodejs_url = siteconfig["baseUrl"].split("://")[1] + ":" + str(siteconfig["port"])
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
        if "Location" in headers:
            old_url = headers["Location"]
            del headers["Location"] # must be like this :(
            headers["Location"] = old_url.replace(nodejs_url, my_url)
        return None
opener = urllib.request.build_opener(NoRedirect)
hop_by_hop = set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"])

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
        subprocess.Popen(["node","run.js"], start_new_session=True)
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

