Screenful.UserProfile={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<div id='skeloginbox' class='middlebox'><div class='one'></div></div><form id='skeapibox' class='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form><div id='oneclickbox' class='middlebox'><div class='one'></div></div><form id='changepwdbox' class='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form>");
    $("#changepwdbox .one").append("<div class='message'>"+Screenful.Loc.changePwdMsg+"</div>");
    $("#changepwdbox .one").append("<div class='field password'><div class='label'>"+Screenful.Loc.newPassword+"</div><input class='textbox' type='password'/></div>");
    $("#changepwdbox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.change+"'/></div>");
    $("#changepwdbox .one").append("<div class='error' style='display: none'></div>");
    $("#changepwdbox .two").append("<div class='message'>"+Screenful.Loc.passwordChanged+"</div>");
    $("#changepwdbox .two").append("<div class='field submit'><button class='return'>"+Screenful.Loc.ok+"</button></div>");

    if (Screenful.User.sketchengineLoginPage != "") {
      $("#skeloginbox .one").append("<div class='label'>Sketch Engine login</div>");
      if (Screenful.User.ske_username != "") {
        $("#skeloginbox .one").append("<div class='message'>Your Lexonomy account is linked to your Sketch Engine account <b>"+Screenful.User.ske_username+"</b>.</div>");
        if (Screenful.User.ske_apiKey != "") {
          $("#skeloginbox .one").append("<div class='message'>Your Sketch Engine API key is <b>"+Screenful.User.ske_apiKey+"</b>.</div>");
        }
        $("#skeloginbox .one").append("<div class='message'><a href='"+Screenful.User.sketchengineLoginPage+"'>Link to a different Sketch Engine account&nbsp;»</a></div>");
      } else {
        $("#skeloginbox .one").append("<div class='message'><a href='"+Screenful.User.sketchengineLoginPage+"'>Link your Lexonomy account to your Sketch Engine account&nbsp;»</a></div>");
      }
      if (Screenful.User.ske_apiKey == "") {
        $("#skeloginbox .one").append("<div class='message'>Your Sketch Engine API key is not set. Please, <a href='"+Screenful.User.sketchengineLoginPage+"'>login via Sketch Engine</a> to set API key automatically.</div>");
      }
    }

    $("#skeapibox .one").append("<div class='label'>Sketch Engine API key</div>");
    if (Screenful.User.sketchengineLoginPage != "") {
      $("#skeapibox .one").append("<div class='message'>Unless you need special setup, Please, <a href='"+Screenful.User.sketchengineLoginPage+"'>login via Sketch Engine</a> to set API key automatically.</div>");
    }
    $("#skeapibox .one").append("<div class='field skeapikey'><div class='label'>"+Screenful.Loc.newApiKey+"</div><input class='textbox' value='"+Screenful.User.ske_apiKey+"'/></div>");
    $("#skeapibox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.change+"'/></div>");
    $("#skeapibox .one").append("<div class='error' style='display: none'></div>");
    $("#skeapibox .two").append("<div class='message'>"+Screenful.Loc.apiKeyChanged+"</div>");
    $("#skeapibox .two").append("<div class='field submit'><button class='return'>"+Screenful.Loc.ok+"</button></div>");

    $("#oneclickbox .one").append("<div class='label'>One-Click Dictionary API key</div>");
    $("#oneclickbox .one").append("<div class='message'>This key allows external tools such as Sketch Engine to create a dictionary in your account and to populate it with pre-generated entries.</div>");
    $("#oneclickbox .one").append("<div class='message' id='oneclickkey'>"+Screenful.User.oneclick+"</div>");
    $("#oneclickbox .one").append("<div class='apibuttons'><button class='iconReload'>Generate new API key</button> <button class='iconCross'>Remove API key</button></div>");

    $("#changepwdbox").on("submit", function(e){
      var password=$("#changepwdbox div.field.password input").val();
      if(password=="") { $("#changepwdbox .error").html(Screenful.Loc.passwordEmpty).show(); return false; }
      if(password.length<6) { $("#changepwdbox .error").html(Screenful.Loc.passwordShort).show(); return false; }
      if($.trim(password)!=password) { $("#changepwdbox .error").html(Screenful.Loc.passwordWhitespace).show(); return false; }
      Screenful.UserProfile.goPassword(password);
      return false;
    });

    $("#skeapibox").on("submit", function(e){
      var newapikey=$("#skeapibox div.field.skeapikey input").val();
      Screenful.UserProfile.goSkeApiKey(newapikey);
      return false;
    });

    $("button.return").on("click", function(e){
      window.location=Screenful.UserProfile.returnUrl;
    });

    $("button.iconReload").on("click", function(e){
      var newkey=Screenful.UserProfile.generateKey();
      $("#oneclickkey").html(newkey);
      Screenful.UserProfile.goOneclickApiKey(newkey);
    });

    $("button.iconCross").on("click", function(e){
      $("#oneclickkey").html("");
      Screenful.UserProfile.goOneclickApiKey("");
    });
  },

  goPassword: function(password){
    $.ajax({url: Screenful.UserProfile.pwdActionUrl, dataType: "json", method: "POST", data: {password: password}}).done(function(data){
      if(data.success) {
        $("#changepwdbox .one").hide();
        $("#changepwdbox .two").show()
      }
    });
  },

  goSkeApiKey: function(skeapikey){
    $.ajax({url: Screenful.UserProfile.skeActionUrl, dataType: "json", method: "POST", data: {ske_apiKey: skeapikey}}).done(function(data){
      if(data.success) {
        $("#skeapibox .one").hide();
        $("#skeapibox .two").show()
      }
    });
  },

  goOneclickApiKey: function(apikey){
    $.ajax({url: Screenful.UserProfile.oneclickUpdateUrl, dataType: "json", method: "POST", data: {apiKey: apikey}}).done(function(data){
      if(data.success) {
      }
    });
  },

  generateKey: function(){
    var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var key="";
    while(key.length<32) {
      var i=Math.floor(Math.random() * alphabet.length);
      key+=alphabet[i];
    }
    return key;
  },

};
$(window).ready(Screenful.UserProfile.start);
