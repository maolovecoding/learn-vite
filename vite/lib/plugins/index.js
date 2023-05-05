const preAliasPlugin = require('./preAliasPlugin')
const resolvePlugin = require('./resolve')
const importAnalysisPlugin = require('./importAnalysis')
/**
 * 内置插件
 * @param {*} config 
 * @returns 
 */
async function resolvePlugins(config){
  return [
    preAliasPlugin(config),
    resolvePlugin(config),
    importAnalysisPlugin(config)
  ]
}
module.exports = {
  resolvePlugins
}