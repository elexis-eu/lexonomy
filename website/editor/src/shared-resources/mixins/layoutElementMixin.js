import valueDisplayMixin from "@/shared-resources/mixins/valueDisplayMixin"
import {xml2js} from "xml-js"

export default {
  mixins: [
    valueDisplayMixin
  ],
  computed: {
    configStyles() {
      let output = {}
      for (const [style, value] of Object.entries(this.elementData)) {
        switch (style) {
          case "background":
            output[style] = value
            break
          case "color":
            output.color = value
            break
          case "border":
            output.border = `1px ${value} #767676`
            break
          case "slant":
            output.fontStyle = value
            break
          case "weight":
            output.fontWeight = value
            break
          case "separation":
            if (value === "space") {
              output.marginBottom = "24px"
            }
            break
        }
      }
      if (!this.elementData.color) {
        output.color = "#767676"
      }
      return output

    },
    componentData() {
      if (this.elementData.valueRenderType === "text-input-with-markup") {
        return this.calculatedContent.elements
          || []
      }
      let textElement = this.calculatedContent.elements && this.calculatedContent.elements.find(element => {
        return element.type === "text" && !element.name
      })
      return textElement || {text: "", type: "text"}
    },
    calculatedContent() {
      return this.updatedContent || this.content
    }
  },
  data() {
    return {
      showChildren: true,
      updatedContent: null
    }
  },
  methods: {
    hideChildren() {
      this.showChildren = false
    },
    createElementTemplate(elementName) {
      return xml2js(`<${elementName}></${elementName}>`, this.state.xml2jsConfig).elements[0]
    },
    handleValueUpdate(data) {
      let content = Object.assign({}, this.calculatedContent)
      if (Object.keys(content).length === 0) {
        content = this.createElementTemplate(this.elementName)
      }
      content.elements = data.elements
      this.$emit('input', {elementName: this.elementName, editorChildNumber: this.editorChildNumber, content: content})
    },
    handleChildUpdate(data) {
      let content = {...this.content, ...data.content}
      this.$emit('input', {elementName: this.elementName, editorChildNumber: this.editorChildNumber, content: content})
    },
    updateContent(newContent) {
      this.updatedContent = newContent
    },
    moveElementDown() {
      this.$emit("move-element", {name: this.elementName, direction: 1, position: this.editorChildNumber})
    },
    moveElementUp() {
      this.$emit("move-element", {name: this.elementName, direction: -1, position: this.editorChildNumber})
    },
    createSibling() {
      console.log("createSibling")
      this.$emit("create-element", {name: this.elementName})
    },
    deleteElement() {
      this.$emit("delete-element", {name: this.elementName, position: this.editorChildNumber})
    },
    cloneElement() {
      this.$emit("clone-element", {name: this.elementName, content: this.content})
    }
  }
}
