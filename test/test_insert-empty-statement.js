var test = require('tape'),
    convert = require('convert-source-map'),
    esprima    = require('esprima'),
    estraverse = require('estraverse'),
    escodegen  = require('escodegen'),
    SourceMapConsumer = require('source-map').SourceMapConsumer

var merge = require('../')

test('handle original position of code that does not have an origin', function(t) {
  var f = 'a.js'
  var code = 'a = b'

  // transform to insert empty statement
  var tmp_transformed = insertEmptyStatementTransform(code, f)
  t.equal(convert.removeComments(tmp_transformed), ['a = b;',
                                                    ';',
                                                    ''].join('\n'))

  // transform to insert empty statement (x2)
  var transformed = insertEmptyStatementTransform(tmp_transformed, f)
  t.equal(convert.removeComments(transformed), ['a = b;',
                                                ';',
                                                ';',
                                                ''].join('\n'))

  // verify
  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos

  // pos for variable `a`
  origPos = con.originalPositionFor({line: 1, column: 0})
  t.deepEqual(origPos, {line: 1, column: 0, name: 'a', source: 'a.js'})

  // pos for variable `b`
  origPos = con.originalPositionFor({line: 1, column: 4})
  t.deepEqual(origPos, {line: 1, column: 4, name: 'b', source: 'a.js'})

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed)
})

test('handle original position of code that does not have an origin (with compact format)', function(t) {
  var f = 'a.js'
  var code = 'a = b'

  // transform to insert empty statement
  var tmp_transformed = insertEmptyStatementTransform(code, f, true)
  t.equal(convert.removeComments(tmp_transformed), ['a=b;;',
                                                    ''].join('\n'))

  // transform to insert empty statement (x2)
  var transformed = insertEmptyStatementTransform(tmp_transformed, f, true)
  t.equal(convert.removeComments(transformed), ['a=b;;;',
                                                ''].join('\n'))

  var map = convert.fromSource(transformed).toJSON()
  var con = new SourceMapConsumer(map)
  var origPos

  // pos for variable `a`
  origPos = con.originalPositionFor({line: 1, column: 0})
  t.deepEqual(origPos, {line: 1, column: 0, name: 'a', source: 'a.js'})

  // pos for variable `b`
  origPos = con.originalPositionFor({line: 1, column: 2})
  t.deepEqual(origPos, {line: 1, column: 4, name: 'b', source: 'a.js'})

  t.end()
  // con.eachMapping(e => console.log(e))
  // console.log(transformed)
 })

function insertEmptyStatementTransform(code, filepath, compact) {

  var emptyStatement = esprima.parse(';').body[0]
  var ast = esprima.parse(code, {sourceType: 'module', loc: true})
  estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === 'ExpressionStatement') {
        parent.body.push(emptyStatement)
      }
    },
    leave: function() {}
  })

  var gen = escodegen.generate(ast, {
    sourceMap: filepath,
    sourceMapWithCode: true,
    sourceContent: code,
    format: {
      compact: compact
    }
  })

  var oldMap = convert.fromSource(code) && convert.fromSource(code).toObject(),
      newMap = JSON.parse(gen.map.toString()),
      mergedMap = merge(oldMap, newMap),
      mapComment = convert.fromObject(mergedMap).toComment()

  return gen.code + '\n' + mapComment
}
