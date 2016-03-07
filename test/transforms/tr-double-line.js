var fs         = require('fs'),
    esprima    = require('esprima'),
    estraverse = require('estraverse'),
    escodegen  = require('escodegen'),
    convert    = require('convert-source-map'),
    SM         = require('source-map')

var mergeSourceMap = require('../../')

module.exports = function(code, filepath) {
  var ast = esprima.parse(code, {sourceType: 'module', loc: true})
  estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === 'ExpressionStatement') {
        parent.body.splice(parent.body.indexOf(node), 0, node)
      }
    },
    leave: function() {}
  })

  var gen = escodegen.generate(ast, {
    sourceMap: filepath,
    sourceMapWithCode: true,
    sourceContent: code
  })

  var origMap = convert.fromSource(code) && convert.fromSource(code).toObject(),
      newMap = JSON.parse(gen.map.toString()),
      mergedMap = origMap ? mergeSourceMap(origMap, newMap) : newMap
      mapComment = convert.fromObject(mergedMap).toComment()

  return gen.code + '\n' + mapComment
}
