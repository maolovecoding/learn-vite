const fs = require('fs-extra')
const { parse } = require('url')
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
    const fsPath = parse(id).pathname // 去掉query
    code = await fs.readFile(fsPath, 'utf-8')
  }
  // 把每个url变成一个入口
  await server.moduleGraph.ensureEntryFormUrl(url)
  // transform => 转换文件内第三方模块的路径为预解析得到的路径
  const result = await pluginContainer.transform(code, id)
  return result
}
module.exports = tranformRequest