const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {alias: {'vue$': 'vue/dist/vue.esm.js'}},
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*'},
      port: 8081
    },
    output: {
      filename: 'editor.js'
    }
  },
  outputDir: '../dist/editor/', // dist in main website directory  
  assetsDir: 'assets', // relative to outputDir, so website/dist/assets
  css: {
    extract: {
      filename: 'editor.css'
    }
  },
  chainWebpack: config => {
    // remove splitting vendor so we only get one big master editor.js
    config.optimization.delete('splitChunks')
    // don't generate index.html, we're not making an SPA here.
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
})
