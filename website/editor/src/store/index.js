
var state = {
  entry: {
    entryId: null,
    dictId: null,
    dictConfigs: null,
    userAccess: null,
    userInfo: null,
    editorConfig: null,
    content: {},
    contentHtml: null
  },
  xml2jsConfig: {
    compact: false
  },
  _initialContent: null,
  headwordElement: null,
  headwordData: null,
  openedPopups: []
}
export default {
  state: state
}
