Screenful.Move={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form>");
    $("#middlebox .one").append("<div class='field old'><div class='label'>"+Screenful.Loc.currentUrl+"</div><div class='url'><span class='pre'>"+Screenful.Move.prefix+Screenful.Move.current+"</span></div>");
    $("#middlebox .one").append("<div class='field url'><div class='label'>"+Screenful.Loc.newUrl+"</div><div class='url'><span class='pre'>"+Screenful.Move.prefix+"</span><input class='post'/></div></div>");
    $("#middlebox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.change+"'/></div>");
    $("#middlebox .one").append("<div class='error' style='display: none'></div>");
    $("#middlebox .two").append("<div class='message'>"+Screenful.Move.finishedMessage+"</div>");
    $("#middlebox .two").append("<div class='url'><a href=''></a></div>");

    $("#middlebox div.field.url input.post").width($("#middlebox div.field.url div.url").width()-$("#middlebox div.field.url span.pre").width()-10);

    $("#middlebox div.field.url input").focus();
    $("#middlebox").on("submit", function(e){
      var url=$.trim($("#middlebox div.field.url input").val());
      if(url=="") { $("#middlebox .error").html(Screenful.Loc.urlEmpty).show(); return false; }
      if(url.length<3) { $("#middlebox .error").html(Screenful.Loc.urlShort).show(); return false; }
      if(/[^a-zA-Z0-9\-]/.test(url)) { $("#middlebox .error").html(Screenful.Loc.urlInvalid).show(); return false; }
      Screenful.Move.go(url);
      return false;
    });
  },

  go: function(url){
    $.ajax({url: Screenful.Move.actionUrl, dataType: "json", method: "POST", data: {url: url}}).done(function(data){
      if(!data.success) {
        $("#middlebox div.error").html(Screenful.Loc.urlTaken).show();
      } else {
        url=Screenful.Move.prefix+url+"/";
        $("#middlebox .two .url a").html(url).attr("href", url);
        $("#middlebox .one").hide();
        $("#middlebox .two").show()
      }
    });
  },


};
$(window).ready(Screenful.Move.start);
