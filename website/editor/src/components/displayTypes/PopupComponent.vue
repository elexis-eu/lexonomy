<template>
  <div class="popup-component" :style="configStyles">
    <div>
      <!--      <button @click="openPopup">Open {{ elementName }}</button>-->
      <section v-if="elementData.shown" class="preview drop-shadow--100" @click="openPopup">
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
        <section>
          <component :is="valueComponent"
                     class="preview-element text--md"
                     :elementEditorConfig="elementData"
                     :elementName="elementName"
                     :elementData="elementData"
                     :content="componentData"
                     :isAttribute="isAttribute"
                     :parentElementName="parentElementName"
                     :forceReadOnlyElements="true"
                     @hide-children="hideChildren"
                     @input="handleValueUpdate"
          />

          <ComponentGeneratorComponent
            v-if="showChildren"
            class="preview-components"
            :children="children"
            :elementName="elementName"
            :content="calculatedContent"
            :forceReadOnlyElements="true"
            @input="handleChildUpdate"
          />
        </section>
      </section>
      <PopupDisplay v-model="showPopup">
        <component
          v-if="elementData.shown"
          :is="valueComponent"
          :elementEditorConfig="elementData"
          :elementName="elementName"
          :elementData="elementData"
          :content="componentData"
          :isAttribute="isAttribute"
          :parentElementName="parentElementName"
          @hide-children="hideChildren"
          @input="handleValueUpdate"
        />
        <ComponentGeneratorComponent
          v-if="showChildren"
          :children="children"
          :elementName="elementName"
          :content="calculatedContent"
          @input="handleChildUpdate"
        />
      </PopupDisplay>
    </div>
    <SelectElementFromArray
      v-if="showSelectNewParent"
      v-model="showSelectNewParent"
      :element-name="elementName"
      :possible-parent-elements="newPossibleParents"
      :parentElementName="parentElementName"
      @selected-element="handleSelectedNewParent"
    />
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import ActionButtons from "@/components/ActionButtons"
import layoutElementMixin from "@/shared-resources/mixins/layoutElementMixin"
import PopupDisplay from "@/components/PopupDisplay"
import SelectElementFromArray from "@/components/SelectElementFromArray"

export default {
  name: "PopupComponent",
  inject: ['$validator'],
  components: {
    ComponentGeneratorComponent,
    ActionButtons,
    PopupDisplay,
    SelectElementFromArray
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
    editorChildNumber: Number,
    isAttribute: Boolean,
    forceReadOnlyElements: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false,
      showChildren: true,
      updatedContent: null
    }
  },
  methods: {
    openPopup() {
      this.showPopup = true
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-component {
  padding: 8px 16px;
  margin-bottom: 8px;

  .preview {
    display: flex;
    padding: 8px;
    text-align: left;
    cursor: pointer;
    transition: 0.3s all;


    &:hover {
      box-shadow: 0px 2px 14px rgba(24, 24, 24, 0.2);
    }

    .actions-button {
      margin-right: 8px;
    }

    .preview-element {
      margin-left: -8px;
    }
  }
}

</style>
