const connect = require('connect')
const serverStaticMiddleware = require('./middlewares/static')
const resolveConfig = require('../config')
const createServer = async () => {
  const config = await resolveConfig()
  const app = connect()
  app.use(serverStaticMiddleware(config))
  const server = {
    async listen(port, callback){
      require('http')
      .createServer(app)
      .listen(port, callback)
    }
  }
  return server
}

module.exports = {
  createServer
}