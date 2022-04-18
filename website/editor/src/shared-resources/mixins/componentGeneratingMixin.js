// export default {
//   data() {
//     return {
//       displayTypeToComponentMap: {
//         "popup": "PopupComponent",
//         "inline": "InlineComponent",
//         "read-only": "ReadOnlyComponent",
//         "text-input": "TextInputComponent",
//         "textarea-input": "TextAreaInputComponent",
//         "dropdown": "DropdownComponent",
//         "media": "MediaComponent"
//       },
//       actualContent: {}
//     }
//   },
//   watch: {
//     content(nevVal) {
//       console.log("triggered watch")
//       if(Array.isArray(nevVal)) {
//         this.actualContent = nevVal[0]
//         this.$emit("createAdditionalElements", {
//           additionalContent: nevVal.slice(1),
//           elementName: this.name
//         })
//       } else {
//         this.actualContent = nevVal
//       }
//     }
//   },
//   created() {
//     if(Array.isArray(this.content)) {
//       this.actualContent = this.content[0]
//       this.$emit("createAdditionalElements", {
//         additionalContent: this.content.slice(1),
//         elementName: this.name
//       })
//     } else {
//       this.actualContent = this.content
//     }
//   },
//   methods: {
//     getComponentFromElementName(elementObject) {
//       let elementData = Object.values(elementObject)[0]
//       return this.displayTypeToComponentMap[elementData.displayType]
//     },
//     getPropsForElement(element) {
//       console.log("And here!", this.name)
//       let elementName = Object.keys(element)[0]
//       let elementData = Object.values(element)[0]
//       let children = elementData.children
//       delete elementData.children
//
//       let content = {}
//       for (const [key, value] of Object.entries(this.actualContent)) {
//         if(key == elementName) {
//           content = value
//           break
//         }
//       }
//       console.log(`Content for ${elementName}:`, content)
//       return {
//         children: children,
//         elementData: elementData,
//         name: elementName,
//         content: content
//       }
//     },
//     createAdditionalElements(event) {
//       //dynamically create another element with event.elementName
//       console.log(event)
//     }
//   }
// }
