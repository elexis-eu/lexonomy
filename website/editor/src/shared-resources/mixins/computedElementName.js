export default {
  computed: {
    computedElementName() {
      const structureConfig = this.state.entry.dictConfigs.xema.elements
      return (structureConfig[this.elementName] && structureConfig[this.elementName].elementName) || this.elementName
    }
  },
}
