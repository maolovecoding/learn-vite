const pathLib = require('path')
const resolve = require('resolve')
const fs = require('fs-extra')
/**
 * vite插件 也兼容rollup插件
 * @param {*} param0 
 * @returns 
 */
function resolvePlugin({ root }){
  return {
    name: 'resolve',
    /**
     * 
     * @param {string} path 
     * @param {string} importer 
     */
    resolveId(path, importer){
      // TODO 路径别名
      // 判断path是否是 / 开头 是根目录下的绝对路径
      if (path.startsWith('/')) {
        return {
          id: pathLib.resolve(root, path.slice(1))
        }
      }
      // TODO windows和mac绝对路径是否有问题？
      // 路径是绝对路径
      if (pathLib.isAbsolute(path)) {
        return {
          id: path,
        }
      }
      // 是相对路径
      if (path.startsWith('.')) {
        const baseDir = importer ? pathLib.dirname(importer) : root
        const fsPath = pathLib.resolve(baseDir, path)
        return {
          id: fsPath
        }
      }
      // 第三方模块
      const res = tryNodeResolve(path, importer, root)
      if (res) {
        return res
      }
    }
  }
}
/**
 * 解析第三方模块 找esm的入口文件路径
 * @param {*} path 
 * @param {*} importer 
 * @param {*} root 
 * @returns {{id: string}}
 */
function tryNodeResolve(path, importer, root){
  const pkgPath = resolve.sync(`${path}/package.json`, {basedir: root})
  const pkgDir = pathLib.dirname(pkgPath)
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const entryPoint = pkg.module // 拿到入口点 esm的入口文件
  const entryPointPath = pathLib.join(pkgDir, entryPoint)
  return {
    id: entryPointPath
  }
}

module.exports = resolvePlugin