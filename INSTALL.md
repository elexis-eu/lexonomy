This page explains what you must do to set up a local installation of Lexonomy
on your own computer or adapt a version to run on a server.

# Preliminary remarks

Lexonomy's backend is written in [Node.js](https://nodejs.org/en/) and currently being
rewritten into [Python](https://python.org). That means that as of now you need a working instalation
of Node and Python 3.

You also need to download the source code from this repository into a directory
on your computer.


# Run Lexonomy locally

Whichever way you choose to run Lexonomy locally, with the default
configuration:
- An instance of Lexonomy will start at the address http://localhost:8000/, this starts
  the Python backend and that will start the Node backend automatically too (the startup
  takes about five seconds).
- You should be able to navigate to this address with your web browser and see
  Lexonomy's home page

## Inside a docker environment

Bootstrapping a local development environment in docker has (so far) only been
tested on Linux. Most likely this also works for MacOS - and most likely does
*not* work for Windows.

### Prerequisites
- [docker](https://docs.docker.com/install/) 17.09.0+
- [docker-compose](https://docs.docker.com/compose/install/) 1.17.0+  
  The two need to accept `version: '3.4'` [docker-compose
  files](https://docs.docker.com/compose/compose-file/compose-versioning/#version-34)
- make

### Punch it

```bash
$ make
docker volume create nodemodules
nodemodules
docker-compose run --rm dev npm install --unsafe-perm=true

> lexonomy@ postinstall /opt/service/website
> node adminscripts/init.js

Connected to ../data/lexonomy.sqlite database.
[...]
audited 649 packages in 2.509s
found 0 vulnerabilities

docker-compose run --rm dev pip install -r requirements.txt
[...]
Installing collected packages: bottle, express, six, Paste
Successfully installed Paste-3.0.8 bottle-0.12.16 express-1.0 six-1.12.0
[...]
docker-compose run --rm --service-ports dev
Bottle v0.13-dev server starting up (using WSGIRefServer())...
Listening on http://0.0.0.0:8000/
Hit Ctrl-C to quit.
```


## Inside a user environment

### Prerequisites

- [Download and install Node.js](https://nodejs.org/en/download/).
- [Download and install Python 3](https://www.python.org/downloads/)
- [Download and install xsltproc](http://xmlsoft.org/XSLT/xsltproc.html)
- In your terminal, go to the `website` directory of the repository:
```sh
cd website
```

- Copy `siteconfig.json.template` to `siteconfig.json`
```sh
cp siteconfig.json.template siteconfig.json
```

- Install all modules that Lexonomy depends on with this (basic database and
  default user setup is also done during this step):
```
npm install
```

- Initialize database and admin user:
```
node ./adminscripts/init.js
```

### Punch it
In your terminal and in the `website` directory, start Lexonomy with this:
```sh
python3 lexonomy.py
```

# Configuring your Lexonomy (for a server installation)

By default, configuration is located in the file `website/siteconfig.json`, however this can be changed by setting the `$LEXONOMY_SITECONFIG` environmental variable. This file contains some configuration options for your Lexonomy installation. Let's look at those options you will probably want to change at this stage.

## Base URL

```js
"baseUrl": "http://localhost:8080/"
```

This is the URL at which your Lexonomy installation is visible to web browsers. For reasons we will not go into now, Lexonomy needs to know that this URL is.

- For Lexonomy's “home” installation this is `https://www.lexonomy.eu/`.

- If you are testing a local installation on your own desktop computer then this is `http://localhost/`.

- If you are setting up your own installation on a web server somewhere then this should be any URL, such as `http://www.mylexonomy.com/`.

Make sure the path (ie. the final forward slash) is included. If your installation of Lexonomy is meant to be accessible from the Internet at a URL that contains a path, such as `http://www.example.com/mylexonomy/`, then make sure to include the path `/mylexonomy/` in the URL too.

## Root path

```js
"rootPath": "/"
```

This is the path at which Lexonomy listens for incoming HTTP requests on the server. Under normal circumstances this should be the same as the path at the end of your URL, for example `/` or `/mylexonomy/`. If, however, you have a proxy server which listens for HTTP requests at one URL and then forwards them to another, then the first URL should be the `baseUrl` and the second URL's path should be the `rootPath`.

## Port

```js
"port": 8080
```

This is the port number at which Lexonomy listens for incoming HTTP requests.

**Note:** When launched this way, Lexonomy runs on `port:8080`. To allow it to
run on a privileged port (<1024) like, for example on `port:80`, you need superuser permissions:
```bash
sudo node lexonomy.js
```

## Data directory

```js
"dataDir": "../data/"
```

This is the path to the `data` folder where Lexonomy will store all its data, including (importantly) all the dictionaries. Note that the directory name does not have to be `data`, it can be anything you want.

If the path given here is relative, it is interpreted relatively to the web application's current directory (= the `website` directory). It can also be an absolute path, eg. `/home/joebloggs/lexonomydata/`.

## Logging

```js
"verbose": false
```

If you set this to `true` Lexonomy will report each HTTP request (except requests for static files) to standard error output (= to the command line or terminal) – useful for debugging.

## Tracking code

```js
"trackingCode": ""
```

This is an HTML snippet which Lexonomy inserts into every public-facing web page. You can replace it with your own tracking code from Google Analytics, StatCounter or whatever other web analytics service you use, or leave it blank.

## Welcome message

```js
"welcome": "Welcome to your <a href='http://www.lexonomy.eu/'>Lexonomy</a> installation."
```

This is the welcome message displayed on the home page of your Lexonomy installation (left of the log-in box).

## Admin account(s)

```js
"admins": ["root@localhost"]
```  

This is an array of one or more e-mail addresses. People listed here are administrators: they can access everything in Lexonomy (including other people's dictionaries) and, after they log in, they will see options to create/change/delete user accounts, which other users don't see. You probably want to change this to your own e-mail address, like `joebloggs@example.com`.

# Initializing your application

Once you have updated `website/siteconfig.json` you need to run an initialization script to create user accounts for the administrators listed under `admins`. To do this, go to your terminal, go the `website` directory and run this:

```
node adminscripts/init.js
```

The script will tell you that it has created user accounts for the administrators and what their passwords are. You can use this information to log into your local installation of Lexonomy (and perhaps change the password then).

# Running your installation

Congratulations, your Lexonomy installation is now fully configured and ready to face the world. On this page, we have assumed you are running Lexonomy by typing `python3 lexonomy.py` into your terminal.

## Running a standalone server

```
python3 lexonomy.py
```

starts a standalone web server. If you have the [Paste](https://pythonpaste.readthedocs.io/en/latest/) Python module installed, it will use that one (it provides a multi-threaded web server). Otherwise it will use a Bottle builtin web server which is single-threaded. To manage the server in a Linux environment, you can use the provided [systemd unit file](website/docs/lexonomy.service)

## Running as CGI or WSGI inside of Apache

You can run Lexonomy inside Apache as CGI or WSGI. For the latter please refer to the relevant [Bottle](http://bottlepy.org) documentation (the Bottle app is WSGI-compatible), for the former you can get inspiration in the [configuration file](website/docs/lexonomy_httpd.conf) that is part of Lexonomy.

