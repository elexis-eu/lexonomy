<template>
  <div v-if="!isRootElement" ref="actionButton" class="dropdown">
    <button @click="toggleDropdown">...</button>
    <div v-show="show" class="vue-dropdown-content">
      <a v-if="canMoveElementDown" @click="triggerEvent('move-element-down')">Move {{ computedElementName }} down</a>
      <a v-if="canMoveElementUp" @click="triggerEvent('move-element-up')">Move {{ computedElementName }} up</a>
      <a v-if="canAddElement" @click="triggerEvent('add-element')">Create new {{ computedElementName }}</a>
      <a v-if="canAddElement && elementEditorConfig.enableCopying" @click="triggerEvent('clone-element')">Duplicate {{ computedElementName }}</a>
      <a v-if="canRemoveElement" @click="triggerEvent('remove-element')">Remove selected {{ computedElementName }}</a>
    </div>
  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"

export default {
  name: "ActionButtons",
  props: {
    elementName: String,
    elementEditorConfig: Object,
    parentElementName: String,
    numberOfElements: Number,
    editorChildNumber: Number
  },
  mixins: [
    computedElementName
  ],
  data() {
    return {
      show: false
    }
  },
  computed: {
    isRootElement() {
      return this.elementName === this.state.entry.dictConfigs.xema.root
    },
    canAddElement() {
      let parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].children || []
      let childElement = parentChildren.find(el => el.name === this.elementName)
      // if (!childElement) {
      //   parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
      //   childElement = parentChildren[this.elementName]
      // }
      return childElement && (!childElement.max || this.numberOfElements < childElement.max)
    },
    canRemoveElement() {
      let parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].children || []
      let childElement = parentChildren.find(el => el.name === this.elementName)
      // if (!childElement) {
      //   parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
      //   childElement = parentChildren[this.elementName]
      // }
      return childElement && (!childElement.min || this.numberOfElements > childElement.min)
    },
    canMoveElementDown() {
      return this.elementEditorConfig.enablePositionChange && this.editorChildNumber < this.numberOfElements - 1
    },
    canMoveElementUp() {
      return this.elementEditorConfig.enablePositionChange && this.editorChildNumber > 0
    }
  },
  watch: {
    show(show) {
      if (show) {
        window.addEventListener("click", this.watchForOutsideClick)
      } else {
        window.removeEventListener("click", this.watchForOutsideClick)
      }
    }
  },
  methods: {
    triggerEvent(event) {
      this.toggleDropdown()
      this.$nextTick(() => {
        this.$emit(event)
      })
    },
    toggleDropdown() {
      this.show = !this.show
    },
    watchForOutsideClick(event) {
      if (this.$refs.actionButton && !this.$refs.actionButton.contains(event.target)) {
        this.toggleDropdown()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  background-color: #3498DB;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: #2980B9;
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.vue-dropdown-content {
  display: block;
  position: absolute;
  width: max-content;
  background-color: #f1f1f1;
  min-width: 160px;
  overflow: auto;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 2;

  a {
    display: block;
    padding: 12px 16px;
    color: black;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background-color: #ddd;
    }
  }
}
</style>
