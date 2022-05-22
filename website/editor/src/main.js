import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import InlineComponent from "@/components/displayTypes/InlineComponent"
import PopupComponent from "@/components/displayTypes/PopupComponent"
import ReadOnlyComponent from "@/components/displayTypes/ReadOnlyComponent"
import DropdownComponent from "@/components/displayTypes/DropdownComponent"
import MediaComponent from "@/components/displayTypes/MediaComponent"
import TextInputComponent from "@/components/displayTypes/TextInputComponent"
import TextInputWithMarkupComponent from "@/components/displayTypes/TextInputWithMarkupComponent"
import VeeValidate from "vee-validate"
Vue.config.productionTip = false
const bus = new Vue()

Vue.use(VeeValidate, {
  mode: "eager"
});

Vue.component("InlineComponent", InlineComponent)
Vue.component("PopupComponent", PopupComponent)
Vue.component("ReadOnlyComponent", ReadOnlyComponent)
Vue.component("DropdownComponent", DropdownComponent)
Vue.component("MediaComponent", MediaComponent)
Vue.component("TextInputComponent", TextInputComponent)
Vue.component("TextInputWithMarkupComponent", TextInputWithMarkupComponent)
Vue.mixin({
  data: () => {
    return {
      bus,
      state: store.state
    }
  }
})


window.mountGraphicalEditor = function () {
  let element = "editor"
  if (!document.getElementById("editor")) {
    element = "container"
  }
  window.editor = new Vue({
    components: {App},
    template: "<App/>"
  })
  window.editor.$mount("#"+element)
}
