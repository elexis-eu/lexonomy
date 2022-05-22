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
        if (this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes[this.elementName].optionality === "obligatory") {
          return {required: true}
        }
      }
      return null
    }
  }
}
