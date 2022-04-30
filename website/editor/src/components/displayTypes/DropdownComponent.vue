<template>
  <div>
    <section v-if="elementData.shown" class="dropdown">
      <p> {{ elementName }}</p>
      <select v-model="value">
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.caption }}</option>
      </select>
    </section>
  </div>
</template>

<script>

export default {
  name: "DropdownComponent",
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
      value: null,
      options: []
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
  created() {
    let structureConfig = this.state.entry.dictConfigs.xema.elements[this.elementName]
    this.options = structureConfig.values
    this.value = this.content.text
  },
  mounted() {
    var elems = document.querySelectorAll('select');
    // eslint-disable-next-line no-undef
    M.FormSelect.init(elems, {});
  }
}
</script>

<style scoped>
.dropdown {
  display: flex;
  justify-content: center;
}

.dropdown p {
  margin-right: 8px;
}

</style>
