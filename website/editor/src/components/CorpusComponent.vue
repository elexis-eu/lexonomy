<template>
  <div v-if="isAnyCorpusAvailable" class="corpus-managers">
    <div ref="corpusManagers" class="dropdown" @click="openCorpuses">
      <button
        :class="{active: show}"
      >
        <i v-if="numberOfCorpuses > 1" class="material-icons right">arrow_drop_down</i>
        <p>Corpus search</p>
      </button>
      <ul v-show="show">
        <button v-if="kontextEnabled" class="tertiary" @click="openKontext">KonText</button>
        <button v-if="isSkeAvailable & numberOfSkeCorpuses === 1" class="tertiary" @click="openSketchEngine">Sketch Engine</button>
        <button v-if="numberOfSkeCorpuses > 1 && skeXamplEnabled" class="tertiary" @click="openSketchEngine('xampl')">Ske - Examples</button>
        <button v-if="numberOfSkeCorpuses > 1 && skeCollxEnabled" class="tertiary" @click="openSketchEngine('collx')">Ske - Collocations</button>
        <button v-if="numberOfSkeCorpuses > 1 && skeDefoEnabled" class="tertiary" @click="openSketchEngine('defo')">Ske - Definitions</button>
        <button v-if="numberOfSkeCorpuses > 1 && skeThesEnabled" class="tertiary" @click="openSketchEngine('thes')">Ske - Thesauruses</button>
      </ul>
    </div>
    <KontextDisplay
      v-model="showKontext"
      @save="$emit('save', $event)"
    />
    <SkeDisplay
      v-model="showSke"
      :search-type="skeSearchType"
      @save="$emit('save', $event)"
    />
  </div>
</template>

<script>
import KontextDisplay from "@/components/corpusManagers/KontextDisplay"
import SkeDisplay from "@/components/corpusManagers/SkeDisplay"

export default {
  name: "CorpusComponent",
  components: {
    SkeDisplay,
    KontextDisplay
  },
  props: {
    elementName: {
      type: String,
      required: true
    }
  },
  computed: {
    isAnyCorpusAvailable() {
      return this.kontextEnabled || this.isSkeAvailable
    },
    skeConfig() {
      return this.state.entry.dictConfigs.kex
    },
    isSkeConfigValid() {
      return !!(this.skeConfig.corpus &&
        this.skeConfig.apiurl &&
        this.skeConfig.url)
    },
    isSkeAvailable() {
      return this.skeXamplEnabled || this.skeCollxEnabled || this.skeThesEnabled || this.skeDefoEnabled
    },
    skeXamplEnabled() {
      let settings = this.state.entry.dictConfigs.xampl
      return !!(this.isSkeConfigValid &&
        settings.container &&
        settings.container === this.elementName &&
        settings.markup)

    },
    skeCollxEnabled() {
      let settings = this.state.entry.dictConfigs.collx
      return !!(this.isSkeConfigValid &&
        settings.container &&
        settings.container === this.elementName)
    },
    skeThesEnabled() {
      let settings = this.state.entry.dictConfigs.thes
      return !!(this.isSkeConfigValid &&
        settings.container &&
        settings.container === this.elementName)
    },
    skeDefoEnabled() {
      let settings = this.state.entry.dictConfigs.defo
      return !!(this.isSkeConfigValid &&
        settings.container &&
        settings.container === this.elementName)
    },
    kontextEnabled() {
      let apiData = this.state.entry.dictConfigs.kontext
      return !!(apiData.container &&
        apiData.container === this.elementName &&
        apiData.markup &&
        apiData.url)
    },
    numberOfCorpuses() {
      return [this.kontextEnabled, this.skeDefoEnabled, this.skeThesEnabled, this.skeCollxEnabled, this.skeXamplEnabled].filter(value => value === true).length
    },
    numberOfSkeCorpuses() {
      return [this.skeDefoEnabled, this.skeThesEnabled, this.skeCollxEnabled, this.skeXamplEnabled].filter(value => value === true).length
    },

  },
  watch: {
    show(show) {
      if (show) {
        window.addEventListener("click", this.watchForOutsideClick)
      } else {
        window.removeEventListener("click", this.watchForOutsideClick)
      }
    }
  },
  data() {
    return {
      show: false,
      showKontext: false,
      showSke: false,
      skeSearchType: "xampl"
    }
  },
  methods: {
    toggleShow() {
      this.show = !this.show
    },
    openCorpuses() {
      if (this.numberOfCorpuses === 1) {
        if (this.kontextEnabled) {
          this.openKontext()
        } else if (this.isSkeAvailable) {
          this.openSketchEngine()
        }
      } else {
        this.toggleShow()
      }
    },
    openKontext() {
      this.showKontext = true
    },
    openSketchEngine(searchType = null) {
      if (this.skeXamplEnabled) {
        this.skeSearchType = "xampl"
      }
      if (this.skeCollxEnabled) {
        this.skeSearchType = "collx"
      }
      if (this.skeThesEnabled) {
        this.skeSearchType = "thes"
      }
      if (this.skeDefoEnabled) {
        this.skeSearchType = "defo"
      }
      if (searchType) {
        this.skeSearchType = searchType
      }
      this.showSke = true
    },
    watchForOutsideClick(event) {
      if (this.$refs.corpusManagers && !this.$refs.corpusManagers.contains(event.target)) {
        this.toggleShow()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.corpus-managers {
  position: relative;
  width: 100%;
  height: 30px;

  &:hover {
    .dropdown {
      color: #222;
    }
  }

  .dropdown {
    position: absolute;
    width: 160px;
    right: 0;
    cursor: pointer;

    button {
      display: inline-block;
      width: 160px;

      i {
        margin-left: 0;

      }

      &.active {
        i {
          transform: rotate(180deg);
        }
      }

      p {
        margin: 0;
        line-height: 24px;
      }

    }
  }

  ul {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    z-index: 2;

  }
}

</style>
