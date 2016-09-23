var test = require('tape'),
    babel = require('babel-core'),
    convert = require('convert-source-map')

var merge = require('../')

test('undefined args should not effect results', t => {

  var code = `(() => {
    console.log(new Error().stack);

    foo.bar = 1;
})();
`

  var transformed = babel.transform(code, {presets: ['es2015'],
                                           sourceMaps: 'inline',
                                           sourceFileName: '../babel.es6',
                                           sourceMapTarget: 'babel.js'}).code

  var map = convert.fromSource(transformed).toObject()
  t.equal(map, merge(undefined, map))
  t.equal(map, merge(map, undefined))
  t.end()
})
