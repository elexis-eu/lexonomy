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
        "media": "MediaComponent",
        "text-input-with-markup": "TextInputWithMarkupComponent"
      }
      this.valueComponent = displayTypeToComponentMap[this.elementData.valueType]
  }
}
