console.log(`[vite] connecting....`)
const socket = new WebSocket(`ws://${window.location.host}`, 'vite-hmr')

socket.addEventListener('message', async event => {
  handleMessage(JSON.parse(event.data))
})
async function handleMessage(data) {
  switch (data.type) {
    case 'connected':
      console.log(`[vite] connected`)
      break
    case 'update':
      data.updates.forEach(update => {
        if (update.type === 'js-update') {
          fetchUpdate(update)
        }
      })
  }
}
async function fetchUpdate( { path, acceptedPath } ) {
  // path 边界模块路径 /src/index.js
  // acceptedPath 变更的模块路径  /src/renderModule.js
  const module = window.hotModulesMap.get(path)
  if (!module) return // TODO 可以刷新浏览器
  const moduleMap = new Map() // 存放模块路径和新的模块内容的映射
  const modulesToUpdate = new Set()
  for (const { deps, callback } of module.callbacks) {
    deps.forEach(dep => {
      if (acceptedPath === dep) { // 说明导入的模块发生了更新了
        modulesToUpdate.add(dep) // 需要请求更新的模块
      }
    })
  }
  await Promise.all(
    Array.from(modulesToUpdate).map(async dep => {
      // 请求更新的模块 
      const updateModule = await import(dep + '?ts=' + Date.now());
      // 设置更新模块的路径 和 其模块的映射
      moduleMap.set(dep, updateModule)
    })
  )
  for(const { deps, callback } of module.callbacks) {
    // 执行模块更新后的回调 形成热更新操作 把依赖的模块作为形参传递给calllback
    callback(deps.map(dep => moduleMap.get(dep)))
  }
  const logged = `${acceptedPath} via ${path}`
  console.log(`[vite] hot updated ${logged}`)
}