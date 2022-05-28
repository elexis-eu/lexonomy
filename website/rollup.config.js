import riot from 'rollup-plugin-riot'
import nodeResolve from '@rollup/plugin-node-resolve'
import { registerPreprocessor } from '@riotjs/compiler'
import sass from 'node-sass'
import css from "rollup-plugin-import-css"
import { uglify } from "rollup-plugin-uglify"


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
export default [{
  input: 'app.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    strict: false
  },
  plugins: [
    riot(options),
    ...(process.env.ROLLUP_WATCH ? [] : [uglify]), // only enable the slow uglify if creating production build (i.e. not in watch mode)
    nodeResolve()
  ]
}, {
  input: 'app.static.js',
  context: "window",
  output: {
    file: 'bundle.static.js',
    format: 'iife',
    strict: false
  }
}, {
  input: "app.css.js",
  output: {
    file: "bundle.css"
  },
  plugins: [
    css(),
    nodeResolve()
  ]
}]
