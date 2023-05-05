const alias = {
  js: 'application/javascript',
  css: 'application/css',
  html: 'text/html',
  json: 'application/json',
}
/**
 * 
 * @param {import('connect').IncomingMessage} req 
 * @param {} res 
 * @param {number} content 
 * @param {string} type 
 */
function send(req, res, content, type){
  res.setHeader('Content-Type', alias[type])
  res.statusCode = 200
  return res.end(content)
}
module.exports = send