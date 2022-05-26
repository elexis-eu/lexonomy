<template>
  <div>
    <ul v-for="(typeElement) in renderedChildren"
        :key="typeElement.name"
    >
      <!--        :style="getEncompassingStyles(typeElement.name)"-->
      <CorpusComponent v-if="useExampleEngine(typeElement.name)" :element-name="typeElement.name"
                       @save="saveFromCorpus(typeElement, $event)"></CorpusComponent>
      <component v-for="element in typeElement.children"
                 :is="element.componentName"
                 :ref="element.props.elementName + element.props.editorChildNumber"
                 :key="element.props.key"
                 v-bind="element.props"
                 :class="{'is-attribute': element.props.isAttribute}"
                 @input="handleChildUpdate"
                 @create-element="createElement"
                 @move-element="moveElement"
                 @delete-element="deleteElement"
                 @clone-element="createElement"
                 style="display: list-item"
      />
    </ul>
  </div>
</template>

<script>
import {xml2js} from "xml-js"
import CorpusComponent from "@/components/CorpusComponent"
import corpusMixin from "@/shared-resources/mixins/corpusMixin"

export default {
  name: "ComponentGeneratorComponent",
  inject: ['$validator'],
  components: {
    CorpusComponent
  },
  props: {
    children: Array,
    elementEditorConfig: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    },
    forceReadOnlyElements: {
      type: Boolean,
      default: false
    }
  },
  mixins: [
    corpusMixin
  ],
  data() {
    return {
      displayTypeToComponentMap: {
        "popup": "PopupComponent",
        "inline": "InlineComponent",
        "read-only": "ReadOnlyComponent",
        "text-input": "TextInputComponent",
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
    useExampleEngine() {
      return !this.forceReadOnlyElements
    },
    getEncompassingStyles(elementName) {
      let gutter = this.state.entry.dictConfigs.xemplate[elementName].gutter
      let listStyle = "none"
      switch (gutter) {
        case "disk":
          listStyle = "disc"
          break
        case "square":
          listStyle = "square"
          break
        case "diamond":
        case "arrow":
        case "handing":
          break
        case "indent":
          return {marginLeft: "40px"}
        case "sensenum0":
          listStyle = "upper-roman"
          break
        case "sensenum1":
          listStyle = "decimal"
          break
        case "sensenum2":
          listStyle = "lower-alpha"
          break
        case "sensenum3":
          listStyle = "lower-roman"
          break
      }
      return {
        listStyleType: listStyle,
        listStylePosition: "inside",
        textAlign: "left"
      }
    },
    // Update only content of children to prevent re-rendering of whole structure
    updateContentInChildren(newContent) {
      if (!newContent || (!newContent.elements && !newContent.attributes)) {
        return
      }
      for (let elementType of this.renderedChildren) {
        let newContentForChildType
          if (elementType.children[0].props.isAttribute) {
            if (newContent.attributes) {
              newContentForChildType = [{type: "attribute", name: elementType.name, text: newContent.attributes[elementType.name]}]
            }
        } else {
            if (newContent.elements) {
              newContentForChildType = newContent.elements.filter(element => {
                return element.name === elementType.name
              })
            }
        }
        if (newContentForChildType.length === 0) {
          if (elementType.children.length > 0) {
            this.loadNewData(newContent)
          }
          continue
        }
        let childrenToRemove = []
        for (let i in elementType.children) {
          let renderedChild = elementType.children[i]

          let renderedChildRefs = this.$refs[renderedChild.props.elementName + renderedChild.props.editorChildNumber]
          let renderedChildRef = (renderedChildRefs && renderedChildRefs[0]) || null

          let newContent
          if (newContentForChildType.length !== elementType.children.length) {
            newContent = newContentForChildType.find(child => child._index === renderedChild.props.editorChildNumber)
          } else {
            newContent = newContentForChildType[renderedChild.props.editorChildNumber]
          }
          if (renderedChildRef && newContent) {
            renderedChildRef.updateContent(newContent)
          }
          if (renderedChildRef && !newContent) {
            // Save indexes of children to remove
            childrenToRemove.push(Number(i))
          }
        }
        if (childrenToRemove.length > 0) {
          while (childrenToRemove.length > 0) {
            // pop from array to guarantee elements are on proper index
            let indexToRemove = childrenToRemove.pop()
            elementType.children.splice(indexToRemove, 1)
          }
          elementType.children.forEach((child, i) => {
            child.props.editorChildNumber = i
          })
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
        let elementData = this.getElementData(elementName, this.elementName, child.isAttribute)
        this.state.entry.dictConfigs.xemplate[elementName] = elementData

        // Calculate component name to render
        // !!!MUST WAIT FOR NEW ELEMENT DATA TO SET!!!
        let componentName = this.getComponentFromElementName(elementName, child.isAttribute)


        //  Get XML content for current element instance
        let content = [{}]
        if (child.isAttribute) {
          let attrValue = XMLContent.attributes && XMLContent.attributes[elementName]
          content = [{type: "attribute", name: elementName, text: attrValue}]
        } else {
          if (Array.isArray(XMLContent && XMLContent.elements)) {
            content = XMLContent.elements.filter(element => {
              return element.name === elementName
            })
            if (content.length === 0) {
              content = [{}]
            }
          }
        }
        // Decide if multiple instances need to be made and push children to array to be rendered

        let sameTypeChildren = []
        if (Array.isArray(content)) {
          content.forEach((contentInstance, index) => {
            // Add elements to render list
            sameTypeChildren.push({
              componentName: componentName,
              props: {
                elementName: elementName,
                children: this.getElementChildren(elementName, contentInstance),
                content: contentInstance,
                elementData: elementData,
                editorChildNumber: index,
                parentElementName: this.elementName,
                numberOfElements: content.length,
                isAttribute: child.isAttribute,
                forceReadOnlyElements: this.forceReadOnlyElements,
                key: Math.random()
              }
            })
          })
        } else {
          // content._editorChildNumber = 0
          sameTypeChildren.push({
            componentName: componentName,
            props: {
              elementName: elementName,
              children: this.getElementChildren(elementName, content),
              content: content,
              elementData: elementData,
              editorChildNumber: 0,
              parentElementName: this.elementName,
              numberOfElements: content.length,
              isAttribute: child.isAttribute,
              forceReadOnlyElements: this.forceReadOnlyElements,
              key: Math.random()
            }
          })
        }

        this.renderedChildren.push({
          name: elementName,
          children: sameTypeChildren
        })
      })
    },

    createElementTemplate(elementName) {
      return xml2js(`<${elementName}></${elementName}>`, this.state.xml2jsConfig).elements
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
    },
    handleChildUpdate(data) {
      let content = Object.assign({}, this.content)
      if (data.isAttribute) {
        content.attributes = {...content.attributes, ...data.content}
        this.$emit("input", {content: content})
        return true
      }
      // Update content without creating new content/elements
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
      let contentUpdated = false
      for (const i in content.elements) {
        if (content.elements[i].name === data.elementName) {
          if (consecutiveNumber === data.editorChildNumber) {
            contentUpdated = true
            content.elements[i] = data.content
            break
          }
          consecutiveNumber++
        }
      }
      if (!contentUpdated) {
        this.appendElementAfterSameNameSiblings(data.elementName, content, data.content)
      }
      this.$emit("input", {content: content})
    },

    getComponentFromElementName(elementName, parentName, isAttribute) {
      if (this.forceReadOnlyElements) {
        return this.displayTypeToComponentMap["inline"]
      }
      let formatterConfig = this.state.entry.dictConfigs.xemplate
      let elementConfig
      if (isAttribute) {
        elementConfig = formatterConfig[parentName].attributes && formatterConfig[parentName].attributes[elementName]
      } else {
        elementConfig = formatterConfig[elementName]
      }
      let type = (elementConfig && elementConfig.displayType) || "inline"
      return this.displayTypeToComponentMap[type]
    },

    appendElementAfterSameNameSiblings(data, content, newContent) {
      let elements = content.elements || []
      let locationOfLastElement = elements.map(el => el.name).lastIndexOf(data.name)
      if (locationOfLastElement >= 0) {

        elements.splice(locationOfLastElement + 1, 0, newContent)
      } else {
        elements.push(newContent)
      }
      content.elements = elements
      this.loadNewData(content)

    },

    createElement(data) {
      let nextChildNumber = this.content.elements.filter(el => el.name === data.name).length
      this.handleChildUpdate({
        elementName: data.name,
        editorChildNumber: nextChildNumber,
        content: data.content || this.createElementTemplate(data.name)[0]
      })
    },

    moveElement({name, direction, position}) {
      let elements = this.content.elements || []
      if (!this.isNewPositionInBounds(elements, name, position, direction)) {
        return
      }
      let elementToMoveIndex = this.getPositionOfElementInContent(name, position, this.content)

      var element = elements[elementToMoveIndex]
      elements.splice(elementToMoveIndex, 1)
      elements.splice(elementToMoveIndex + direction, 0, element)

      let content = Object.assign({}, this.content)
      content.elements = elements
      this.loadNewData(content)
      this.$emit("input", {content: content})
    },
    deleteElement({name, position}) {
      let elements = this.content.elements || []
      let consecutiveNumber = 0
      let elementToDeleteIndex
      for (const i in elements) {
        if (elements[i].name === name) {
          elements[i]._index = consecutiveNumber
          if (consecutiveNumber === position) {
            elementToDeleteIndex = i
          }
          consecutiveNumber++
        }
      }
      elements.splice(elementToDeleteIndex, 1)

      let content = Object.assign({}, this.content)
      content.elements = elements
      this.$emit("input", {content: content})
    },
    isNewPositionInBounds(elements, elementName, position, direction) {
      let newPosition = position + direction
      let elementsLength = elements.filter(el => el.name === elementName).length
      return newPosition >= 0 && newPosition < elementsLength
    },
    getPositionOfElementInContent(name, position, content) {
      let elements = content.elements
      let consecutiveNumber = 0
      let elementToMoveIndex
      for (const i in elements) {
        if (elements[i].name === name) {
          if (consecutiveNumber === position) {
            elementToMoveIndex = i
            break
          }
          consecutiveNumber++
        }
      }
      return elementToMoveIndex
    }
  }
}
</script>

<style lang="scss" scoped>
.is-attribute {
  padding: 0 !important;
  margin: 0;
}
</style>
