<template>
  <div>
    <section v-if="elementData.shown">
      <p :class="computedClass">{{ forceReadOnly ? computedElementNameWithColon : "" }} </p>
      <span :class="computedClass"> {{ content.text }}</span>
    </section>
  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"

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
  mixins: [computedElementName, forceReadOnly]
}
</script>

<style lang="scss" scoped>
p {
  margin: 0;
  padding: 0;
  padding-bottom: 4px;
}
</style>
