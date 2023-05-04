const connect = require('connect')
const http = require('http')
const static = require('serve-static')

// connect => express => koa
const app = connect()
app.use(static(__dirname))


http.createServer(app).listen(3000)