<template>
  <div>
    <section class="media-input" v-if="elementData.shown">
      <label :for="computedElementName">{{ computedElementName }}:</label>
      <input :name="computedElementName" type="text" v-model="value">
      <button @click="$refs.imageSearcher.toggleOpen()">Search for image</button>
    </section>

    <ImageSearcher ref="imageSearcher" @selected="updateValue"/>

  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"
import ImageSearcher from "@/components/ImageSearcher"

export default {
  name: "MediaComponent",
  components: {ImageSearcher},
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  },
  mixins: [computedElementName],
  computed: {
    isMultimediaAPI() {
      return true
    }
  },
  data() {
    return {
      value: ""

    }
  },
  watch: {
    value(newVal) {
      if (newVal === this.content.text) {
        return
      }
      if (this.content.type === "attribute") {
        this.$emit('input', {elementName: this.elementName, attributes: {[this.content.name]: newVal}})
      } else {
        let elements = Object.assign({}, this.content)
        elements.text = newVal
        this.$emit('input', {elementName: this.elementName, elements: [elements]})
      }
    }
  },
  mounted() {
    this.value = this.content.text
  },
  methods: {
    updateValue(value) {
      this.value = value
    }
  }
}
</script>

<style lang="scss" scoped>

.media-input {
  display: flex;
  align-items: center;

  input {
    margin: 0;
  }

  label {
    font-size: 1rem;
    text-transform: capitalize;
    padding-right: 10px;
    color: inherit;
  }
}

</style>
