const fs = require('fs-extra')
/**
 * 
 * @param {string} url /src/index.js?hash=xxx
 * @param {*} server 
 */
async function tranformRequest(url, server){
  const { pluginContainer } = server
  // resolveId => load => transform
  // resolveId => /src/index.js 绝对路径
  const { id } = await pluginContainer.resolveId(url); // container.resolveId => resolvePlugin.resolveId
  // load => 拿到内容
  const loadResult = await pluginContainer.load(id)
  let code
  if (loadResult) {
    code = loadResult.code
  } else {
    code = fs.readFileSync(id, 'utf-8')
  }
  // transform => 转换文件内第三方模块的路径为预解析得到的路径
  const result = await pluginContainer.transform(code, id)
  return result
}
module.exports = tranformRequest