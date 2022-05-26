<template>
  <div v-show="show" class="popup">
    <div ref="wrapper" class="modal" @click="maybeClosePopup">
      <div ref="modalContent" class="modal-content">
        <span class="close" @click="close">&times;</span>
        <div class="search-box">
          <input type="text" placeholder="Search images for" v-model="searchTerm">
          <button @click="getImages()">Search</button>
        </div>
        <div class="image-carousel">
          <div v-for="(image, i) of images" :key="i" class="image-holder">
            <img @click="selectImage(image.url)" :src="image.thumb">
          </div>
          <p v-if="errorMessage">{{ errorMessage }}</p>
          <div class="loader-wrapper">
            <LoaderComponent v-if="gettingImagesInProcess"/>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import LoaderComponent from "@/components/LoaderComponent"

export default {
  name: "ImageSearcher",
  components: {
    LoaderComponent
  },
  data() {
    return {
      show: false,
      popupId: null,
      searchTerm: "",
      images: [],
      continue: null,
      scrollListening: false,
      gettingImagesInProcess: false,
      errorMessage: null
    }
  },
  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          if (!this.popupId) {
            this.popupId = Math.random()
          }
          this.state.openedPopups.push(this.popupId)
          document.addEventListener('keydown', this.handleEscKey)
        }
      },
      immediate: true
    },
  },
  methods: {
    toggleOpen() {
      this.show = !this.show
    },
    close() {
      this.show = false
    },
    handleEscKey() {
      this.$nextTick(() => {
        if (this.state.openedPopups[this.state.openedPopups.length - 1] === this.popupId) {
          document.removeEventListener('keydown', this.handleEscKey)
          this.close()
          this.state.openedPopups.pop()
        }
      })

    },
    maybeClosePopup(event) {
      if (event.target === this.$refs.wrapper) {
        this.close()
      }
    },
    selectImage(imageUrl) {
      this.$emit('selected', imageUrl)
      this.close()
    },
    getImages() {
      this.gettingImagesInProcess = true
      axios
        .get(`${window.location.origin}/${this.state.entry.dictId}/getmedia/${this.searchTerm}/`)
        .then(response => {
          this.images = []
          this.gettingImagesInProcess = false
          if (response.data.images.length === 0) {
            this.errorMessage = "No images found."
            return
          }
          this.errorMessage = null
          response.data.images.forEach(image => {
            this.images.push({thumb: image.thumb, url: image.url})
          })

        }).catch(e => {
        this.errorMessage = e.message
      })
    },
  }
}
</script>

<style lang="scss" scoped>

.popup {
  padding: 8px 16px;
  margin-bottom: 8px;

  .modal {
    display: block;
    position: fixed; /* Stay in place */
    z-index: 3; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    max-height: 100%;
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
  }

  /* The Close Button */
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;

    &:hover,
    &:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
  }

  .search-box {
    display: flex;

    input {
      max-width: 400px;
      margin: 0;
    }

    button {
      margin: 0 16px;
    }
  }

  .image-carousel {
    display: flex;
    flex-direction: row;
    flex-flow: wrap;
    justify-content: space-between;
    margin: 20px;

    .image-holder {
      display: flex;
      width: 200px;
      height: 200px;
      margin: 10px 5px;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        cursor: pointer;

        &:hover {
          filter: drop-shadow(2px 4px 6px black)
        }
      }
    }

    .loader-wrapper {
      position: relative;
      width: 100%;
      height: 30px;
      margin-top: 30px;
    }
  }
}
</style>
