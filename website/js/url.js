class UrlClass {
   constructor(){
   }

   setQuery(query, addToHistory){
      let parts = window.location.href.split(/\?(.*)/s)
      let queryStr = this.stringifyQuery(query)
      let url = `${parts[0]}${queryStr}`

      if(addToHistory){
          history.pushState(null, null, url)
          route.base() // need to update route's "current" value in
                       //order to browser back button works correctly
      } else{
          history.replaceState(null, null, url)
      }
   }

   stringifyQuery(query){
      let str = ""
      let value
      let urlValue

      for(let key in query){
         value = query[key]
         urlValue = (typeof value == "boolean") ? (value * 1) : value
         if(key){
            str += (str ? "&" : "") + key + "=" + encodeURIComponent(urlValue)
         }
      }

      return str ? ("?" + str) : ""
   }

   /*parseQuery(str){
        let query = {}
        if(str && str.indexOf("=") != -1){
            str.split('&').forEach(part => {
                let pair = part.split('=')
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
            })
        }
        return query
    }*/

}

window.url = new UrlClass()
