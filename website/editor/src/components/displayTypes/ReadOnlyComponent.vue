<template>
  <div>
    <section v-if="elementData.show">
<!--      <p>Read-only component</p>-->
      <p> {{ elementName }}: {{content._text}}</p>
    </section>
    <ComponentGeneratorComponent
      :children="children"
      :content="content"
      :elementEditorConfig="elementData"
      :elementName="elementName"
    />
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"

export default {
  name: "ReadOnlyComponent",
  components: {ComponentGeneratorComponent},
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>

</style>
