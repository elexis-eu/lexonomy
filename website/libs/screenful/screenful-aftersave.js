Screenful.Aftersave={
  start: function(){
    $("#statusbar").append("<div id='aftersave' style='display: none'></div>");
    $("#aftersave").append("<div class='message'>"+Screenful.Aftersave.message+"</div> ");
    $("#aftersave").append("<div class='meter'><div class='done'></div></div>");
    if(Screenful.Aftersave.maximizeUrl) $("#aftersave").append(" <a class='maximize' href='"+Screenful.Aftersave.maximizeUrl+"'></a>");
  },

  batch: function(){
    $("#aftersave .meter").addClass("faded");
    $.ajax({url: Screenful.Aftersave.actionUrl, dataType: "json", method: "POST", data: {}}).done(function(data){
      if(!Screenful.Aftersave.totalTodo) Screenful.Aftersave.totalTodo=data.todo;
      if(Screenful.Aftersave.totalTodo<data.todo) Screenful.Aftersave.totalTodo=data.todo;

      var todo=Screenful.Aftersave.totalTodo;
      var done=Screenful.Aftersave.totalTodo-data.todo;
      var percentage=0; if(todo>0) percentage=Math.round(done/todo*100);
      $("#aftersave .meter .done").css("width", percentage+"%");
      $("#aftersave .meter").removeClass("faded");

      if(!data.todo) {
        $("#aftersave").fadeOut();
        if(Screenful.Navigator) Screenful.Navigator.refresh();
      } else {
        $("#aftersave").show();
        window.setTimeout(Screenful.Aftersave.batch, 1000); //1000 ms = 1 second
      }
    });
  },


};
$(window).ready(Screenful.Aftersave.start);
