export default {
  methods: {
    getStylesFromConfig(elementName) {
      let data = this.state.entry.dictConfigs.xemplate[elementName]
      let output = {}
      for (const [style, value] of Object.entries(data)) {
        switch (style) {
          // Commented are ignored in graphical editor
          // case "captioning":
          //  Interactivity - element probably gets marked as clickable <a> element that can be used as a redirect
          //  Does it get the ability to select element from left side inside editor like in a serchable dropdown or something?
          // case "interactivity":
          //  Do we need both punc in editor? Do we only display outer? What is the purpose of both?
          // case "innerPunc":
          // case "outerPunc":
            // Do brackets add ANY benefit to the editor itself - there is reason for it in the view, but not editor?
            // break
          // case "textsize":
          //   switch (value) {
          //     case "smaller":
          //       output.fontSize = "12px"
          //       break
          //     case "bigger":
          //       output.fontSize = "20px"
          //       break
          //   }
          //   break
          case "background":
            output.backgroundColor = value
            break
          case "colour":
            output.color = value
            break
          case "slant":
            output.fontStyle = value
            break
          case "weight":
            output.fontWeight = value
            break
        }
      }
      return output

    }
  }
}
