const connect = require('connect')
const serverStaticMiddleware = require('./middlewares/static')
const transformMiddleware = require('./middlewares/transform')
const resolveConfig = require('../config')
const { createOptimizeDepsRun } = require('../optimizer')
const { createPluginContainer } = require('./pluginContainer')
const createServer = async () => {
  const config = await resolveConfig()
  const middlewares = connect()
  const pluginContainer = await createPluginContainer(config)
  const server = {
    pluginContainer,
    async listen(port, callback){
      // 项目启动前 进行依赖预构建
      await runOptimize(config, server)
      require('http')
      .createServer(middlewares)
      .listen(port, callback)
    }
  }
  // preAliasPlugin插件需要server 使用到我们预处理的optimizeDepsMetadata
  config.plugins.forEach(plugin => plugin.configureServer?.(server))
  // 重写第三方依赖的路径 import 'vue' => import '/node_modules/.myvite/deps/vue.js'
  middlewares.use(transformMiddleware(server)) // 先走转换 转换不成功才走静态资源中间件
  middlewares.use(serverStaticMiddleware(config)) // 静态文件中间件
  return server
}
/**
 * 依赖预构建
 */
async function runOptimize(config, server){
  const optimizeDeps = await createOptimizeDepsRun(config)
  server._optimizeDepsMetadata = optimizeDeps.metadata
}

module.exports = {
  createServer
}