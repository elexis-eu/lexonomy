const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {alias: {'vue$': 'vue/dist/vue.esm.js'}},
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*'}
    }
  }
})
