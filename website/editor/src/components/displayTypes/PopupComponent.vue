<template>
  <div class="popup-component" :class="{'element-hidden': !elementData.shown}">
    <div>
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
          @select-new-parent="selectNewParent"
          @add-link="addLink"
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
                     :showElementsPreview="true"
                     @hide-children="hideChildren"
          />

          <ComponentGeneratorComponent
            v-if="showChildren"
            class="preview-components"
            :children="children"
            :elementName="elementName"
            :content="viewOnlyContent"
            :showElementsPreview="true"
            :hideEmptyElements="true"
            :maxDisplayedChildren="5"
          />
        </section>
      </section>
      <PopupDisplay v-model="showPopup"
                    :fullHeight="false"
                    :forceButtonClose="true"
                    saveButtonText="Ok"
                    @cancel="handleCancel"
                    @save="handleSave"
      >
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
          @input="handleTempValueUpdate"
        />
        <ComponentGeneratorComponent
          v-if="showChildren"
          :children="children"
          :elementName="elementName"
          :content="calculatedContent"
          @input="handleTempChildUpdate"
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
import PopupDisplay from "@/components/PopupDisplay"
import SelectElementFromArray from "@/components/SelectElementFromArray"
import {js2xml, xml2js} from "xml-js"
import LinkingElementSelector from "@/components/LinkingElementSelector"

export default {
  name: "PopupComponent",
  inject: ['$validator'],
  components: {
    LinkingElementSelector,
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
    showElementsPreview: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    viewOnlyContent() {
      return this.updatedContent || this.content
    },
    calculatedContent() {
      return this.updatedContent || this.unsavedData
    }
  },
  data() {
    return {
      showPopup: false,
      showChildren: true,
      updatedContent: null,
      dataOnPopupOpen: null,
      unsavedData: null
    }
  },
  created() {
    this.unsavedData = this.content
  },
  methods: {
    openPopup() {
      this.showPopup = true
      let deepCopy = this.createDeepCopy(this.calculatedContent).elements
      this.dataOnPopupOpen = (deepCopy && deepCopy[0]) ? deepCopy[0] : {}
    },
    handleCancel() {
      this.updatedContent = this.dataOnPopupOpen
      this.showPopup = false
    },
    handleSave() {
      this.showPopup = false
      this.$nextTick(() => {
        this.handleChildUpdate({content: this.unsavedData})
      })
    },
    handleTempValueUpdate(data) {
      this.unsavedData.elements = {...this.unsavedData.elements, ...data.elements}
    },
    handleTempChildUpdate(data) {
      this.unsavedData = data.content
    },
    createDeepCopy(content) {
      let xml = js2xml({elements: [content]}, this.state.xml2jsConfig)
      return xml2js(xml, this.state.xml2jsConfig)
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-component {
  padding: 8px 16px;
  margin-bottom: 8px;

  &.element-hidden {
    padding: 0;
  }

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
