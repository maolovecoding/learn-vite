const { normalizePath } = require('./utils')
const path = require('path')
const { resolvePlugins } = require('./plugins');
const fs = require('fs-extra')
async function resolveConfig(){
  const root = normalizePath(process.cwd())
  const cacheDir = normalizePath(path.resolve('node_modules/.myvite'))
    const config = {
    root,
    cacheDir
  }
  // 读取配置文件
  const configFile = path.resolve(root, 'vite.config.js')
  const exists = await fs.exists(configFile)
  let userConfig = []
  if (exists) {
    userConfig = require(configFile)
    Object.assign(config, userConfig)
  }
  // 执行插件的 config方法
  userConfig.plugins?.forEach(plugin => {
    const res = plugin.config?.(config)
    if (res) {
      Object.assign(config, res)
    }
  })
  config.plugins = await resolvePlugins(config, userConfig.plugins)
  return config
}
module.exports = resolveConfig