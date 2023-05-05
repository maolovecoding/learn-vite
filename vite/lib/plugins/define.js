
function definePlugin(config){
  return {
    name: 'define',
    transform(code, id) {
      // 替换对象
      const replacements = config.define || {}
      // __VUE_OPTIONS_API__ => true,
      // __VUE_PROD_DEVTOOLS__ => false
      for (const key in replacements) {
        code = code.replace(new RegExp(key, 'g'), replacements[key])
      }
      return code
    }
  }
}
module.exports = definePlugin