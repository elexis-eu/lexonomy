<template>
  <div v-if="!isRootElement" ref="actionButton" class="dropdown">
    <button class="button--sm secondary" @click.prevent.stop.stop="toggleDropdown" :disabled="disable || numberOfActions === 0">
      {{ buttonText }}
    </button>
    <div v-show="show" class="vue-dropdown-content">
      <button v-if="canMoveElementUp"
              class="tertiary"
              @click.prevent.stop="triggerEvent('move-element-up')">
        Move {{ computedElementName }} <img :src="iconUrl('arrow-up.svg')">
      </button>
      <button v-if="canMoveElementDown"
              class="tertiary"
              @click.prevent.stop="triggerEvent('move-element-down')">
        Move {{ computedElementName }} <img :src="iconUrl('arrow-down.svg')">
      </button>
      <div v-if="canMoveElementDown || canMoveElementUp" class="break"></div>
      <button v-if="canAddElement && !subentryElement"
              class="tertiary"
              @click.prevent.stop="triggerEvent('add-element')">
        Create new {{ computedElementName }}
      </button>
      <button v-if="canAddElement && elementEditorConfig.enableCopying"
              class="tertiary"
              @click.prevent.stop="triggerEvent('clone-element')">
        Duplicate {{ computedElementName }}
      </button>
      <button v-if="canAddElement && subentryElement"
              class="tertiary"
              @click.prevent.stop="triggerEvent('link-element')">
        Add new {{ computedElementName }} subentry
      </button>
      <button v-if="elementEditorConfig.enableParentChange"
              class="tertiary"
              @click.prevent.stop="triggerEvent('select-new-parent')">
        Change parent of {{ computedElementName }}
      </button>
      <button v-if="canAddLink"
              class="tertiary"
              @click.prevent.stop="triggerEvent('add-link')">
        Link to another element
      </button>
      <div v-if="canAddElement && canRemoveElement" class="break"></div>
      <button v-if="canRemoveElement"
              class="tertiary"
              @click.prevent.stop="triggerEvent('remove-element')">
        Remove selected {{ computedElementName }}
      </button>
    </div>
  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"
import iconUrl from "@/shared-resources/mixins/iconUrl"

export default {
  name: "ActionButtons",
  props: {
    elementName: String,
    elementEditorConfig: Object,
    parentElementName: String,
    numberOfElements: Number,
    editorChildNumber: Number,
    subentryElement: Boolean,
    disable: {
      type: Boolean,
      default: false
    }
  },
  mixins: [
    computedElementName,
    iconUrl
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
    buttonText() {
      const xemplate = this.state.entry.dictConfigs.xemplate
      if (!xemplate || !xemplate[this.elementName]) {
        return this.computedElementName
      }
      switch(xemplate[this.elementName].gutter) {
        case "sensenum0":
        case "sensenum1":
        case "sensenum2":
        case "sensenum3":
          return (this.editorChildNumber+1) + ". " + this.computedElementName
        default:
          return this.computedElementName
      }
    },
    numberOfActions() {
      return [this.canAddElement, this.canRemoveElement, this.canMoveElementUp, this.canMoveElementDown].filter(bool => bool === true).length
    },
    canAddElement() {
      const xemaElements = this.state.entry.dictConfigs.xema.elements
      let parentChildren = (xemaElements && xemaElements[this.parentElementName] && xemaElements[this.parentElementName].children) || []
      let childElement = parentChildren.find(el => el.name === this.elementName)
      return childElement && (!Number(childElement.max) || this.numberOfElements < Number(childElement.max))
    },
    canRemoveElement() {
      const xemaElements = this.state.entry.dictConfigs.xema.elements
      let parentChildren = (xemaElements && xemaElements[this.parentElementName] && xemaElements[this.parentElementName].children) || []
      let childElement = parentChildren.find(el => el.name === this.elementName)
      return childElement && (!Number(childElement.min) || this.numberOfElements > Number(childElement.min))
    },
    canAddLink() {
      return this.state.entry.dictConfigs.linking[this.elementName]
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
.dropdown {
  position: relative;
  display: flex;
  align-items: center;

  img {
    filter: invert(56%) sepia(100%) saturate(7500%) hue-rotate(203deg) brightness(90%) contrast(101%);
  }
}

.vue-dropdown-content {
  display: block;
  position: absolute;
  width: max-content;
  top: calc(50% + 20px);
  background-color: #fff;
  border: 1px solid #D9EAFF;
  border-radius: 4px;
  min-width: 160px;
  overflow: auto;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 2;

  .break {
    border-bottom: 1px solid #D9EAFF;
  }

  button {
    display: block;
    //padding: 12px 16px;
    //color: black;
    //text-decoration: none;
    cursor: pointer;

    //&:hover {
    //  background-color: #ddd;
    //}
  }
}
</style>
