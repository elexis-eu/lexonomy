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
import {js2xml, xml2js} from "xml-js"

export default {
  name: "EntryDisplay",
  components: {
    ComponentGeneratorComponent
  },
  watch: {
    dirty(newVal) {
      try {
        // eslint-disable-next-line no-undef
        (newVal) ? Screenful.Editor.changed() : Screenful.Editor.resetChanged()
      } catch (e) {
        console.error(e)
      }
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
      let structureCopy = this.createDeepCopy()
      delete structureCopy.declaration
      this.fixElementNames(structureCopy)
      let data = js2xml(structureCopy, this.state.xml2jsConfig)
      console.log(data)
      return data
    },
    createDeepCopy() {
      let xml = js2xml(this.dataStructure, this.state.xml2jsConfig)
      return xml2js(xml, this.state.xml2jsConfig)
    },
    fixElementNames(structure) {
      if (structure.name) {
        let config = this.getStructureConfig(structure.name)
        if (config && config.elementName) {
          structure.name = config.elementName
        }
      }
      if (structure.attributes) {
        for (const attribute of Object.keys(structure.attributes)) {
          let config = this.getStructureConfig(attribute, structure.name)
          if (config && config.elementName) {
            structure.attributes[config.elementName] = structure.attributes[attribute]
            delete structure.attributes[attribute]
          }
        }
      }
      if (structure.elements) {
        for (const element of structure.elements) {
          this.fixElementNames(element)
        }
      }
    },
    getStructureConfig(elementName, parentElement = null) {
      let config = this.state.entry.dictConfigs.xema.elements
      if (!config[elementName]) {
        return {}
      }
      if (parentElement) {
        return config[parentElement].attributes[elementName]
      }
      return config[elementName] || {}
    }
  }
}
</script>

<style scoped>

</style>
