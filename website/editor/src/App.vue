<template>
  <div id="editor">
    <div>
      <h4>EntryID</h4>
      <p>{{ state.entry.entryId }}</p>
    </div>
    <EntryDisplay/>
  </div>
</template>

<script>
import {xml2js} from "xml-js"
import EntryDisplay from "@/components/EntryDisplay"

export default {
  name: 'App',
  components: {EntryDisplay},
  props: {
    message: String
  },
  created() {
    let data = window.entryData
    this.updateEntry(data)
  },
  methods: {
    updateEntry(data) {
      if (!data) {
        return
      }
      console.log(data.content)
      // We want to make 2 separate copies of content so we can easily track dirty flag
      this.state._initialContent = xml2js(data.content || "", this.state.xml2jsConfig)
      data.content = xml2js(data.content || "", this.state.xml2jsConfig)
      this.changeElementNames(data.content, null, data.dictConfigs.xema)
      this.state.entry = {...this.state.entry, ...data}
    },
    changeElementNames(structure, parentName = null, config) {
      if (structure.name) {
        structure.name = this.getFakeName(structure.name, parentName, config) || structure.name
      }
      if (structure.attributes) {
        for (const attribute of Object.keys(structure.attributes)) {
          let fakeName = this.getFakeName(attribute, structure.name, config)
          if (fakeName && fakeName !== attribute) {
            structure.attributes[fakeName] = structure.attributes[attribute]
            delete structure.attributes[attribute]
          }
        }
      }
      if (structure.elements) {
        for (const element of structure.elements) {
          this.changeElementNames(element, structure.name, config)
        }
      }
    },
    getFakeName(elementName, parentElement, config) {
      if (config.root === elementName) {
        return config.elements[elementName].name
      }
      if (!parentElement) {
        console.error("No parent element")
        return elementName
      }

      let parentChildren = config.elements[parentElement] && config.elements[parentElement].children || []
      if (parentElement) {
        parentChildren = parentChildren.map(child => child.name)
      }
      for (const [el, data] of Object.entries(config.elements)) {
        if (data.elementName === elementName) {
          if (parentChildren.includes(el)) {
            return el
          }
        }
      }
    }
  }
}
</script>

<style scoped>
#editor {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
