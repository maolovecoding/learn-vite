/**
 * 处理文件热更新 发生变化的文件会向上 “冒泡”，直到遇到可以处理变化的文件，或者没有能处理的 那就刷新浏览器
 * 处理这个过程：需要知道那些信息？
 * 1. 知道那些模块导入了那些模块
 * 2. 知道父模块可以接收那些子模块的变更
 * 3. 知道谁引入了本模块，本模块又被那些模块引入了？
 * 构建模块依赖图
 * @param {string} file 变化的文件
 * @param {*} server 
 */
async function handleHMRUpdate(file, server) {
  const { moduleGraph, ws } = server
  const updateModule = moduleGraph.getModuleById(file)
  if (updateModule) {
    const updates = []
    // 热更新的边界模块 就是模块发生更新，那些模块执行相应的回调函数？
    const boundaries = new Set()
    propagateUpdate(updateModule, boundaries)
    updates.push(...[...boundaries].map(({boundary, acceptedVia}) => (
      {
        type: `${boundary.type}-update`,
        path: boundary.url,
        acceptedPath: acceptedVia.url // 变更模块的路径
      }
    )))
    ws.send({
      type: 'update',
      updates
    })
  }
}
/**
 * 广播更新
 * @param {*} updateModule 
 * @param {*} boundaries 
 */
function propagateUpdate(updateModule, boundaries) {
  // 找到模块的边界 放到集合中
  if (!updateModule.importers.size) return  // 模块没有被任何引入
  for (const importerModule of updateModule.importers) {
    if (importerModule.acceptedHmrDeps.has(updateModule)) {
      boundaries.add({
        boundary: importerModule, // 边界 接收变更的模块
        acceptedVia: updateModule // 变更的模块（通过该模块得到的变更）
      })
    }
  }

}

const LexerState = {
  inCall: 0, // 方法调用中
  inQuoteString: 1, // 值字符串中 引号里面
}
/**
 * 词法分析热更新依赖 有限状态机
 * @param {string} code 
 * @param {number} start 
 * @param {Set} acceptedUrls 热更新依赖集合
 */
function lexAcceptedHmrDeps(code, start, acceptedUrls){
  let state = LexerState.inCall
  let currentDep = '' // 当前的依赖
  function appDep(index) {
    acceptedUrls.add({
      url: currentDep,
      start: index - currentDep.length - 1,
      end: index + 1
    })
    currentDep = ''
  }
  for (let i = start; i < code.length; i++) {
    const char = code.charAt(i)
    switch (state) {
      case LexerState.inCall:
        if (char === `'` || char === `"`) {
          state = LexerState.inQuoteString
        }
        break
      case LexerState.inQuoteString:
        if (char === `'` || char === `"`) {
          appDep(i)
          state = LexerState.inCall
        } else {
          currentDep += char
        }
        break
    }
  }
}

module.exports = {
  handleHMRUpdate,
  lexAcceptedHmrDeps
}