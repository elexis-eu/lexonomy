<template>
    <div v-if="state.entry.dictConfigs && state.entry.dictConfigs.xemplate">
    <ComponentGeneratorComponent
      :children="preparedDataForEntry"
      :content="content"
    />
  </div>
</template>

<script>
import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"

export default {
  name: "EntryDisplay",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    content: {
      type: Object,
      required: true
    },
    contentHtml: {
      type: String,
      required: false
    }
  },
  computed: {
    preparedDataForEntry() {
      if (!this.state.entry.dictConfigs) {
        return []
      }
      return [{
        max: 1,
        min: 1,
        name: this.state.entry.dictConfigs.xema.root
      }]
    }
  }
}
</script>

<style scoped>

</style>
