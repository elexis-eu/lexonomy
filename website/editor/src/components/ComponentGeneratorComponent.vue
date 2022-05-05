<template>
  <div>
    <component v-for="element in renderedChildren"
               :ref="element.props.elementName + element.props.editorChildNumber"
               :key="element.props.elementName + '-' + Math.random()"
               :is="element.componentName"
               v-bind="element.props"
               @input="handleChildUpdate"
    />
  </div>
</template>

<script>
import {xml2js} from "xml-js"

export default {
  name: "ComponentGeneratorComponent",
  props: {
    children: Array,
    elementEditorConfig: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  },
  data() {
    return {
      displayTypeToComponentMap: {
        "popup": "PopupComponent",
        "inline": "InlineComponent",
        "read-only": "ReadOnlyComponent",
        "text-input": "TextInputComponent",
        "textarea-input": "TextAreaInputComponent",
        "dropdown": "DropdownComponent",
        "media": "MediaComponent"
      },
      renderedChildren: [],
      actualContent: {}

    }
  },
  watch: {
    content: {
      handler(newVal) {
        this.updateContentInChildren(newVal)
      },
      deep: true
    }
  },
  created() {
    //  create components from content
    this.loadNewData(this.content)
  },
  methods: {
    // Update only content of children to prevent re-rendering of whole structure
    updateContentInChildren(newContent) {
      if (!newContent || !newContent.elements) {
        return
      }
      for (let renderedChild of this.renderedChildren) {
        let newContentForChild = newContent.elements.filter(element => {
          return element.name === renderedChild.props.elementName
        })
        if (newContentForChild.length === 0) {
          continue
        }

        let renderedChildRefs = this.$refs[renderedChild.props.elementName + renderedChild.props.editorChildNumber]
        let renderedChildRef = (renderedChildRefs && renderedChildRefs[0]) || null

        if (renderedChildRef && newContentForChild[renderedChild.props.editorChildNumber]) {
          renderedChildRef.updateContent(newContentForChild[renderedChild.props.editorChildNumber])
        }

      }
    },
    loadNewData(XMLContent) {
      this.renderedChildren = []
      if (!this.children) {
        return
      }

      this.children.forEach(child => {
        // Get element name
        let elementName = child.name

        //Extract element data and/or assign defaults
        let elementData = this.getElementData(elementName)
        this.state.entry.dictConfigs.xemplate[elementName] = elementData

        // Calculate component name to render
        // !!!MUST WAIT FOR NEW ELEMENT DATA TO SET!!!
        let componentName = this.getComponentFromElementName(elementName)


        //  Get XML content for current element instance
        let content = [{}]
        if (Array.isArray(XMLContent && XMLContent.elements)) {
          content = XMLContent.elements.filter(element => {
            return element.name === elementName
          })
          if (content.length === 0) {
            content = [{}]
          }
        }
        // Decide if multiple instances need to be made and push children to array to be rendered
        if (Array.isArray(content)) {
          content.forEach((contentInstance, index) => {
            // Add elements to render list
            this.renderedChildren.push({
              componentName: componentName,
              props: {
                elementName: elementName,
                children: this.getElementChildren(elementName, contentInstance),
                content: contentInstance,
                elementData: elementData,
                editorChildNumber: index,
                parentElementName: this.elementName,
                numberOfElements: content.length
              }
            })
          })
        } else {
          // content._editorChildNumber = 0
          this.renderedChildren.push({
            componentName: componentName,
            props: {
              elementName: elementName,
              children: this.getElementChildren(elementName, content),
              content: content,
              elementData: elementData,
              editorChildNumber: 0,
              parentElementName: this.elementName,
              numberOfElements: content.length
            }
          })
        }

      })
    },

    createElementTemplate(elementName) {
      return xml2js(`<${elementName}></${elementName}>`, this.state.xml2jsConfig).elements
    },
    getElementChildren(elementName, content) {
      let elementInXema = this.state.entry.dictConfigs.xema.elements[elementName]
      let children = elementInXema && elementInXema.children
      if (content.elements) {
        let elemntsInContent = content.elements.filter(el => !!el.name)
        let differentElementsInXMLContent = elemntsInContent.map((value) => value.name).filter((value, index, _arr) => _arr.indexOf(value) === index).length;
        if (!elementInXema || differentElementsInXMLContent !== (elementInXema.children && elementInXema.children.length) || 0) {
          let artificialChildren = []
          if (elemntsInContent) {
            artificialChildren = elemntsInContent.map(element => {
              return {min: 1, max: 1, name: element.name}
            })
          }
          children = children || []
          for (const child of artificialChildren) {
            if (!children.find(el => el.name === child.name)) {
              children.push(child)
            }
          }
        }
      }
      return children
    },

    getElementData(elementName) {
      let elementData = this.state.entry.dictConfigs.xemplate[elementName]
      if (!elementData) {
        elementData = {
          shown: true,
          displayType: "inline",
          valueRenderType: "text-input"}
      } else {
        if (!("shown" in elementData)) {
          elementData.shown = true
        }
        if (!("displayType" in elementData)) {
          elementData.displayType = "inline"
        }
        if (!("valueRenderType" in elementData)) {
          elementData.valueRenderType = "text-input"
        }
      }
      return elementData
    },
    handleChildUpdate(data) {

      // Update content without creating new content/elements
      let content = Object.assign({}, this.content)
      if (!content.elements) {
        content.elements = this.createElementTemplate(data.elementName)
      } else if (!content.elements.find(el => {
        return el.name === data.elementName
      })) {
        content.elements.push(data.content)
        this.$emit("input", {content: content})
        return
      }

      let consecutiveNumber = 0
      for (const i in content.elements) {
        if (content.elements[i].name === data.elementName) {
          if (consecutiveNumber === data.editorChildNumber) {
            content.elements[i] = data.content
            break
          }
          consecutiveNumber++
        }
      }
      this.$emit("input", {content: content})
    },

    getComponentFromElementName(elementName) {
      const elementConfig = this.state.entry.dictConfigs.xemplate[elementName]
      let type = (elementConfig && elementConfig.displayType) || "inline"
      return this.displayTypeToComponentMap[type]
    }
  }
}
</script>

<style scoped>

</style>
