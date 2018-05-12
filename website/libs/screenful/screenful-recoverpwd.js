Screenful.RecoverPwd={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form>");
    if (Screenful.RecoverPwd.tokenValid) {
      $("#middlebox .one").append("<div class='message'>"+Screenful.Loc.recoverPwdMsg+"</div>");
      $("#middlebox .one").append("<div class='field password'><div class='label'>"+Screenful.Loc.newPassword+"</div><input class='textbox' type='password'/></div>");
      $("#middlebox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.change+"'/></div>");
      $("#middlebox .one").append("<div class='error' style='display: none'></div>");
      $("#middlebox .two").append("<div class='message'>"+Screenful.Loc.passwordChanged+"</div>");
      $("#middlebox .two").append("<div class='field submit'><button class='return'>"+Screenful.Loc.ok+"</button></div>");
    } else {
      $("#middlebox .one").append("<div class='bigerror'>"+Screenful.Loc.invalidToken+"</div>");
      $("#middlebox .one").append("<div class='field submit'><button class='return'>"+Screenful.Loc.ok+"</button></div>");
    }

    $("#middlebox div.field.password input").focus();

    $("#middlebox").on("submit", function(e){
      var password=$("#middlebox div.field.password input").val();
      if(password=="") { $("#middlebox .error").html(Screenful.Loc.passwordEmpty).show(); return false; }
      if(password.length<6) { $("#middlebox .error").html(Screenful.Loc.passwordShort).show(); return false; }
      if($.trim(password)!=password) { $("#middlebox .error").html(Screenful.Loc.passwordWhitespace).show(); return false; }
      Screenful.RecoverPwd.go(password);
      return false;
    });

    $("#middlebox button.return").on("click", function(e){
      window.location=Screenful.RecoverPwd.returnUrl;
      return false;
    });
  },

  go: function(password){
    $.ajax({url: Screenful.RecoverPwd.actionUrl, dataType: "json", method: "POST", data: {password: password, token: Screenful.RecoverPwd.token}}).done(function(data){
      if(data.success) {
        $("#middlebox .one").hide();
        $("#middlebox .two").show()
      }
    });
  },


};
$(window).ready(Screenful.RecoverPwd.start);
