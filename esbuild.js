/**
 * @type {import('esbuild').Plugin}
 */
const envPlugin = {
  name: 'env',
  setup(build){ // 每次build都会执行该setup函数
    // 每次解析导入的模块都会执行该回调
    // 用模块的路径和此回调的filter正则进行匹配 匹配上执行回调
    build.onResolve({
      filter: /^env$/,
      // namespace: 'fs' // 命名空间是用来过滤想处理的模块
    }, (onResolveArgs) => {
      return {
        external: false, // 是否是外部模块  是外部模块的话就不处理
        namespace: 'env-namespace', // 属于该命名空间
        path: onResolveArgs.path // env解析得到的路径 普通模块的话 就是绝对路径
      }
    })
    build.onLoad({
      filter: /^env$/,
      namespace: 'env-namespace'
    }, onLoadArgs => {
      // return {
      //   contents: `{ "OS": "${process.env.os}" }`,
      //   loader: 'json'
      // }
      return {
        contents: `export const OS = "${process.env.os}"`,
        loader: 'js', // 使用的加载器 就是内容的格式
      }
    })
  }
}
require('esbuild').build({
  entryPoints: ['./esbuild.main.js'],
  bundle: true,
  // outfile: 'out.js',
  loader: {
    '.js': 'jsx' // js类型的文件 用jsx加载器加载
  },
  plugins: [
    envPlugin
  ]
}).catch(err => {
  console.log('构建失败~~~')
})

/*
{
  path: 'env', // 模块名
  在哪个模块导入的env模块
  importer: 'F:\\vscode\\webpack-vite-rollup\\vite\\esbuild.main.js',
  namespace: 'file', 命名空间的名字
  resolveDir: 'F:\\vscode\\webpack-vite-rollup\\vite', 根目录
  kind: 'import-statement', 导入语句
  pluginData: undefined
}
*/