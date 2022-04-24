<template>
  <div>
    <section v-if="elementData.shown">
<!--      <p>dropdown component</p>-->
      <p> {{ elementName }}</p>
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
  }
}
</script>

<style scoped>

</style>
