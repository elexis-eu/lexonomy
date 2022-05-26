<template>
  <div>
    <section class="media-input" v-if="elementData.shown && !readOnly">
      <label v-if="isAttribute" class="text--md" :for="computedElementName">{{ computedElementNameWithColon }}</label>
      <input :name="computedElementName" type="text" v-model="value">
      <button class="button--sm secondary" @click="$refs.imageSearcher.toggleOpen()" style="margin-left: 8px">Search for
        image
      </button>
    </section>

    <ImageSearcher v-if="elementData.shown && !readOnly" ref="imageSearcher" @selected="updateValue"/>
    <section v-if="elementData.shown && readOnly" class="read-only">
      <p :class="computedClass">{{ computedElementNameWithColon }} </p>
      <span :class="computedClass">{{ value }}</span>
    </section>
  </div>
</template>

<script>
import computedElementName from "@/shared-resources/mixins/computedElementName"
import ImageSearcher from "@/components/ImageSearcher"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"

export default {
  name: "MediaComponent",
  components: {ImageSearcher},
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: Object,
      required: true
    }
  },
  mixins: [computedElementName, forceReadOnly],
  computed: {
    isMultimediaAPI() {
      return true
    }
  },
  data() {
    return {
      value: ""

    }
  },
  watch: {
    value(newVal) {
      if (newVal === this.content.text) {
        return
      }
      if (this.content.type === "attribute") {
        this.$emit('input', {elementName: this.elementName, attributes: {[this.content.name]: newVal}})
      } else {
        let elements = Object.assign({}, this.content)
        elements.text = newVal
        this.$emit('input', {elementName: this.elementName, elements: [elements]})
      }
    }
  },
  mounted() {
    this.value = this.content.text
  },
  methods: {
    updateValue(value) {
      this.value = value
    }
  }
}
</script>

<style lang="scss" scoped>
.media-input {
  display: flex;
  align-items: center;

  input {
    margin: 0;
  }

  label {
    text-transform: capitalize;
    padding-right: 10px;
    color: inherit;
  }
}

</style>
