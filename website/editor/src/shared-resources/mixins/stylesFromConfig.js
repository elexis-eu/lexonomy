export default {
  methods: {
    getStylesFromConfig(elementName) {
      let data = this.state.entry.dictConfigs.xemplate[elementName]
      let output = {}
      for (const [style, value] of Object.entries(data)) {
        switch (style) {
          case "background":
          case "color":
            output[style] = value
            break
          case "border":
            output.border = `1px ${value}`
            break
          case "slant":
            output.fontStyle = value
            break
          case "weight":
            output.fontWeight = value
        }
      }
      return output

    }
  }
}
