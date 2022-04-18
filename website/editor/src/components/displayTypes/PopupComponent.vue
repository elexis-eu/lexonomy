<template>
  <div class="popup">
    <section v-if="elementData.show">
      <p>Popup component</p>
      <p> {{ elementName }}</p>
    </section>
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

export default {
  name: "PopupComponent",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  },
}
</script>

<style scoped>
  .popup {
      border: 1px solid #eee;
  }
</style>
