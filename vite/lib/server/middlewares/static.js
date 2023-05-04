const static = require('serve-static')
const serverStaticMiddleware = ({ root }) => {
  return static(root)
} 

module.exports = serverStaticMiddleware