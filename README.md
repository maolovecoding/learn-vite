# vite

## 为什么vite冷启动快

可以看一下node_modules文件夹下的.vite/deps文件夹。
比如我们用到了vue，那么`_metadata.json`文件内就会多：

```json
{
  "hash": "880b49e0",
  "browserHash": "d40db334",
  "optimized": {
    "vue": {
      "src": "../../.pnpm/registry.npmmirror.com+vue@3.2.47/node_modules/vue/dist/vue.runtime.esm-bundler.js",
      "file": "vue.js",
      "fileHash": "bccd0d98",
      "needsInterop": false
    }
  },
  "chunks": {}
}
```

相当于我们知道了会走vue模块package.json文件内module字段指向的文件，会把这个文件的内容拷贝到`.vite/deps`文件夹下的vue.js文件里面，查找vue模块就会直接走vue.js文件了，而不去再次查找vue模块的内容。

## esbuild的基本使用

注意，如果使用插件了，那就只能异步的build.

```js
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
```

## 相关依赖

```shell
pnpm install connect es-module-lexer resolve check-is-array esbuild fast-glob fs-extra serve-static magic-string chokidar ws  hash-sum --save
```
