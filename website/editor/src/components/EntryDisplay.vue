<template>
  <div v-if="state.entry.dictConfigs && state.entry.dictConfigs.xemplate">
    <ComponentGeneratorComponent
      :children="preparedDataForEntry"
      :content="dataStructure"
      @input="handleContentUpdate"
    />
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import {js2xml} from "xml-js"

export default {
  name: "EntryDisplay",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    contentHtml: {
      type: String,
      required: false
    }
  },
  computed: {
    preparedDataForEntry() {
      if (!this.state.entry.dictConfigs) {
        return []
      }
      return [{
        max: 1,
        min: 1,
        name: this.state.entry.dictConfigs.xema.root
      }]
    }
  },
  data() {
    return {
      dataStructure: {}
    }
  },
  created() {
    this.dataStructure = this.state.entry.content
    window.harvestGraphicalEditorData = this.getXmlData
  },
  methods: {
    handleContentUpdate(data) {
      this.dataStructure = data.content
    },
    getXmlData() {
      let structureCopy = Object.assign({}, this.dataStructure)
      delete structureCopy.declaration
      let data = js2xml(structureCopy, {compact: false})
      return data
    }
  }
}
</script>

<style scoped>

</style>
