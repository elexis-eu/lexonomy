<template>
  <div class="corpus-managers">
    <div ref="corpusManagers" class="dropdown" @click="toggleShow">
      <button
           :class="{active: show}"
      >
        <i class="material-icons right">arrow_drop_down</i>
        <p>Corpus Managers</p>
      </button>
      <ul v-show="show">
        <button v-if="sketchEngineEnabled" class="tertiary" @click="openSketchEngine">Sketch Engine</button>
        <button v-if="kontextEnabled" class="tertiary" @click="openKontext">KonText</button>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "CorpusComponent",
  computed: {
    sketchEngineEnabled() {
      let xampl = this.state.entry.dictConfigs.xampl
      let apiData = this.state.entry.dictConfigs.kex
      return !!(xampl.container &&
        xampl.markup &&
        xampl.template &&
        apiData.apiurl &&
        apiData.url);

    },
    kontextEnabled() {
      let apiData = this.state.entry.dictConfigs.kontext
      return apiData.container &&
        apiData.markup &&
        apiData.template &&
        apiData.url
    }
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
      show: false
    }
  },
  methods: {
    toggleShow() {
      this.show = !this.show
    },
    openKontext() {
      alert("open kontext")
    },
    openSketchEngine() {
      alert("open sketch engine")
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
  cursor: pointer;

  &:hover {
    .dropdown {
      color: #222;
    }
  }

  .dropdown {
    position: absolute;
    width: 190px;
    right: 0;

    button {
      display: inline-block;
      width: 190px;

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
