<dict-edit>
    <div class="row">
        <div class="col s10 offset-s1">
            <h3 class="header">{ this.props.dictDetails.title }</h3>
        </div>
    </div>
    <div if={ this.doctypes.length > 1 } class="row doctypes">
        <div class="col s12">
            <ul class="tabs">
                <li each={ type in this.doctypes } active={ type == this.doctype } class="tab col s2"><a
                        onclick={ doChangeDoctype } doctype={ type }>{ type }</a></li>
            </ul>
        </div>
    </div>
    <div class="divider"></div>
    <div class="row">
        <div class="col s3">
            <div class="row">
                <input type="text" id="searchBox" placeholder="search" class="col s6" onkeypress={ runSearch }/>
                <div class="col s3">
                    <div class="input-field">
                        <select id="searchType">
                            <option value="" disabled selected>?</option>
                            <option value="start">starts like this</option>
                            <option value="exact">is exactly</option>
                            <option value="wordstart">contains a word that starts like this</option>
                            <option value="substring">contains this sequence of characters</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="entry-list collection">
                <list-headword each={ entry in this.entryList } entryData={ entry }
                               active={entry.id == this.props.entryId} change-entry-edit={ changeEntryEdit }/>
            </div>
        </div>
        <div class="col s9">
            <div id="app">
            </div>
            <!--             <dict-edit-entry  entryId={ this.selectedEntry } selectedId={ this.selectedId } dictId={ this.dictId } dictConfigs={ this.props.dictConfigs } userAccess={ this.props.userAccess } userInfo={ this.props.userInfo } userDicts={ this.userDicts }></dict-entry-edit>-->
        </div>
    </div>

    <script>
      export default {
        dictId: '',
        dictConfigs: {},
        doctype: 'entry',
        doctypes: ['entry'],
        entryList: [],
        entryCount: 0,
        selectedEntry: '',
        selectedId: '',
        userDicts: [],
        waitingForEditor: false,

        loadList() {
          var searchtext = ''
          var modifier = 'start'
          if($('#searchType').val() != null) {
            modifier = $('#searchType').val()
          }
          if($('#searchBox').val() != '') {
            searchtext = $('#searchBox').val()
          }
          $.post("/" + this.dictId + "/" + this.doctype + "/entrylist.json", {
            searchtext: searchtext,
            modifier: modifier,
            howmany: 100
          }, (response) => {
            console.log(response)
            this.entryList = response.entries
            this.entryCount = response.total
            this.update()
          })
        },

        changeEntryEdit(i) {
          console.log('onclick')
          console.log(i)
          //$('#editor').html(i)
          this.selectedEntry = i
          this.update()
        },

        runSearch(e) {
          if(e.keyCode == 13) {
            this.loadList()
          }
        },

        doChangeDoctype(e) {
          var newdoctype = e.target.getAttribute('doctype')
          if(newdoctype != this.doctype) {
            this.doctype = newdoctype
            route("/" + this.dictId + "/edit/" + newdoctype)
            this.loadList()
            this.update()
          }
        },

        onMounted() {
          this.getEditorFromDevServer()
          this.dictId = this.props.dictId
          this.doctype = this.props.doctype
          this.doctypes = this.props.doctypes
          console.log('list edit dict ' + this.dictId + this.doctype + this.props.entryId)
          this.props.loadDictDetail()
          this.loadList()
          $.get("/userdicts.json", (response) => {
            this.userDicts = response.dicts
          })
        },

        onUpdated() {
          this.doctypes = this.props.doctypes
          if(this.props.entryId && this.props.entryId != "") {
            this.selectedId = this.props.entryId
          }
          console.log('list edit dict update' + this.dictId + this.doctype + this.props.entryId)
          $('select').formSelect()
          $('select').siblings('input').attr("data-constrainwidth", false)
          console.log(this.doctypes)
          if(window.editor) {
            this.sendEntryToEditor()
          } else {
            this.waitingForEditor = true
          }
        },
        getEditorFromDevServer() {
          window.addEventListener("message", (event) => {
            if(event.data) {
              switch (event.data.event) {
                case "editorReady":
                  this.editorReady = event.data.data && event.data.data.ready
                  if(this.waitingForEditor) {
                    this.sendEntryToEditor()
                    this.waitingForEditor = false
                  }
              }
            }
          })

          fetch('http://localhost:8081/js/chunk-vendors.js').then(r => r.text()).then(vendorContent => {
            const newScript = document.createElement("script")
            newScript.append(document.createTextNode(vendorContent))
            document.querySelector('body').appendChild(newScript)
            fetch('http://localhost:8081/js/app.js').then(r => r.text()).then(content => {
              const newScript = document.createElement("script")
              newScript.append(document.createTextNode(content))
              document.querySelector('body').appendChild(newScript)
            })
          })
        },
        sendEntryToEditor() {
          let types = [
            "popup",
            "inline",
            "read-only",
            "text-input",
            "textarea-input",
            "dropdown",
            "media",
            "text-input-with-markup", //example is what we're looking at
            "link to another entry?" // sometimes id is passed which is a reference to a different element
          ]
          //What happends if element isn't in structure
          let editorConfig = {
            entry: {
              show: true,
              displayType: "inline",
              // add ability to add additional element
              children: [
                {
                  headword: {
                    show: true,
                    // displayType: "read-only"
                    displayType: "text-input"
                  }
                },
                {
                  partOfSpeech: {
                    show: true,
                    displayType: "read-only"
                  }
                },
                {
                  sense: {
                    show: true,
                    displayType: "popup",
                    enablePositionChange: true,
                    enableCopying: true,
                    children: [
                      {
                        definition: {
                          show: true,
                          displayType: "text-input"
                        }
                      },
                      {
                        example: {
                          show: true,
                          displayType: "text-input",
                          enablePositionChange: true,
                          enableCopying: true,
                          children: [
                            {
                              h: {
                                show: true,
                                displayType: "read-only"
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }

          editor.bus.$emit("updateEntry", {
            entryId: this.selectedEntry,
            selectedId: this.selectedId,
            dictId: this.dictId,
            dictConfigs: this.dictConfigs,
            userAccess: this.props.userAccess,
            userInfo: this.props.userInfo,
            userDicts: this.userDicts,
            editorConfig: editorConfig

          })
        }
      }
    </script>

    <style>
        ul.select-dropdown, ul.dropdown-content {
            width: 200% !important;

        li > span {
            white-space: nowrap;
        }

        }
        .entry-list {
            max-height: 80%;
            overflow-y: auto;
        }

        .doctypes {
            margin-bottom: 0px;
        }

        li.tab[active] {
            background-color: transparent;
            color: #ee6e73;
            border-bottom: 2px solid;
        }

        li.tab a {
            cursor: pointer;
        }
    </style>
</dict-edit>

