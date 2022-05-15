<template>
  <div class="inline-component" :style="configStyles">
    <section v-if="elementData.shown" class="content">
      <ActionButtons
        v-if="!isAttribute"
        :elementName="elementName"
        :elementEditorConfig="elementData"
        :editorChildNumber="editorChildNumber"
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
                 :children="children"
                 :isAttribute="isAttribute"
                 :parentElementName="parentElementName"
                 @hide-children="hideChildren"
                 @input="handleValueUpdate"
      />
    </section>
    <ComponentGeneratorComponent
      v-if="elementData.valueType !== 'text-input-with-markup'"
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
    editorChildNumber: Number,
    isAttribute: Boolean
  }
}
</script>

<style scoped>
.inline-component {
  margin-bottom: 8px;
  padding: 8px;
}

.content {
  display: flex;
}
</style>
