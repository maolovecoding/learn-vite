const { isJsRequest } = require('../../utils')
const send = require('../send')
const tranformRequest = require('../transformRequest')

/**
 * 
 * @param {*} server 
 * @returns {import('connect').NextHandleFunction}
 */
function transformMiddleware(server){
  return async (req, res, next) => {
    if (req.method !== 'GET') return next()
    if (isJsRequest(req.url)) {
      // 请求的的资源是js 重写第三方模块路径
      // url = path + query
      const result = await tranformRequest(req.url, server)
      if (result) {
        return send(req, res, result.code, 'js')
      } else {
        return next()
      }
    } else {
      next()
    }
  }
}

module.exports = transformMiddleware