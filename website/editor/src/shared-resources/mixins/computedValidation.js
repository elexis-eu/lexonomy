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
    computedValidation() {
      if (!this.parentElementName) {
        return null
      }
      if (this.isAttribute) {
        let attributeXema = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes[this.elementName]
        if (attributeXema.optionality === "obligatory") {
          if (attributeXema.filling === "lst") {
            return {requiredDropdown: true}
          } else {
            return {required: true}
          }
        }
      }
      return null
    }
  }
}
