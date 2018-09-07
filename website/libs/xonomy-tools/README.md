# Xonomy tools

Support tools for the [Xonomy](http://www.lexiconista.com/xonomy/) XML editor, used in [Lexonomy](https://www.lexonomy.eu/) dictionary platform.

## Conversion from DTD

Use existing DTD to get either Xonomy document specification, or Lexonomy entry structure (Xema).
At the moment, basic structure of elements and attributes is loaded from the DTD.
Conversion does not configure Xonomy/Lexonomy to validate complex entry structure (like children sequence or choice).

### Usage

Example HTML page is provided showing basic usage. Include `dtd2xonomy.js` either in webpage or as a node.js module.

First, get the DTD data as a string and let the script parse it:
```
var xmlStructure = parseDTD(dtdData);
```

In the next step, you can use the parsed structure to get Lexonomy entry structure (Xema). The function return JSON object:
```
var xema = struct2Xema(xmlStructure);
```

Or you can get the Xonomy document specification, as an object:
```
var spec = struct2Xonomy(xmlStructure);
```

For the Xonomy editor, or other use, you can get the initial XML document. This XML contains root element with required children elements:
```
var xmlDoc = initialDocument(xmlStructure);
```

