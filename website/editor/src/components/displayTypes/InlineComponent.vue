<template>
  <div class="inline-component" :style="configStyles">
    <section class="content">
      <ActionButtons
        :elementName="elementName"
        :elementEditorConfig="elementData"
        :parentElementName="parentElementName"
      />
      <component :is="valueComponent"
                 :elementEditorConfig="elementData"
                 :elementName="elementName"
                 :elementData="elementData"
                 :content="componentData"
                 @hide-children="hideChildren"
                 @input="handleValueUpdate"
      />
    </section>
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
import ActionButtons from "@/components/ActionButtons"

export default {
  name: "InlineComponent",
  components: {
    ActionButtons,
    ComponentGeneratorComponent
  },
  mixins: [
    valueDisplayMixin
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    parentElementName: String,
    content: {
      type: [Object, Array],
      required: true
    },
    childrenContent: Object,
    editorChildNumber: Number
  },
  computed: {
    configStyles() {
      let output = {}
      for (const [style, value] of Object.entries(this.elementData)) {
        switch (style) {
          case "background":
          case "color":
            output[style] = value
            break
          case "border":
            output.border = `1px ${value}`
            break
          case "slant":
            output.fontStyle = value
            break
          case "weight":
            output.fontWeight = value
        }
      }
      return output

    },
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
.inline-component {
    margin-bottom: 16px;
    padding: 8px;
}
.content {
  display: flex;
}
</style>
