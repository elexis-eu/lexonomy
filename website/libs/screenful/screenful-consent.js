Screenful.Consent={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form>");
    $("#middlebox").append("<div class='title'>"+Screenful.Loc.termsTitle+"</div>");
    $("#middlebox").append("<div class=''>"+Screenful.Loc.termsOfUse+"</div>");
    $("#middlebox").append("<div class='field consent'><label><input type='checkbox' id='consent'/>"+Screenful.Loc.termsConsent+"</label></div>");
    $("#middlebox").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.confirm+"'/></div>");
    $("#middlebox").append("<div class='error' style='display: none'></div>");

    $("#middlebox div.field.password input").focus();

    $("#middlebox").on("submit", function(e){
      var consent = $("#consent").prop('checked');
      if(!consent) { $("#middlebox .error").html(Screenful.Loc.termsError).show(); return false; }
      Screenful.Consent.go();
      return false;
    });

  },

  go: function(){
    $.ajax({url: Screenful.Consent.actionUrl, dataType: "json", method: "POST", data: {consent: 1}}).done(function(data){
      if(data.success) window.location=Screenful.Consent.returnUrl;
      else $("#middlebox div.error").show();
    });
  },


};
$(window).ready(Screenful.Consent.start);
