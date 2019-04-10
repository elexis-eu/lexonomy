Screenful.Job={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<div id='middlebox'></div>");
    $("#middlebox").append("<div class='message'>"+Screenful.Job.message+"</div>");
    $("#middlebox").append("<div class='waiter'></div>");
    $("#middlebox").append("<div class='progressMessage'></div>");
    $("#middlebox").append("<div id='errorbox' style='display:none; margin-top: 2em'>⚠️ There were some errors during XML parsing, <a href='javascript:void(0)'>see errors.</a></div>");
    $("#middlebox").append("<div id='log' class='waiter' style='display:none'><pre></pre></div>");
    $("#middlebox").append("<div id='fulllink' style='display:none'>This view is truncated. There were more errors and you can download the whole <a href='javascript:void(0)'>error file.</a></div>");
    $("#middlebox").append("<div class='buttons'><button class='button finished' style='display: none'>"+Screenful.Loc.finished+"</button></div>");
    $("#middlebox .buttons button").on("click", function(e){ window.location=Screenful.Job.awayUrl; });
    $("#errorbox").on("click", function() {
      $("#log").show()
      data = Object.assign({}, Screenful.Job.state)
      data.showErrors = true
      data.truncate = 10000
      $.get({url: Screenful.Job.actionUrl, data: data}).done(function(data) {
        $("#log").removeClass("waiter")
        if (data.truncated) {
          data.errorData += "\n--preview truncated--"
          $("#fulllink").show()
        }
        $("#log pre").html(data.errorData)
      })
    })
    $("#fulllink").on("click", function(){
      data = Object.assign({}, Screenful.Job.state)
      data.showErrors = true
      window.location=Screenful.Job.actionUrl + "?" +$.param(data)
    })
    Screenful.Job.batch();
  },

  batch: function(){
    $.get({url: Screenful.Job.actionUrl, data: Screenful.Job.state}).done(function(data){
      $("#middlebox .progressMessage").html(data.progressMessage);
      if(data.errors)
        $("#errorbox").show()
      if(data.finished) {
        $("#middlebox .waiter").first().addClass("finished");
        $("#middlebox .buttons button").show();
      } else {
        window.setTimeout(Screenful.Job.batch, 500); //500 ms = 0.5 second.
      }
    });
  },


};
$(window).ready(Screenful.Job.start);
