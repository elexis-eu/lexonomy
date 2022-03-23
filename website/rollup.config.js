import riot from 'rollup-plugin-riot'
import nodeResolve from '@rollup/plugin-node-resolve'
const options = {
  ext: 'tag'
}
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
