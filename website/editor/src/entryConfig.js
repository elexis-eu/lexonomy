import Vue from 'vue'
import App from './pages/entryConfig/App.vue';

Vue.config.productionTip = false

window.editor = new Vue({
  el: "#app",
  components: {App},
  template: "<App/>"
})
