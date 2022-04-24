<template>
  <div>
    <section v-if="elementData.shown">
<!--      <p>Read-only component</p>-->
      <p> {{ elementName }}: {{content._text}}</p>
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
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>

</style>
