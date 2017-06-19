const test = require('tape')

const merge = require('../')

const fs = require('fs')
const resolve = require('path').resolve

const babel = require('babel-core')
const SourceMapConsumer = require('source-map').SourceMapConsumer

const doubleLineTransform = require('./transforms/tr-double-line')
const insertEmptyStatementTransform = require('./transforms/tr-insert-empty-statement')

test('undefined args should not effect results', function(t) {
  const code = 'y = x => x * 2'
  const transformed = babel.transform(code, {
    filename: 'source.js',
    plugins: ['transform-es2015-spread'],
    sourceMaps: true
  })

  const map = transformed.map
  t.equal(map, merge(undefined, map))
  t.equal(map, merge(map, undefined))
  t.end()
})

test('multi transform with CoffeeScript and doubleLineTransform', function(t) {
  // first transform from CofeeeScript to JavaScript (assumed pre-processed)
  const coffeeCompiledCode = fs.readFileSync(resolve(__dirname, './fixtures/coffee-script/expected.js'), 'utf-8')
  const coffeeCompiledMap = fs.readFileSync(resolve(__dirname, './fixtures/coffee-script/expected.js.map'), 'utf-8')

  // second transform with `doubleLineTransform`
  const doubleLineTransformed = doubleLineTransform(coffeeCompiledCode, 'coffeeCompiled.js')

  // exercise: merge maps of `coffeeCompiled` and `doubleLineTransformed`
  const mergedMap = merge(coffeeCompiledMap, doubleLineTransformed.map.toJSON())

  // logging...
  // console.log('# 1')
  // new SourceMapConsumer(coffeeCompiledMap).eachMapping(m => console.log(JSON.stringify(m)))
  // console.log('# 2')
  // new SourceMapConsumer(doubleLineTransformed.map.toJSON()).eachMapping(m => console.log(JSON.stringify(m)))
  // console.log('# 3')
  // new SourceMapConsumer(mergedMap).eachMapping(m => console.log(JSON.stringify(m)))

  // verify
  t.equal(doubleLineTransformed.code, fs.readFileSync(resolve(__dirname, './fixtures/coffee-script/actual.js'), 'utf-8'))

  const con = new SourceMapConsumer(mergedMap)
  for (var i = 0; i < 2; i++) {
    const offset = i * 17
    t.deepEqual(
      con.originalPositionFor({ line: 2 + offset, column: 8 }),
      { column: 0, line: 1, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `var *a* = b`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 2 + offset, column: 11 }),
      { column: 0, line: 1, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `var *a* = b`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 3 + offset, column: 4 }),
      { column: 0, line: 1, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `var *a* = b`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 4 + offset, column: 4 }),
      { column: 0, line: 1, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `var *a* = b`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 5 + offset, column: 4 }),
      { column: 0, line: 2, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*b* = function (arg1, arg2)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 5 + offset, column: 18 }),
      { column: 5, line: 2, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `b = function (*arg1*, arg2)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 6 + offset, column: 8 }),
      { column: 2, line: 3, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 6 + offset, column: 20 }),
      { column: 14, line: 3, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 7 + offset, column: 8 }),
      { column: 2, line: 3, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 7 + offset, column: 20 }),
      { column: 14, line: 3, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 8 + offset, column: 8 }),
      { column: 2, line: 5, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 8 + offset, column: 20 }),
      { column: 14, line: 5, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 9 + offset, column: 8 }),
      { column: 2, line: 5, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
    t.deepEqual(
      con.originalPositionFor({ line: 9 + offset, column: 20 }),
      { column: 14, line: 5, name: null, source: '../../../test/fixtures/coffee-script/expected.coffee' },
      'pos of `*console*.log(arg1)`'
    )
  }
  t.end()
})

test('multi transform with es2015-arrow and es2015-spread on babel', function(t) {

  // source.js -> resultOfArrow.js
  const resultOfArrow = babel.transform(fs.readFileSync(resolve(__dirname, './fixtures/es2015/expected.js')), {
    filename: 'source.js',
    plugins: ['transform-es2015-arrow-functions'],
    sourceMaps: true,
  })
  // logging...
  // console.log('# arrow')
  // const arrowMapConsumer = new SourceMapConsumer(resultOfArrow.map)
  // arrowMapConsumer.eachMapping(m => console.log(JSON.stringify(m)))
  // console.log(resultOfArrow.code)

  // resultOfArrow.js -> resultOfAdditionalSpread.js
  const resultOfAdditionalSpread = babel.transform(resultOfArrow.code, {
    filename: 'resultOfArrow.js',
    plugins: ['transform-es2015-spread'],
    sourceMaps: true
  })
  // logging...
  // console.log('# additionalSpread')
  // const additionalSpreadMapConsumer = new SourceMapConsumer(resultOfAdditionalSpread.map)
  // additionalSpreadMapConsumer.eachMapping(m => console.log(JSON.stringify(m)))
  // console.log(resultOfAdditionalSpread.code)

  // exercise: merge maps of `resultOfArrow` and `resultOfAdditionalSpread
  const mergedMap = merge(resultOfArrow.map, resultOfAdditionalSpread.map)
  const mergedMapConsumer = new SourceMapConsumer(mergedMap)

  // logging...
  // console.log('# merged')
  // mergedMapConsumer.eachMapping(m => console.log(JSON.stringify(m)))

  // actual map with babel in same time transform
  const resultOfArrowAndSpreadAtSameTime = babel.transform(fs.readFileSync(resolve(__dirname, './fixtures/es2015/expected.js')), {
    filename: 'source.js',
    plugins: ['transform-es2015-arrow-functions', 'transform-es2015-spread'],
    sourceMaps: true
  })
  const sameTimeMapConsumer = new SourceMapConsumer(resultOfArrowAndSpreadAtSameTime.map)
  // logging...
  // console.log('# actual with babel')
  // sameTimeMapConsumer.eachMapping(m => console.log(JSON.stringify(m)))
  // console.log(resultOfArrowAndSpreadAtSameTime.code)

  // verify
  const actualCode = fs.readFileSync(resolve(__dirname, './fixtures/es2015/actual.js'), 'utf-8')
  t.equal(resultOfAdditionalSpread.code, actualCode)
  t.equal(resultOfArrowAndSpreadAtSameTime.code, actualCode)

  // mappings by merge-soource-source-map, filtered by having `name` property
  const mergedMappings = []
  mergedMapConsumer.eachMapping(function(m) { m.name && mergedMappings.push(m) })

  // mappings by babel, filtered by having `name` property
  const sameTimeMappings = []
  sameTimeMapConsumer.eachMapping(function(m) { m.name && sameTimeMappings.push(m) })

  t.deepEqual(mergedMappings, sameTimeMappings)
  t.end()
})

test('handle original position of code that does not have an origin', function(t) {
  const origCode = 'a = b'

  // transform to insert empty statement
  const transformed1 = insertEmptyStatementTransform(origCode, 'source.js')
  t.equal(transformed1.code, 'a = b;\n;')

  // transform to insert empty statement (x2)
  const transformed2 = insertEmptyStatementTransform(transformed1.code, 'transformed1.js')
  t.equal(transformed2.code, 'a = b;\n;\n;')

  // verify
  const mergedMap = merge(transformed1.map.toJSON(), transformed2.map.toJSON())
  const con = new SourceMapConsumer(mergedMap)
  var origPos

  // pos for variable `a`
  origPos = con.originalPositionFor({line: 1, column: 0})
  t.deepEqual(origPos, {line: 1, column: 0, name: 'a', source: 'source.js'})

  // pos for variable `b`
  origPos = con.originalPositionFor({line: 1, column: 4})
  t.deepEqual(origPos, {line: 1, column: 4, name: 'b', source: 'source.js'})

  t.end()
})

test('handle original position of code that does not have an origin (with compact format)', function(t) {
  const origCode = 'a = b'

  // transform to insert empty statement
  const transformed1 = insertEmptyStatementTransform(origCode, 'source.js', true)
  t.equal(transformed1.code, 'a=b;;')

  // transform to insert empty statement (x2)
  const transformed2 = insertEmptyStatementTransform(transformed1.code, 'transformed1.js', true)
  t.equal(transformed2.code, 'a=b;;;')

  const mergedMap = merge(transformed1.map.toJSON(), transformed2.map.toJSON())
  const con = new SourceMapConsumer(mergedMap)
  var origPos

  // pos for variable `a`
  origPos = con.originalPositionFor({line: 1, column: 0})
  t.deepEqual(origPos, {line: 1, column: 0, name: 'a', source: 'source.js'})

  // pos for variable `b`
  origPos = con.originalPositionFor({line: 1, column: 2})
  t.deepEqual(origPos, {line: 1, column: 4, name: 'b', source: 'source.js'})

  t.end()
})
