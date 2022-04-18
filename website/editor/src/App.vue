<template>
  <div id="app">
    <div>
      <h4>EntryID</h4>
      <p>{{ state.entry.entryId }}</p>
    </div>
    <EntryDisplay :content="state.entry.content" :content-html="state.entry.contentHtml"/>
  </div>
</template>

<script>
import axios from "axios"
import {xml2js} from "xml-js"
import EntryDisplay from "@/components/EntryDisplay"

export default {
  name: 'App',
  components: {EntryDisplay},
  props: {
    message: String
  },
  // watch: {
  //   // "state.entry": {
  //   //   handler(newVal) {
  //   //     // console.log(newVal)
  //   //   },
  //   //   deep: true
  //   // },
  //   "state.entry.entryId"(newVal) {
  //     this.readEntry(newVal)
  //   }
  // },
  computed: {
    entriesToRender() {
      console.log(this.state.entry["entryId"], "inside compuited")
      return this.state.entry.content
    }
  },
  created() {
    this.bus.$on("updateEntry", this.updateEntry)
    window.postMessage(
      {
        event: "editorReady",
        data: {
          ready: true
        }
      },
      "*"
    )
  },
  beforeDestroy() {
    this.bus.$off("updateEntry", this.updateEntry)
  },
  methods: {
    async updateEntry(data) {
      if(!data) {
        return
      }
      if(data.entryId !== "" && data.entryId !== this.state.entry.entryId) {
        let contentData = {content: {}, contentHtml: ""}
        contentData = await this.readEntry(data.entryId, data.dictId)
        this.state.entry = {...this.state.entry, ...data, ...contentData}
      } else {
        console.log("entry same or invalid")
      }
    },
    readEntry(id, dictId) {
      // console.log("entryId", id)
      let data = new FormData()
      data.append("id", id)
      return axios.post(`/${dictId}/entryread.json`, data)
        .then(response => {
          if(response.data.success) {

            let content = xml2js(response.data.content, {compact: true})
            let contentHtml = response.data.contentHtml
            return {content: content, contentHtml: contentHtml}
          } else {
            console.error("Failed to load")
            return {content: {}, contentHtml: ""}
          }
        })
        .catch(e => {
          console.error(e.message)
          return {content: {}, contentHtml: ""}
        })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
