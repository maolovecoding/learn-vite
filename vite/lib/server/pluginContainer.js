const { normalizePath } = require("../utils")

/**
 * 创建插件container 插件容器
 * @param {{plugins:{resolveId:Function,name:string}[],root: string}} param0 
 * plugins 插件数组 格式和rollup插件是一样的 {name, resolveId}
 * @returns 
 */
async function createPluginContainer({ plugins, root }){
  const container = {
    /**
     * 解析路径
     * @param {string} path 
     * @param {string} importer 
     */
    async resolveId(path, importer){
      let resolveId = path
      for(const plugin of plugins) {
        if (!plugin.resolveId)continue
        const result = await plugin.resolveId.call(null, path, importer)
        if (result) {
          resolveId = result.id || result
          break
        }
      }
      return {
        id: normalizePath(resolveId)
      }
    },
    load(){},
    transform(){}
  }
  return container
}

module.exports = {
  createPluginContainer
}