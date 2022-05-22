<template>
  <PopupDisplay z-index="10" :value="value" @input="$emit('input', $event)">
    <h2>Kontext search engine</h2>
    <div class="search-box">
      <input v-model="searchTerm" placeholder="Headword" type="text">
      <button @click="getExamples">Search</button>
    </div>
    <div v-if="!error" class="examples">
      <div v-for="(example, i) in examples" :key="example.text" class="example" @click="toggleCheck(i)">
        <input type="checkbox" :checked="example.checked">
        <span class="text--xs"
              v-html="example.text"
              style="
                font-size: 12px;
                line-height: 16px"
        />
      </div>
    </div>
    <div v-else>
      {{ errorMessage }}
    </div>

    <div class="navigation">
      <button v-if="showPreviousButton" class="tertiary">Previous</button>
      <button v-if="showNextButton" class="tertiary">Next</button>
    </div>
    <div class="actions">
      <button @click="$emit('input', false)">Cancel</button>
      <button :disabled="!isAnyExampleChecked" @click="saveSelectedExamples">Save</button>
    </div>
  </PopupDisplay>
</template>

<script>
import PopupDisplay from "@/components/PopupDisplay"
import axios from "axios"

export default {
  name: "KontextDisplay",
  components: {PopupDisplay},
  props: {
    value: {
      type: Boolean,
      required: true
    },
    zIndex: {
      type: String,
      default: "1"
    }
  },
  watch: {
    "state.headwordData": {
      handler(headoword) {
        this.searchTerm = headoword
      },
      immediate: true
    },
  },
  computed: {
    isAnyExampleChecked() {
      return this.examples.filter(el => el.checked).length > 0
    }
  },
  data() {
    return {
      searchTerm: "",
      examples: [],
      error: false,
      errorMessage: "",
      showPreviousButton: false,
      showNextButton: false,
      pagination: {}
    }
  },
  methods: {
    saveSelectedExamples() {
      let selectedExamples = this.examples.filter(el => el.checked)
      this.$emit("save", selectedExamples)
      this.$emit("input", false)
    },
    toggleCheck(index) {
      this.examples[index].checked = !this.examples[index].checked
    },
    getExamples() {
      // let url = `http://localhost:8080/${this.state.entry.dictId}/kontext/conc/`
      let url = `https://lexonomy.elex.is/6xgi7he7/kontext/conc/`
      axios.get(url, {
        params: {
          querytype: "kontextsimple",
          query: this.searchTerm
        }
      }).then(response => {
        console.log(response)
        if ((response.data.error && response.data.error === "Empty result") || (response.data.Lines && response.data.Lines.length === 0)) {
          this.error = true
          this.errorMessage = "No results found."
        } else if (response.data.Lines) {
          let lines = response.data.Lines
          this.error = false
          this.showPreviousButton = !!response.data.pagination.prevPage
          this.showNextButton = !!response.data.pagination.nextPage
          this.pagination = response.data.pagination
          this.examples = []
          for (var iLine = 0; iLine < lines.length; iLine++) {
            var line = lines[iLine]
            var left = ""
            for (var i = 0; i < line.Left.length; i++) left += line.Left[i].str
            left = left.replace(/<[^<>]+>/g, "")
            var kwic = ""
            for (i = 0; i < line.Kwic.length; i++) kwic += line.Kwic[i].str
            kwic = kwic.replace(/<[^<>]+>/g, "")
            var right = ""
            for (i = 0; i < line.Right.length; i++) right += line.Right[i].str
            right = right.replace(/<[^<>]+>/g, "")
            var txt = left + "<b>" + kwic + "</b>" + right
            txt = txt.replace("<b> ", " <b>")
            txt = txt.replace(" </b>", "</b> ")
            this.examples.push({checked: false, text: txt, left: left, headword: kwic, right: right})
          }
        } else {
          this.error = true
          this.errorMessage = "There has been an error getting data from KonText."
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.search-box {
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    max-width: 400px;
    margin: 0;
  }

  button {
    margin: 0 16px;
  }
}

.examples {
  margin: 24px 0;
}

.example {
  text-align: left;
  padding: 4px;

  &:not(:first-child) {
    border-top: 1px solid #637383;
  }
}

.actions {
  margin-top: 24px;
  text-align: right;

  button {
    margin-left: 16px;
  }
}

</style>
