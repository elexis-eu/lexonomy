<template>
  <div>
    <section v-if="elementData.shown && !readOnly" class="dropdown">
      <p class="text--md">{{ (isAttribute) ? computedElementNameWithColon : '' }}</p>
      <select
              :name="computedElementName"
              v-model="value"
              v-validate.continues="computedValidation"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.caption }}</option>
      </select>
    </section>
    <section v-if="elementData.shown && readOnly" class="read-only">
      <p :class="computedClass">{{ computedElementNameWithColon }} </p>
      <span :class="computedClass">{{ valueCaption }}</span>
    </section>
  </div>
</template>

<script>

import computedElementName from "@/shared-resources/mixins/computedElementName"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"
import computedValidation from "@/shared-resources/mixins/computedValidation"

export default {
  name: "DropdownComponent",
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
  computed: {
    valueCaption() {
      let selectedOption = this.options.find(el => el.value === this.value)
      return selectedOption && selectedOption.caption
    }
  },
  data() {
    return {
      value: null,
      options: []
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
  created() {
    let structureConfig = this.state.entry.dictConfigs.xema.elements[this.elementName]
    if (!structureConfig) {
      let parentConfig = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
      structureConfig = parentConfig[this.elementName]
    }
    this.options = structureConfig.values
    this.value = this.content.text
  },
  mounted() {
    var elems = document.querySelectorAll('select')
    // eslint-disable-next-line no-undef
    M.FormSelect.init(elems, {})
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  display: flex;
  justify-content: start;

  p {
    margin-right: 8px;
    color: inherit;
  }
}

</style>
