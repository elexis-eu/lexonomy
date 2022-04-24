<template>
    <div>
        <section class="text-input" v-if="elementData.shown">
            <label :for="elementName">{{elementName}}:</label>
            <input :name="elementName" v-model="values[0]">
            <span class="markup">{{content[markupAttribute] && content[markupAttribute]._text}}</span>
<!--            <label :for="elementName + '-2'">{{elementName}}:</label>-->
            <input :name="elementName + '-2'" v-model="values[1]">
        </section>

    </div>
</template>

<script>

export default {
  name: "TextInputWithMarkupComponent",
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
      this.values = this.content._text
    } else {
      this.values.push(this.content._text)
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
