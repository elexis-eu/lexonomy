<template>
  <div class="popup" :style="configStyles">
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
            :elementEditorConfig="elementData"
            :elementName="elementName"
            :content="calculatedContent"
            :forceReadOnlyElements="true"
            @input="handleChildUpdate"
          />
        </section>
      </section>
      <div v-if="showPopup" ref="wrapper" class="modal" @click="maybeClosePopup">
        <div ref="modalContent" class="modal-content">
          <span class="close" @click="closePopup">&times;</span>
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
            :elementEditorConfig="elementData"
            :elementName="elementName"
            :content="calculatedContent"
            @input="handleChildUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import ActionButtons from "@/components/ActionButtons"
import layoutElementMixin from "@/shared-resources/mixins/layoutElementMixin"

export default {
  name: "PopupComponent",
  components: {
    ComponentGeneratorComponent,
    ActionButtons
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
    },
    maybeClosePopup(event) {
      if (event.target === this.$refs.wrapper) {
        this.closePopup()
      }
    },
    closePopup() {
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
.popup {
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

  .modal {
    display: block;
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    max-height: 100%;
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 15px 12px;
    border: 1px solid #888;
    border-radius: 16px;
    width: 80%; /* Could be more or less, depending on screen size */
  }

  /* The Close Button */
  .close {
    color: #B6BFC9;
    float: right;
    font-size: 28px;

    &:hover,
    &:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
  }
}

</style>
