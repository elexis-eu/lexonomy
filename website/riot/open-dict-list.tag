<open-dict-list>
    <h4>
        Open dictionaries
    </h4>
    <div if={isLoading}>
        <div class="progress" style="margin: 20vh auto; max-width: 50%;">
            <div class="indeterminate"></div>
        </div>
    </div>
    <div if={!isLoading}>
        <div>
            <div class="input-field" style="display: inline-block; margin-right: 40px;">
              <i class="material-icons prefix grey-text">search</i>
              <input id="search" type="text" oninput={onSearchInput} style="width: 200px;">
              <label for="search">Find</label>
            </div>
            <div class="input-field" style="display: inline-block;">
                <i class="material-icons prefix grey-text">translate</i>
                <select id="languageSelect" style="width: 200px;">
                    <option value="">All languages</option>
                    <option each={language in languageList} value={language}>{language}</option>
                </select>
                <label>Language</label>
            </div>
        </div>
        <div if={!visibleDicts.length} class="center" style="margin: 20vh auto;">
            <h3 class="grey-text lighten-2">Nothing found</h3>
        </div>
        <table if={visibleDicts.length} class="striped highlight" style="margin: 0 15px;">
            <thead>
                <th>
                    Title
                </th>
                <th>
                    Language
                </th>
                <th>
                    Author
                </th>
                <th>
                    Licence
                </th>
            </thead>
            <tbody>
                <tr each={(row, idx) in visibleDicts} id="r_{idx}">
                    <td>
                        <a href="#/{row.id}">
                            <span id="t_{idx}">
                                {row.title}
                            </span>
                        </a>
                    </td>
                    <td>
                        <span id="l_{idx}">
                            {row.lang}
                        </span>
                    </td>
                    <td>
                        <span id="a_{idx}">
                            {row.author}
                        </span>
                    </td>
                    <td>
                        <span id="i_{idx}">
                            {row.licence}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <script>
        export default {
            isLoading: true,
            visibleDicts: [],
            allDicts: [],
            languageList: [],
            language: "",
            query: "",


            loadData(){/*
                setTimeout(() => {
                    // toto je testovací a takto to funguje
                    let payload = {"entries": [{"id": "kjmcbe2g", "title": "Besti\u00e1\u0159", "hasLinks": false, "lang": "Czech", licence: "free", author: "Petr"}, {"id": "sw5v3weq", "title": "Clone of moj", "hasLinks": false, "lang": "English", "currentUserCanEdit": true, "currentUserCanDelete": true, author:"John"}, {"id": "5ur4adnu", "title": "Clone of moj", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "ewcmhdrj", "title": "Clone of test3", "hasLinks": false, "lang": "Hebrew", author: "Samuel", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "unevfhvs", "title": "Jakub & Stepan PL-CZ Dictionary", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "navloexx01anita", "title": "Lao Examples Fix 1 Batch 1 (Anita)", "hasLinks": false, "lang": "Czech", "currentUserCanEdit": true}, {"id": "qeyjxer9", "title": "Slovn\u00edk \u010desk\u00fdch televizn\u00edch po\u0159ad\u016f", "hasLinks": false, "lang": "English", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "y728bdws", "title": "druh\u00fd test", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "st7j78pf", "title": "linking1", "hasLinks": true, "lang": "English", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "ty3sb5in", "title": "linking2", "hasLinks": true, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "3mrebqnx", "title": "moj", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "fjiceh5b", "title": "muj prvni slovnik", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "5jutw2fi", "title": "test3", "hasLinks": false, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "7drc88a2", "title": "testing dictionary", "hasLinks": true, "lang": "", "currentUserCanEdit": true, "currentUserCanDelete": true}, {"id": "v-h-s", "title": "vojensko-historick\u00fd slovn\u00edk", "hasLinks": false, "lang": ""}], "success": true}
                    this.allDicts = payload.entries
                    this.visibleDicts = this.allDicts
                    this.isLoading = false
                    this.languageList = [...new Set(this.allDicts.map(d => d.lang))].filter(l => l != "")
                    this.update()
                    this.initializeLanguageSelect()
                    $("#search").focus()
                }, 1000)
                */
                $.post({url: "https://beta.lexonomy.eu/push.api",
                    data: JSON.stringify({
                        "email": "rambousek@gmail.com",
                        "apikey": "GCFVC7IU6CPTVLXDB69QCJIR26S2WY5O",
                        "command": "publicDicts"
                    }),
                    success: payload => {
                        this.allDicts = payload.entries
                        this.visibleDicts = this.allDicts
                        this.isLoading = false
                        this.languageList = [...new Set(this.allDicts.map(d => d.lang))].filter(l => l != "")
                        this.update()
                        this.initializeLanguageSelect()
                        $("#search").focus()
                    },
                    error: payload => {
                        M.toast({html: "Could not load the data."})
                    }
                })
            },

            onSearchInput(evt){
                this.query = evt.target.value
                this.filter()
            },

            onLanguageChange(evt){
                this.language = evt.target.value
                this.filter()
            },

            filter(){
                this.allDicts.forEach(c => {
                    delete c.h_title
                    delete c.h_lang
                    delete c.h_author
                    delete c.h_licence
                })
                this.visibleDicts = this.allDicts
                if(this.language){
                    this.visibleDicts = this.visibleDicts.filter(d => d.lang == this.language)
                }
                if(this.query !== ""){
                    let sortResult = FuzzySort.go(this.query, this.visibleDicts, {
                        key: "id",
                        keys: ["title", "lang", "author", "licence"]
                    })
                    this.visibleDicts = sortResult.map(fs => {
                        fs.obj.h_title = FuzzySort.highlight(fs[0], '<b class="red-text">', "</b>")
                        fs.obj.h_lang = FuzzySort.highlight(fs[1], '<b class="red-text">', "</b>")
                        fs.obj.h_author = FuzzySort.highlight(fs[2], '<b class="red-text">', "</b>")
                        fs.obj.h_licence = FuzzySort.highlight(fs[3], '<b class="red-text">', "</b>")
                        return fs.obj
                    }).sort((a, b) => {
                        return a.score == b.score ? a.title.localeCompare(b.title) : Math.sign(b.score - a.score)
                    })
                }
                this.update()
                this.highlightOccurrences()
            },

            highlightOccurrences(){
                let el, row
                this.visibleDicts.forEach((c, idx) => {
                    row = this.$(`#r_${idx}`)
                    if(row){
                        el = this.$(`#t_${idx}`);
                        el.innerHTML = c.h_title ? c.h_title : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '')
                        el = this.$(`#l_${idx}`);
                        el.innerHTML = c.h_lang ? c.h_lang : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '')
                        el = this.$(`#a_${idx}`);
                        el.innerHTML = c.h_author ? c.h_author : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '')
                        el = this.$(`#i_${idx}`);
                        el.innerHTML = c.h_licence ? c.h_licence : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '')
                    }
                }, this)
            },

            initializeLanguageSelect(){
                 $("#languageSelect").formSelect({
                        dropdownOptions: {
                            constrainWidth: false
                        }
                    })
                    .on("change", this.onLanguageChange)
            },

            onMounted(){
                this.loadData()
            }
        }
    </script>
</open-dict-list>

