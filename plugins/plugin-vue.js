const fs = require('fs-extra')
const { parse, compileScript, rewriteDefault, compileTemplate } = require('vue/compiler-sfc')
function vue(){
  let root
  return {
    name: 'vue',
    config(config) {
      root = config.root
      return {
        define: {
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false
        }
      }
    },
    /**
     * 
     * @param {string} code 
     * @param {string} id 
     */
    async transform(code, id){
        const { filename } = parseVueRequest(id)
        if (filename.endsWith('.vue')) {
          return await transformMain(code, filename)
        }
      return null
    }
  }
}
/**
 * 
 * @param {string} source 
 * @param {string} filename 
 */
async function transformMain(source, filename) {
  const descriptor = await getDescriptor(filename)
  const scriptCode = genScriptCode(descriptor, filename)
  const templateCode = genTemplateCode(descriptor,filename)
  const code = [
    scriptCode,
    templateCode,
    '_sfc_main.render = render;',
    'export default _sfc_main;'
  ].join('\n')
  return {
    code
  }
}
/**
 * 生成模板代码
 * @param {import('vue/compiler-sfc').SFCDescriptor} descriptor 
 * @param {string} id 
 */
function genTemplateCode(descriptor, id){
  const content = descriptor.template.content
  const result = compileTemplate({
    source: content,
    id
  })
  return result.code
}
/**
 * 生成脚本代码
 * @param {import('vue/compiler-sfc').SFCDescriptor} descriptor 
 * @param {string} id 
 */
function genScriptCode(descriptor, id){
  const script = compileScript(descriptor, {
    id
  })
  const code = rewriteDefault(script.content, '_sfc_main')
  return code
}

const descriptorCache = new Map
/**
 * 
 * @param {string} filename 
 * @returns {import('vue/compiler-sfc').SFCDescriptor}
 */
async function getDescriptor(filename){
  let descriptor = descriptorCache.get(filename)
  if (descriptor) return descriptor
  // App.vue
  const content = await fs.readFile(filename, 'utf-8')
  descriptor = parse(content, { filename }).descriptor
  descriptorCache.set(filename, descriptor)
  return descriptor // 描述符
}
/**
 * 
 * @param {string} id 
 */
function parseVueRequest(id){
  const [filename, querystring] = id.split('?')
  const query = new URLSearchParams(querystring)
  return {
    filename,
    query
  }
}

module.exports = vue