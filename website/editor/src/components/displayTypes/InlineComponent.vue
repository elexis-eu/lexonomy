<template>
  <div class="inline-component" :class="{'read-only': forceReadOnlyElements}" :style="configStyles">
    <section v-if="elementData.shown && !readOnly" class="content">
      <ActionButtons
        v-if="!isAttribute"
        class="actions-button"
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
<!--     for ActionButton   :class="{'hide': isAttribute}"-->
        <component :is="valueComponent"
                 class="value-display"
                 :elementEditorConfig="elementData"
                 :elementName="elementName"
                 :elementData="elementData"
                 :content="componentData"
                 :children="children"
                 :isAttribute="isAttribute"
                 :parentElementName="parentElementName"
                 :forceReadOnly="forceReadOnlyElements"
                 @hide-children="hideChildren"
                 @input="handleValueUpdate"
      />
    </section>
    <section v-if="elementData.shown && readOnly">
      <component :is="valueComponent"
                 :elementEditorConfig="elementData"
                 :elementName="elementName"
                 :elementData="elementData"
                 :content="componentData"
                 :children="children"
                 :isAttribute="isAttribute"
                 :parentElementName="parentElementName"
                 :forceReadOnly="forceReadOnlyElements"
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
      :forceReadOnlyElements="forceReadOnlyElements"
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
  inject: ['$validator'],
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
    isAttribute: Boolean,
    forceReadOnlyElements: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.inline-component {
  margin-bottom: 8px;
  padding: 8px 0 8px 8px;

  .actions-button {
    margin-right: 8px;

    &.hide {
      display: block !important;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  }

  .content {
    display: flex;

    .value-display {
      flex: 1;
    }
  }

  &.read-only {
    padding: 0;
    margin-bottom: 0;
    text-align: left;

    p {
      padding: 0;
      padding-bottom: 4px;
    }

  }

}

</style>
