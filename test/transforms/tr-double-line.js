var esprima    = require('esprima'),
    estraverse = require('estraverse'),
    escodegen  = require('escodegen'),
    convert    = require('convert-source-map')

var merge = require('../../')

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

  var oldMap = convert.fromSource(code) && convert.fromSource(code).toObject(),
      newMap = JSON.parse(gen.map.toString()),
      mergedMap = merge(oldMap, newMap),
      mapComment = convert.fromObject(mergedMap).toComment()

  return gen.code + '\n' + mapComment
}
