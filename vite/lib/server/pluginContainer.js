const { normalizePath } = require("../utils")

/**
 * 创建插件container 插件容器
 * @param {{plugins:{resolveId:Function,name:string}[],root: string}} param0 
 * plugins 插件数组 格式和rollup插件是一样的 {name, resolveId}
 * @returns 
 */
async function createPluginContainer({ plugins, root }) {
  // 插件上下文类
  class PluginContext {
    async resolve(id, importer){
      return await container.resolveId(id, importer)
    }
  }
  const container = {
    /**
     * 解析路径
     * @param {string} path 
     * @param {string} importer 
     */
    async resolveId(path, importer){
      let resolveId = path
      const ctx = new PluginContext()
      for(const plugin of plugins) {
        if (!plugin.resolveId)continue
        const result = await plugin.resolveId.call(ctx, path, importer)
        if (result) {
          resolveId = result.id || result
          break
        }
      }
      return {
        id: normalizePath(resolveId)
      }
    },
    async load(id){
      const ctx = new PluginContext()
      for(const plugin of plugins) {
        if (!plugin.load) continue
        const result = await plugin.load.call(ctx, id)
        if (result) {
          return result
        }
      }
      return null
    },
    async transform(code, id){
      const ctx = new PluginContext()
      for(const plugin of plugins) {
        if (!plugin.transform) continue
        // call(注入this) this => 插件上下文对象
        const result = await plugin.transform.call(ctx, code, id)
        if (!result) {
          continue
        } else {
          code = result.code || result
        }
      }
      return {
        code
      }
    }
  }
  return container
}

module.exports = {
  createPluginContainer
}