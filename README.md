# merge-source-map

Merge old source map and new source map in multi-transform flow

[![travis-ci](https://travis-ci.org/keik/merge-source-map.svg?branch=master)](https://travis-ci.org/keik/merge-source-map)

[![npm](https://nodei.co/npm/merge-source-map.png)](https://npmjs.org/package/merge-source-map)


# API

```javascript
var merge = require('merge-source-map')
```


## `merge(oldMap, newMap)`

Merge old source map and new source map and return merged.
If old or new source map value is falsy, return another one as it is.

<dl>
  <dt>
    <code>oldMap</code> : <code>object|undefined</code>
  </dt>
  <dd>
    old source map object
  </dd>

  <dt>
    <code>newmap</code> : <code>object|undefined</code>
  </dt>
  <dd>
    new source map object
  </dd>
</dl>


# Example

```javascript
var esprima    = require('esprima'),
    estraverse = require('estraverse'),
    escodegen  = require('escodegen'),
    convert    = require('convert-source-map'),
    merge      = require('merge-source-map')

const CODE = 'a = 1',
      FILEPATH = 'a.js'

// create AST of original code
var ast = esprima.parse(CODE, {sourceType: 'module', loc: true})

// transform AST of original code
estraverse.replace(ast, {
  enter: function(node, parent) { /* change AST */ },
  leave: function(node, parent) { /* change AST */ }
})

// generate code and source map from transformed AST
var gen = escodegen.generate(ast, {
  sourceMap: FILEPATH,
  sourceMapWithCode: true,
  sourceContent: CODE
})

// merge old source map and new source map
var oldMap = convert.fromSource(CODE) && convert.fromSource(CODE).toObject(),
    newMap = JSON.parse(gen.map.toString()),
    mergedMap = merge(oldMap, newMap),
    mapComment = convert.fromObject(mergedMap).toComment()

// attach merge source map to transformed code
var transformed = gen.code + '\n' + mapComment

console.log(transformed);
```


# Test

```
% npm install
% npm test
```


# License

MIT (c) keik
