<template>
  <PopupDisplay z-index="10" :value="value" @input="$emit('input', $event)">
    <h2>Sketch Engine:{{ displayedType }} search</h2>
    <div class="search-box">
      <div v-if="searchType === 'xampl'" class="switch type-toggle">
        <label>
          Headword
          <input ref="searchTypeToggle" type="checkbox">
          <span class="lever"></span>
          CQL
        </label>
      </div>
      <input v-model="searchTerm" placeholder="Headword" type="text">
      <button @click="getExamples(1)">Search</button>
    </div>
    <div v-if="!error" class="examples">
      <div v-for="(example, i) in examples" :key="example.text + i" class="example" @click="toggleCheck(i)">
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
      <button v-if="showPreviousButton" class="tertiary" @click="getExamples(pagination.prevPage)">Previous</button>
      <button v-if="showNextButton" class="tertiary" @click="getExamples(pagination.nextPage)">Next</button>
    </div>
    <div class="actions">
      <button @click="$emit('input', false)">Cancel</button>
      <button :disabled="!isAnyExampleChecked" @click="saveSelectedExamples">Save
        {{ examples.filter(el => el.checked).length || "" }}
      </button>
    </div>
  </PopupDisplay>
</template>

<script>
import PopupDisplay from "@/components/PopupDisplay"
import axios from "axios"
// import axios from "axios"
export default {
  name: "SkeDisplay",
  components: {PopupDisplay},
  props: {
    value: {
      type: Boolean,
      required: true
    },
    zIndex: {
      type: String,
      default: "2"
    },
    searchType: {
      type: String
    }
  },
  watch: {
    "state.headwordData": {
      handler(headoword) {
        this.searchTerm = headoword
      },
      immediate: true
    }
  },
  computed: {
    isAnyExampleChecked() {
      return this.examples.filter(el => el.checked).length > 0
    },
    displayedType() {
      switch (this.searchType) {
        case "xampl":
          return " Examples"
        case "collx":
          return " Collocations"
        case "thes":
          return " Thesaurus"
        case "defo":
          return " Definitions"
        default:
          return ""
      }
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
      this.$emit("save", {type: this.searchType, elements: selectedExamples})
      this.$emit("input", false)
    },
    toggleCheck(index) {
      this.examples[index].checked = !this.examples[index].checked
    },
    getExamples(page) {
      let skeConfig = this.state.entry.dictConfigs.kex
      let url = `${window.location.origin}/${this.state.entry.dictId}/skeget/${this.searchType}/`
      let queryType = (this.$refs.searchTypeToggle && this.$refs.searchTypeToggle.checked) ? "skecql" : "skesimple"
      let params = {
        url: skeConfig.apiurl,
        corpus: skeConfig.corpus,
        username: this.state.entry.userInfo.ske_username,
        apikey: this.state.entry.userInfo.ske_apiKey,
        querytype: queryType,
        fromp: page
      }
      switch (this.searchType) {
        case "xampl":
          params.query = this.searchTerm
          break
        case "collx":
        case "thes":
        case "defo":
          params.lemma = this.searchTerm
          break
      }
      axios.get(url, {
        params: params
      }).then(response => {
        if ((response.data.error && response.data.error === "Empty result") || (response.data.Lines && response.data.Lines.length === 0)) {
          this.error = true
          this.errorMessage = "No results found."
        }
        this.examples = []
        switch (this.searchType) {
          case "xampl":
            this.prepareExamples(response.data)
            break
          case "collx":
            this.prepareCollocations(response.data)
            break
          case "thes":
            this.prepareThesaurus(response.data)
            break
          case "defo":
            this.prepareDefinitions(response.data)
            break
        }
      })
        .catch(e => {
          alert("Something went wrong with SketchEngine, make sure your credentials are correct. " + e.message)
        })
    },
    prepareThesaurus(data) {
      if (data.Words) {
        let words = data.Words
        this.error = false
        this.showPreviousButton = !!data.prevlink
        this.showNextButton = !!data.nextlink
        this.pagination = {prevPage: data.prevLink, nextPage: data.nextLink}
        this.examples = []
        for (let iLine = 0; iLine < words.length; iLine++) {
          let line = words[iLine]
          let txt = line.word
          this.examples.push({checked: false, text: txt})
        }
      } else {
        this.error = true
        this.errorMessage = "There has been an error getting data from KonText."
      }
    },
    prepareCollocations(data) {
      if (data.Items) {
        let items = data.Items
        this.error = false
        this.showPreviousButton = !!data.prevlink
        this.showNextButton = !!data.nextlink
        this.pagination = {prevPage: data.prevLink, nextPage: data.nextLink}
        this.examples = []
        for (let iLine = 0; iLine < items.length; iLine++) {
          let line = items[iLine]
          let txt = line.word
          this.examples.push({checked: false, text: txt})
        }
      } else {
        this.error = true
        this.errorMessage = "There has been an error getting data from KonText."
      }
    },
    prepareExamples(data) {
      if (data.Lines) {
        let lines = data.Lines
        this.error = false
        this.showPreviousButton = !!data.prevlink
        this.showNextButton = !!data.nextlink
        this.pagination = {prevPage: data.prevLink, nextPage: data.nextLink}
        this.examples = []
        for (let iLine = 0; iLine < lines.length; iLine++) {
          let line = lines[iLine]
          let left = ""
          for (let i = 0; i < line.Left.length; i++) left += line.Left[i].str
          left = left.replace(/<[^<>]+>/g, "")
          let kwic = ""
          for (let i = 0; i < line.Kwic.length; i++) kwic += line.Kwic[i].str
          kwic = kwic.replace(/<[^<>]+>/g, "")
          let right = ""
          for (let i = 0; i < line.Right.length; i++) right += line.Right[i].str
          right = right.replace(/<[^<>]+>/g, "")
          let txt = left + "<b>" + kwic + "</b>" + right
          txt = txt.replace("<b> ", " <b>")
          txt = txt.replace(" </b>", "</b> ")
          this.examples.push({checked: false, text: txt, left: left, headword: kwic, right: right})
        }
      } else {
        this.error = true
        this.errorMessage = "There has been an error getting data from KonText."
      }
    },
    prepareDefinitions(data) {
      if (data.Lines) {
        let lines = data.Lines
        this.error = false
        this.showPreviousButton = !!data.prevlink
        this.showNextButton = !!data.nextlink
        this.pagination = {prevPage: data.prevLink, nextPage: data.nextLink}
        this.examples = []
        for (let iLine = 0; iLine < lines.length; iLine++) {
          let line = lines[iLine]
          let left = ""
          for (let i = 0; i < line.Left.length; i++) left += line.Left[i].str
          left = left.replace(/<[^<>]+>/g, "")
          let kwic = ""
          for (let i = 0; i < line.Kwic.length; i++) kwic += line.Kwic[i].str
          kwic = kwic.replace(/<[^<>]+>/g, "")
          let right = ""
          for (let i = 0; i < line.Right.length; i++) right += line.Right[i].str
          right = right.replace(/<[^<>]+>/g, "")
          let txt = left + "<b>" + kwic + "</b>" + right
          txt = txt.replace("<b> ", " <b>")
          txt = txt.replace(" </b>", "</b> ")
          this.examples.push({checked: false, text: txt})
        }
      } else {
        this.error = true
        this.errorMessage = "There has been an error getting data from KonText."
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.corpus-managers {
  .modal {
    max-height: 100%;
  }

  .modal-content {
    height: 70%;

  }
}

.search-box {
  display: flex;
  align-items: center;
  justify-content: center;

  .type-toggle {
    margin-right: 16px;

    .lever {
      background-color: #005FCC !important;

      &:after {
        background-color: #F1F1F1 !important
      }
    }
  }

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
  max-height: calc(100% - 235px);
  overflow-Y: auto;
}

.example {
  text-align: left;
  padding: 4px;

  &:not(:first-child) {
    border-top: 1px solid #637383;
  }
}

.navigation {
  display: flex;
  justify-content: center;

  button {
    margin-left: 16px;
  }
}

.actions {
  position: absolute;
  margin-top: 24px;
  bottom: 46px;
  right: calc(10% + 16px);

  button {
    margin-left: 16px;
  }
}
</style>
