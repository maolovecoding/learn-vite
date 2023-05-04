const scanImports = require('./scan')
/**
 * 创建优化的依赖 分析项目依赖的第三方模块
 * @param {*} config 
 */
async function createOptimizeDepsRun(config){
  const deps = await scanImports(config) // 扫描导入
  console.log(deps)
}




module.exports = {
  createOptimizeDepsRun
}