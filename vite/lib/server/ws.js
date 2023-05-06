const { WebSocketServer } = require('ws')
function createWebsocketServer(httpServer, config){
  const wss = new WebSocketServer({
    noServer: true, // ws服务器和http服务器共享地址和端口 
  })
  // http监听客户端发出的升级协议请求的时候
  httpServer.on('upgrade', (req, client, head) => {
    // Sec-Websocket-Protocol: vite-hmr
    if (req.headers['sec-websocket-protocol'] === 'vite-hmr')
    // 升级通信协议 http => ws
      wss.handleUpgrade(req, client, head, wsclient => {
        wss.emit('connection', wsclient, req) // 连接成功
      })
  })
  // 放服务器监听到客户端的连接，请求成功的时候
  wss.on('connection', client => {
    client.send(JSON.stringify({ type: "connected" }))
  })
  return {
    on: wss.on.bind(wss), // on 监听客户端发送过来的请求
    off: wss.off.bind(wss), // 取消监听客户端发送过来的请求
    send(payload) {
      const stringified = JSON.stringify(payload)
      // 调用此方法可以向所有的客户端发送消息
      wss.clients.forEach(client => {
        client.send(stringified)
      })
    }
  }
}

module.exports = {
  createWebsocketServer
}