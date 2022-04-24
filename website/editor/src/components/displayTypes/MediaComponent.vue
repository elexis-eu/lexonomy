<template>
  <div>
    <section v-if="elementData.shown">
<!--      <p>Media component</p>-->
      <p> {{ elementName }}</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "MediaComponent",
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
