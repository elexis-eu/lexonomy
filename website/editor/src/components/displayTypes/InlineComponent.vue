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
      }
      let textElement = this.calculatedContent.elements && this.calculatedContent.elements.find(element => {
        return element.type === "text" && !element.name
      })
      return textElement || {}
    },
  },
  data () {
    return {
      showChildren: true,
      updatedContent: null
    }
  },
  methods: {
    hideChildren() {
      this.showChildren = false
    },
    handleValueUpdate(data) {
      let content = {...this.content, ...{elements: data.elements}}
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
