<template>
  <div id="editor">
    <div>
      <h4>EntryID</h4>
      <p>{{ state.entry.entryId }}</p>
    </div>
    <EntryDisplay :content-html="state.entry.contentHtml"/>
  </div>
</template>

<script>
import {xml2js} from "xml-js"
import EntryDisplay from "@/components/EntryDisplay"

export default {
  name: 'App',
  components: {EntryDisplay},
  props: {
    message: String
  },
  created() {
    let data = window.entryData
    this.updateEntry(data)
  },
  methods: {
    updateEntry(data) {
      if(!data) {
        return
      }

      data.content = xml2js(data.content || "", {compact: false})
      this.state.entry = {...this.state.entry, ...data}
    }
  }
}
</script>

<style scoped>
#editor {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
