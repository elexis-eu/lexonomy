Screenful.Download={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'></form>");
    for(var i=0; i<Screenful.Download.items.length; i++){
      var item=Screenful.Download.items[i];
      if(!item.blurb) item.blurb="";
      $("#middlebox").append("<a class='download' href='"+item.url+"'>"+item.title+" <span class='explanation'>"+item.blurb+"</span></a>");
    }
  },
};
$(window).ready(Screenful.Download.start);
