var test               = require('tape'),
    fs                 = require('fs'),
    path               = require('path'),
    sourceMap          = require('source-map'),
    SourceMapConsumer  = sourceMap.SourceMapConsumer,
    SourceMapGenerator = sourceMap.SourceMapGenerator,
    convert            = require('convert-source-map'),
    coffee             = require('coffee-script')

var tr_doubleId        = require('./transforms/tr-double-id'),
    tr_doubleLine      = require('./transforms/tr-double-line')

var codes = {

  '1.js': [
    'a = b'
  ].join('\n'),

  '2.js': [
    'a = 1',
    'console.log(2)',
    'b = 3',
    'console.log(4)'
  ].join('\n'),

  '3.coffee': [
    'a = 1',
    'console.log 2'
  ].join('\n')

}

test('single line-preserved-transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  var transformed = tr_doubleId(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aa = bb;',
            ''
          ].join('\n'))

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
  t.equal(convert.removeComments(transformed),
          [
            'a = b;',
            'a = b;',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 2; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-preserved-transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  // x3
  code = tr_doubleId(code, f)
  code = tr_doubleId(code, f)
  var transformed = tr_doubleId(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aaaaaaaa = bbbbbbbb;',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos = con.originalPositionFor({line: 1, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 1, column: 11})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)
  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-breaking-transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  // x3
  code = tr_doubleLine(code, f)
  code = tr_doubleLine(code, f)
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'a = b;',
            'a = b;',
            'a = b;',
            'a = b;',
            'a = b;',
            'a = b;',
            'a = b;',
            'a = b;',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 8; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-preserved and line-breaking transform on 1.js', function(t) {
  // setup
  var f = '1.js'
  var code = codes[f]

  // exercise
  // x2 x2
  code = tr_doubleId(code, f)
  code = tr_doubleLine(code, f)
  code = tr_doubleId(code, f)
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aaaa = bbbb;',
            'aaaa = bbbb;',
            'aaaa = bbbb;',
            'aaaa = bbbb;',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 4; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 7})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('single line-preserved-transform on 2.js', function(t) {
  // setup
  var f = '2.js'
  var code = codes[f]

  // exercise
  var transformed = tr_doubleId(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aa = 1;',
            'console.log(2);',
            'bb = 3;',
            'console.log(4);',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos = con.originalPositionFor({line: 1, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 1, column: 5})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)

  origPos = con.originalPositionFor({line: 2, column: 0})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 2, column: 8})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 8)
  origPos = con.originalPositionFor({line: 2, column: 12})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 12)

  origPos = con.originalPositionFor({line: 3, column: 0})
  t.equal(origPos.line, 3)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 3, column: 5})
  t.equal(origPos.line, 3)
  t.equal(origPos.column, 4)

  origPos = con.originalPositionFor({line: 4, column: 0})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 4, column: 8})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 8)
  origPos = con.originalPositionFor({line: 4, column: 12})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 12)

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('single line-breaking-transform on 2.js', function(t) {
  // setup
  var f = '2.js'
  var code = codes[f]

  // exercise
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'a = 1;',
            'a = 1;',
            'console.log(2);',
            'console.log(2);',
            'b = 3;',
            'b = 3;',
            'console.log(4);',
            'console.log(4);',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 2; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  for (i = 3; i <= 4; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 12)
  }

  for (i = 5; i <= 6; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 3)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 3)
    t.equal(origPos.column, 4)
  }

  for (i = 7; i <= 8; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 12)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-preserved-transform on 2.js', function(t) {
  // setup
  var f = '2.js'
  var code = codes[f]

  // exercise
  // x3
  code = tr_doubleId(code, f)
  code = tr_doubleId(code, f)
  var transformed = tr_doubleId(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aaaaaaaa = 1;',
            'console.log(2);',
            'bbbbbbbb = 3;',
            'console.log(4);',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos = con.originalPositionFor({line: 1, column: 0})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 1, column: 11})
  t.equal(origPos.line, 1)
  t.equal(origPos.column, 4)

  origPos = con.originalPositionFor({line: 2, column: 0})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 2, column: 8})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 8)
  origPos = con.originalPositionFor({line: 2, column: 12})
  t.equal(origPos.line, 2)
  t.equal(origPos.column, 12)

  origPos = con.originalPositionFor({line: 3, column: 0})
  t.equal(origPos.line, 3)
  t.equal(origPos.column, 0)

  origPos = con.originalPositionFor({line: 3, column: 11})
  t.equal(origPos.line, 3)
  t.equal(origPos.column, 4)

  origPos = con.originalPositionFor({line: 4, column: 0})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 0)
  origPos = con.originalPositionFor({line: 4, column: 8})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 8)
  origPos = con.originalPositionFor({line: 4, column: 12})
  t.equal(origPos.line, 4)
  t.equal(origPos.column, 12)

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-breaking-transform on 2.js', function(t) {
  // setup
  var f = '2.js'
  var code = codes[f]

  // exercise
  // x3
  code = tr_doubleLine(code, f)
  code = tr_doubleLine(code, f)
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'a = 1;',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'b = 3;',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 8; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  for (i = 9; i <= 16; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 12)
  }

  for (i = 17; i <= 24; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 3)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 3)
    t.equal(origPos.column, 4)
  }

  for (i = 25; i <= 32; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 4)
    t.equal(origPos.column, 12)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-preserved and line-breaking transform on 2.js', function(t) {
  // setup
  var f = '2.js'
  var code = codes[f]

  // exercise
  // x2 x2
  code = tr_doubleId(code, f)
  code = tr_doubleLine(code, f)
  code = tr_doubleId(code, f)
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            'aaaa = 1;',
            'aaaa = 1;',
            'aaaa = 1;',
            'aaaa = 1;',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'console.log(2);',
            'bbbb = 3;',
            'bbbb = 3;',
            'bbbb = 3;',
            'bbbb = 3;',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            'console.log(4);',
            ''
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 1; i <= 4; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 7})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  for (i = 5; i <= 8; i++) {
    origPos = con.originalPositionFor({line: i, column: 0})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 12)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})

test('multi line-preserved and line-breaking transform on 3.js', function(t) {
  // setup
  var f = '3.coffee'
  var code = codes[f]

  // exercise
  // coffee + x1
  var compiled = coffee.compile(code, { sourceMap: true, generatedFile: f, inline: true})
  code = compiled.js + '\n' + convert.fromJSON(compiled.v3SourceMap).toComment()
  var transformed = tr_doubleLine(code, f)
  t.equal(convert.removeComments(transformed),
          [
            '(function () {',       //  1
            '    var a;',           //  2
            '    a = 1;',           //  3
            '    a = 1;',           //  4
            '    console.log(2);',  //  5
            '    console.log(2);',  //  6
            '}.call(this));',       //  7
            '(function () {',       //  8
            '    var a;',           //  9
            '    a = 1;',           // 10
            '    a = 1;',           // 11
            '    console.log(2);',  // 12
            '    console.log(2);',  // 13
            '}.call(this));',       // 14
            ''                      // 15
          ].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos
  var i

  for (i = 3; i <= 4; i++) {
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  for (i = 5; i <= 6; i++) {
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 16})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 12)
  }

  for (i = 10; i <= 11; i++) {
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 8})
    t.equal(origPos.line, 1)
    t.equal(origPos.column, 4)
  }

  for (i = 12; i <= 13; i++) {
    origPos = con.originalPositionFor({line: i, column: 4})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 0)
    origPos = con.originalPositionFor({line: i, column: 12})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 8)
    origPos = con.originalPositionFor({line: i, column: 16})
    t.equal(origPos.line, 2)
    t.equal(origPos.column, 12)
  }

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed);
})
