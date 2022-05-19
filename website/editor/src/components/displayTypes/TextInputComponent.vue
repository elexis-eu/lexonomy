<template>
  <div>
    <section class="text-input" v-if="elementData.shown && !readOnly">
      <label class="text--md" :for="computedElementName">{{ computedElementNameWithColon }}</label>
      <textarea v-if="this.elementData.editorInputType === 'textarea'"
                name="elementName"
                cols="30"
                rows="10"
                v-model="value"/>
      <input v-else
             :name="computedElementName"
             :type="getInputType()"
             :placeholder="computedElementName"
             v-model="value">
      <button v-if="elementData.interactivity" class="button--sm tertiary" @click="previewValue" style="margin-left: 8px;">Preview</button>
    </section>
    <section class="read-only" v-if="elementData.shown && readOnly">
      <p :class="computedClass">{{ computedElementNameWithColon }} {{ value }}</p>
    </section>
  </div>
</template>

<script>

import computedElementName from "@/shared-resources/mixins/computedElementName"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"

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
  mixins: [computedElementName, forceReadOnly],
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
    previewValue() {
      window.open(this.value, "_blank")
    },
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

<style lang="scss" scoped>
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
