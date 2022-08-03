window.editorNeedsSaving = (evt) => {
   if(Screenful && Screenful.Editor && Screenful.Editor.needsSaving){
      if(!confirm(Screenful.Loc.unsavedConfirm)){
         if(evt){
            evt.stopImmediatePropagation()
            evt.stopPropagation()
            evt.preventDefault()
         }
         return true
      } else {
         Screenful.Editor.needsSaving = false
         return false
      }
   }
   return false
}
