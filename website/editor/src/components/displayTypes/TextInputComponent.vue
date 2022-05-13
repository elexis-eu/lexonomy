<template>
  <div>
    <section class="text-input" v-if="elementData.shown">
      <label :for="elementName">{{ elementName }}:</label>
      <textarea v-if="this.elementData.editorInputType === 'textarea'"
                name="elementName"
                cols="30"
                rows="10"
                v-model="value"/>
      <input v-else :name="elementName" :type="getInputType()" v-model="value">
    </section>
  </div>
</template>

<script>

export default {
  name: "TextInputComponent",
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
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
    getInputType() {
      switch (this.elementData.editorInputType) {
        case "number":
        case "text":
          return this.elementData.editorInputType
        default:
          return "text"
      }
    }
  }
}
</script>

<style scoped>
.text-input {
  display: flex;
  align-items: baseline;

}

label {
  font-size: 1rem;
  text-transform: capitalize;
  padding-right: 10px;
  color: inherit;
}
</style>
