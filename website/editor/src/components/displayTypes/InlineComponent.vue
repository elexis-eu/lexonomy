<template>
  <div class="inline-component" :style="configStyles">
    <section v-if="elementData.shown" class="content">
      <ActionButtons
        :elementName="elementName"
        :elementEditorConfig="elementData"
        :parentElementName="parentElementName"
        :numberOfElements="numberOfElements"
        @move-element-down="moveElementDown"
        @move-element-up="moveElementUp"
        @add-element="createSibling"
        @clone-element="cloneElement"
        @remove-element="deleteElement"
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
import ActionButtons from "@/components/ActionButtons"
import layoutElementMixin from "@/shared-resources/mixins/layoutElementMixin"

export default {
  name: "InlineComponent",
  components: {
    ActionButtons,
    ComponentGeneratorComponent
  },
  mixins: [
    layoutElementMixin
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    parentElementName: String,
    numberOfElements: Number,
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
  },
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
