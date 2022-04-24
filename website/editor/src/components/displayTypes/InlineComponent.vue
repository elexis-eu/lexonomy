<template>
  <div>
      <section v-if="elementData.shown">
      </section>
      <component :is="valueComponent"
                 :elementEditorConfig="elementData"
                 :elementName="elementName"
                 :elementData="elementData"
                 :content="content"
                 @hide-children="hideChildren"
      />
      <ComponentGeneratorComponent
              v-if="showChildren"
              :children="children"
              :elementEditorConfig="elementData"
              :elementName="elementName"
              :content="content"
      />
  </div>
</template>

<script>

import ComponentGeneratorComponent from "@/components/ComponentGeneratorComponent"
import valueDisplayMixin from "@/shared-resources/mixins/valueDisplayMixin"

export default {
  name: "InlineComponent",
  components: {
    ComponentGeneratorComponent
  },
  mixins: [
    valueDisplayMixin
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    },
    childrenContent: Object
  },
  data () {
    return {
      showChildren: true
    }
  },
  mounted() {
    // console.log(this.children, "InlineComponent")
  },
  methods: {
    hideChildren() {
      this.showChildren = false
    }
  }
}
</script>

<style scoped>

</style>
