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
      for (const [elementName, content] of Object.entries(newContent)) {
        let foundChildren = this.renderedChildren.filter(child => {
          return child.props.elementName === elementName
        })
        if (foundChildren.length > 0) {

          if (Array.isArray(content)) {
            content.forEach((contentInstance, index) => {
              let childProps = foundChildren[index].props
              this.$refs[childProps.elementName + childProps.editorChildNumber][0].updateContent(contentInstance)
            })
          } else {
            let childProps = foundChildren[0].props
            this.$refs[childProps.elementName + childProps.editorChildNumber][0].updateContent(content)
          }
        }
      }
    },
    loadNewData(XMLContent) {
      this.renderedChildren = []
      if(!this.children) {
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
        let content = XMLContent[elementName] || {}

        // Decide if multiple instances need to be made and push children to array to be rendered
        if(Array.isArray(content)) {
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

    handleChildUpdate(data) {
      let content = Object.assign({}, this.content)
      if (Array.isArray(content[data.elementName])) {
        content[data.elementName][data.editorChildNumber] = data.content
      } else {
        content[data.elementName] = data.content
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
