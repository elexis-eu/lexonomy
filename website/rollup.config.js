import riot from 'rollup-plugin-riot'
import nodeResolve from '@rollup/plugin-node-resolve'
import { registerPreprocessor } from '@riotjs/compiler'
import sass from 'sass'
import postcss from "rollup-plugin-postcss"
import url from "postcss-url"
import { uglify } from "rollup-plugin-uglify"
const path = require('path')

/*
  NOTE: rollup compiles the regular interface, consisting of the riotjs files.
  entry points are:
  app.js: all frontend code
  app.static.js: all frontend dependencies (jquery, riot runtime, etc.)
  app.css.js: all frontend css + all dependency css
  The Vue-based xml editor is compiled seperately, though the output directory of the compilation is mostly the same.
  see website/editor/vue.config.js
*/


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
    file: 'dist/riot/bundle.js',
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
    file: 'dist/riot/bundle.static.js',
    format: 'iife',
    strict: false
  }
}, {
  /*
    NOTE: for this step, we need to extract references to assets such as background-image
    Use absolute paths everywhere possible so relative references can actually be properly transformed.
  */
  input: "app.css.js",
  output: {
    file: path.resolve("dist/riot/bundle.css"),
  },
  plugins: [
    postcss({
      plugins: [
        url([{
          url: 'copy',

          assetsPath: path.resolve('dist', 'assets'), // relative to "to" property
          useHash: true,
          // places to check for assets/images used in url() in the css files included in app.css.js
          // Use path.resolve to transform into absolute paths so we don't have to mess about with relatives
          basePath: [
            path.resolve('.'),
            path.resolve('widgets/'),
            path.resolve('libs/screenful/'),
            path.resolve('img/materialize-colorpicker'),
            path.resolve('libs/jquery')
          ],
        }]),
      ],
      extract: true,
      // unused by rollup, passed as sort of "base output path" to plugins
      // without setting this some images end up in the wrong place, or the url to the image does at least..
      to: path.resolve('dist/riot/bundle.css') 
    })
  ]
}]
