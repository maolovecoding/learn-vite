const { build } = require('esbuild')
const path = require('path')
const esBuildScanPlugin = require('./esBuildScanPlugin')
/**
 * 扫描项目中导入的第三方模块
 */
module.exports = async function scanImports(config){
  // 存放依赖导入
  const depImports = {}
  // 得到一个扫描插件
  const scanPlugin = await esBuildScanPlugin(config, depImports)
  await build({
    absWorkingDir: config.root,
    entryPoints: [
      path.resolve('./index.html'), // 指定编译的入口 html
    ],
    bundle: true,
    format: 'esm',
    outfile: './dist/bundle.js',
    write: false, // 真实情况其实不需要写入硬盘 
    plugins: [scanPlugin]
  })
  return depImports
}