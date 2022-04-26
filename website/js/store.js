class StoreClass {
   constructor(){
      observable(this);

      this.data = {
         isSiteconfigLoading: false,
         isDictlistLoading: false,
         isDictlistLoaded: false,
         siteconfig: null,
         dictlist: []
      }

      this.resetDictionary()
   }

   getDictionary(dictId){
      return this.data.dictlist.filter(d => d.id = dictId)
   }

   open(dictId, doctype, entryId){

   }

   changeDictionary(dictId){
      if(dictId != this.data.dictId){
         this.resetDictionary()
         this.data.dictId = dictId
         if(dictId){
            this.loadDictionary()
         } else {
            this.trigger("dictionaryChanged")
         }
      }
   }

   changeDoctype(doctype){
      if(this.data.isDictionaryLoading){
         this.one("dictionaryChanged", this.changeDoctype.bind(this, doctype))
      } else {
         if(doctype != this.data.doctype){
            this.data.doctype = doctype
            this.data.config.xema.root = doctype
            this.trigger("doctypeChanged")
         }
      }
   }

   changeEntry(entryId){
      if(this.data.isDictionaryLoading){
         this.one("dictionaryChanged", this.changeEntry.bind(this, entryId))
      } else {
         if(entryId != this.data.entryId){
            this.data.entryId = entryId
            this.trigger("entryChanged")
         }
      }
   }

   setEntryFlag(entryId, flag){
      let entry = this.data.entryList.find(e => e.id == entryId)
      entry.isSaving = true
      this.trigger("entrylistChanged", entryId)
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/entryflag.json`,
         method: 'POST',
         data: {
            id: entryId,
            flag: flag
         }
      })
            .done(function(flag, response) {
               if(response.success){
                  entry.flag = [flag]
               }
            }.bind(this, flag))
            .fail(response => {
                  M.toast({html: "Flag was not saved."})
            })
            .always(response => {
               delete entry.isSaving
               this.trigger("entrylistChanged", entryId)
            })
   }

   getFlagColor(flagName){
      if(flagName){
         let flag = this.data.config.flagging.flags.find(f => f.name == flagName)
         return flag ? flag.color : ''
      }
      return ''
   }

   getFlagTextColor(flagColor){
      let tmp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(flagColor);
      if(tmp){
         let red = parseInt(tmp[1], 16)
         let green = parseInt(tmp[2], 16)
         let blue = parseInt(tmp[3], 16)
         return (red * 0.299 + green * 0.587 + blue * 0.114) > 186 ? "#000000" : "#ffffff"
      }
      return "#000000"
   }

   resetDictionary(){
      Object.assign(this.data, {
         isDictionaryLoading: false,
         isDictionaryLoaded: false,
         isEntrylistLoading: false,
         isEntrylistLoaded: false,
         isDictionaryExamplesLoading: false,
         config: null,
         doctype: null,
         doctypes: null,
         entryList: null,
         dictId: null,
         entryId: null,
         searchtext: '',
         modifier: 'start',
         mode: 'view',
         userAccess: {
            canEdit: false,
            canConfig: false,
            canUpload: false,
            canDownload: false
         },
         dictionaryExamples: null
      })
   }

   loadSiteconfig(){
      this.data.isSiteconfigLoading = true
      return $.ajax({url: `${window.API_URL}/siteconfigread.json`})
            .done(response => {
               this.data.siteconfig = response
               //this.trigger("siteconfigChanged")
            })
            .fail(response => {
               M.toast({html: "Could not load app configuration."})
            })
            .always(response => {
               this.data.isSiteconfigLoading = false
            })
   }

   loadDictlist(){
      this.data.isDictlistLoading = true
      this.trigger("dictlistLoadingChanged")
      return $.ajax(`${window.API_URL}/userdicts.json`)
            .done(response => {
               this.data.dictlist = response.dicts || []
               this.data.isDictlistLoaded = true
               this.trigger("dictlistChanged")
            })
            .fail(response => {
               M.toast({html: "Dictionary list could not be loaded."})
            })
            .always(response => {
               this.data.isDictlistLoading = false
               this.trigger("dictlistLoadingChanged")
            })
   }

   loadPublicDictionaryList(){
      return $.ajax(`${window.API_URL}/publicdicts.json`)
            .done(response => {
               this.data.publicDictlist = response.entries || []
            })
            .fail(response => {
               M.toast({html: "Dictionary list could not be loaded."})
            })
            .always(response => {})
   }

   loadDictionary(){
      if(!this.data.dictId || this.data.isDictionaryLoading){
         return
      }
      this.data.isDictionaryLoading = true
      this.data.isDictionaryLoaded = false
      this.trigger("isDictionaryLoadingChanged")
      return $.ajax(`${window.API_URL}${this.data.dictId}/config.json`)
         .done(response => {
            if(response.success){
               Object.assign(this.data, {
                     config: response.configs,
                     userAccess: response.userAccess,
                     xemaOverride: false,
                     xemplateOverride: false,
                     editingOverride: false,
                     userAccess: response.userAccess,
                     dictConfigs: response.configs,
                     doctype: response.doctype,
                     doctypes: response.doctypes
                  },
                  response.publicInfo
               )
               this.data.isDictionaryLoaded = true
               this.data.isDictionaryLoading = false
               this.trigger("dictionaryChanged")
               this.loadEntrylist()
            }
         })
         .fail(response => {
            this.data.isDictionaryLoading = false
            M.toast({html: "Dictionary configuration could not be loaded."})
            route("#/")
         })
         .always(response => {
            this.trigger("isDictionaryLoadingChanged")
         })
   }

   loadEntrylist(){
      if(!this.data.dictId || !this.data.doctype){
         return
      }
      this.data.isEntrylistLoading = true
      this.trigger("entrylistLoadingChanged")
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/${this.data.doctype}/entrylist.json`,
         method: "POST",
         data: {
            searchtext: this.data.searchtext,
            modifier: this.data.modifier,
            howmany: 100
         }
      })
            .done(response => {
               this.data.entryList = response.entries
               this.data.entryCount = response.total
               this.data.isEntrylistLoaded = true
               this.trigger("entrylistChanged")
            })
            .fail(response => {
               M.toast({html: "Entry list could not be loaded."})
            })
            .always(response => {
               this.data.isEntrylistLoading = false
               this.trigger("entrylistLoadingChanged")
            })
   }

   loadDictionaryConfig(configId){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/configread.json`,
         method: "POST",
         data: {
            id: configId
         }
      })
            .done(response => {
            })
            .fail(response => {
               M.toast({html: `Could not load the data ('${configId}'): ${response.statusText}`})
            })
            .always(response => {

            })
   }

   updateDictionaryConfig(configId, data){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/configupdate.json`,
         method: 'POST',
         data: {
            id: configId,
            content: JSON.stringify(data)
         }
      })
            .done(response => {
               this.loadDictionary(this.data.dictId)
               M.toast({html: "Saved"})
            })
            .fail(response => {
               M.toast({html: `Could not save the data ('${configId}'): ${response.statusText}`})
            })
            .always(response => {})
   }

   createDictionary(data){
      return $.ajax({
         url: `${window.API_URL}make.json`,
         method: 'POST',
         data: data
      })
            .done(response => {
               if (response.success) {
                  this.loadDictlist()
               }
            })
            .fail(response => {
               M.toast({html: "Could not create dictionary."})
            })
            .always(repsonse => {

            })
   }

   cloneDictionary(dictId){
      return $.ajax({
         url: `${window.API_URL}${dictId}/clone.json`,
         method: 'POST'
      })
            .done(response => {
               this.data.dictlist = response.dicts
               M.toast({html: "Dictionary was cloned."})
               this.trigger("dictlistChanged")
            })
            .fail(response => {
               M.toast({html: "Dictionary clone creation failed."})
            })
            .always(repsonse => {
            })
   }

   deleteDictionary(dictId){
      return $.ajax({
         url: `${window.API_URL}${dictId}/destroy.json`,
         method: 'POST'
      })
            .done(response => {
               this.data.dictlist = response.dicts
               M.toast({html: "Dictionary was deleted."})
               this.trigger("dictlistChanged")
            })
            .fail(response => {
               M.toast({html: "Dictionary clone creation failed."})
            })
            .always(repsonse => {

            })
   }

   uploadXML(data){
      return $.ajax({
            url: `${window.API_URL}${this.data.dictId}/upload.html`,
            method: 'POST',
            data: data,
            processData: false,
            contentType: false
         })
   }

   importXML(data){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/import.json`,
         data: data
      })
   }

   reloadDictionaryExamples(){
      if(!this.data.dictId || this.data.isDictionaryExamplesLoading){
         return
      }
      this.data.isDictionaryExamplesLoading = true
      this.trigger("isDictionaryExamplesLoading")
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/random.json`,
         method: 'POST'
      })
            .done(response => {
               this.data.dictionaryExamples = response.entries
               this.trigger("dictionaryExamplesChanged")
            })
            .fail(response => {
               M.toast({html: "Could not load the examples."})
            })
            .always(response => {
               this.data.isDictionaryExamplesLoading = false
               this.trigger("isDictionaryExamplesLoading")
            })
   }

   loadCorpora(){
      return $.ajax({
         url: `${window.API_URL}skeget/corpora`
      })
            .fail(response => {
               M.toast({html: "Could not load Sketch Engine corpora."})
            })
   }

   loadKontextCorpora(){
      return $.ajax({
         url: `${window.API_URL}kontext/corpora`
      })
            .fail(response => {
               M.toast({html: "Could not load Kontext corpora."})
            })
   }

   suggestUrl(){
      return $.ajax({
         url: `${window.API_URL}makesuggest.json`
      })
            .fail(response => {
               M.toast({html: "Could not generate URL of the new dictionary."})
            })
   }

   autoAddImages(addElem, addNumber){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/autoimage.json`,
         method: 'POST',
         data: {
            "addElem": addElem,
            "addNumber": addNumber
         }
      })
            .fail(response => {
               M.toast({html: "Could not automatically add images."})
            })
   }

   autoAddImagesGetProgress(jobId){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/autoimageprogress.json`,
         data: {jobId: jobId}
      })
            .fail(response => {
               M.toast({html: "Could not check image generation progress."})
            })

   }

   startLinking(otherDictID){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/linknaisc.json`,
         data: {otherdictID: otherDictID}
      })
            .fail(response => {
               M.toast({html: "Could not initiate linking process."})
            })
   }

   linkingCheckIfRunning(){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/linking.json`
      })
            .fail(response => {
               M.toast({html: "Could not check linking process."})
            })
   }

   linkingGetProgress(otherDictID, jobID){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/naiscprogress.json`,
         data: {
            otherdictID: otherDictID,
            jobid: jobID
         }
      })
            .fail(response => {
               M.toast({html: "Could not check the linking progress."})
            })
   }

   autonumberElements(countElem, storeElem){
      return $.ajax({
         url: `${window.API_URL}${this.data.dictId}/autonumber.json`,
         method: 'POST',
         data: {
            "countElem": countElem,
            "storeElem": storeElem
         }
      })
            .fail(response => {
               M.toast({html: "Autonumbering failed."})
            })
   }
}

window.store = new StoreClass()
