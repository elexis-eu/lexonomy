import riot from 'rollup-plugin-riot'
import nodeResolve from '@rollup/plugin-node-resolve'
// import {registerPreprocessor} from '@riotjs/compiler';
// import sass from 'sass';



// registerPreprocessor('css', 'sass', function(code, { options }) {
//   const { file } = options
  
//   return {
//     code: sass.compileString(code).css,
//     map: null // sourcemap? TODO 
//   }
// });

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
