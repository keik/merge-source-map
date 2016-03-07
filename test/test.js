var test               = require('tape'),
    fs                 = require('fs'),
    path               = require('path'),
    sourceMap          = require('source-map'),
    SourceMapConsumer  = sourceMap.SourceMapConsumer,
    SourceMapGenerator = sourceMap.SourceMapGenerator,
    convert            = require('convert-source-map')

var tr_doubleId        = require('./transforms/tr-double-id'),
    tr_doubleLine      = require('./transforms/tr-double-line')

var codes = {}
codes['1.js'] = [
  'a = b'
].join('\n')

test('single line-preserved-transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  var transformed = tr_doubleId(code, f)

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos = con.originalPositionFor({line: 1, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 1, column: 5})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)
  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('single line-breaking-transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  var transformed = tr_doubleLine(code, f)

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos = con.originalPositionFor({line: 1, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 1, column: 4})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)
  origPos = con.originalPositionFor({line: 2, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 2, column: 4})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)
  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})
