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
  created() {
    let structureConfig = this.state.entry.dictConfigs.xema.elements[this.elementName]
    this.options = structureConfig.values
    this.value = this.content._text
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

select {
  display: block;
  width: auto;
}
</style>
