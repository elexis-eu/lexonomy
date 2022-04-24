<template>
  <div class="popup">
    <section v-if="elementData.shown">
      <p>Popup component - 12312312325345</p>
<!--      <p> {{ elementName }}</p>-->
    </section>
    <component :is="valueComponent"
               :elementEditorConfig="elementData"
               :elementName="elementName"
               :elementData="elementData"
               :content="content"/>
    <ComponentGeneratorComponent
      :children="children"
      :elementEditorConfig="elementData"
      :elementName="elementName"
      :content="content"
    />
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import valueDisplayMixin from "@/shared-resources/mixins/valueDisplayMixin"

export default {
  name: "PopupComponent",
  components: {
    ComponentGeneratorComponent
  },
  mixins: [
    valueDisplayMixin
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  }
}
</script>

<style scoped>
.popup {
  border: 1px solid #eee;
}
</style>
