const preAliasPlugin = require('./preAliasPlugin')
const resolvePlugin = require('./resolve')
const importAnalysisPlugin = require('./importAnalysis')
const definePlugin = require('./define')
/**
 * 内置插件
 * @param {*} config 
 * @returns 
 */
async function resolvePlugins(config, userPlugins = []){
  return [
    preAliasPlugin(config),
    resolvePlugin(config),
    ...userPlugins,
    definePlugin(config),
    importAnalysisPlugin(config)
  ]
}
module.exports = {
  resolvePlugins
}