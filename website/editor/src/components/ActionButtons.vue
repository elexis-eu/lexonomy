<template>
  <div v-if="!isRootElement" ref="actionButton" class="dropdown">
    <button @click="toggleDropdown">...</button>
    <div v-show="show" class="vue-dropdown-content">
      <a v-if="canMoveElementDown" @click="triggerEvent('move-element-down')">Move {{ elementName }} down</a>
      <a v-if="canMoveElementUp" @click="triggerEvent('move-element-up')">Move {{ elementName }} up</a>
      <a v-if="canAddElement" @click="triggerEvent('add-element')">Create new {{ elementName }}</a>
      <a v-if="canAddElement && elementEditorConfig.enableCopying" @click="triggerEvent('clone-element')">Duplicate {{ elementName }}</a>
      <a v-if="canRemoveElement" @click="triggerEvent('remove-element')">Remove selected {{ elementName }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActionButtons",
  props: {
    elementName: String,
    elementEditorConfig: Object,
    parentElementName: String,
    numberOfElements: Number,
    editorChildNumber: Number
  },
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
      return childElement && (childElement.max === 0 || this.numberOfElements < childElement.max)
    },
    canRemoveElement() {
      let parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].children || []
      let childElement = parentChildren.find(el => el.name === this.elementName)
      // if (!childElement) {
      //   parentChildren = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
      //   childElement = parentChildren[this.elementName]
      // }
      return childElement && (childElement.min === 0 || this.numberOfElements < childElement.min)
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
