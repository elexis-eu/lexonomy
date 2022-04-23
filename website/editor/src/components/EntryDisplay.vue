<template>
<!--  <div v-if="state.entry.dictConfigs && state.entry.dictConfigs.xemplate">-->
  <div v-if="state.entry.editorConfig">
    <ComponentGeneratorComponent
      :children="preparedDataForEntry"
      :content="content"
    />

<!--      <component v-for="(elementData, element) in state.entry.editorConfig"-->
<!--                 :key="element"-->
<!--                 :is="getComponentFromElementName({[element]: elementData})"-->
<!--                 v-bind="getPropsForElement({[element]: elementData})"-->
<!--                 @createAdditionalElements="createAdditionalElements($event)"-->
<!--      />-->
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"

export default {
  name: "EntryDisplay",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    content: {
      type: Object,
      required: true
    },
    contentHtml: {
      type: String,
      required: false
    }
  },
  computed: {
    preparedDataForEntry() {
      // if (!this.state.entry.dictConfigs) {
      //   return []
      // }
      // return [this.state.entry.dictConfigs.xemplate]

      console.log(this.state.entry.editorConfig)
      return [this.state.entry.editorConfig]
    }
  },
}
</script>

<style scoped>

</style>
