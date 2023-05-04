const connect = require('connect')
const http = require('http')

// connect => express => koa
const app = connect()
app.use((req, res, nest) => {
  console.log('中间件1')
  nest()
})
app.use((req, res, nest) => {
  console.log('中间件2')
  nest()
})
app.use((req, res, nest) => {
  console.log('中间件3')
  res.end('end')
})

http.createServer(app).listen(3000)