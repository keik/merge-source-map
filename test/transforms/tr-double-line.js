const esprima    = require('esprima')
const estraverse = require('estraverse')
const escodegen  = require('escodegen')

module.exports = function(code, filepath) {
  const ast = esprima.parse(code, {sourceType: 'module', loc: true})
  estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === 'ExpressionStatement') {
        parent.body.splice(parent.body.indexOf(node), 0, node)
      }
    },
    leave: function() {}
  })

  return escodegen.generate(ast, {
    sourceMap: filepath,
    sourceMapWithCode: true,
    sourceContent: code
  })
}
