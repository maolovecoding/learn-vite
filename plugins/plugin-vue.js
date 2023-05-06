const fs = require('fs-extra')
const hash = require('hash-sum') // 根据文件路径生成hash
const dedent = require('dedent')
const { parse, compileScript, rewriteDefault, compileTemplate, compileStyleAsync } = require('vue/compiler-sfc')
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
    async load(id){
      const { filename, query } = parseVueRequest(id)
      if (query.has('vue')) {
        const descriptor = await getDescriptor(filename)
        if (query.get('type') === 'style') {
          // 处理样式
          const styleBlock = descriptor.styles[Number(query.get('index'))]
          if (styleBlock) {
            return {
              code: styleBlock.content
            }
          }
        }
      }
    },
    /**
     * 
     * @param {string} code 
     * @param {string} id 
     */
    async transform(code, id){
        const { filename, query } = parseVueRequest(id)
        if (filename.endsWith('.vue')) {
          if (query.get('type') === 'style') {
            const descriptor = await getDescriptor(filename)
            const res = await transformStyle(code, descriptor, Number(query.get('index')))
            return res
          }
          return await transformMain(code, filename)
        }
      return null
    }
  }
}
/**
 * 生成style代码
 * @param {string} code
 * @param {import('vue/compiler-sfc').SFCDescriptor} descriptor 
 * @param {number} index 
 */
async function transformStyle(code, descriptor, index){
  const styleBlock = descriptor.styles[index]
  const result = await compileStyleAsync({
    filename: descriptor.filename, // 文件名
    source: code, // 样式源代码
    id: `deta-v-${descriptor.id}`, // 全局唯一id
    scoped: styleBlock.scoped // scoped
  })
  const styleCode = result.code
  code = `
    const style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(styleCode)};
    document.head.appendChild(style);
  `
  return {
    code
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
  const styleCode = genStyleCode(descriptor, filename)
  const code = [
    scriptCode,
    templateCode,
    styleCode,
    '_sfc_main.render = render;',
    'export default _sfc_main;'
  ].join('\n')
  return {
    code
  }
}
/**
 * 生成style代码
 * @param {import('vue/compiler-sfc').SFCDescriptor} descriptor 
 * @param {string} filename 
 */
function genStyleCode(descriptor, filename){
  let styleCode = ''
  const styles = descriptor.styles
  styles.forEach((style, index) => {
    const query = `?vue&type=style&index=${index}&lang${style.lang? style.lang : '.css'}`
    const styleRequest = filename.replace(/\\/g, '/')
    styleCode += `\nimport "${styleRequest}${query}"`
  })
  return styleCode
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
  descriptor.id = hash(filename)
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