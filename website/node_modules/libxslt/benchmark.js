var fs = require('fs');
var async = require('async');
var libxmljs = require("libxmljs");
var libxslt = require('./index');

var stylesheetStr = fs.readFileSync('./test/resources/cd.xsl', 'utf8');
var stylesheetObj = libxmljs.parseXml(stylesheetStr);
var stylesheet = libxslt.parse(stylesheetObj);
var docStr = fs.readFileSync('./test/resources/cd.xml', 'utf8');
var docObj = libxmljs.parseXml(docStr);

var bench = function(name, iterations, f) {
	return function(callback) {
		var before = Date.now();
		f(iterations, function() {
			var duration = (Date.now() - before);
			console.log('%d %s in %dms = %d/s', iterations, name, duration, Math.round(iterations / (duration / 1000)));
			if (callback) callback();
		});
	};
};

var stylesheetSyncParsingStr = function(iterations, callback) {
	for (var i = 0; i < iterations; i++) {
		libxslt.parse(stylesheetStr);
	}
	callback();
};

var stylesheetSyncParsingObj = function(iterations, callback) {
	for (var i = 0; i < iterations; i++) {
		libxslt.parse(stylesheetObj);
	}
	callback();
};

var stylesheetAsyncSeriesParsingStr = function(iterations, callback) {
	var i = 0;
	async.eachSeries(new Array(iterations), function(u, callbackEach) {
		libxslt.parse(stylesheetStr, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback);
};

var stylesheetAsyncSeriesParsingObj = function(iterations, callback) {
	var i = 0;
	async.eachSeries(new Array(iterations), function(u, callbackEach) {
		libxslt.parse(stylesheetObj, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var stylesheetAsyncParallelParsingStr = function(iterations, callback) {
	var i = 0;
	async.eachLimit(new Array(iterations), 10, function(u, callbackEach) {
		libxslt.parse(stylesheetStr, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback);
};

var stylesheetAsyncParallelParsingObj = function(iterations, callback) {
	var i = 0;
	async.eachLimit(new Array(iterations), 10, function(u, callbackEach) {
		libxslt.parse(stylesheetObj, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var applySyncStr = function(iterations, callback) {
	for (var i = 0; i < iterations; i++) {
		stylesheet.apply(docStr);
	}
	callback();
};

var applySyncObj = function(iterations, callback) {
	for (var i = 0; i < iterations; i++) {
		stylesheet.apply(docObj);
	}
	callback();
};

var applyAsyncSeriesStr = function(iterations, callback) {
	var i = 0;
	async.eachSeries(new Array(iterations), function(u, callbackEach) {
		stylesheet.apply(docStr, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var applyAsyncSeriesObj = function(iterations, callback) {
	var i = 0;
	async.eachSeries(new Array(iterations), function(u, callbackEach) {
		stylesheet.apply(docObj, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var applyAsyncParallelStr = function(iterations, callback) {
	var i = 0;
	async.eachLimit(new Array(iterations), 10, function(u, callbackEach) {
		stylesheet.apply(docStr, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var applyAsyncParallelObj = function(iterations, callback) {
	var i = 0;
	async.eachLimit(new Array(iterations), 10, function(u, callbackEach) {
		stylesheet.apply(docObj, function(err, result) {
			i++;
			callbackEach(err);
		});
	}, callback); 
};

var iterations = 10000;
async.series([
	//bench('synchronous parse from string\t\t\t', iterations, stylesheetSyncParsingStr),
	bench('synchronous parse from parsed doc\t\t\t', iterations, stylesheetSyncParsingObj),

	//bench('asynchronous parse in series from string\t\t\t', iterations, stylesheetAsyncSeriesParsingStr),
	bench('asynchronous parse in series from parsed doc\t', iterations, stylesheetAsyncSeriesParsingObj),

	//bench('asynchronous parse in parallel from string\t\t\t', iterations, stylesheetAsyncParallelParsingStr),
	bench('asynchronous parse in parallel from parsed doc\t', iterations, stylesheetAsyncParallelParsingObj),

	//bench('synchronous apply from string\t\t\t', iterations, applySyncStr),
	bench('synchronous apply from parsed doc\t\t\t', iterations, applySyncObj),

	//bench('asynchronous apply in series from string\t\t', iterations, applyAsyncSeriesStr),
	bench('asynchronous apply in series from parsed doc\t', iterations, applyAsyncSeriesObj),

	//bench('asynchronous apply in parallel from string\t', iterations, applyAsyncParallelStr),
	bench('asynchronous apply in parallel from parsed doc\t', iterations, applyAsyncParallelObj)
]);