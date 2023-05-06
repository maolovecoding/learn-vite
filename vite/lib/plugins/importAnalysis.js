const { init, parse } = require('es-module-lexer')
const MagicString = require('magic-string').default
const { lexAcceptedHmrDeps } = require('../server/hmr')
const path = require('path')
/**
 * 分析导入导出等 插件
 * @param {*} config 
 * @returns 
 */
function importAnalysis(config){
  const { root } = config
  let server
  return {
    name: "importAnalysis",
    configureServer(_server) {
      server = _server
    },
    // 找到源文件中的第三方模块进行转换
    async transform(source, importer) {
      /**
      * 格式化第三方模块标识符
      * @param {string} url 
      */
      const normalizeUrl = async url => {
        // "vue" => "/node_modules/.myvite/deps/vue.js"
        // this => 插件上下文 => resolve => contaier.resolveId
        const resolved = await this.resolve(url, importer)
        if (resolved && resolved.id.startsWith(root)) {
          url = resolved.id.slice(root.length)
        }
        // 建立此导入的模块和模块节点的对应关系
        await moduleGraph.ensureEntryFormUrl(url)
        return url
      }
      await init // 等待解析器初始化完成
      const [imports] = parse(source) // 获取导入的模块
      if(imports.length === 0) return source // 没有导入模块
      const { moduleGraph } = server
      // importer 是导入方的id，通过id拿到moduleNode
      const importerModuleNode = moduleGraph.getModuleById(importer)
      const importedUrls = new Set() // 此模块将要导入的子模块
      const acceptedUrls = new Set() // 此模块接收变更的依赖模块 里面的路径是原始路径
      const ms = new MagicString(source)
      // 重写路径
      for (let index = 0; index < imports.length; index++) {
        const {
          s: start,
          e: end,
          n: specifier // 标识符 vue
        } = imports[index]
        const rawUrl = source.slice(start, end); // import.meta 原始引入地址
        if (rawUrl === 'import.meta') {
          const prop = source.slice(end, end + 4); // import.meta.hot
          if (prop === '.hot') {
            if (source.slice(end + 4, end + 11) === '.accept') {
              // import.meta.hot.accept
              // 词法分析热更新依赖
              lexAcceptedHmrDeps(source, source.indexOf('(', end + 11) + 1, acceptedUrls)
            }
          } 
        }
        if (specifier) {
          const normalizedUrl = await normalizeUrl(specifier)
          if (normalizedUrl !== specifier) {
            // 重写路径 "vue" => "/node_modules/.myvite/deps/vue.js"
            ms.overwrite(start, end, normalizedUrl)
          }
          // 添加解析后的导入的模块id
          importedUrls.add(normalizedUrl)
        }
      }
      // 转为绝对路径 从当前所在模块的路径找导入的模块的绝对路径
      const toAbsoluteUrl = url => path.posix.resolve(path.posix.dirname(importerModuleNode.url), url)
      const normalizedAcceptedUrls = new Set() // 路径变成相对root的绝对路径了
      for (const { url, start, end } of acceptedUrls) {
        const normalizedUrl = await normalizeUrl(
          toAbsoluteUrl(url)
        )
        normalizedAcceptedUrls.add(normalizedUrl)
        ms.overwrite(start, end, JSON.stringify(normalizedUrl)) // 重写路径
      }
      // 更新模块信息
      await moduleGraph.updateModuleInfo(importerModuleNode, importedUrls, normalizedAcceptedUrls)
      return ms.toString()
    }
  }
}
module.exports = importAnalysis