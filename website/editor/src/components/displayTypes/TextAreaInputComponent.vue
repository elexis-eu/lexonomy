<template>
  <div>

    <section v-if="elementData.shown">
<!--      <p>Textarea input component</p>-->
      <p> {{ elementName }}</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "TextareaInputComponent",
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    }
  }
}
</script>

<style scoped>

</style>
