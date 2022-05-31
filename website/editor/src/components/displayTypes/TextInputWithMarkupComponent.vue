<template>
  <div>
    <section class="input-section" v-if="elementData.shown && !readOnly">
      <label v-if="isAttribute" class="text--md">{{ computedElementNameWithColon }}</label>
      <div ref="wholeInput" class="text-with-markup">
        <span
          v-for="(element, index) in values"
          :key="index + element.type"
          :ref="index"
          :data-index="index"
          :data-type="element.type"
          :data-name="element.name || null"
          :data-text="element.text"
          :class="calculatedClasses(element)"
          :style="calculatedStyles(element)"
          role="textbox"
          contenteditable
          @focusout="updateValue"
          style="white-space: pre-wrap"
          v-html="element.text"
        ></span>

      </div>
      <div ref="markActionButton" class="dropdown">
        <button class="secondary mark-as" @click="toggleMarkActions">Mark as</button>
        <div v-show="showMarkActions" class="vue-dropdown-content">
          <button v-for="(element, index) in markupElements"
                  :key="index"
                  class="tertiary"
                  @click="markTextAs(element.type)"
                  :disabled="element.disabled">{{ element.type }}
          </button>
        </div>
      </div>
    </section>
    <section class="read-only" v-if="elementData.shown && readOnly && readOnlyValues.length > 0">

      <p :class="computedClass">{{ computedElementNameWithColon }} </p>
      <span :class="computedClass">
        <span v-for="(element, i) in readOnlyValues"
              :key="i + element.type"
              style="white-space: pre-wrap"
              v-html="element.text"/>
      </span>
    </section>
  </div>
</template>

<script>

import stylesFromConfig from "@/shared-resources/mixins/stylesFromConfig"
import computedElementName from "@/shared-resources/mixins/computedElementName"
import forceReadOnly from "@/shared-resources/mixins/forceReadOnly"


export default {
  name: "TextInputWithMarkupComponent",
  props: {
    elementData: Object,
    elementName: String,
    content: {
      type: [Object, Array],
      required: true
    },
    children: Array
  },
  mixins: [
    stylesFromConfig,
    computedElementName,
    forceReadOnly
  ],
  computed: {
    readOnlyValues() {
      return this.values.filter(el => el.text)
    }
  },
  watch: {
    values: {
      handler(newVal) {
        let elements
        // Check if it's array
        if (Array.isArray(this.values)) {
          elements = []
          this.values.forEach((element) => {
            switch (element.type) {
              case "text":
                if (element.text !== "") {
                  elements.push({
                    type: "text",
                    text: element.text
                  })
                }
                break
              default:
                if (element.text !== "") {
                  elements.push({
                    type: "element",
                    name: element.name,
                    elements: [{type: "text", text: element.text}]
                  })
                }
            }
          })

        } else {
          // Assign new content
          elements = Object.assign({}, this.content)
          elements.text = "" + newVal[0].text
        }
        if (JSON.stringify(elements) === JSON.stringify(this.content)) {
          return
        }
        // Emit event with new data
        this.$emit('input', {elementName: this.elementName, elements: elements})
      },
      deep: true
    },
    showMarkActions(show) {
      if (show) {
        window.addEventListener("click", this.watchForOutsideClick)
      } else {
        window.removeEventListener("click", this.watchForOutsideClick)
      }
    }
  },
  data() {
    return {
      values: [],
      markupElements: null,
      combinedValue: "",
      showMarkActions: false
    }
  },
  created() {
    let xampl = this.state.entry.dictConfigs.xampl

    this.markupElements = [{type: "text", disabled: false}]
    if (Array.isArray(this.children)) {
      this.children.forEach(child => {
        if (!child.isAttribute) {
          this.markupElements.push({type: this.getElementNameInConfig(child.name), disabled: false})
        }
      })
    } else {
      this.markupElements = [{type: xampl.markup, disabled: false}]
    }

  },
  mounted() {
    this.computeValues()
  },
  methods: {
    getElementNameInConfig(elementName) {
      let config = this.state.entry.dictConfigs.xema.elements
      let configData = config[elementName]
      return (configData && configData.elementName) || elementName
    },
    computeValues() {
      if (Array.isArray(this.content) && this.content.length > 0) {
        this.content.forEach((element, index) => {
          if (element.type === "text") {
            this.values.push({
              type: "text",
              text: element.text,
              index: index,
              name: null
            })
          } else if (element.type === "element") {
            this.values.push({
              type: element.type,
              name: element.name || null,
              text: this.findTextInElement(element.elements),
              index: index
            })
          }
        })
      } else {
        this.values = [{
          type: "text",
          text: "",
          index: 0,
          name: null
        }]
      }
    },
    updateValue(event) {
      this.values[event.target.dataset.index].text = event.target.textContent

    },
    findTextInElement(elements) {
      if (Array.isArray(elements)) {
        let textElement = elements.find(el => el.type === "text")
        return textElement.text || ""
      }
      return ""
    },
    calculatedStyles(element) {
      switch (element.type) {
        case "text":
          return this.getStylesFromConfig(this.elementName)
        case "element":
          return this.getStylesFromConfig(element.name)
      }

    },
    calculatedClasses(element) {
      let output = []
      if (element.text === "") {
        output.push("empty-element")
      }
      if (element.type === "text") {
        output.push("text-element")
      } else {
        output.push("dynamic-element")
      }
      return output
    },
    markTextAs(attribute) {
      this.showMarkActions = false
      const {fromElement, start, end, selection} = this.getSelection()
      if (!fromElement || !selection) {
        return
      }
      let newValues = []

      if (start !== 0) {
        newValues.push({
          type: fromElement.dataset.type,
          text: fromElement.textContent.substring(0, start),
          name: fromElement.dataset.name || null
        })
      }
      switch (attribute) {
        case "text":
          newValues.push(
            {
              type: "text",
              text: selection,
              name: null
            })
          break
        default:
          newValues.push(
            {
              type: "element",
              text: selection,
              name: attribute || null
            })
      }
      if (end !== fromElement.textContent.length) {
        newValues.push({
          type: fromElement.dataset.type,
          text: fromElement.textContent.substring(end, fromElement.textContent.length),
          name: fromElement.dataset.name || null
        })
      }

      this.values.splice(Number(fromElement.dataset.index), 1, ...newValues)
      this.tryMergingValues()
    },
    tryMergingValues() {
      if (this.values.length < 2) {
        return
      }
      for (let i = 0; i < this.values.length - 1; i++) {
        let val = this.values[i]
        let nextVal = this.values[i + 1]
        if (val.type === nextVal.type && val.name === nextVal.name) {
          val.text += nextVal.text
          this.values.splice(i, 2, val)
          this.tryMergingValues()
          break
        }
      }
    },
    getSelection() {
      let sel = getSelection()
      let rng, startSel, endSel
      let displaytext = this.$refs["wholeInput"]
      if (!sel.rangeCount
        || displaytext.compareDocumentPosition((rng = sel.getRangeAt(0)).startContainer) === Node.DOCUMENT_POSITION_PRECEDING
        || displaytext.compareDocumentPosition(rng.endContainer) === Node.DOCUMENT_POSITION_FOLLOWING) {
        return {}
      } else {
        let fromElement = sel.focusNode.parentElement
        startSel = displaytext.compareDocumentPosition(rng.startContainer) === Node.DOCUMENT_POSITION_FOLLOWING ? 0 : rng.startOffset
        endSel = displaytext.compareDocumentPosition(rng.endContainer) === Node.DOCUMENT_POSITION_PRECEDING ? displaytext.textContent.length : rng.endOffset
        sel = fromElement.textContent.substring(startSel, endSel)
        return {fromElement: fromElement, start: startSel, end: endSel, selection: sel}
      }
    },

    toggleMarkActions() {
      this.showMarkActions = !this.showMarkActions
    },
    watchForOutsideClick(event) {
      if (this.$refs.markActionButton && !this.$refs.markActionButton.contains(event.target)) {
        this.toggleMarkActions()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.text-with-markup {
  font-style: normal;
  text-align: left;


  span[contenteditable] {
    margin: 0;
    padding: 4px 0;
    border: 1px solid transparent;
    border-radius: 0;
    line-height: 24px;
    text-align: left;

    &:focus {
      border-color: #E85D04;
    }

    &.empty-element {
      border: 1px solid #eee;
      padding: 4px 16px;
    }
  }
}

.input-section {
  display: flex;
  align-items: center;

  label {
    font-size: 1rem;
    text-transform: capitalize;
    padding-right: 10px;
  }
}

.markup {
  margin: 0 5px;
}

button {
  margin-left: 8px;

  &.mark-as {
    width: 85px;
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.vue-dropdown-content {
  display: block;
  position: absolute;
  width: max-content;
  background-color: #f1f1f1;
  min-width: 160px;
  overflow: auto;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.vue-dropdown-content a {
  display: block;
  padding: 12px 16px;
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.vue-dropdown-content a:hover {
  background-color: #ddd;
}
</style>
