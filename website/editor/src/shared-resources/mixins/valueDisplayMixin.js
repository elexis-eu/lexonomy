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

      let filling = this.state.entry.dictConfigs.xema.elements[this.elementName].filling
      this.valueComponent = fillingToComponentMap[filling]
  }
}
