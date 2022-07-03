export default {
  props: {
    forceReadOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedClass() {
      return (this.forceReadOnly) ? "text--xs" : "text--md"
    },
    readOnly() {
      return this.elementData.readOnly || this.forceReadOnly
    }
  }
}
