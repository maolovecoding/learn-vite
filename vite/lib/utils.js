/**
 * 
 * @param {string} path 
 * @returns 
 */
function normalizePath(path){
  return path.replace(/\\/g, '/')
}

module.exports = {
  normalizePath
}