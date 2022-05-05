<template>
  <div class="popup" v-if="elementData.shown">
    <button @click="openPopup">Open {{ elementName }}</button>

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

    <div v-show="showPopup" class="modal" @click="closePopup">
      <div class="modal-content" @click.stop="">
        <span class="close" @click="closePopup">&times;</span>
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
    editorChildNumber: Number
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
    closePopup() {
      this.showPopup = false
    }
  }
}
</script>

<style scoped>
.popup {
  /*border: 1px solid #eee;*/
}

.modal {
  display: block;
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
