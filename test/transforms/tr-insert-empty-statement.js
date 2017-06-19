const esprima    = require('esprima')
const estraverse = require('estraverse')
const escodegen  = require('escodegen')

module.exports = function insertEmptyStatementTransform(code, filepath, compact) {
  const emptyStatement = esprima.parse(';').body[0]
  const ast = esprima.parse(code, {sourceType: 'module', loc: true})
  estraverse.replace(ast, {
    enter: function(node, parent) {
      if (node.type === 'ExpressionStatement') {
        parent.body.push(emptyStatement)
      }
    },
    leave: function() {}
  })

  return escodegen.generate(ast, {
    sourceMap: filepath,
    sourceMapWithCode: true,
    sourceContent: code,
    format: {compact: compact}
  })
}
