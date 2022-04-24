<template>
  <div>
    <!--    <component v-for="element in children"-->
    <!--               :key="Object.keys(element)[0]"-->
    <!--               :is="getComponentFromElementName(element)"-->
    <!--               v-bind="getPropsForElement(element)"-->
    <!--    />-->

    <component v-for="element in renderedChildren"
               :key="element.props.elementName + '-' + Math.random()"
               :is="element.componentName"
               v-bind="element.props"
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
        console.log("Content changed")
        this.loadNewData(newVal)
      },
      deep: true
    }
  },
  created() {
    //  create components from content

    if(this.elementName === "sense") {
      // eslint-disable-next-line no-debugger
      // debugger
    }
    this.loadNewData(this.content)
  },
  methods: {
    loadNewData(XMLContent) {
      // console.log("")
      // console.log(`loadNewData for ${this.elementName}:`)
      // console.log("Content:", XMLContent)
      // // console.log("Children:", this.children)
      // console.log("ElementEditorData", this.elementEditorConfig)
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
        let content = {}
        for (const [key, value] of Object.entries(XMLContent)) {
          if(key == elementName) {
            content = value
            break
          }
        }
        // Decide if multiple instances need to be made and push children to array to be rendered
        if(Array.isArray(content)) {
          for (const contentInstance of content) {
            this.renderedChildren.push({
              componentName: componentName,
              props: {
                elementName: elementName,
                children: children,
                content: contentInstance,
                elementData: elementData
              }
            })
          }
        } else {
          this.renderedChildren.push({
            componentName: componentName,
            props: {
              elementName: elementName,
              children: children,
              content: content,
              elementData: elementData
            }
          })
        }

      })
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
