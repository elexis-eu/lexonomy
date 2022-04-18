import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import InlineComponent from "@/components/displayTypes/InlineComponent"
import PopupComponent from "@/components/displayTypes/PopupComponent"
import ReadOnlyComponent from "@/components/displayTypes/ReadOnlyComponent"
import DropdownComponent from "@/components/displayTypes/DropdownComponent"
import MediaComponent from "@/components/displayTypes/MediaComponent"
import TextInputComponent from "@/components/displayTypes/TextInputComponent"
import TextAreaInputComponent from "@/components/displayTypes/TextAreaInputComponent"

Vue.config.productionTip = false
const bus = new Vue()

Vue.component("InlineComponent", InlineComponent)
Vue.component("PopupComponent", PopupComponent)
Vue.component("ReadOnlyComponent", ReadOnlyComponent)
Vue.component("DropdownComponent", DropdownComponent)
Vue.component("MediaComponent", MediaComponent)
Vue.component("TextInputComponent", TextInputComponent)
Vue.component("TextAreaInputComponent", TextAreaInputComponent)
Vue.mixin({
  data: () => {
    return {
      bus,
      state: store.state
    }
  }
})
window.editor = new Vue({
  el: "#app",
  components: {App},
  template: "<App/>"
})
