<template>
<!--  <div v-if="!keepAlive">-->
    <div ref="wrapper" v-if="!keepAlive && value" class="modal" @click="maybeClosePopup" :style="computedStyles">
      <div ref="modalContent" class="modal-content">
        <span class="close" @click="closePopup">&times;</span>
        <slot></slot>
      </div>
    </div>
<!--  </div>-->
<!--  <div v-else>-->
    <div ref="wrapper" v-else-if="keepAlive" v-show="value" class="modal" @click="maybeClosePopup" :style="computedStyles">
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
      default: "1"
    },
    keepAlive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedStyles() {
      return {zIndex: this.zIndex}
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
