<template>
  <div>
    <section class="media-input" v-if="elementData.shown && !readOnly">
      <label v-if="isAttribute" class="text--md" :for="computedElementName">{{ computedElementNameWithColon }}</label>
      <input :name="computedElementName" type="text" v-model="value"
             @change="updateParent">
      <button class="button--sm secondary" @click="$refs.imageSearcher.toggleOpen()" style="margin-left: 8px">
        <img :src="iconUrl('search-image.svg')">
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
import iconUrl from "@/shared-resources/mixins/iconUrl"

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
  mixins: [computedElementName, forceReadOnly, iconUrl],
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
  mounted() {
    this.value = this.content.text
  },
  methods: {
    updateParent() {
      this.$nextTick(() => {
        if (this.value === this.content.text) {
          return
        }
        if (this.content.type === "attribute") {
          this.$emit('input', {elementName: this.elementName, attributes: {[this.content.name]: this.value}})
        } else {
          let elements = Object.assign({}, this.content)
          elements.text = this.value
          this.$emit('input', {elementName: this.elementName, elements: [elements]})
        }
      })
    },
    updateValue(value) {
      this.value = value
      this.updateParent()
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

  button {
    font-size: 28px;

    img {
      filter: invert(56%) sepia(100%) saturate(7500%) hue-rotate(203deg) brightness(90%) contrast(101%);
    }

    &:hover {
      img {
        filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(268deg) brightness(104%) contrast(101%);
      }
    }
  }
}

</style>
