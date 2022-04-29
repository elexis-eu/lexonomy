<template>
  <div>
    <section class="text-input" v-if="elementData.shown">
      <label :for="elementName">{{ elementName }}:</label>
      <input :name="elementName" v-model="values[0]">
      <span class="markup">{{ content[markupAttribute] && content[markupAttribute]._text }}</span>
      <!--            <label :for="elementName + '-2'">{{elementName}}:</label>-->
      <input :name="elementName + '-2'" v-model="values[1]">
    </section>

  </div>
</template>

<script>

export default {
  name: "TextInputWithMarkupComponent",
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  },
  watch: {
    values: {
      handler(newVal) {
        let content
        // Check if it's array
        if (Array.isArray(this.content._text)) {
          // Escape clause if no changes were made
          if (this.isArraySame(newVal, this.content._text)) {
            return
          }
          // Assign new content
          content = Object.assign({}, this.content)
          content._text = [...newVal]

        } else {
          // Escape clause if no changes were made
          if (newVal[0] === this.content._text) {
            return
          }
          // Assign new content
          content = Object.assign({}, this.content)
          content._text = "" + newVal[0]
        }
        // Emit event with new data
        this.$emit('input', {elementName: this.elementName, content: content})
      },
      deep: true
    }
  },
  data() {
    return {
      values: [],
      markupAttribute: null
    }
  },
  created() {
    let xampl = this.state.entry.dictConfigs.xampl
    if (Array.isArray(xampl)) {
      //  handle array
    } else {
      this.markupAttribute = xampl.markup
    }
    this.$emit("hide-children")

  },
  mounted() {
    if (Array.isArray(this.content._text)) {
      this.values = [...this.content._text]
    } else {
      this.values.push("" + this.content._text)
    }
  },
  methods: {
    isArraySame(array1, array2) {
      return array1.length === array2.length && array1.every((value, index) => value === array2[index])
    }
  }
}
</script>

<style scoped>
.markup {
  margin: 0 5px;
}

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
