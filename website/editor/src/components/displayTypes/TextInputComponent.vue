<template>
  <div>
    <section class="text-input" v-if="elementData.shown">
        <label :for="elementName">{{elementName}}:</label>
        <input :name="elementName" v-model="value">
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
    },
  },
  data() {
    return {
      value: "",

    }
  },
  watch: {
    value(newVal) {
      if (newVal === this.content.text) {
        return
      }
      let elements = Object.assign({}, this.content)
      elements.text = newVal
      this.$emit('input', {elementName: this.elementName, elements: [elements]})
    }
  },
  mounted() {
    this.value = this.content.text
  },
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
