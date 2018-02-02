var fs = require('fs');

var should = require('should');

var libxslt = require('../index');

var stylesheetSource = fs.readFileSync('./test/resources/cd.xsl', 'utf8');
var docSource = fs.readFileSync('./test/resources/cd.xml', 'utf8');
var stylesheetIncludeSource = fs.readFileSync('./test/resources/xslinclude.xsl', 'utf8');
var stylesheetBadIncludeSource = fs.readFileSync('./test/resources/xslbadinclude.xsl', 'utf8');
var stylesheetBadParamSource = fs.readFileSync('./test/resources/xslbadparam.xsl', 'utf8');
var doc2Source = fs.readFileSync('./test/resources/collection.xml', 'utf8')

describe('node-libxslt', function() {
	describe('synchronous parse function', function() {
		it('should parse a stylesheet from a libxslt.libxmljs xml document', function() {
			var stylesheetDoc = libxslt.libxmljs.parseXml(stylesheetSource);
			var stylesheet = libxslt.parse(stylesheetDoc);
			stylesheet.should.be.type('object');
		});
		it('should parse a stylesheet from a xml string', function() {
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.should.be.type('object');
		});
		it('should parse a stylesheet with a include from a xml string', function() {
			var stylesheetDoc = libxslt.libxmljs.parseXml(stylesheetIncludeSource);
			var stylesheetInclude = libxslt.parse(stylesheetDoc);
			stylesheetInclude.should.be.type('object');
		});
		it('should throw an error when parsing invalid stylesheet', function() {
			(function() {
				libxslt.parse('this is not a stylesheet!');
			}).should.throw();
		});
		it('should throw an error when parsing stylesheet with invalid include', function() {
			(function() {
				libxslt.parse(stylesheetBadIncludeSource);
			}).should.throw(/unable to load/);
		});
	});

	describe('parseFile function', function() {
		it('should parse a stylesheet from a file', function(callback) {
			libxslt.parseFile('./test/resources/cd.xsl', function(err, stylesheet) {
				stylesheet.should.be.type('object');
				callback(err);
			});
		});
	});

	describe('asynchronous parse function', function() {
		it('should parse a stylesheet from a libxslt.libxmljs xml document', function(callback) {
			var stylesheetDoc = libxslt.libxmljs.parseXml(stylesheetSource);
			libxslt.parse(stylesheetDoc, function(err, stylesheet) {
				stylesheet.should.be.type('object');
				callback(err);
			});
		});
		it('should parse a stylesheet from a xml string', function(callback) {
			libxslt.parse(stylesheetSource, function(err, stylesheet) {
				stylesheet.should.be.type('object');
				callback(err);
			});
		});
		it('should parse a stylesheet with a include from a xml string', function(callback) {
			var stylesheetDoc = libxslt.libxmljs.parseXml(stylesheetIncludeSource);
			libxslt.parse(stylesheetDoc, function(err, stylesheet) {
				stylesheet.should.be.type('object');
				callback(err);
			});
		});
		it('should return an error when parsing invalid stylesheet', function(callback) {
			libxslt.parse('this is not a stylesheet!', function(err) {
				should.exist(err);
				callback();
			});
		});
		it('should throw an error when parsing stylesheet with invalid include', function(callback) {
			libxslt.parse(stylesheetBadIncludeSource, function(err) {
				should.exist(err);
				err.message.should.match(/unable to load/)
				callback();
			});
		})
	});

	describe('synchronous apply function', function() {
		it('should apply a stylesheet to a libxslt.libxmljs xml document', function() {
			var doc = libxslt.libxmljs.parseXml(docSource);
			var stylesheet = libxslt.parse(stylesheetSource);
			var result = stylesheet.apply(doc);
			result.should.be.type('object');
			result.toString().should.match(/<td>Bob Dylan<\/td>/);
		});
		it('should apply a stylesheet to a libxslt.libxmljs xml document and force output as string', function() {
			var doc = libxslt.libxmljs.parseXml(docSource);
			var stylesheetDoc = libxslt.libxmljs.parseXml(stylesheetIncludeSource);
			var stylesheet = libxslt.parse(stylesheetSource);
			var result = stylesheet.apply(doc, {}, {outputFormat: 'string'});
			result.should.be.type('string');
			result.should.match(/<td>Bob Dylan<\/td>/);
		});
		it('should apply a stylesheet to a xml string', function() {
			var stylesheet = libxslt.parse(stylesheetSource);
			var result = stylesheet.apply(docSource);
			result.should.be.type('string');
			result.should.match(/<td>Bob Dylan<\/td>/);
		});
		it('should apply a stylesheet to a xml string and force output as document', function() {
			var stylesheet = libxslt.parse(stylesheetSource);
			var result = stylesheet.apply(docSource, {}, {outputFormat: 'document'});
			result.should.be.type('object');
			result.toString().should.match(/<td>Bob Dylan<\/td>/);
		});
		it('should apply a stylesheet with a parameter', function() {
			var stylesheet = libxslt.parse(stylesheetSource);
			var result = stylesheet.apply(docSource, {
				MyParam: 'MyParamValue'
			});
			result.should.be.type('string');
			result.should.match(/<p>My param: MyParamValue<\/p>/);
		});
		it('should apply a stylesheet with the same parameter multiple times', function() {
			var stylesheet = libxslt.parse(stylesheetSource);
			var params = {
				MyParam: 'MyParamValue'
			}
			var result = stylesheet.apply(docSource, params);
			result.should.be.type('string');
			result.should.match(/<p>My param: MyParamValue<\/p>/);
			result = stylesheet.apply(docSource, params);
			result.should.be.type('string');
			result.should.match(/<p>My param: MyParamValue<\/p>/);
		});
		/*it.only('should throw an error if it fails to apply stylesheet', function() {
			var stylesheet = libxslt.parse(stylesheetBadParamSource);
			(function() {
				result = stylesheet.apply('<data></data>');
				console.log(result);
			}).should.throw(/unable to load/);
		});*/
	});

	describe('asynchronous apply function', function() {
		it('should apply a stylesheet to a libxslt.libxmljs xml document', function(callback) {
			var doc = libxslt.libxmljs.parseXml(docSource);
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.apply(doc, function(err, result) {
				result.should.be.type('object');
				result.toString().should.match(/<td>Bob Dylan<\/td>/);
				callback();
			});
		});
		it('should apply a stylesheet to a libxslt.libxmljs xml document and force output as string', function(callback) {
			var doc = libxslt.libxmljs.parseXml(docSource);
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.apply(doc, {}, {outputFormat: 'string'}, function(err, result) {
				result.should.be.type('string');
				result.should.match(/<td>Bob Dylan<\/td>/);
				callback();
			});
		});
		it('should apply a stylesheet to a xml string', function(callback) {
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.apply(docSource, function(err, result) {
				result.should.be.type('string');
				result.should.match(/<td>Bob Dylan<\/td>/);
				callback();
			});
		});
		it('should apply a stylesheet to a xml string and force output as document', function(callback) {
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.apply(docSource, {}, {outputFormat: 'document'}, function(err, result) {
				result.should.be.type('object');
				result.toString().should.match(/<td>Bob Dylan<\/td>/);
				callback();
			});
		});
		it('should apply a stylesheet with a include to a xml string', function(callback) {
			var stylesheetInclude = libxslt.parse(stylesheetIncludeSource);
			stylesheetInclude.apply(doc2Source, function(err, result) {
				result.should.be.type('string');
				result.should.match(/Title - Lover Birds/);
				callback();
			});
		});
	});

	describe('applyToFile function', function() {
		it('should apply a stylesheet to a xml file', function(callback) {
			var stylesheet = libxslt.parse(stylesheetSource);
			stylesheet.applyToFile('./test/resources/cd.xml', function(err, result) {
				result.should.be.type('string');
				result.should.match(/<td>Bob Dylan<\/td>/);
				callback();
			});
		});
	});

	describe('disable-output-escaping attribute', function() {
		it('should be interpreted by a stylesheet', function() {
			var stylesheetStr = fs.readFileSync('test/resources/disable-output-escaping.xsl', 'utf8');
			var stylesheetEsc = libxslt.parse(stylesheetStr);
			var result = stylesheetEsc.apply('<root/>');
			result.should.match(/<foo\/>/);
			result.should.match(/&lt;bar\/&gt;/);
		});
	});

	describe('omit-xml-declaration directive', function() {
		it('should be respected by a stylesheet with output method text', function() {
			var data='<root><!-- comment on xml data --></root>';
			var stylesheetTextOut = libxslt.parse(fs.readFileSync('test/resources/omit-xml-declaration-text-out.xsl', 'utf8'));
			var result = stylesheetTextOut.apply(data);
			result.should.be.type('string');
			result.should.not.match(/\?xml/);
			result.should.match(/<foo\/>/);
			result.should.match(/<bar\/>/);
			result.should.not.match(/\<!-- comment/);
			result.should.not.match(/\<node/);
			result.should.match(/with text/);
	});

	it('should be respected by a stylesheet with output method xml', function() {
			var data='<root><!-- comment on xml data --></root>';
			var stylesheetXMLOut = libxslt.parse(fs.readFileSync('test/resources/omit-xml-declaration-xml-out.xsl', 'utf8'));
			var result = stylesheetXMLOut.apply(data);
			result.should.be.type('string');
			result.should.not.match(/\?xml/);
			result.should.match(/<foo\/>/);
			result.should.match(/&lt;bar\/&gt;/);
			result.should.not.match(/\<!-- comment/);
			result.should.match(/\<node/);
			result.should.match(/with text/);
		});
	});

	describe('implicitly omitted xml-declaration', function() {

		it('should be respected by a stylesheet with output method html', function() {
			var data='<root><strong></strong><!-- comment on xml data --></root>';
			var stylesheetHtmlOut = libxslt.parse(fs.readFileSync('test/resources/implicit-omit-xml-declaration-html-out.xsl', 'utf8'));
			var result = stylesheetHtmlOut.apply(data);
			result.should.be.type('string');
			result.should.not.match(/\?xml/);
			result.should.match(/<foo\/>/);
			result.should.match(/<strong><\/strong>/);
			result.should.match(/&lt;bar\/&gt;/);
			result.should.not.match(/\<!-- comment/);
			result.should.match(/\<node/);
			result.should.match(/with text/);
		});

		it('should be respected by a stylesheet with output method text', function() {
			var data='<root><strong>some text </strong><!-- comment on xml data --></root>';
			var stylesheetTextOut = libxslt.parse(fs.readFileSync('test/resources/implicit-omit-xml-declaration-text-out.xsl', 'utf8'));
			var result = stylesheetTextOut.apply(data);
			result.should.be.type('string');
			result.should.not.match(/\?xml/);
			result.should.match(/<foo\/>/);
			result.should.match(/<bar\/>/);
			result.should.not.match(/\<!-- comment/);
			result.should.not.match(/\<node/);
			result.should.not.match(/\<strong/);
			result.should.match(/some text with text/);
		});
	});

	describe('handle quotes in strings', function() {

		it('should avoid conflict with xpath single quote by using double-quotes', function() {
			var data='<root/>';
			var  xslDoc = libxslt.parse(fs.readFileSync('test/resources/handle-quotes-in-string-params.xsl', 'utf8'));
			var result = xslDoc.apply(data,{strParam:"/root/item[@id='123']"});
			result.should.match(/strParam:\/root\/item\[@id='123'\]/);
		});

	});

	describe('no params wrap', function() {

		it('should bypass parameter string wrap and deliver xpath expressions for nodesets', function() {
			var data='<root><item id="123">Ok 123</item><item id="321"/><other/></root>';
			var  xslDoc = libxslt.parse(fs.readFileSync('test/resources/use-xpath-params.xsl', 'utf8'));
			var result = xslDoc.apply(data,{at:"/root/item[@id='123']",testName:"'testing xpath selectors'"},{noWrapParams:true});
			result.should.match(/testing xpath selectors/);
			result.should.match(/#selected nodes:1/);
			result.should.match(/Node \[item id:123\] was selected./);
		});

	});

	describe('libexslt bindings', function(){
		it('should expose EXSLT functions', function(callback){
			var stylesheet = libxslt.parse(stylesheetSource);
			libxslt.parseFile('test/resources/min-value.xsl', function(err, stylesheet){
				should.not.exist(err);
				stylesheet.applyToFile('test/resources/values.xml', function(err, result){
					should.not.exist(err);
					result.should.match(/Minimum: 4/);
					callback();
				});
			});
		});
	});
});
