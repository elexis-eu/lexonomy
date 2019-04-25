This page explains what you must do to set up a local installation of Lexonomy
on your own computer or adapt a version to run on a server.

# Preliminary remarks

Lexonomy is written in [Node.js](https://nodejs.org/en/), which means it runs
on both Linux and Windows and you don't need to compile or build anything
(yourself). You do need an environment with a working `Node.JS executable`.

You also need to download the source code from this repository into a directory
on your computer.


# Run Lexonomy locally

Whichever way you choose to run Lexonomy locally, with the default
configuration:
- An instance of Lexonomy will start at the address http://localhost:8080/
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
make
```


## Inside a user environment

### Prerequisites

- [Download and install Node.js](https://nodejs.org/en/download/).
- Go into your copy of the repository and rename files as follows:  
  In the `website` directory, rename `siteconfig.json.template` to
  `siteconfig.json`.
- In your terminal, go to the `website` directory:
```sh
cd website
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
node lexonomy.js
```


#### Update and put to the right place: - Update the file siteconfig.json according to your needs (see below for details) and run script to 

## Short interlude: installing libxslt on Windows

One of the modules that will be installed on your computer when you run `npm install` is a module called libxslt. If you are installing the libxslt module on Windows, you may run into all sorts of complications. Here are some hints to get you through them.

- **Error MSB8036: The Windows SDK version 8.1...**: you need to install Windows SDK 8.1 first. For more information see [here](https://social.msdn.microsoft.com/Forums/en-US/4d035e42-0618-476b-b309-ae2673f14de4/the-windows-sdk-version-81-was-not-found-in-vs-2015-update-3?forum=vssetup) and [here](https://developer.microsoft.com/en-us/windows/downloads/sdk-archive).

- **Error TRK0005: Failed to locate: "CL.exe"**: you need to install Visual C++ first. For more information see [here](https://msdn.microsoft.com/en-IN/library/60k1461a.aspx).

- **Unresolved external symbol vsaprintf...**: you need to install an older version of libxslt instead of the latest one: `npm install libxslt@0.6.5`. For more information see [here](https://github.com/albanm/node-libxslt/issues/64) and [here](https://60devs.com/npm-install-specific-version.html).

# Configuring your installation

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
run on a port <1024 like, for example on `port:80`, on some Linuxes you will
likely have to run Lexonomy with a more priviledged user:
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

If you set this to `true` Lexonomy will report each HTTP request (except requests for static files) to standard output (= to the command line or terminal) – useful for debugging.

You can customize Lexonomy's logging behaviour further by setting `verbose` to an object with the following properties:

```js
"verbose": {
  "filename": "../log.txt",
  "multiline": true
}
```

If the `filename` property is not an empty string (or something else that's nullable) then Lexonomy will output the log into a file instead of standard output. The path given here can be absolute or relative, and if it is relative, it is interpreted relatively to the web application's current directory (= the `website` directory).

If the `multiline` property is `true` then each log entry will occupy several lines, with an empty line between entries. This is to make the log more easily readable. If it is `false` then each log entry will be a one-liner.

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

Congratulations, your Lexonomy installation is now fully configured and ready to face the world. On this page, we have assumed you are running Lexonomy by typing `node lexonomy.js` into your terminal, which is fine for testing on your own local machine, but not for production. Running a Node.js application in production, as a public-facing website, requires a bit more setting up. At the very least, you need a **process manager** to keep the application running for ever and restart it in case it crashes. Just search the web for something like "Node.js in production" and you will find plenty of instructions.

Most of the instructions you will find are relevant to Linux. But Lexonomy – like any Node.js application ­– can run on Windows too. Windows servers usually come with their own web server called IIS (Internet Information Server) and this web server can (be made to) play well with Node.js applications: just search the web for "Node.js IIS".

