<template>
  <div class="corpus-managers" >
    <div ref="corpusManagers" class="dropdown" @click="toggleShow">
      <div class="button"
           :class="{active: show}"
      >
        <i class="material-icons right">arrow_drop_down</i>
        <p>Corpus Managers</p>
      </div>
      <ul v-show="show">
        <li v-if="sketchEngineEnabled"><a @click="openSketchEngine">Sketch Engine</a></li>
        <li v-if="kontextEnabled"><a @click="openKontext">KonText</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "CorpusComponent",
  computed: {
    sketchEngineEnabled() {
      return true
    },
    kontextEnabled() {
      return true
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
    width: 140px;
    right: 0;

    .button {
      display: inline-block;
      width: 140px;
      height: 24px;

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
    padding: 16px;
    background: white;
    border: 1px solid #eee;
    z-index: 2;

    li {
      cursor: pointer;
    }
  }
}

</style>
