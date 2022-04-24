<template>
  <div>
    <section class="text-input" v-if="elementData.shown">
        <label :for="elementName">{{elementName}}:</label>
        <input :name="elementName" v-model="values[0]">
    </section>
  </div>
</template>

<script>

export default {
  name: "TextInputComponent",
  components: {
  },
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      values: [],

    }
  },
  mounted() {
    if (Array.isArray(this.content._text)) {
      this.values = this.content._text
    } else {
      this.values.push(this.content._text)
    }
  }
}
</script>

<style scoped>
.text-input {
    display: flex;
    align-items: baseline;

}
label {
    font-size: 1rem;
    text-transform: capitalize;
    padding-right: 10px;
}
</style>
