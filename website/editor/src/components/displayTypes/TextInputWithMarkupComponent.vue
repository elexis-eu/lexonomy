<template>
  <div>
    <section class="text-input" v-if="elementData.shown">
      <label :for="elementName">{{ elementName }}:</label>
      <input v-if="values[0]" :name="elementName" v-model="values[0].text">
      <span class="markup">{{ content[markupAttribute] && content[markupAttribute]._text }}</span>
      <!--            <label :for="elementName + '-2'">{{elementName}}:</label>-->
      <input v-if="values[1]" :name="elementName + '-2'" v-model="values[1].text">
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
      type: [Object, Array],
      required: true
    }
  },
  watch: {
    values: {
      handler(newVal) {
        let elements
        // Check if it's array
        if (Array.isArray(this.content)) {
          // Assign new content
          elements = [...this.content]
          let propValues = elements.filter(element => {
            return element.type === "text" && !element.name
          })

          newVal.forEach((element, index) => {
            propValues[index] = element
          })

        } else {
          // Assign new content
          elements = Object.assign({}, this.content)
          elements.text = "" + newVal[0].text
        }
        // Emit event with new data
        this.$emit('input', {elementName: this.elementName, elements: elements})
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
    if (Array.isArray(this.content)) {
      let values = this.content.filter(element => {
        return element.type === "text" && !element.name
      })
      this.values = [...values]
    } else {
      this.values.push({type: "text", text: "" + this.content.text})
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
