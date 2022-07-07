<template>
  <div class="inline-component" :class="{'read-only': forceReadOnlyElements, 'element-hidden': !elementData.shown}"
       :style="configStyles">
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
        @select-new-parent="selectNewParent"
        @add-link="addLink"
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
      />
    </section>
    <ComponentGeneratorComponent
      v-if="valueComponent !== 'TextInputWithMarkupComponent'"
      :children="children"
      :elementName="elementName"
      :content="calculatedContent"
      :forceReadOnlyElements="forceReadOnlyElements"
      :maxDisplayedChildren="maxDisplayedChildren"
      @input="handleChildUpdate"
    />
    <SelectElementFromArray
      v-if="showSelectNewParent"
      v-model="showSelectNewParent"
      :element-name="elementName"
      :possible-parent-elements="newPossibleParents"
      :parentElementName="parentElementName"
      @selected-element="handleSelectedNewParent"
    />
    <LinkingElementSelector
      v-if="showSelectLinkedElement"
      v-model="showSelectLinkedElement"
      :sourceId="calculatedContent.attributes && calculatedContent.attributes['lxnm:linkable']"
      :element-name="elementName"
    />

  </div>
</template>

<script>

import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import ActionButtons from "@/components/ActionButtons"
import layoutElementMixin from "@/shared-resources/mixins/layoutElementMixin"
import SelectElementFromArray from "@/components/SelectElementFromArray"
import LinkingElementSelector from "@/components/LinkingElementSelector"

export default {
  name: "InlineComponent",
  inject: ['$validator'],
  components: {
    LinkingElementSelector,
    SelectElementFromArray,
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
    },
    maxDisplayedChildren: {
      type: Number,
      default: -1
    }
  }
}
</script>

<style lang="scss" scoped>
.inline-component {
  margin-bottom: 8px;
  padding: 8px 4px 0 4px;

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

  &.element-hidden {
    padding: 0;
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
