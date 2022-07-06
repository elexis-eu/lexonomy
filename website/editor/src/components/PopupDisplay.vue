<template>
  <div ref="wrapper" v-if="!keepAlive && value" class="modal" @click="maybeClosePopup"
       :style="computedStyles">
    <div ref="modalContent" class="modal-content" :class="{'full-height': fullHeight, 'adjustable-height': !fullHeight}">
      <span class="close" @click="closeButtonClick">&times;</span>
      <slot></slot>
      <div v-if="!hideActions" class="default-actions">
        <button @click="$emit('save')">Ok</button>
        <button @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
  <div ref="wrapper" v-else-if="keepAlive" v-show="value" class="modal" @click="maybeClosePopup"
       :style="computedStyles">
    <div ref="modalContent" class="modal-content" :class="{'full-height': fullHeight, 'adjustable-height': !fullHeight}">
      <span class="close" @click="closePopup">&times;</span>
      <slot></slot>
      <div v-if="!hideActions" class="default-actions">
        <button @click="$emit('save')">Ok</button>
        <button @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PopupDisplay",
  inject: ["$validator"],
  props: {
    value: {
      type: Boolean,
      required: true
    },
    zIndex: {
      type: String,
      default: "2"
    },
    keepAlive: {
      type: Boolean,
      default: false
    },
    fullHeight: {
      type: Boolean,
      default: true
    },
    forceButtonClose: {
      type: Boolean,
      default: false
    },
    hideActions: {
      type: Boolean,
      default: false
    },
    saveButtonText: {
      type: String,
      default: "Save"
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          if (!this.popupId) {
            this.popupId = Math.random()
          }
          this.state.openedPopups.push(this.popupId)
          document.addEventListener('keydown', this.handleNavigationKeys)
        } else {
          document.removeEventListener('keydown', this.handleNavigationKeys)
        }
      },
      immediate: true
    }
  },
  computed: {
    computedStyles() {
      return {zIndex: this.zIndex}
    }
  },
  data() {
    return {
      popupId: null
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleNavigationKeys)
  },
  methods: {
    closeButtonClick() {
      if (!this.forceButtonClose) {
        this.closePopup()
      } else {
        this.$emit('cancel')
      }
    },
    maybeClosePopup(event) {
      if (event.target === this.$refs.wrapper) {
        if (!this.forceButtonClose) {
          this.closePopup()
        }
      }
    },
    closePopup() {
      this.$emit("input", false)
      this.$emit("cancel")
    },
    handleNavigationKeys(event) {
      if (!["Escape", "Enter"].includes(event.key)) {
        return
      }
      this.$nextTick(() => {
        if (this.state.openedPopups[this.state.openedPopups.length - 1] === this.popupId) {
          switch (event.key) {
            case "Escape":
              this.closePopup()
              this.state.openedPopups.pop()
              break
            case "Enter":
              this.$emit("save")
          }
        }
      })

    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  display: block;
  position: fixed; /* Stay in place */
  z-index: 2; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  max-height: 100%;
  overflow: hidden;
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  position: relative;
  width: 80%; /* Could be more or less, depending on screen size */
  max-height: 70%;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 15px 12px;
  border: 1px solid #888;
  border-radius: 16px;
  background-color: #fefefe;

  &.full-height {
    height: calc(100% - 60px);
    max-height: calc(100% - 60px);
    margin: 30px auto;
  }

  &.adjustable-height {
    overflow-y: auto;
    padding-bottom: 0;
  }
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

.default-actions {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 24px;
  z-index: 1;

  .adjustable-height & {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: 15px;
    background-color: white;
    box-shadow: 0px -5px 10px 0px rgb(255 255 255);
  }

  button {
    margin-left: 16px;
  }
}
</style>
