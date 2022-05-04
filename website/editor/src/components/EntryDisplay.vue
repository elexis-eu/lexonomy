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
  watch: {
    dirty(newVal) {
      try {
        // eslint-disable-next-line no-undef
        (newVal) ? Screenful.Editor.changed() : Screenful.Editor.resetChanged()
      } catch (e) {
        console.error(e)
      }
    },
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
      dataStructure: {},
      dirty: false
    }
  },
  created() {
    this.dataStructure = this.state.entry.content
    window.harvestGraphicalEditorData = this.getXmlData
  },
  methods: {
    handleContentUpdate(data) {
      this.dataStructure = data.content
      this.dirty = this.areAnyChanges()
    },
    areAnyChanges() {

      let updatedContent = js2xml(this.dataStructure, this.state.xml2jsConfig)
      let initialContent = js2xml(this.state._initialContent, this.state.xml2jsConfig)
      return initialContent != updatedContent
    },
    getXmlData() {
      let structureCopy = Object.assign({}, this.dataStructure)
      delete structureCopy.declaration
      let data = js2xml(structureCopy, this.state.xml2jsConfig)
      return data
    }
  }
}
</script>

<style scoped>

</style>
