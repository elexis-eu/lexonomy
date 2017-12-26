XmlSplit
========

[![Build Status](https://travis-ci.org/remuslazar/node-xmlsplit.svg?branch=master)](https://travis-ci.org/remuslazar/node-xmlsplit)

Abstract
--------

This utility helps you dealing with (very) large XML input files, splitting them
into smaller chunks of valid XML files, which can be processed sequentially (in memory)
using e.g. libxmljs.


Motivation
----------

Performance.

There are other (very useful) libs available, like

* https://github.com/assistunion/xml-stream
* https://github.com/StevenLooman/saxpath

to name a few, because of the xml parsing behind the scenes, the performance is
not quite good enough for some applications.

To handle the XML parsing part, plain JavaScript Strings and methods (.slice, split)
are being used, for obvious reasons.

API
---

Initialize a new object

```
var xmlsplit = new XmlSplit(batchSize=1, tagName=<autodetect>)
```

and use the
[stream.Transform API](https://nodejs.org/api/stream.html#stream_class_stream_transform_1)
to pass your XML data through.

By default, it splits children of the root, but the tag name can be specified
with the constructor's second argument.

The optional batchSize argument sets the number of items in each XML document.

The awesome [Stream Handbook](https://github.com/substack/stream-handbook) covers
the basics of Node.js Stream and is a "must read"..


Example
-------

An example XML input file could look something like

```
<?xml version = '1.0' encoding = 'UTF-8'?>
<product_export  date="2015-06-19">
    <product id=1> ... </product>
    <product id=2> ... </product>
    ...
</product_export>
```

Using this code snippet:

```
var XmlSplit = require('./lib/xmlsplit.js')

var xmlsplit = new XmlSplit()
var inputStream = fs.createReadStream() // from somewhere

inputStream.pipe(xmlsplit).on('data', function(data) {
    var xmlDocument = data.toString()
    // do something with xmlDocument ..
})
```

You will get a full valid XML document on each iteration:

```
<?xml version = '1.0' encoding = 'UTF-8'?>
<product_export  date="2015-06-19">
    <product id=1> ... </product>
</product_export>
```

```
<?xml version = '1.0' encoding = 'UTF-8'?>
<product_export  date="2015-06-19">
    <product id=2> ... </product>
</product_export>
```

License
-------

See [LICENSE.txt](LICENSE.txt)
