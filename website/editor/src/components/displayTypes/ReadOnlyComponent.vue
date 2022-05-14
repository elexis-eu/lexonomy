<template>
  <div>
    <section v-if="elementData.shown">
<!--      <p>Read-only component</p>-->
      <p> {{ computedElementName }}: {{content.text}}</p>
    </section>
  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"

export default {
  name: "ReadOnlyComponent",
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  },
  mixins: [computedElementName]
}
</script>

<style scoped>

</style>
