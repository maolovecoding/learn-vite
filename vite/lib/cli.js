const { createServer } = require('./server');

(async () => {
  const server = await createServer()
  server.listen(9999, () => {
    console.log('server')
  })
})()