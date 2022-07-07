<template>
  <PopupDisplay
    class="linking-element-selector"
    :z-index="zIndex"
    :value="value"
    saveButtonText="Link"
    @cancel="cancelAddLink"
    @save="linkToElement"
  >
    <h2>Link selected {{ computedElementName }} to:</h2>
    <div class="popup-header">
        <p class="text--md">Dictionary:</p>
        <select name="dictionary" v-model="selectedDictionary">
        <option v-for="dict in linkableDicts" :key="dict.value" :value="dict.id"
                :selected="selectedDictionary === dict.id">{{ dict.title }}
        </option>
      </select>
      <input v-model="searchTerm" placeholder="Filter" type="text">
    </div>
    <div class="links">
      <div v-for="(el, i) in displayedLinks"
           :key="i"
           class="link"
           :class="{'selected': selectedElement === i}"
           @click="selectedElement = i"
      >
        <p>{{ el.element }}: {{ el.link }} ({{ el.preview }})</p>
      </div>
    </div>
  </PopupDisplay>
</template>

<script>
import PopupDisplay from "@/components/PopupDisplay"
import computedElementName from "@/shared-resources/mixins/computedElementName"
import axios from "axios"

export default {
  name: "LinkingElementSelector",
  components: {PopupDisplay},
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
    sourceId: {
      type: String,
      default: null
    },
  },
  computed: {
    linkableDicts() {
      return this.state.entry.userDicts.filter(dict => dict.hasLinks)
    }
  },
  watch: {
    selectedDictionary() {
      this.getLinkableElements()
    },
    searchTerm() {
      this.applySearchFilter()
      this.selectedElement = null
    }
  },
  data() {
    return {
      selectedDictionary: null,
      selectedElement: null,
      searchTerm: "",
      availableLinks: [],
      displayedLinks: []
    }
  },
  mounted() {
    this.selectedDictionary = this.linkableDicts[0] && this.linkableDicts[0].id
    this.$nextTick(() => {
      // eslint-disable-next-line no-undef
      M.FormSelect.init(document.querySelectorAll('select'), {})
    })
  },
  methods: {
    getLinkableElements() {
      this.selectedElement = null
      const url = `${window.location.origin}/${this.selectedDictionary}/linkablelist.json`
      axios.get(url).then(response => {
        this.availableLinks = response.data.links
        this.displayedLinks = this.availableLinks
      })
    },
    applySearchFilter() {
      if (this.availableLinks.length > 0) {
        let normalizedSearchTerm = this.searchTerm.toLowerCase()
        this.displayedLinks = this.availableLinks.filter(link => {
          return link.element.toLowerCase().includes(normalizedSearchTerm) ||
            link.link.toLowerCase().includes(normalizedSearchTerm) ||
            link.preview.toLowerCase().includes(normalizedSearchTerm)
        })
      }

    },
    cancelAddLink() {
      this.$emit("input", false)
    },
    linkToElement() {
      const selectedEl = this.displayedLinks[this.selectedElement]
      const url = `${window.location.origin}/${this.selectedDictionary}/links/add`
      const params = {
        source_el: this.elementName,
        source_id: this.sourceId,
        target_dict: this.selectedDictionary,
        target_el: selectedEl.element,
        target_id: selectedEl.link,
      }
      axios.get(url, {params: params}).then(() => {
        // eslint-disable-next-line no-undef
        M.toast({html: "Linked!"});
        this.$emit("input", false)
      }).catch(e => {
        // eslint-disable-next-line no-undef
        M.toast({html: e.message});
      })
    }
  }
}
</script>

<style lang="scss">
.linking-element-selector {
  .popup-header {
    display: flex;
    align-items: center;

    p {
      margin-right: 8px;
    }

    .select-wrapper {
      max-width: fit-content;
      margin-right: 15px;
    }

    input {
      max-width: 400px;
      margin: 0;
    }

    button {
      margin: 0 16px;
    }

  }

  .links {
    margin: 24px 0;
    max-height: calc(100% - 165px);
    overflow-Y: auto;
  }

  .link {
    text-align: left;
    padding: 4px;
    cursor: pointer;

    &.selected {
      background: #dedede;
    }

    &:not(:first-child) {
      border-top: 1px solid #637383;
    }
  }
}
</style>
