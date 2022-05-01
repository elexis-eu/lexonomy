<template>
  <div>
    <section v-if="elementData.shown">
    </section>
    <component :is="valueComponent"
               :elementEditorConfig="elementData"
               :elementName="elementName"
               :elementData="elementData"
               :content="componentData"
               @hide-children="hideChildren"
               @input="handleValueUpdate"
    />
    <ComponentGeneratorComponent
      v-if="showChildren"
      :children="children"
      :elementEditorConfig="elementData"
      :elementName="elementName"
      :content="calculatedContent"
      @input="handleChildUpdate"
    />
  </div>
</template>

<script>

import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import valueDisplayMixin from "@/shared-resources/mixins/valueDisplayMixin"
import {xml2js} from "xml-js"

export default {
  name: "InlineComponent",
  components: {
    ComponentGeneratorComponent
  },
  mixins: [
    valueDisplayMixin
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    },
    childrenContent: Object,
    editorChildNumber: Number
  },
  computed: {
    calculatedContent() {
      return this.updatedContent || this.content
    },
    componentData() {
      if (this.elementData.valueRenderType === "text-input-with-markup") {
        return this.calculatedContent.elements
          || [
            {text: "", type: "text"},
            {name: this.state.entry.dictConfigs.xampl.markup, type: "element", elements: [{type: "text", text: ""}]},
            {text: "", type: "text"}
          ]
      }
      let textElement = this.calculatedContent.elements && this.calculatedContent.elements.find(element => {
        return element.type === "text" && !element.name
      })
      return textElement || {text: "", type: "text"}
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
    }
  }
}
</script>

<style scoped>

</style>
