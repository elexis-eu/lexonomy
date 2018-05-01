Screenful.Job={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<div id='middlebox'></div>");
    $("#middlebox").append("<div class='message'>"+Screenful.Job.message+"</div>");
    $("#middlebox").append("<div class='waiter'></div>");
    $("#middlebox").append("<div class='progressMessage'></div>");
    $("#middlebox").append("<div class='buttons'><button class='button finished' style='display: none'>"+Screenful.Loc.finished+"</button></div>");
    $("#middlebox .buttons button").on("click", function(e){ window.location=Screenful.Job.awayUrl; });
    Screenful.Job.batch();
  },

  batch: function(){
    $.ajax({url: Screenful.Job.actionUrl, dataType: "json", method: "POST", data: Screenful.Job.state}).done(function(data){
      Screenful.Job.state=data.state;
      $("#middlebox .progressMessage").html(data.progressMessage);
      if(data.finished) {
        $("#middlebox .waiter").addClass("finished");
        $("#middlebox .buttons button").show();
      } else {
        window.setTimeout(Screenful.Job.batch, 0); //500 ms = 0.5 second.
      }
    });
  },


};
$(window).ready(Screenful.Job.start);
