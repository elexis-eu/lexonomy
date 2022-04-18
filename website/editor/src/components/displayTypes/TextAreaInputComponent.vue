<template>
  <div>

    <section v-if="elementData.show">
<!--      <p>Textarea input component</p>-->
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
import componentGeneratingMixin from "@/shared-resources/mixins/componentGeneratingMixin"

export default {
  name: "TextareaInputComponent",
  mixins: [
    componentGeneratingMixin
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

</style>
