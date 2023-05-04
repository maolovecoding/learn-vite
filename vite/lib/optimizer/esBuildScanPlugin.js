const fs = require("fs-extra")
const { normalizePath } = require('../utils')
const { createPluginContainer } = require('../server/pluginContainer')
// 22分
const htmlTypesRE = /\.html$/
const scriptModuleRE = /<script\s+src\="(.+?)"/
const resolvePlugin = require('../plugins/resolve')
/**
 * 获取esbuild扫描插件的工厂方法
 * @param {*} config 配置对象
 * @param {} depImports 存放导入的模块
 * @returns {import('esbuild').Plugin}
 */
async function esBuildScanPlugin(config, depImports){
  const container = await createPluginContainer({plugins: [
    resolvePlugin(config)
  ], root: config.root})
  const resolve = async function(path, importer){
    // 由插件容器进行路径解析，返回绝对路径
    return await container.resolveId(path, importer)
  }
  return {
    name: 'scan', // 依赖扫描插件
    setup(build){
      build.onResolve({ filter: htmlTypesRE }, async ({ path,importer }) => {
        // 入口文件是html 找到文件的真实路径 path不一定是绝对路径
        const resolved = await resolve(path, importer)
        if (resolved) {
          return {
            path: resolved.id || resolved,
            namespace: 'html'
          }
        }
      })
    build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
      const resolved = await resolve(path, importer)
      if (resolved) {
        const id = resolved.id || resolved
        if (id.includes('node_modules')) {
          depImports[path] = normalizePath(id) // vue: node_modules/vue/dist/xxxxx
          return {
            external: true, // 外部模块
            path: id,
          }
        } else {
          return {
            path: id
          }
        }
      }
    })
      build.onLoad({filter: htmlTypesRE, namespace: 'html'}, async ({ path }) => {
        // 读取文件内容 把 html => js
        const html = fs.readFileSync(path, 'utf-8')
        const [, src] = html.match(scriptModuleRE)
        const jsContent = `import ${JSON.stringify(src)}` // import '/src/index.js'
        return {
          contents: jsContent,
          loader: 'js'
        }
      })
      

    }
  }
}
module.exports = esBuildScanPlugin