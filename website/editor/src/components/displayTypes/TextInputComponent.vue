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
      if (newVal === this.content._text) {
        return
      }
      let content = Object.assign({}, this.content)
      content._text = newVal
      this.$emit('input', {elementName: this.elementName, content: content})
    }
  },
  mounted() {
    this.value = this.content._text
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
}
</style>
