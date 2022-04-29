<template>
  <div>
      <section v-if="elementData.shown">
      </section>
      <component :is="valueComponent"
                 :elementEditorConfig="elementData"
                 :elementName="elementName"
                 :elementData="elementData"
                 :content="calculatedContent"
                 @hide-children="hideChildren"
                 @input="handleValueUpdate"
      />
      <ComponentGeneratorComponent
              v-if="showChildren"
              :children="children"
              :elementEditorConfig="elementData"
              :elementName="elementName"
              :content="calculatedContent"
              @input="handleValueUpdate"
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
    }
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
