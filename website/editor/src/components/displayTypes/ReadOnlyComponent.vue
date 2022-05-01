<template>
  <div>
    <section v-if="elementData.shown">
<!--      <p>Read-only component</p>-->
      <p> {{ elementName }}: {{content.text}}</p>
    </section>
  </div>
</template>

<script>
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
}
</script>

<style scoped>

</style>
