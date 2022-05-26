<template>
  <div>
    <section class="text-input" v-if="elementData.shown && !readOnly">
      <label v-if="isAttribute" class="text--md" :for="computedElementName">{{ computedElementNameWithColon }}</label>
      <textarea v-if="this.elementData.editorInputType === 'textarea'"
                :name="computedElementName"
                cols="30"
                rows="10"
                v-model="value"
                :placeholder="(errors && errors.first(computedElementName)) || computedElementName"
                v-validate.continues="computedValidation"
                :class="{'error': errors.has(computedElementName)}"
      />
      <input v-else
             :name="computedElementName"
             :type="getInputType()"
             v-model="value"
             :placeholder="(errors && errors.first(computedElementName)) || computedElementName"
             v-validate.continues="computedValidation"
             @change="updateParent"
             :class="{'error': errors.has(computedElementName)}"
      >
      <button v-if="elementData.interactivity" class="button--sm tertiary" @click="previewValue"
              style="margin-left: 8px;">Preview
      </button>
    </section>
    <section class="read-only" v-if="elementData.shown && readOnly">
      <p :class="computedClass">{{ computedElementNameWithColon }} </p>
      <span :class="computedClass">{{ value }}</span>
    </section>
  </div>
</template>

<script>

import computedElementName from "@/shared-resources/mixins/computedElementName"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"
import computedValidation from "@/shared-resources/mixins/computedValidation"

export default {
  name: "TextInputComponent",
  inject: ['$validator'],
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  },
  mixins: [computedElementName, forceReadOnly, computedValidation],
  data() {
    return {
      value: ""

    }
  },
  mounted() {
    this.value = this.content.text
  },
  methods: {
    updateParent() {
      this.$nextTick(() => {
        if (this.value === this.content.text) {
          return
        }
        if (this.content.type === "attribute") {
          this.$emit('input', {elementName: this.elementName, attributes: {[this.content.name]: this.value}})
        } else {
          let elements = Object.assign({}, this.content)
          elements.text = this.value
          this.$emit('input', {elementName: this.elementName, elements: [elements]})
        }
      })
    },
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
