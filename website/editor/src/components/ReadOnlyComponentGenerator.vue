<template>
  <div>
    <section v-for="element in renderedChildren"
             :key="element.props.key"
             class="component drop-shadow--100"
             @click="$emit('selected-element', element)"
    >
      <component
        :is="element.componentName"
        :ref="element.props.elementName + element.props.editorChildNumber"
        v-bind="element.props"
        :forceReadOnlyElements="true"
        :max-displayed-children="5"
        :class="{'is-attribute': element.props.isAttribute}"
      />
    </section>
  </div>
</template>

<script>

export default {
  name: "ReadOnlyComponentGenerator",
  props: {
    children: Array,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  },
  data() {
    return {
      renderedChildren: []

    }
  },
  watch: {
    content: {
      handler(newVal) {
        this.loadNewData(newVal)
      },
      deep: true
    }
  },
  created() {
    //  create components from content
    this.loadNewData(this.content)
  },
  methods: {
    loadNewData(XMLContent) {
      this.renderedChildren = []
      if (!this.children) {
        return
      }
      XMLContent.forEach(child => {
        // eslint-disable-next-line no-debugger
        // debugger
        // Get element name
        let elementName = child.name

        //Extract element data and/or assign defaults
        let elementData = this.getElementData(elementName, child.parentName, child.isAttribute)
        elementData.hideElementName = false
        // Calculate component name to render
        // !!!MUST WAIT FOR NEW ELEMENT DATA TO SET!!!
        let componentName = "InlineComponent"


        //  Get XML content for current element instance
        let content = child
        // Decide if multiple instances need to be made and push children to array to be rendered


        this.renderedChildren.push({
          componentName: componentName,
          props: {
            elementName: elementName,
            children: this.getElementChildren(elementName, content),
            content: content,
            elementData: elementData,
            editorChildNumber: 0,
            parentElementName: this.elementName,
            numberOfElements: 1,
            isAttribute: child.isAttribute,
            forceReadOnlyElements: this.forceReadOnlyElements,
            key: Math.random()
          }
        })

      })
    },
    getElementChildren(elementName, content) {
      let elementInXema = this.state.entry.dictConfigs.xema.elements[elementName]
      let children = elementInXema && elementInXema.children
      if (elementInXema && Object.keys(elementInXema.attributes || {}).length > 0) {
        let mappedAttributes = Object.keys(elementInXema.attributes).map(att => {
          return {name: att, isAttribute: true}
        })
        children = mappedAttributes.concat(children)
      }
      if (content.elements) {
        let elemntsInContent = content.elements.filter(el => !!el.name)
        let differentElementsInXMLContent = elemntsInContent.map((value) => value.name).filter((value, index, _arr) => _arr.indexOf(value) === index).length
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

    getElementData(elementName, parentName, isAttribute) {
      let formatterConfig = this.state.entry.dictConfigs.xemplate
      let elementData
      if (isAttribute) {
        elementData = formatterConfig[parentName].attributes && formatterConfig[parentName].attributes[elementName]
      } else {
        elementData = formatterConfig[elementName]
      }

      if (!elementData) {
        elementData = {
          shown: true,
          displayType: "inline",
          valueRenderType: "text-input"
        }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.component {
  display: flex;
  margin: 8px;
  padding: 8px;
  text-align: left;
  cursor: pointer;
  transition: 0.3s all;

  &:hover {
    box-shadow: 0px 2px 14px rgba(24, 24, 24, 0.2);
  }
}
.is-attribute {
  padding: 0 !important;
  margin: 0;
}
</style>
