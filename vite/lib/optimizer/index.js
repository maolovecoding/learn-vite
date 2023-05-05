const scanImports = require('./scan')
const path = require('path')
const esbuild = require('esbuild')
const fs =require('fs-extra')
const { normalizePath } = require('../utils')
/**
 * 创建优化的依赖 分析项目依赖的第三方模块
 * @param {*} config 
 */
async function createOptimizeDepsRun(config){
  // {vue: '/node_modules/vue/dist/vue.runtime.esm-bundler.js'}
  const deps = await scanImports(config) // 扫描导入
  const { cacheDir } = config // 缓存目录
  const depsCacheDir = path.resolve(cacheDir, 'deps')
  const metaDataPath = path.join(depsCacheDir, '_metadata.json')
  const metadata = {
    optimized: {}
  }
  for (const id in deps) {
    // id = vue
    const entry = deps[id] // vue enrty path
    // const outfile = id + '.js' // 编译后生成的 vue.js文件的绝对路径
    const outfile = normalizePath(path.resolve(depsCacheDir, id + '.js')) // 编译后生成的 vue.js文件的绝对路径
    metadata.optimized[id] = {
      src: entry, // vue包esm文件的入口路径
      file: outfile,
      needsInterop: false, // TODO 是否需要转为esm 如果不是esm规范就是true
    }
    // 第三方模块 预编译
    await esbuild.build({
      absWorkingDir: config.root,
      entryPoints: [deps[id]],
      outfile, // 写入的路径
      write: true,
      bundle: true,
      format: 'esm'
    })
    await fs.ensureDir(depsCacheDir) // 没有目录时创建
    // 写入metadata文件
    await fs.writeFile(metaDataPath, JSON.stringify(metadata, (key, val) => {
      if (key === 'file' || key === 'src') {
        // 变成相对路径
        return normalizePath(path.relative(depsCacheDir, val))
      }
      return val
    }, 2))
  }
  return {
    metadata
  }
}




module.exports = {
  createOptimizeDepsRun
}