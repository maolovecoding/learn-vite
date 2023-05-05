// import { defineConfig } from 'vite'
// import vuePlugin from './plugins/plugin-vue'
// import vuePlugin from '@vitejs/plugin-vue'
// export default defineConfig({
//   plugins: [
//     vuePlugin()
//   ]
// })

const vuePlugin = require('./plugins/plugin-vue')
module.exports = {
  plugins: [
    vuePlugin()
  ]
}