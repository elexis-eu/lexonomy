Screenful.Signup={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox' onsubmit='return false;'><div class='one'></div><div class='two' style='display: none'></div></form>");
    $("#middlebox .one").append("<div class='message'>"+Screenful.Loc.signupInfoEmail+"</div>");
    $("#middlebox .one").append("<div class='field email'><div class='label'>"+Screenful.Loc.username+"</div><input class='textbox' type='email'/></div>");
    $("#middlebox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.signupButton+"'/></div>");
    $("#middlebox .two").append("<div class='message'>"+Screenful.Loc.signupTokenSent+"</div>");
    $("#middlebox .two").append("<div class='field submit'><button class='return'>"+Screenful.Loc.ok+"</button></div>");
    $("#middlebox").append("<div class='error' style='display: none'>"+Screenful.Loc.badEmailError+"</div>");

    $("#middlebox div.field.email input").focus();
    $("#middlebox").on("submit", function(e){
      var email=$("#middlebox div.field.email input").val();
      if (email!="") Screenful.Signup.sendToken(email);
      return false;
    });

    $("#middlebox button.return").on("click", function(e){
      window.location=Screenful.Signup.returnUrl; 
      return false;
    });
  },

  sendToken: function(email){
    $("#middlebox div.error").hide();
    $.ajax({url: Screenful.Signup.actionUrl, dataType: "json", method: "POST", data: {email: email}}).done(function(data){
      if(data.success) {
        $("#middlebox .one").hide();
        $("#middlebox .two").show();
      } else {
        $("#middlebox div.error").fadeIn();
      }
    });
  },
};
$(window).ready(Screenful.Signup.start);
