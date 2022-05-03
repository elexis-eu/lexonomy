class AuthClass {
   constructor(){
      observable(this);

      this.data = {
         authorized: false
      }
      this.resetUser()
   }

   resetUser(){
      Object.assign(this.data, {
         username: null,
         apiKey: null,
         consent: null,
         email: null,
         sessionkey: null,
         ske_apiKey: null,
         ske_username: null
      })
   }

   checkAuthCookie(){
      if (!this.data.username) {
         this.data.isCheckingAuth = true
         this.trigger("checkingAuthChanged")
         return $.ajax({
            url: `${window.API_URL}login.json`,
            method: 'POST'
         })
               .done(response => {
                  if (response.success) {
                     Object.assign(this.data, response, {username: response.email})
                     this.data.authorized = true;
                     this.trigger("authChanged")
                  }
               })
               .fail(response => {})
               .always(() => {
                  this.data.isCheckingAuth = false
                  this.trigger("checkingAuthChanged")
               })
      }
   }

   login(email, password){
      this.data.isCheckingAuth = true
      this.trigger("checkingAuthChanged")
      return $.ajax({
            url: `${window.API_URL}login.json`,
            method: 'POST',
            data: {
               email: email,
               password: password
            }
         })
               .done(response => {
                  if (response.success) {
                     Object.assign(this.data, response, {username: response.email})
                     this.data.authorized = true;
                     this.trigger("authChanged")
                  }
               })
               .fail(response => {})
               .always(() => {
                  this.data.isCheckingAuth = false
                  this.trigger("checkingAuthChanged")
               })
   }

   register(){
      return $.ajax({
            url: `${window.API_URL}signup.json`,
            method: 'POST',
            data: {
               email: email
            }
         })
               .done(response => {
                  this.trigger("registrationComplete", {error: response.success ? "" : "Incorrect e-mail."})
               })
               .fail(response => {
                  this.trigger("registrationComplete", {error: "Incorrect e-mail."})
               })
               .always(response => {
               })
   }

   registerPassword(token, password){
      return $.ajax({
            url: `${window.API_URL}createaccount.json`,
            method: 'POST',
            data: {
               token: token,
               password: password
            }
         })
               .done(response => {
                  this.trigger("registerPasswordComplete", {error: response.success ? "" : "Error while creating account."})
               })
               .fail(response => {
                  this.trigger("registerPasswordComplete", {error: "Error while creating account."})
               })
               .always(response => {
               })
   }

   requestResetPassword(email){
      return $.ajax({
            url: `${window.API_URL}forgotpwd.json`,
            method: 'POST',
            data: {
               email: email
            }
         })
   }

   resetPassword(token, password){
      return $.ajax({
            url: `${window.API_URL}recoverpwd.json`,
            method: 'POST',
            data: {
               token: token,
               password: password
            }
         })
               .done(response => {
                  this.trigger("passwordResetComplete", {error: response.success ? "" : "Error while accessing account."})
               })
               .fail(response => {
                  this.trigger("passwordResetComplete", {error: "Error while accessing account."})
               })
               .always(response => {
               })
   }

   verifyToken(token, type){
      return $.ajax({
            url: `${window.API_URL}verifytoken.json`,
            method: 'POST',
            data: {
               token: token,
               type: type
            }
         })
   }

   consent(){
      this.data.isCheckingAuth = true
      this.trigger("checkingAuthChanged")
      return $.ajax({
         url: `${window.API_URL}consent.json`,
         method: 'POST',
         data: {
            consent: 1
         }
      })
            .done(response => {
               this.data.consent = true
               this.trigger("authChanged")
            })
            .fail(response => {
               M.toast("Could not save the consent.")
            })
            .always(response => {
               this.data.isCheckingAuth = false
               this.trigger("checkingAuthChanged")
            })
   }

   logout(){
      this.data.isCheckingAuth = true
      this.trigger("checkingAuthChanged")
      return $.ajax({
         url: `${window.API_URL}logout.json`,
         method: 'POST'
      })
            .done(() => {
               this.data.authorized = false;
               this.resetUser()
               this.trigger("authChanged")
            })
            .fail(response => {
               M.toast({html: "Could not log out."})
            })
            .always(() => {
               this.data.isCheckingAuth = false
               this.trigger("checkingAuthChanged")
            })
   }

   _getCookie(val) {
      if (document.cookie != undefined) {
         if (document.cookie.split('; ').find(row => row.startsWith(val+'=')) != undefined) {
            return document.cookie.split('; ').find(row => row.startsWith(val+'=')).split('=')[1].slice(1,-1)
         }
      }
      return ""
   }
}

window.auth = new AuthClass()
