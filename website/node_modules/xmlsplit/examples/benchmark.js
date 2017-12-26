#!/usr/bin/env node

var XmlSplit = require('../lib/xmlsplit.js')

var splitter = new XmlSplit()

var count = 0
process.stdin.pipe(splitter).on('data', function(data) {
  count++
}).on('end', function() {
  console.log('Processed %d record(s).', count)
})
