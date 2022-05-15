export default {
  props: {
    isAttribute: {
      type: Boolean
    },
    parentElementName: {
      type: String
    },
  },
  computed: {
    computedElementName() {
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
  },
}
