export default {
  props: {
    showPreview: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedClass() {
      return (this.showPreview) ? "text--xs" : "text--md"
    },
    readOnly() {
      return this.elementData.readOnly || this.showPreview
    }
  }
}
