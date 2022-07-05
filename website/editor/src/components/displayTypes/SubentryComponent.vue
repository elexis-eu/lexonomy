<template>
  <div class="subentry-component">
    <div>
      <section v-if="elementData.shown" class="subentry-element read-only">
        <ActionButtons
          v-if="!isAttribute"
          class="actions-button"
          :elementName="elementName"
          :elementEditorConfig="elementData"
          :editorChildNumber="editorChildNumber"
          :parentElementName="parentElementName"
          :numberOfElements="numberOfElements"
          :subentryElement="true"
          @move-element-down="moveElementDown"
          @move-element-up="moveElementUp"
          @add-element="createSibling"
          @link-element="linkNewSubentry"
          @select-new-parent="selectNewParent"
          @clone-element="cloneElement"
          @remove-element="deleteElement"
        />

        <p @click="openSubentry">{{ computedElementNameWithColon }} {{ displayValue }}</p>
      </section>
    </div>

    <SelectElementFromArray
      v-if="showSelectNewParent"
      v-model="showSelectNewParent"
      :element-name="elementName"
      :possible-parent-elements="newPossibleParents"
      :parentElementName="parentElementName"
      @selected-element="handleSelectedNewParent"
    />
    <PopupDisplay
      z-index="10"
      :value="showSubentriesSearchPopup"
      :hideActions="true"
      @input="showSubentriesSearchPopup = $event"
      class="subentry-search-modal"
    >
      <h2>Link new {{ elementName }}</h2>
      <div class="search-box">
        <input v-model="searchTerm" placeholder="Headword" type="text">
        <button @click="getSubentries">Search</button>
      </div>
      <div v-if="!error" class="subenries">
        <div v-for="(entry, i) in subentries" :key="entry.id + i" class="subentry" @click="toggleCheck(i)">
          <input type="checkbox" :checked="entry.checked">
          <span class="text--xs"
                v-html="entry.title"
                style="
              font-size: 12px;
              line-height: 16px"
          />
        </div>
      </div>
      <div v-else>
        {{ errorMessage }}
      </div>

      <div class="actions">
        <button @click="showSubentriesSearchPopup = false">Cancel</button>
        <button :disabled="!isAnySubentryChecked" @click="saveSelectedSubentries">Save
          {{ subentries.filter(el => el.checked).length || "" }}
        </button>
      </div>
    </PopupDisplay>
  </div>
</template>

<script>
import ActionButtons from "@/components/ActionButtons"
import layoutElementMixin from "@/shared-resources/mixins/layoutElementMixin"
import SelectElementFromArray from "@/components/SelectElementFromArray"
import computedElementName from "@/shared-resources/mixins/computedElementName"
import axios from "axios"
import PopupDisplay from "@/components/PopupDisplay"

export default {
  name: "SubentryComponent",
  components: {
    PopupDisplay,
    ActionButtons,
    SelectElementFromArray
  },
  mixins: [
    layoutElementMixin,
    computedElementName
  ],
  props: {
    children: Array,
    elementData: Object,
    elementName: String,
    parentElementName: String,
    numberOfElements: Number,
    content: {
      type: [Object, Array],
      required: true
    },
    editorChildNumber: Number,
    isAttribute: Boolean,
    forceReadOnlyElements: {
      type: Boolean,
      default: false
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
    displayValue() {
      let structureConfig = this.state.entry.dictConfigs.xema.elements[this.elementName]
      if (!structureConfig) {
        let parentConfig = this.state.entry.dictConfigs.xema.elements[this.parentElementName].attributes || {}
        structureConfig = parentConfig[this.elementName]
      }
      if (structureConfig.values.length > 0) {
        return structureConfig.values.find(el => el.value === this.calculatedContent.attributes.title).caption
      }
      return (this.calculatedContent && this.calculatedContent.attributes && this.calculatedContent.attributes.title) || ""
    },
    isAnySubentryChecked() {
      return this.subentries.filter(el => el.checked).length > 0
    },
  },
  data() {
    return {
      updatedContent: null,
      showSubentriesSearchPopup: false,
      searchTerm: "",
      subentries: [],
      error: false,
      errorMessage: ""
    }
  },
  methods: {
    openSubentry() {
      window.store.open(this.state.entry.dictId, this.elementName, this.content.attributes.id, "edit")
    },
    linkNewSubentry() {
      this.showSubentriesSearchPopup = true
      this.getSubentries()
    },
    getSubentries() {
      let url = `${window.location.origin}/${this.state.entry.dictId}/subget/`
      let params = {
        lemma: this.searchTerm,
        doctype: this.elementName
      }
      axios.get(url, {params: params}).then(response => {
        if (!response.data.entries || response.data.entries.length === 0) {
          this.error = true
          this.errorMessage = "No results found."
          return
        }
        this.subentries = []
        response.data.entries.forEach(el => {
          this.subentries.push({...el, ...{checked: false}})
        })
      })
    },
    toggleCheck(index) {
      this.subentries[index].checked = !this.subentries[index].checked
    },
    saveSelectedSubentries() {
      let selectedSubentries = this.subentries.filter(el => el.checked)
      for (const entry of selectedSubentries) {
        let newObject = this.createElementTemplate("lxnm:subentryParent")
        newObject.attributes = {
          doctype: entry.doctype,
          id: entry.id,
          title: entry.sortkey
        }
        this.$emit("create-element", {name: entry.doctype, content: newObject})
      }
      this.showSubentriesSearchPopup = false

    }
  }
}
</script>

<style lang="scss" scoped>
.subentry-component {
  padding: 8px 16px;
  margin-bottom: 8px;

  .subentry-element {
    display: flex;
    align-items: center;
    padding: 8px;
    color: #0000FF;
    text-align: left;
    text-decoration: underline;
    transition: 0.3s all;

    p {
      cursor: pointer;

      &:hover {
        color: #004494;
      }

      &:focus {
        border: 1px solid #f48c06;
      }
    }

    .actions-button {
      margin-right: 8px;
    }

    .preview-element {
      margin-left: -8px;
    }
  }

  .subentry-search-modal {
    .modal {
      max-height: 100%;
    }

    .modal-content {
      height: 70%;

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

    .subentries {
      margin: 24px 0;
      max-height: calc(100% - 235px);
      overflow-Y: auto;
    }

    .subentry {
      text-align: left;
      padding: 4px;

      &:not(:first-child) {
        border-top: 1px solid #637383;
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
  }
}

</style>
