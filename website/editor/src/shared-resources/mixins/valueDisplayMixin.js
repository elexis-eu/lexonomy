export default {
  data() {
    return {
      valueComponent: null
    }
  },
  created() {
    let displayTypeToComponentMap = {
        "read-only": "ReadOnlyComponent",
        "text-input": "TextInputComponent",
        "textarea-input": "TextAreaInputComponent",
        "dropdown": "DropdownComponent",
        "media": "MediaComponent"
      }
      this.valueComponent = displayTypeToComponentMap[this.elementData.valueType]
  }
}
