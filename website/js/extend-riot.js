import {install} from 'riot'

install(function(component) {
   component.store = window.store
   component.dictData = window.store.data
   component.auth = window.auth
   component.authData = window.auth.data

   if(component.bindings){
      component.boundFunctions = {}
      let oldOnMounted = component.onMounted
      let oldOnBeforeUnmount = component.onBeforeUnmount
      let boundFunction
      component.onMounted = () => {
         oldOnMounted.apply(component)
         component.bindings.forEach(b => {
            boundFunction = component[b[2]].bind(component)
            component[b[0]].on(b[1], boundFunction)
            component.boundFunctions[`${b[1]}_${b[2]}`] = boundFunction
         })
      }
      component.onBeforeUnmount = () => {
         component.bindings.forEach(b => {
            component[b[0]].off(b[1], component.boundFunctions[`${b[1]}_${b[2]}`])
         })
         oldOnBeforeUnmount.apply(component)
      }
   }
   return component
})
