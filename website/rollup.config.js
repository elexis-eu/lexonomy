import riot from 'rollup-plugin-riot'
import nodeResolve from '@rollup/plugin-node-resolve'
import { registerPreprocessor } from '@riotjs/compiler'
import sass from 'node-sass'

registerPreprocessor('css', 'scss', function(code, { options }) {
  const { file } = options
  const {css} = sass.renderSync({
    data: code
  })
  return {
    code: css.toString(),
    map: null
  }
})

const options = {}
export default {
  input: 'app.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    strict: false
  },
  plugins: [
    riot(options),
    nodeResolve()
  ]
}
