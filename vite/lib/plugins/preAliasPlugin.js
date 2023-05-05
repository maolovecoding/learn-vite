/**
 * 预处理路径映射问题 把vue的源码路径转为指向我们预处理完毕的路径
 * @param {*} config 
 * @returns 
 */
function preAliasPlugin(config){
  let server
  return {
    name: 'preAliasPlugin',
    configureServer(_server){
      server = _server
    },
    async resolveId(id){ // id = vue
      const metadata = server._optimizeDepsMetadata
      const isOptimized = metadata.optimized[id]
      if (isOptimized) { // 预处理过
        return {
          id: isOptimized.file
        }
      }
      return null // 没有预打包该第三方模块 没办法处理 交给下一个插件
    }
  }
}
module.exports = preAliasPlugin