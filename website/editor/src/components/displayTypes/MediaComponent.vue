<template>
  <div>
    <section v-if="elementData.show">
<!--      <p>Media component</p>-->
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
  name: "MediaComponent",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
