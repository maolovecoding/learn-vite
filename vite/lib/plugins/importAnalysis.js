const { init, parse } = require('es-module-lexer')
const MagicString = require('magic-string').default
function importAnalysis(config){
  const { root } = config

  return {
    name: "importAnalysis",
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
        return url
      }
      await init // 等待解析器初始化完成
      const [imports] = parse(source) // 获取导入的模块
      if(imports.length === 0) return source // 没有导入模块
      const ms = new MagicString(source)
      // 重写路径
      for (let index = 0; index < imports.length; index++) {
        const {
          s: start,
          e: end,
          n: specifier // 标识符 vue
        } = imports[index]
        if (specifier) {
          const normalizedUrl = await normalizeUrl(specifier)
          if (normalizedUrl !== specifier) {
            // 重写路径 "vue" => "/node_modules/.myvite/deps/vue.js"
            ms.overwrite(start, end, normalizedUrl)
          }
        }
      }
      return ms.toString()
    }
  }
}
module.exports = importAnalysis