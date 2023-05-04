const connect = require('connect')
const serverStaticMiddleware = require('./middlewares/static')
const resolveConfig = require('../config')
const { createOptimizeDepsRun } = require('../optimizer')
const createServer = async () => {
  const config = await resolveConfig()
  const middlewares = connect()
  middlewares.use(serverStaticMiddleware(config)) // 静态文件中间件
  const server = {
    async listen(port, callback){
      // 项目启动前 进行依赖预构建
      await runOptimize(config)
      require('http')
      .createServer(middlewares)
      .listen(port, callback)
    }
  }
  return server
}
/**
 * 依赖预构建
 */
async function runOptimize(config){
  await createOptimizeDepsRun(config)
}

module.exports = {
  createServer
}