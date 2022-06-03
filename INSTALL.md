This page explains what you must do to set up a local installation of Lexonomy
on your own computer or adapt a version to run on a server.

# Preliminary remarks

Lexonomy's backend is written in [Python](https://python.org). That means that as of now you need
a working installation of Python >=3.9

You also need to download the source code from this repository into a directory
on your computer.

# Run Lexonomy

Whichever way you choose to run Lexonomy locally, with the default
configuration:
- An instance of Lexonomy will start at the address http://localhost:8000/
- You should be able to navigate to this address with your web browser and see
  Lexonomy's home page

## Prerequisites

- [Download and install Python](https://www.python.org/downloads/) 3.9+
- [Download and install the JWT module for Python3](https://github.com/jpadilla/pyjwt)
- [Download and install the LXML module for Python3](https://lxml.de/installation.html)
- [Download and install the Markdown module for Python3](https://python-markdown.github.io/)
- [Download and install NodeJS to build the frontend](https://nodejs.org/en/)

# Configuring your Lexonomy
The frontend configuration file is `website/config.js`. The most important setting is the URL of the backend configuration (as `window.API_URL`), which should in most cases be the same as `baseUrl` specified below. However, you can point Lexonomy frontend to an arbitrary backend installation.
You can also use this file to load the Vue-based graphical editor from webpack directly (during development, see inside the file for further instructions).

By default, backend configuration is located in the file `website/siteconfig.json`, however this can be changed by setting the `$LEXONOMY_SITECONFIG` environmental variable. This file contains some configuration options for your Lexonomy installation. Let's look at those options you will probably want to change at this stage.

- In your terminal, go to the `website` directory of the repository:
```sh
cd website
```

- Copy `siteconfig.json.template` to `siteconfig.json`; this is the backend configuration
```sh
cp siteconfig.json.template siteconfig.json
```

- Copy `config.js.template` to `config.js`; this is the frontend configuration
```sh
cp config.js.template config.js
```

- Build the frontend.
Lexonomy uses a combination of [https://riot.js.org/](Riot.js) for its menus, and [https://vuejs.org/](Vue) for the graphical xml editor.

```sh
make
```
It produces `website/dist`, containing the necessary javascript and css files for the general Lexonomy interface and the editor.
Alternaltively the following commands perform a manual build:
```sh
cd website
npm install
cd editor 
npm install
cd ..
npm run build
```

During development it is also possible to automatically have the frontend rebuild on change by running `npm run watch`. To enable this for the Graphical Editor, you should enable the webpack url in `website/config.js`.

# Backend configuration

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
sudo python3 lexonomy.py
```

## Data directory

```js
"dataDir": "../data/"
```

This is the path to the `data` folder where Lexonomy will store all its data, including (importantly) all the dictionaries. Note that the directory name does not have to be `data`, it can be anything you want.

If the path given here is relative, it is interpreted relatively to the web application's current directory (= the `website` directory). It can also be an absolute path, eg. `/home/joebloggs/lexonomydata/`.

Upon start, Lexonomy creates three subdirectories automatically:

- `dicts` – a directory with individual dictionaries, each being an SQLite database,
- `uploads` – a directory for temporary storage of user-uploaded imports,
- `sqlite_tmp` – a directory that SQLite will use as its temporary directory.

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
python3 adminscripts/init.py
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

# Upgrading to newer versions

You should generally be able to upgrade by copying new files over and running an update script to upgrade DB schemas. The upgrade script is idempotent so you may run it at any time or multiple times with no harm:

```sh
python3 adminscripts/updates.py
```
