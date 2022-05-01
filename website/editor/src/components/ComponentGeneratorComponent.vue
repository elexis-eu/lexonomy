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
        // Update only content of children to prevent re-rendering of whole structure
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
    updateContentInChildren(newContent) {
      console.log(newContent)
      for (let renderedChild of this.renderedChildren) {
        let newContentForChild = newContent.elements.filter(element => {
          return element.name === renderedChild.props.elementName
        })
        // eslint-disable-next-line no-debugger
        // debugger
        if (newContentForChild.length === 0) {
          continue
        }

        let renderedChildRefs = this.$refs[renderedChild.props.elementName + renderedChild.props.editorChildNumber]
        let renderedChildRef = (renderedChildRefs && renderedChildRefs[0]) || null

        if (renderedChildRef && newContentForChild[renderedChild.props.editorChildNumber]) {
          console.log("update child content", renderedChild, newContentForChild[renderedChild.props.editorChildNumber])
          renderedChildRef.updateContent(newContentForChild[renderedChild.props.editorChildNumber])
        }

      }



      // for (const index in newContent.elements) {
      //   let foundRenderedChildren = this.renderedChildren.filter(child => {
      //     return child.props.elementName === newContent.elements[index].name
      //   })
      //   if (foundRenderedChildren.length > 0) {
      //
      //     // foundRenderedChildren.forEach((contentInstance, index) => {
      //       // eslint-disable-next-line no-debugger
      //       debugger
      //       let childProps = foundRenderedChildren[index].props
      //       if (this.$refs
      //         && this.$refs[childProps.elementName + childProps.editorChildNumber]
      //         && this.$refs[childProps.elementName + childProps.editorChildNumber][0]) {
      //         this.$refs[childProps.elementName + childProps.editorChildNumber][0].updateContent(newContent.elements[index])
      //       }
      //     // })
      //   }
      // }
    },
    loadNewData(XMLContent) {
      this.renderedChildren = []
      if (!this.children) {
        return
      }
      let entry = this.state.entry

      this.children.forEach(child => {
        // Get element name
        let elementName = child.name

        // Calculate component to render
        let componentName = this.getComponentFromElementName(elementName)

        //Extract element data
        let elementData = entry.dictConfigs.xemplate[elementName]

        //  Get element children
        let children = entry.dictConfigs.xema.elements[elementName].children

        //  Get XML content for current element instance
        let content = [{}]
        if (Array.isArray(XMLContent && XMLContent.elements)) {
          content = XMLContent.elements.filter(element => {
            return element.name === elementName
          })
          if (content.length === 0) {
            content.push({})
          }
        }
        // Decide if multiple instances need to be made and push children to array to be rendered
        if (Array.isArray(content)) {
          content.forEach((contentInstance, index) => {
            // contentInstance._editorChildNumber = index
            this.renderedChildren.push({
              componentName: componentName,
              props: {
                elementName: elementName,
                children: children,
                content: contentInstance,
                elementData: elementData,
                editorChildNumber: index
              }
            })
          })
        } else {
          // content._editorChildNumber = 0
          this.renderedChildren.push({
            componentName: componentName,
            props: {
              elementName: elementName,
              children: children,
              content: content,
              elementData: elementData,
              editorChildNumber: 0
            }
          })
        }

      })
    },

    createElementTemplate(elementName) {
      return xml2js(`<${elementName}></${elementName}>`, {compact: false}).elements
    },

    handleChildUpdate(data) {

      // Update content without creating new content/elements
      // eslint-disable-next-line no-debugger
      // debugger
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
      let type = elementConfig.displayType || "inline"
      return this.displayTypeToComponentMap[type]
    }
  }
}
</script>

<style scoped>

</style>
