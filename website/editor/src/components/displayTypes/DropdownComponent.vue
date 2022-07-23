<template>
  <div>
    <section v-if="elementData.shown && !readOnly"
             class="dropdown"
             :class="{'error': errors.has(computedElementName)}">
      <p class="text--md">{{ (isAttribute) ? computedElementNameWithColon : '' }}</p>
      <select
        :name="computedElementName || elementName"
        v-model="value"
        v-validate.continues="computedValidation"
      >
        <option
          value=""
          disabled
          selected
        >
          Choose {{ this.computedElementName || elementName }}
        </option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.caption }}</option>
      </select>
    </section>
    <section v-if="elementData.shown && readOnly" class="read-only">
      <p v-if="showPreview" :class="computedClass">{{ computedElementNameWithColon }} </p>
      <span :class="computedClass">{{ valueCaption }}</span>
    </section>
  </div>
</template>

<script>

import computedElementName from "@/shared-resources/mixins/computedElementName"
import showPreview from "@/shared-resources/mixins/showPreview"
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
  mixins: [computedElementName, showPreview, computedValidation],
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
    this.initSelect()
  },
  methods: {
    initSelect() {
      // eslint-disable-next-line no-undef
      M.FormSelect.init(document.querySelectorAll('select'), {})
    }
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
