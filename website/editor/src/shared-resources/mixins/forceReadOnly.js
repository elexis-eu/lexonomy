export default {
  props: {
    forceReadOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedClass() {
      // if (this.forceReadOnly && this.isAttribute) {
      //   return "text--xs"
      // }
      // return "text--md"
      return (this.forceReadOnly) ? "text--xs" : "text--md"
    },
    readOnly() {
      return this.elementData.readOnly || this.forceReadOnly
    }
  }
}
