export default {

  methods: {
    saveFromCorpus(element, data) {
      switch (data.type) {
        case "kontext":
          this.saveFromKontext(element, data.elements)
          break
        case "collx":
        case "thes":
         case "defo":
          this.saveSingleWord(element, data.elements)
          break
        case "xampl":
          this.saveSkeExamples(element, data.elements)
          break
      }
    },
    saveFromKontext(element, data) {
      for (const elementData of data) {
        let newObject = this.createElementTemplate(element.name)[0]
        let newHeadword = this.createElementTemplate(this.state.entry.dictConfigs.kontext.markup)[0]
        newHeadword.elements = [{type: "text", text: elementData.headword}]
        newObject.elements = [
          {type: "text", text: elementData.left},
          newHeadword,
          {type: "text", text: elementData.right},
        ]
        this.createElement({name: element.name, content: newObject})
      }
    },
    saveSingleWord(element, data) {
      for (const elementData of data) {
        let newObject = this.createElementTemplate(element.name)[0]
        newObject.elements = [
          {type: "text", text: elementData.text},
        ]
        this.createElement({name: element.name, content: newObject})
      }
    },
    saveSkeExamples(element, data) {
      for (const elementData of data) {
        let newObject = this.createElementTemplate(element.name)[0]
        let newHeadword = this.createElementTemplate(this.state.entry.dictConfigs.xampl.markup)[0]
        newHeadword.elements = [{type: "text", text: elementData.headword}]
        newObject.elements = [
          {type: "text", text: elementData.left},
          newHeadword,
          {type: "text", text: elementData.right},
        ]
        this.createElement({name: element.name, content: newObject})
      }
    },
  }
}
