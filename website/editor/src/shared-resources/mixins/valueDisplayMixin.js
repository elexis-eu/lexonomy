
export default {
  data() {
    return {
      valueComponent: null
    }
  },
  created() {
    let fillingToComponentMap = {
      "chd": "ReadOnlyComponent",
      "emp": "ReadOnlyComponent",
      "txt": "TextInputComponent",
      "lst": "DropdownComponent",
      "med": "MediaComponent",
      "inl": "TextInputWithMarkupComponent"
    }
    let structureConfig
    if (this.isAttribute) {
      let parentConfig = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
      structureConfig = parentConfig[this.elementName]
    } else {
      structureConfig = this.state.entry.dictConfigs.xema.elements[this.elementName]
    }
    if (structureConfig) {
      let filling = structureConfig.filling
      this.valueComponent = fillingToComponentMap[filling]
    } else {
      console.error(`xema config doesn't exists for: ${this.elementName}`)
      this.valueComponent = "TextInputComponent"
    }
  }
}
