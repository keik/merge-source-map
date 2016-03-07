var fs         = require('fs'),
    esprima    = require('esprima'),
    estraverse = require('estraverse'),
    escodegen  = require('escodegen'),
    convert    = require('convert-source-map'),
    SM         = require('source-map')

var mergeSourceMap = require('../../')

module.exports = function(code, filepath) {
  var ast = esprima.parse(code, {sourceType: 'module', range: true, comment: true, tokens: true, loc: true})
  estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === 'Identifier' && parent.type === 'AssignmentExpression') {
        node.name = new Array(3).join(node.name)
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
      mergedMap = origMap ? mergeSourceMap(origMap, JSON.parse(gen.map.toString())) : JSON.parse(gen.map.toString()),
      mapComment = convert.fromObject(mergedMap).toComment()

  return gen.code + '\n' + mapComment
}
