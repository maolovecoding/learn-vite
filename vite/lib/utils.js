/**
 * 
 * @param {string} path 
 * @returns 
 */
function normalizePath(path){
  return path.replace(/\\/g, '/')
}
const knowJsSrcRE = /\.(js|vue)($|\?)/
/**
 * 
 * @param {string} url 
 * @returns 
 */
function isJsRequest(url){
  return knowJsSrcRE.test(url)
}

module.exports = {
  normalizePath,
  isJsRequest
}