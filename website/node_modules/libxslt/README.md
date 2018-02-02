node-libxslt
============

[![Build status](https://travis-ci.org/albanm/node-libxslt.svg)](https://travis-ci.org/albanm/node-libxslt)
[![Code Climate](https://codeclimate.com/github/albanm/node-libxslt/badges/gpa.svg)](https://codeclimate.com/github/albanm/node-libxslt)
[![NPM version](https://badge.fury.io/js/libxslt.svg)](http://badge.fury.io/js/libxslt)

Node.js bindings for [libxslt](http://xmlsoft.org/libxslt/) compatible with [libxmljs](https://github.com/polotek/libxmljs/issues/226).

Installation
------------

    npm install libxslt

From source:

    git clone https://github.com/albanm/node-libxslt.git
		git submodule update --init
		npm install
		npm test

Basic usage
-----------

```js
var libxslt = require('libxslt');

libxslt.parse(stylesheetString, function(err, stylesheet){
  var params = {
    MyParam: 'my value'
  };

  // 'params' parameter is optional
  stylesheet.apply(documentString, params, function(err, result){
    // err contains any error from parsing the document or applying the stylesheet
    // result is a string containing the result of the transformation
  });  
});
```

Libxmljs integration
--------------------

Node-libxslt depends on [libxmljs](https://github.com/polotek/libxmljs/issues/226) in the same way that [libxslt](http://xmlsoft.org/libxslt/) depends on [libxml](http://xmlsoft.org/). This dependancy makes possible to bundle and to load in memory libxml only once for users of both libraries.

The libxmljs module required by node-libxslt is exposed as ```require('libxslt').libxmljs```. This prevents depending on libxmljs twice which is not optimal and source of weird bugs.

It is possible to work with libxmljs documents instead of strings:

```js
var lixslt = require('libxslt');
var libxmljs = libxslt.libxmljs;

var stylesheetObj = libxmljs.parseXml(stylesheetString, { nocdata: true });
var stylesheet = libxslt.parse(stylesheetObj);

var document = libxmljs.parseXml(documentString);
stylesheet.apply(document, function(err, result){
  // result is now a libxmljs document containing the result of the transformation
});

```

This is only useful if you already needed to parse a document before applying the stylesheet for previous manipulations.
Or if you wish to be returned a document instead of a string for ulterior manipulations.
In these cases you will prevent extraneous parsings and serializations.

Includes
--------

XSL includes are supported but relative paths must be given from the execution directory, usually the root of the project.

Includes are resolved when parsing the stylesheet by libxml. Therefore the parsing task becomes IO bound, which is why you should not use synchronous parsing when you expect some includes.

Sync or async
-------------

The same *parse()* and *apply()* functions can be used in synchronous mode simply by removing the callback parameter.
In this case if a parsing error occurs it will be thrown.

```js
var lixslt = require('libxslt');

var stylesheet = libxslt.parse(stylesheetString);

var result = stylesheet.apply(documentString);

```

The asynchronous functions use the [libuv work queue](http://nikhilm.github.io/uvbook/threads.html#libuv-work-queue)
to provide parallelized computation in node.js worker threads. This makes it non-blocking for the main event loop of node.js.

Note that libxmljs parsing doesn't use the work queue, so only a part of the process is actually parallelized.

A small benchmark is available in the project. It has a very limited scope, it uses always the same small transformation a few thousand times.
To run it use:

    node benchmark.js

This is an example of its results with an intel core i5 3.1GHz:

```
10000 synchronous parse from parsed doc                in 52ms = 192308/s
10000 asynchronous parse in series from parsed doc     in 229ms = 43668/s
10000 asynchronous parse in parallel from parsed doc   in 56ms = 178571/s
10000 synchronous apply from parsed doc                in 329ms = 30395/s
10000 asynchronous apply in series from parsed doc     in 569ms = 17575/s
10000 asynchronous apply in parallel from parsed doc   in 288ms = 34722/s

```

Observations:
  - it's pretty fast !
  - asynchronous is slower when running in series.
  - asynchronous can become faster when concurrency is high.

Conclusion:
  - use asynchronous by default it will be kinder to your main event loop and is pretty fast anyway.
  - use synchronous only if you really want the highest performance and expect low concurrency.
  - of course you can also use synchronous simply to reduce code depth. If you don't expect a huge load it will be ok.
  - DO NOT USE synchronous parsing if there is some includes in your XSL stylesheets.

Environment compatibility
-------------------------

For now 64bits linux and 32bits windows are confirmed. Other environments are probably ok, but not checked. Please report an issue if you encounter some difficulties.

Node-libxslt depends on [node-gyp](https://github.com/TooTallNate/node-gyp), you will need to meet its requirements. This can be a bit painful mostly for windows users. The node-gyp version bundled in your npm will have to be greater than 0.13.0, so you might have to follow [these instructions to upgrade](https://github.com/TooTallNate/node-gyp/wiki/Updating-npm's-bundled-node-gyp). There is no system dependancy otherwise, libxslt is bundled in the project.

API Reference
=============
  Node.js bindings for libxslt compatible with libxmljs

<a name="module_libxslt.libxmljs"></a>
### libxslt.libxmljs
The libxmljs module. Prevents the need for a user's code to require it a second time. Also prevent weird bugs.

**Kind**: static property of <code>[libxslt](#module_libxslt)</code>  
<a name="module_libxslt.parse"></a>
### libxslt.parse(source, [callback]) ⇒ <code>Stylesheet</code>
Parse a XSL stylesheet

If no callback is given the function will run synchronously and return the result or throw an error.

**Kind**: static method of <code>[libxslt](#module_libxslt)</code>  
**Returns**: <code>Stylesheet</code> - Only if no callback is given.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> &#124; <code>Document</code> | The content of the stylesheet as a string or a [libxmljs document](https://github.com/polotek/libxmljs/wiki/Document) |
| [callback] | <code>parseCallback</code> | The callback that handles the response. Expects err and Stylesheet object. |

<a name="module_libxslt.parseFile"></a>
### libxslt.parseFile(sourcePath, callback)
Parse a XSL stylesheet

**Kind**: static method of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| sourcePath | <code>stringPath</code> | The path of the file |
| callback | <code>parseFileCallback</code> | The callback that handles the response. Expects err and Stylesheet object. |

<a name="module_libxslt..Stylesheet"></a>
### libxslt~Stylesheet
**Kind**: inner class of <code>[libxslt](#module_libxslt)</code>  

* [~Stylesheet](#module_libxslt..Stylesheet)
    * [new Stylesheet(stylesheetDoc, stylesheetObj)](#new_module_libxslt..Stylesheet_new)
    * [.apply(source, [params], [options], [callback])](#module_libxslt..Stylesheet+apply) ⇒ <code>string</code> &#124; <code>Document</code>
    * [.applyToFile(sourcePath, [params], [options], callback)](#module_libxslt..Stylesheet+applyToFile)

<a name="new_module_libxslt..Stylesheet_new"></a>
#### new Stylesheet(stylesheetDoc, stylesheetObj)
A compiled stylesheet. Do not call this constructor, instead use parse or parseFile.

store both the source document and the parsed stylesheet
if we don't store the stylesheet doc it will be deleted by garbage collector and it will result in segfaults.


| Param | Type | Description |
| --- | --- | --- |
| stylesheetDoc | <code>Document</code> | XML document source of the stylesheet |
| stylesheetObj | <code>Document</code> | Simple wrapper of a libxslt stylesheet |

<a name="module_libxslt..Stylesheet+apply"></a>
#### stylesheet.apply(source, [params], [options], [callback]) ⇒ <code>string</code> &#124; <code>Document</code>
Apply a stylesheet to a XML document

If no callback is given the function will run synchronously and return the result or throw an error.

**Kind**: instance method of <code>[Stylesheet](#module_libxslt..Stylesheet)</code>  
**Returns**: <code>string</code> &#124; <code>Document</code> - Only if no callback is given. Type is the same as the source param.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> &#124; <code>Document</code> | The XML content to apply the stylesheet to given as a string or a [libxmljs document](https://github.com/polotek/libxmljs/wiki/Document) |
| [params] | <code>object</code> | Parameters passed to the stylesheet ([http://www.w3schools.com/xsl/el_with-param.asp](http://www.w3schools.com/xsl/el_with-param.asp)) |
| [options] | <code>applyOptions</code> | Options |
| [callback] | <code>applyCallback</code> | The callback that handles the response. Expects err and result of the same type as the source param passed to apply. |

<a name="module_libxslt..Stylesheet+applyToFile"></a>
#### stylesheet.applyToFile(sourcePath, [params], [options], callback)
Apply a stylesheet to a XML file

**Kind**: instance method of <code>[Stylesheet](#module_libxslt..Stylesheet)</code>  

| Param | Type | Description |
| --- | --- | --- |
| sourcePath | <code>string</code> | The path of the file to read |
| [params] | <code>object</code> | Parameters passed to the stylesheet ([http://www.w3schools.com/xsl/el_with-param.asp](http://www.w3schools.com/xsl/el_with-param.asp)) |
| [options] | <code>applyOptions</code> | Options |
| callback | <code>applyToFileCallback</code> | The callback that handles the response. Expects err and result as string. |

<a name="module_libxslt..parseCallback"></a>
### libxslt~parseCallback : <code>function</code>
Callback to the parse function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type |
| --- | --- |
| [err] | <code>error</code> |
| [stylesheet] | <code>Stylesheet</code> |

<a name="module_libxslt..parseFileCallback"></a>
### libxslt~parseFileCallback : <code>function</code>
Callback to the parseFile function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type |
| --- | --- |
| [err] | <code>error</code> |
| [stylesheet] | <code>Stylesheet</code> |

<a name="module_libxslt..applyOptions"></a>
### libxslt~applyOptions
Options for applying a stylesheet

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| outputFormat | <code>String</code> | Force the type of the output, either 'document' or 'string'. Default is to use the type of the input. |
| noWrapParams | <code>boolean</code> | If true then the parameters are XPath expressions, otherwise they are treated as strings. Default is false. |

<a name="module_libxslt..applyCallback"></a>
### libxslt~applyCallback : <code>function</code>
Callback to the Stylesheet.apply function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [err] | <code>error</code> | Error either from parsing the XML document if given as a string or from applying the styleshet |
| [result] | <code>string</code> &#124; <code>Document</code> | Result of the same type as the source param passed to apply |

<a name="module_libxslt..applyToFileCallback"></a>
### libxslt~applyToFileCallback : <code>function</code>
Callback to the Stylesheet.applyToFile function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [err] | <code>error</code> | Error either from reading the file, parsing the XML document or applying the styleshet |
| [result] | <code>string</code> |  |

*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.
