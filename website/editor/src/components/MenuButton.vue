<template>
    <div class="menu-button">
        <div ref="menuButton" class="dropdown" @click="toggleShow">
            <div class="button"
                 :class="{active: show}"
            >
                <i class="material-icons right">arrow_drop_down</i>
                <p>{{buttonText}}</p>
            </div>
            <section v-show="show">
                <slot></slot>
            </section>
        </div>
    </div>
</template>

<script>
export default {
  name: "MenuButton",
  props: {
    buttonText: {
      type: String,
      required: true
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
    watchForOutsideClick(event) {
      if (this.$refs.menuButton && !this.$refs.menuButton.contains(event.target)) {
        this.toggleShow()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-button {
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
    width: 100%;
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
}

</style>
