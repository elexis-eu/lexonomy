Screenful.Make={
  prefix: window.location.href.replace(/\/[^\/]+\/?$/, "/"),
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'><div class='one'></div><div class='two' style='display: none'></div></form>");
    $("#middlebox .one").append("<div class='field title'><div class='label'>"+Screenful.Loc.title+"</div><input class='textbox'/><div class='instro'>"+Screenful.Make.titleHint+"</div></div>");
    $("#middlebox .one").append("<div class='field url'><div class='label'>"+Screenful.Loc.url+"</div><div class='url'><span class='pre'>"+Screenful.Make.prefix+"</span><input class='post' value='"+Screenful.Make.suggested+"'/></div><div class='instro'>"+Screenful.Make.urlHint+"</div></div>");
    $("#middlebox .one").append("<div class='field template'><div class='label'>"+Screenful.Loc.template+"</div><select class='textbox'/><div class='instro'>"+Screenful.Make.templateHint+"</div></div>");
    $("#middlebox .one").append("<div class='field submit'><input class='button' type='submit' value='"+Screenful.Loc.create+"'/></div>");
    $("#middlebox .one").append("<div class='error' style='display: none'></div>");
    $("#middlebox .two").append("<div class='message'>"+Screenful.Make.finishedMessage+"</div>");
    $("#middlebox .two").append("<div class='url'><a href=''></a></div>");

    $("#middlebox div.field.url input.post").width($("#middlebox div.field.url div.url").width()-$("#middlebox div.field.url span.pre").width()-10);

    for(var i=0; i<Screenful.Make.templates.length; i++){
      var t=Screenful.Make.templates[i];
      $("#middlebox div.field.template select").append("<option value='"+t.value+"'>"+t.caption+"</option>");
    }

    $("#middlebox div.field.title input").focus();
    $("#middlebox").on("submit", function(e){
      var title=$.trim($("#middlebox div.field.title input").val());
      var url=$.trim($("#middlebox div.field.url input").val());
      var template=$("#middlebox div.field.template select").val();

      if(title=="") { $("#middlebox .error").html(Screenful.Loc.titleEmpty).show(); return false; }
      if(url=="") { $("#middlebox .error").html(Screenful.Loc.urlEmpty).show(); return false; }
      if(url.length<3) { $("#middlebox .error").html(Screenful.Loc.urlShort).show(); return false; }
      if(/[^a-zA-Z0-9\-]/.test(url)) { $("#middlebox .error").html(Screenful.Loc.urlInvalid).show(); return false; }

      Screenful.Make.make(title, url, template);
      return false;
    });
  },

  make: function(title, url, template){
    $.ajax({url: Screenful.Make.makeUrl, dataType: "json", method: "POST", data: {title: title, url: url, template: template}}).done(function(data){
      if(!data.success) {
        $("#middlebox div.error").html(Screenful.Loc.urlTaken).show();
      } else {
        url=Screenful.Make.prefix+url+"/";
        $("#middlebox .two .url a").html(url).attr("href", url);
        $("#middlebox .one").hide();
        $("#middlebox .two").show()
      }
    });
  },


};
$(window).ready(Screenful.Make.start);
