/*! xslt v0.8.0+master.0.a112fb6468a6 | (c) 2017 Justin Murray | built on 2017-04-14 */
/*https://github.com/murrayju/xslt*/

(function() {
  var slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  (function(root, factory) {
    root.xslt = factory();
  })(this, function() {
    var $xslt, activeXSupported, buildElementString, cleanRootNamespaces, cleanupXmlNodes, collapseEmptyElements, createDomDoc, createXSLTemplate, defaults, docToStr, expandCollapsedElements, getAttrVal, getAttributes, getHeader, getHeaderEncoding, getHeaderStandalone, hasXmlHeader, isXml, loadOptions, manualCreateElement, needsHeader, newDocument, prependHeader, regex, strToDoc, stripAllNamespaces, stripDuplicateAttributes, stripHeader, stripNamespacedNamespace, stripNullNamespaces, tryCreateActiveX, xmlHeader;
    regex = {
      xmlNode: function() {
        return /<([a-z_][a-z_0-9:\.\-]*\b)\s*(?:\/(?!>)|[^>\/])*(\/?)>/i;
      },
      xmlLike: function() {
        return /^\s*</;
      },
      xmlHeader: function() {
        return /^\s*<\?xml\b[^<]+/i;
      },
      namespaces: function() {
        return /\bxmlns(?::([a-z0-9:\-]+))?\s*=\s*"([^"]*)"/ig;
      }
    };
    isXml = function(str) {
      return regex.xmlLike().test(str);
    };
    hasXmlHeader = function(str) {
      return regex.xmlHeader().test(str);
    };
    needsHeader = function(str) {
      return isXml(str) && !hasXmlHeader(str);
    };
    xmlHeader = function(encoding, standalone) {
      var str;
      str = '<?xml version="1.0" ';
      if (encoding != null) {
        str += "encoding=\"" + encoding + "\" ";
      }
      if (standalone != null) {
        str += "standalone=\"" + standalone + "\" ";
      }
      str += '?>';
      return str;
    };
    prependHeader = function(str, encoding, standalone) {
      return xmlHeader(encoding, standalone) + str;
    };
    stripHeader = function(str) {
      return str != null ? str.replace(regex.xmlHeader(), '') : void 0;
    };
    getHeader = function(str) {
      var match, ref;
      match = str != null ? str.match(regex.xmlHeader()) : void 0;
      return ((match != null ? match.length : void 0) && ((ref = match[0]) != null ? typeof ref.trim === "function" ? ref.trim() : void 0 : void 0)) || null;
    };
    getAttrVal = function(node, attrName) {
      var match;
      match = (new RegExp('\\b' + attrName + '\\s*=\\s*"([^"]*)"', 'g')).exec(node);
      return ((match != null ? match.length : void 0) > 1 && match[1]) || null;
    };
    getHeaderEncoding = function(str) {
      return getAttrVal(getHeader(str), 'encoding');
    };
    getHeaderStandalone = function(str) {
      return getAttrVal(getHeader(str), 'standalone');
    };
    activeXSupported = (typeof ActiveXObject !== "undefined" && ActiveXObject !== null) || 'ActiveXObject' in window;
    tryCreateActiveX = function() {
      var i, id, len, objIds;
      objIds = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!activeXSupported) {
        return null;
      }
      for (i = 0, len = objIds.length; i < len; i++) {
        id = objIds[i];
        try {
          return new ActiveXObject(id);
        } catch (undefined) {}
      }
      return null;
    };
    createDomDoc = function() {
      var d;
      d = tryCreateActiveX.apply(null, ["Msxml2.FreeThreadedDOMDocument.6.0", "Msxml2.FreeThreadedDOMDocument.3.0", "Msxml2.FreeThreadedDOMDocument", "Microsoft.XMLDOM", "Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.5.0", "Msxml2.DOMDocument.4.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument"]);
      if (d != null) {
        d.async = false;
        while (d.readyState !== 4) {
          null;
        }
      }
      return d;
    };
    createXSLTemplate = function() {
      return tryCreateActiveX.apply(null, ['Msxml2.XSLTemplate.6.0', 'Msxml2.XSLTemplate']);
    };
    manualCreateElement = function() {
      var res, xml;
      xml = document.createElement('xml');
      xml.src = xmlHeader();
      document.body.appendChild(xml);
      res = xml.XMLDocument;
      document.body.removeChild(xml);
      return res;
    };
    newDocument = function() {
      var d, ref;
      d = null;
      if (d == null) {
        d = createDomDoc();
      }
      if (typeof DOMParser !== "undefined" && DOMParser !== null) {
        return d;
      }
      if (d == null) {
        d = manualCreateElement();
      }
      if (d == null) {
        d = (ref = document.implementation) != null ? typeof ref.createDocument === "function" ? ref.createDocument("", 'test', null) : void 0 : void 0;
      }
      return d;
    };
    strToDoc = function(str) {
      var d, ref, ref1, ref2, ref3;
      if ((typeof str !== 'string') || !isXml(str)) {
        return null;
      }
      if (needsHeader(str)) {
        str = prependHeader(str);
      }
      d = newDocument();
      if ((d != null) && 'loadXML' in d) {
        d.loadXML(str);
        if ((d.documentElement == null) || ((ref = d.parseError) != null ? ref.errorCode : void 0) !== 0) {
          throw new Error("loadXML error: " + d.parseError);
        }
      } else if ((d != null) && 'load' in d) {
        d.load(str);
      } else if (typeof DOMParser !== "undefined" && DOMParser !== null) {
        d = (ref1 = new DOMParser()) != null ? typeof ref1.parseFromString === "function" ? ref1.parseFromString(str, 'text/xml') : void 0 : void 0;
        if ((d != null ? typeof d.getElementsByTagName === "function" ? (ref2 = d.getElementsByTagName('parsererror')) != null ? ref2.length : void 0 : void 0 : void 0) > 0 || (d != null ? (ref3 = d.documentElement) != null ? ref3.nodeName : void 0 : void 0) === 'parsererror') {
          throw new Error("Failed to load document from string:\r\n" + d.documentElement.textContent);
        }
      }
      return d;
    };
    docToStr = function(doc) {
      var ref, xml;
      if (doc == null) {
        return null;
      }
      xml = (typeof doc) === 'string' ? doc : (doc != null ? doc.xml : void 0) != null ? doc.xml : typeof XMLSerializer !== "undefined" && XMLSerializer !== null ? (ref = new XMLSerializer()) != null ? typeof ref.serializeToString === "function" ? ref.serializeToString(doc) : void 0 : void 0 : null;
      if ((xml != null ? typeof xml.indexOf === "function" ? xml.indexOf("<transformiix::result") : void 0 : void 0) >= 0) {
        xml = xml.substring(xml.indexOf(">") + 1, xml.lastIndexOf("<"));
      }
      return xml;
    };
    getAttributes = function(node, excludeFn) {
      var all, attrRegex, attrs, innerA, innerB, name, outer, parts, val;
      attrRegex = /\s([a-z0-9:\-]+)\s*=\s*("([^"]*)"|'([^']*)')/gi;
      attrs = {};
      while (parts = attrRegex.exec(node)) {
        all = parts[0], name = parts[1], outer = parts[2], innerA = parts[3], innerB = parts[4];
        val = {
          outer: outer,
          inner: innerA || innerB
        };
        if (!(typeof excludeFn === "function" ? excludeFn(name, val) : void 0)) {
          attrs[name] = val;
        }
      }
      return attrs;
    };
    buildElementString = function(nodeName, attrs, closeTag) {
      var elStr, name, val;
      if (attrs == null) {
        attrs = {};
      }
      if (closeTag == null) {
        closeTag = '';
      }
      elStr = "<" + nodeName;
      for (name in attrs) {
        val = attrs[name];
        elStr += " " + name + "=" + val.outer;
      }
      elStr += closeTag + ">";
      return elStr;
    };
    cleanRootNamespaces = function(node, nodeName, closeTag, opt) {
      var attName, attrs, name, ns, ref, uri, val;
      attrs = getAttributes(node, function(name, val) {
        var ref;
        return /^xmlns/.test(name) && (ref = val.inner, indexOf.call(opt.excludedNamespaceUris, ref) >= 0);
      });
      ref = opt.includeNamespaces;
      for (ns in ref) {
        uri = ref[ns];
        if (indexOf.call((function() {
          var results;
          results = [];
          for (name in attrs) {
            val = attrs[name];
            results.push(val.inner);
          }
          return results;
        })(), uri) < 0) {
          attName = 'xmlns';
          if (ns.length) {
            attName += ":" + ns;
          }
          attrs[attName] = {
            outer: "\"" + uri + "\"",
            inner: uri
          };
        }
      }
      return buildElementString(nodeName, attrs, closeTag);
    };
    stripDuplicateAttributes = function(node, nodeName, closeTag, blacklist) {
      var attrs;
      if (blacklist == null) {
        blacklist = [];
      }
      attrs = getAttributes(node, function(name, val) {
        var ref;
        return ref = val.inner, indexOf.call(blacklist, ref) >= 0;
      });
      return buildElementString(nodeName, attrs, closeTag);
    };
    stripNullNamespaces = function(node) {
      return node.replace(/xmlns\s*=\s*""/gi, '');
    };
    stripAllNamespaces = function(node) {
      return node.replace(regex.namespaces(), '');
    };
    stripNamespacedNamespace = function(node) {
      var i, len, num, nums;
      nums = [];
      node = node.replace(/xmlns:NS([0-9]+)=""/gi, function(match, num) {
        nums.push(num);
        return '';
      });
      for (i = 0, len = nums.length; i < len; i++) {
        num = nums[i];
        node = node.replace(new RegExp("NS" + num + ":xmlns:", "g"), "xmlns:");
      }
      return node;
    };
    cleanupXmlNodes = function(xml, opt) {
      var isRootNode, namespaceBlacklist;
      namespaceBlacklist = [];
      isRootNode = true;
      return xml != null ? xml.replace(new RegExp(regex.xmlNode().source, 'gi'), function(node, nodeName, closeTag) {
        var i, len, name, ref, rootNamespaces, uri, val;
        if (opt.removeNamespacedNamespace) {
          node = stripNamespacedNamespace(node);
        }
        if (opt.removeNullNamespace) {
          node = stripNullNamespaces(node);
        }
        if (opt.removeAllNamespaces) {
          node = stripAllNamespaces(node);
        }
        if (isRootNode) {
          isRootNode = false;
          node = cleanRootNamespaces(node, nodeName, closeTag, opt);
          rootNamespaces = getAttributes(node, function(name) {
            return !/^xmlns/.test(name);
          });
          namespaceBlacklist = (function() {
            var results;
            results = [];
            for (name in rootNamespaces) {
              val = rootNamespaces[name];
              results.push(val.inner);
            }
            return results;
          })();
          ref = opt.excludedNamespaceUris;
          for (i = 0, len = ref.length; i < len; i++) {
            uri = ref[i];
            namespaceBlacklist.push(uri);
          }
        } else {
          if (opt.removeDupAttrs || opt.removeDupNamespace) {
            node = stripDuplicateAttributes(node, nodeName, closeTag, namespaceBlacklist);
          }
        }
        return node;
      }) : void 0;
    };
    collapseEmptyElements = function(xml) {
      return xml != null ? xml.replace(/<(([a-z_][a-z_0-9:\.\-]*\b)\s*(?:\/(?!>)|[^>\/])*)><\/\2>/gi, function(all, element) {
        return "<" + element + "/>";
      }) : void 0;
    };
    expandCollapsedElements = function(xml) {
      return xml != null ? xml.replace(/<(([a-z_][a-z_0-9:\.\-]*\b)\s*(?:\/(?!>)|[^>\/])*)\/>/gi, function(all, element, name) {
        return "<" + element + "></" + name + ">";
      }) : void 0;
    };
    defaults = {
      fullDocument: false,
      cleanup: true,
      xmlHeaderInOutput: true,
      normalizeHeader: true,
      encoding: 'UTF-8',
      preserveEncoding: false,
      collapseEmptyElements: true,
      expandCollapsedElements: false,
      removeDupNamespace: true,
      removeDupAttrs: true,
      removeNullNamespace: true,
      removeAllNamespaces: false,
      removeNamespacedNamespace: true,
      includeNamespaces: {},
      excludedNamespaceUris: []
    };
    loadOptions = function(options) {
      var opt, p;
      opt = {};
      for (p in defaults) {
        opt[p] = defaults[p];
      }
      if (options != null) {
        for (p in options) {
          opt[p] = options[p];
        }
      }
      return opt;
    };
    $xslt = function(xmlStr, xsltStr, options) {
      var opt, outStr, processor, ref, trans, xmlDoc, xslProc, xslt, xsltDoc;
      opt = loadOptions(options);
      xmlDoc = strToDoc(xmlStr);
      if (xmlDoc == null) {
        throw new Error('Failed to load the XML document');
      }
      xsltDoc = strToDoc(xsltStr);
      if (xsltDoc == null) {
        throw new Error('Failed to load the XSLT document');
      }
      if ((typeof XSLTProcessor !== "undefined" && XSLTProcessor !== null) && ((typeof document !== "undefined" && document !== null ? (ref = document.implementation) != null ? ref.createDocument : void 0 : void 0) != null)) {
        processor = new XSLTProcessor();
        processor.importStylesheet(xsltDoc);
        trans = opt.fullDocument ? processor.transformToDocument(xmlDoc) : processor.transformToFragment(xmlDoc, document);
      } else if ('transformNode' in xmlDoc) {
        trans = xmlDoc.transformNode(xsltDoc);
      } else if (activeXSupported) {
        xslt = createXSLTemplate();
        xslt.stylesheet = xsltDoc;
        xslProc = xslt.createProcessor();
        xslProc.input = xmlDoc;
        xslProc.transform();
        trans = xslProc.output;
      }
      outStr = docToStr(trans);
      if (opt.preserveEncoding) {
        opt.encoding = getHeaderEncoding(outStr) || getHeaderEncoding(xmlStr) || opt.encoding;
      }
      if (opt.cleanup) {
        outStr = $xslt.cleanup(outStr, opt);
      }
      return outStr;
    };
    $xslt.cleanup = function(outStr, options) {
      var opt, standalone;
      opt = loadOptions(options);
      if (!opt.cleanup) {
        return;
      }
      if (opt.preserveEncoding) {
        opt.encoding = getHeaderEncoding(outStr) || opt.encoding;
      }
      standalone = getHeaderStandalone(outStr);
      if (opt.normalizeHeader || !opt.xmlHeaderInOutput) {
        outStr = stripHeader(outStr);
      }
      if (opt.xmlHeaderInOutput && needsHeader(outStr)) {
        outStr = prependHeader(outStr, opt.encoding, standalone);
      }
      outStr = cleanupXmlNodes(outStr, opt);
      if (opt.collapseEmptyElements && !opt.expandCollapsedElements) {
        outStr = collapseEmptyElements(outStr);
      }
      if (opt.expandCollapsedElements && !opt.collapseEmptyElements) {
        outStr = expandCollapsedElements(outStr);
      }
      return outStr;
    };
    return $xslt;
  });

}).call(this);

//# sourceMappingURL=xslt.js.map
