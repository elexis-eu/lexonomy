<template>
  <!--  <div v-if="!keepAlive">-->
  <div ref="wrapper" v-if="!keepAlive && value" class="modal" @click="maybeClosePopup"
       :style="computedStyles">
    <div ref="modalContent" class="modal-content">
      <span class="close" @click="closePopup">&times;</span>
      <slot></slot>
    </div>
  </div>
  <!--  </div>-->
  <!--  <div v-else>-->
  <div ref="wrapper" v-else-if="keepAlive" v-show="value" class="modal" @click="maybeClosePopup"
       :style="computedStyles">
    <div ref="modalContent" class="modal-content">
      <span class="close" @click="closePopup">&times;</span>
      <slot></slot>
    </div>
  </div>
  <!--  </div>-->
</template>

<script>
export default {
  name: "PopupDisplayComponent",
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
          document.addEventListener('keydown', this.handleEscKey)
        }
      },
      immediate: true
    },
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
  methods: {
    maybeClosePopup(event) {
      if (event.target === this.$refs.wrapper) {
        this.closePopup()
      }
    },
    closePopup() {
      this.$emit('input', false)
    },
    handleEscKey(event) {
      if (event.key !== "Escape") {
        return
      }
      this.$nextTick(() => {
        if (this.state.openedPopups[this.state.openedPopups.length - 1] === this.popupId) {
          document.removeEventListener('keydown', this.handleEscKey)
          this.closePopup()
          this.state.openedPopups.pop()
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
</style>
