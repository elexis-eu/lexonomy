<template>
  <PopupDisplay
          :z-index="zIndex"
          :value="value"
          :hideActions="true"
          @input="$emit('input', $event)"
  >
    <h2>Move selected {{ computedElementName }} to:</h2>
    <div class="parents">
      <ReadOnlyComponentGenerator
        :children="children"
        :elementName="elementName"
        :content="possibleParentElements"
        @selected-element="handleSelectedElement"
      />
    </div>

    <div class="actions">
      <button @click="$emit('input', false)">Cancel</button>
    </div>
  </PopupDisplay>
</template>

<script>
import PopupDisplay from "@/components/PopupDisplay"
import computedElementName from "@/shared-resources/mixins/computedElementName"
import ReadOnlyComponentGenerator from "@/components/ReadOnlyComponentGenerator"

export default {
  name: "SelectElementFromArray",
  components: {ReadOnlyComponentGenerator, PopupDisplay},
  mixins: [
    computedElementName
  ],
  props: {
    value: {
      type: Boolean,
      required: true
    },
    zIndex: {
      type: String,
      default: "100"
    },
    elementName: {
      type: String,
      default: ""
    },
    possibleParentElements: {
      type: Array,
      required: true
    }
  },
  computed: {
    children() {
      return this.possibleParentElements.map(el => el.name).filter((item, i, ar) => ar.indexOf(item) === i).map(name => {return {name: name}})
    }
  },
  methods: {
    handleSelectedElement(element) {
      this.$emit('selected-element', element)
      this.$emit('input', false)
    },
  }
}
</script>

<style lang="scss" scoped>

.parents {
  margin: 24px 0;
  max-height: 600px;
  overflow-Y: auto;
}

</style>
