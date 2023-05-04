const { init, parse } = require('es-module-lexer')

;(async () => {
  const sourceCode = `
    import _ from 'lodash'
    export const name = 'zs'
  `
  await init
  const res = parse(sourceCode)
  console.log(res)
  /*
  是一个数组 [imports, exports, ]
    [
      [ { n: 'lodash', s: 20, e: 26, ss: 5, se: 27, d: -1, a: -1 } ],
      [ { s: 45, e: 49, ls: 45, le: 49, n: 'name', ln: 'name' } ],
      false
    ]
*/
})()