export default {
  props: {
    isAttribute: {
      type: Boolean
    },
    parentElementName: {
      type: String
    }
  },
  computed: {
    computedElementNameWithColon() {
      if (this.elementData && this.elementData.hideElementName) {
        return ""
      }
      const structureConfig = this.state.entry.dictConfigs.xema.elements
      let name = (structureConfig[this.elementName] && structureConfig[this.elementName].elementName) || this.elementName
      if (this.isAttribute) {
        try {
          let optionality = structureConfig[this.parentElementName].attributes[this.elementName].optionality

          if (optionality === "obligatory") {
            name += "*"
          }
        } catch (e) {
          console.log("", name)
        }
      }

      name += ":"
      return name
    },
    computedElementName() {
      if (this.elementData && this.elementData.hideElementName) {
        return ""
      }
      const structureConfig = this.state.entry.dictConfigs.xema.elements
      let name = (structureConfig[this.elementName] && structureConfig[this.elementName].elementName) || this.elementName
      if (this.isAttribute) {
        try {
          let optionality = structureConfig[this.parentElementName].attributes[this.elementName].optionality

          if (optionality === "obligatory") {
            name += "*"
          }
        } catch (e) {
          console.log("", name)
        }
      }
      return name
    }
  }
}
