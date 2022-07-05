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
      //     case "background":
      //       output[style] = value
      //       break
      //     case "colour":
      //       output.color = value
      //       break
          case "border":
            output.border = `1px ${value} #B3D6FF`
            break
      //     case "slant":
      //       output.fontStyle = value
      //       break
      //     case "weight":
      //       output.fontWeight = value
      //       break
      //     case "separation":
      //       if (value === "space") {
      //         output.marginBottom = "24px"
      //       }
      //       break
      //   }
      }
      // if (!this.elementData.color) {
      //   output.color = "#767676"
      }
      if (this.forceReadOnlyElements) {
        return
      }
      return output

    },
    readOnly() {
      return this.elementData.readOnly || this.forceReadOnlyElements
    },
    componentData() {
      if (this.valueComponent === "TextInputWithMarkupComponent") {
        return this.calculatedContent.elements
          || []
      }
      if (this.isAttribute) {
        return this.calculatedContent || {type: "attribute", name: this.elementName, text: ""}
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
      updatedContent: null,
      isHeadword: false,
      newPossibleParents: [],
      showSelectNewParent: false
    }
  },
  created() {
    if (this.forceReadOnlyElements) {
      return
    }
    if (this.children && this.children.length > 0) {
      this.bus.$on("is-parent-to-element", this.handleIsParentToElement)
    }
    if (this.state.headwordElement === this.elementName) {
      this.isHeadword = true
      this.state.headwordData = this.getHeadwordValue(this.content.elements)
    }
  },
  beforeDestroy() {
    this.bus.$off("is-parent-to-element", this.handleIsParentToElement)
    this.bus.$off('possible-new-parent', this.handlePossibleNewParent)
    this.bus.$off('add-element-to-self', this.addElementToSelf)
  },
  methods: {
    getHeadwordValue(data) {
       if (!data) {
          return ""
       }
      try {
        return data.find(el => el.type === "text").text
      } catch (e) {
        console.error(e)
        return ""
      }
    },
    hideChildren() {
      this.showChildren = false
    },
    createElementTemplate(elementName) {
      return xml2js(`<${elementName}></${elementName}>`, this.state.xml2jsConfig).elements[0]
    },
    handleValueUpdate(data) {
      if (this.isAttribute) {
        this.$emit('input', {elementName: this.elementName, content: data.attributes, isAttribute: true})
        return
      }
      if (this.isHeadword) {
        this.state.headwordData = this.getHeadwordValue(data.elements)
      }
      let content = Object.assign({}, this.calculatedContent)
      if (Object.keys(content).length === 0) {
        content = this.createElementTemplate(this.elementName)
      }
      content.elements = data.elements
      this.$emit('input', {elementName: this.elementName, editorChildNumber: this.editorChildNumber, content: content})
    },
    handleChildUpdate(data) {
      let content = {...this.calculatedContent, ...data.content}
       if (!content.type) {
          content.type = "element"
       }
       if (!content.name) {
          content.name = this.elementName
       }
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
      this.$emit("create-element", {name: this.elementName})
    },
    deleteElement() {
      this.$emit("delete-element", {name: this.elementName, position: this.editorChildNumber})
    },
    cloneElement() {
      this.$emit("clone-element", {name: this.elementName, content: this.calculatedContent})
    },
    selectNewParent() {
      // Generate list of possible new parents

      // let xema = this.state.entry.dictConfigs.xema
      this.newPossibleParents = []
      this.bus.$on('possible-new-parent', this.handlePossibleNewParent)
      this.bus.$emit('is-parent-to-element', {emitEvent: "possible-new-parent", elementName: this.elementName})
      setTimeout(() => {
        this.showSelectNewParent = true
      }, 50)
    },
    //  ------------ MOVE BETWEEN ELEMENTS ----------------
    handleSelectedNewParent(element) {
      this.bus.$emit('add-element-to-self', {
        name: element.props.elementName,
        editorChildNumber: element.props.content.editorChildNumber,
        content: this.calculatedContent
      })
      this.deleteElement()
    },
    addElementToSelf(data) {
      if (this.elementName === data.name && this.editorChildNumber === data.editorChildNumber) {
        let newContent = Object.assign({}, data.content)
        delete newContent._index
        let content = Object.assign({}, this.calculatedContent)
        if (!content.elements) {
          content.elements = this.createElementTemplate(newContent.name)
        } else if (!content.elements.find(el => {
          return el.name === newContent.name
        })) {
          content.elements.push(newContent)
          this.updatedContent = content
          this.handleChildUpdate({content: content})
          return
        }
        content = this.appendElementAfterSameNameSiblings(newContent.name, content, newContent)
        this.updatedContent = content
        this.handleChildUpdate({content: content})
      }
      this.bus.$off('add-element-to-self', this.addElementToSelf)
    },
    //  ------------ EVENT HANDLERS ----------------
    handlePossibleNewParent(data) {
      this.newPossibleParents.push(data.content)
    },
    handleIsParentToElement(data) {
      if (this.children.find(el => el.name === data.elementName)) {
        this.bus.$emit(data.emitEvent, {
          content: {
            ...this.calculatedContent, ...{
              parentName: this.parentElementName,
              editorChildNumber: this.editorChildNumber
            }
          }
        })
        this.bus.$on('add-element-to-self', this.addElementToSelf)
      }
    },

    appendElementAfterSameNameSiblings(data, content, newContent) {
      let elements = content.elements || []
      let locationOfLastElement = elements.map(el => el.name).lastIndexOf(data)
      if (locationOfLastElement >= 0) {
        elements.splice(locationOfLastElement + 1, 0, newContent)
      } else {
        elements.push(newContent)
      }
      content.elements = elements
      return content
    }
  }
}
