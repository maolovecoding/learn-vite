const { normalizePath } = require('./utils')
const path = require('path')
const { resolvePlugins } = require('./plugins');
async function resolveConfig(){
  const root = normalizePath(process.cwd())
  const cacheDir = normalizePath(path.resolve('node_modules/.myvite'))
  const config = {
    root,
    cacheDir
  }
  config.plugins = await resolvePlugins(config)
  return config
}
module.exports = resolveConfig