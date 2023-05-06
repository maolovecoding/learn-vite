// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')

import { render } from './renderModule.js'
import { sum } from './utils.js'

render()
console.log(sum(1, 3))

window.hotModulesMap = new Map()

window.ownPath = '/src/index.js'
import.meta.hot = {
  accept(deps, callback) {
    acceptDeps(deps, callback)
  }
}
function acceptDeps(deps, callback) {
  const module = window.hotModulesMap.get(window.ownPath) || {
    id: ownPath,
    callbacks: []
  }
  module.callbacks.push({
    callback,
    deps
  })
  window.hotModulesMap.set(window.ownPath, module)
}

if (import.meta.hot) {
  import.meta.hot.accept(['./renderModule.js'], ([renderModule]) => {
    renderModule.render()
  })
}