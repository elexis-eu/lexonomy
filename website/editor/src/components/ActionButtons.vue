<template>
  <div v-if="!isRootElement" ref="actionButton" class="dropdown">
    <button @click="toggleDropdown">...</button>
    <div v-show="show" class="vue-dropdown-content">
      <a @click="$emit('remove-element')">Remove {{ elementName }}</a>
      <a v-if="canAddElement" @click="$emit('add-element')">Create new {{ elementName }}</a>
      <a v-if="elementEditorConfig.enableCopying" @click="$emit('clone-element')">Duplicate {{ elementName }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActionButtons",
  props: {
    elementName: String,
    elementEditorConfig: Object,
    parentElementName: String
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
      let config = this.state.entry.dictConfigs.xema.elements[this.parentElementName].children[this.elementName]
      console.log(config)
      return true
      // eslint-disable-next-line no-debugger
      // debugger
    }
  },
  watch: {
    show(show) {
      if (show) {
        document.addEventListener("click", this.watchForOutsideClick)
      } else {
        document.removeEventListener("click", this.watchForOutsideClick)
      }
    }
  },
  methods: {
    toggleDropdown() {
      this.show = !this.show
    },
    watchForOutsideClick(event) {
      if (!this.$refs.actionButton.contains(event.target)) {
        this.toggleDropdown()
      }
    },
  }
}
</script>

<style scoped>
button {
  background-color: #3498DB;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

button:hover, button:focus {
  background-color: #2980B9;
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
}

.vue-dropdown-content a {
  display: block;
  padding: 12px 16px;
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.vue-dropdown-content a:hover {
  background-color: #ddd;
}

</style>
