# Libxmljs-mt
[![Build Status](https://secure.travis-ci.org/gagern/libxmljs.svg?branch=master)](http://travis-ci.org/gagern/libxmljs)

This project is a fork of [libxmljs](https://github.com/libxmljs/libxmljs).
The current version 0.18.0 is based on libxmljs 0.18.0 and libxml 2.9.4.

Libxmljs was originally designed with single-threaded operations in mind.
There are no asynchroneous operations for things like parsing XML documents.
But even more importantly, since the embedded [libxml](http://xmlsoft.org/)
was configured only for single-threaded use, no other package
could build on this to provide multi-threaded operations using libxml.
The issue is discussed at length in upstream
[issue 296](https://github.com/libxmljs/libxmljs/issues/296).

This package here adds multi-threading support to libxmljs.
It does offer a method to asynchroneously parse an XML file using

```js
libxmljs.fromXmlAsync(buffer, options, function callback(err, doc) {…});
```

and it can be used by other packages to provide
more advanced asynchroneous operations.
To do so, the code has to construct a `libxmljs::WorkerParent` object
on the V8 thread and then a `libxmljs::WorkerSentinel` on the worker thread.
Both of these are RAII sentinels, so they do some setup in their constructor
and some cleaning up in their destructor.
Getting their lifetime right is important.
When using nan, it's easiest to make the `WorkerParent` a member
of the class derived from `NanAsyncWorker`
and have a `WorkerSentinel` variable in the `Execute` method of that class.

It is to be hoped that this fork is a temporary solution,
and that the original libxmljs project will adapt
either this solution or a similar one to become usable in a multi-threaded way.
But the corresponding bug report has remained open for too long,
and even though there was some very valuable discussion going on,
there were also long spans with no activity at all.
It is hard to tell when this fork will become obsolete, if ever.

Note that this project makes use of a git submodule for the libxml code,
so if you are building from a git checkout you might have to perform
`git submodule update --init` before you can do `npm install`.

Below comes the documentation from the original project,
with only slight modifications where appropriate.

-----

# Libxmljs
LibXML bindings for [node.js](http://nodejs.org/)

```javascript
var libxmljs = require("libxmljs-mt");
var xml =  '<?xml version="1.0" encoding="UTF-8"?>' +
           '<root>' +
               '<child foo="bar">' +
                   '<grandchild baz="fizbuzz">grandchild content</grandchild>' +
               '</child>' +
               '<sibling>with content!</sibling>' +
           '</root>';

var xmlDoc = libxmljs.parseXml(xml);

// xpath queries
var gchild = xmlDoc.get('//grandchild');

console.log(gchild.text());  // prints "grandchild content"

var children = xmlDoc.root().childNodes();
var child = children[0];

console.log(child.attr('foo').value()); // prints "bar"
```

## Support

* Docs - [http://github.com/libxmljs/libxmljs/wiki](http://github.com/libxmljs/libxmljs/wiki)
* Mailing list - [http://groups.google.com/group/libxmljs](http://groups.google.com/group/libxmljs)

## API and Examples

Check out the wiki [http://github.com/libxmljs/libxmljs/wiki](http://github.com/libxmljs/libxmljs/wiki).

See the [examples](https://github.com/gagern/libxmljs/tree/master/examples) folder.

## Installation via [npm](https://npmjs.org)

```shell
npm install libxmljs-mt
```

## Contribute

Start by checking out the open issues both for [the upstream project](https://github.com/libxmljs/libxmljs/issues?state=open) and the [multi-threaded fork](https://github.com/gagern/libxmljs/issues?state=open). Specifically the [desired feature](https://github.com/libxmljs/libxmljs/issues?labels=desired+feature&page=1&state=open) ones.

### Requirements

Make sure you have met the requirements for [node-gyp](https://github.com/TooTallNate/node-gyp#installation). You *do not* need to manually install node-gyp; it comes bundled with node.

