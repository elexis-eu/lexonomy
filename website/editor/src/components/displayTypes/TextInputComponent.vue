<template>
  <div>
    <section class="text-input" v-if="elementData.show">
        <label :for="elementName">{{elementName}}:</label>
        <input :name="elementName" v-model="values[0]">
    </section>
      <ComponentGeneratorComponent
              :children="children"
              :elementEditorConfig="elementData"
              :elementName="elementName"
              :content="content"
      />
      <section v-if="elementData.show && values[1]" class="text-input">
          <label :for="elementName + '-2'">{{elementName}}:</label>
          <input :name="elementName + '-2'" v-model="values[1]">
      </section>
  </div>
</template>

<script>

import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
export default {
  name: "TextInputComponent",
  components: {
    ComponentGeneratorComponent
  },
  props: {
    children: Array,
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
