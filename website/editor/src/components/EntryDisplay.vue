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
      console.log("In root:", data.content, this.state.entry.content)
      this.dataStructure = data.content
      // this.state.entry.content = data.content
    },
    getXmlData() {

      console.log(this.dataStructure)
      return ""
    }
  }
}
</script>

<style scoped>

</style>
