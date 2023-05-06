
/**
 * 模块node 代表一个模块
 */
class ModuleNode{
  /**
   * 那些模块导入了自己 
   * @type {Set<string>}
   */
  importers = new Set()
  /**
   * 本模块导入了那些支持热更新的模块 也就是模块修改执行回调
   * @type {Set<string>}
   */
  acceptedHmrDeps = new Set()
  /**
   * @type {string}
   */
  url
  type
  /**
   * 
   * @param {string} url 
   */
  constructor(url, type = 'js') {
    this.url = url
    this.type = type
  }
}

/**
 * 模块依赖图
 * 提供模块id到模块节点的映射
 */
class ModuleGraph {
  /**
   * 模块id和模块节点对象的映射关系
   * @type {Map<string, ModuleNode>}
   */
  id2ModuleMap = new Map()
  /**
   * 根据模块id返回模块节点对象
   * @param {string} id 
   */
  getModuleById(id){
    return this.id2ModuleMap.get(id)
  }
  constructor(resolveId) { // resolveId => async container.resolveId
    this.resolveId = resolveId
  }
  /**
   * 把每个url变成一个入口
   * @param {string} rawUrl 
   */
  async ensureEntryFormUrl(rawUrl) {
    // rawUrl /src/index.js
    // 1. 获得绝对路径
    const [url, resolveId] = await this.resolveUrl(rawUrl)
    let moduleNode = this.getModuleById(resolveId)
    if (!moduleNode) {
      this.id2ModuleMap.set(resolveId, moduleNode = new ModuleNode(url))
    }
    return moduleNode
  }
  
  async resolveUrl(rawUrl) {
    const resolved = await this.resolveId(rawUrl)
    return [rawUrl, resolved.id || resolved]
  }
  /**
   * 
   * @param {ModuleNode} importerModuleNode 
   * @param {Set<string>} importedUrls 
   * @param {Set<string>} acceptedUrls 
   */
  async updateModuleInfo(importerModuleNode, importedUrls, acceptedUrls){
    for (const importedUrl of importedUrls) {
      const depModule = await this.ensureEntryFormUrl(importedUrl)
      // 依赖的模块的导入方 importerModuleNode
      depModule.importers.add(importerModuleNode)
    }
    const acceptedHmrDeps = importerModuleNode.acceptedHmrDeps
    for (const acceptedUrl of acceptedUrls) {
      const acceptedModule = await this.ensureEntryFormUrl(acceptedUrl)
      acceptedHmrDeps.add(acceptedModule)
    }
  }
}

module.exports = {
  ModuleGraph,
  ModuleNode
}