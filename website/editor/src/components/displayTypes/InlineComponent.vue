<template>
  <div>
      <section v-if="elementData.show">
<!--          <p>inline component</p>-->
          <p> {{elementName}}</p>
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
  name: "InlineComponent",
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
    },
    childrenContent: Object
  },
  mounted() {
    // console.log(this.children, "InlineComponent")
  }
}
</script>

<style scoped>

</style>
