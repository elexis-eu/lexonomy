Screenful.History={
  go: function(entryID){
    window.parent.Screenful.Editor.entryID=entryID;
    $("body").html("<div class='leftie'></div>");
    $.ajax({url: Screenful.History.historyUrl, dataType: "json", method: "POST", data: {id: entryID}}).done(function(data){
      if(!data.length) {
        //no history for this entry
      } else {
        for(var i=0; i<data.length; i++){
          var hist=data[i];
          if(!Screenful.History.isDeletion(hist)) {
            var $div=$("<div class='revision'></div>").appendTo($("body"));
            Screenful.History.drawRevision($div, hist, data.length-i, (i==0));
            if(i==0) Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), true);
          }
          var $div=$("<div class='interRevision'></div>").appendTo($("body"));
          Screenful.History.drawInterRevision($div, hist);
        }
      }
    });
  },
  drawRevision: function($div, hist, versionNumber, isLatest){
    $div.data("hist", hist);
    $div.on("click", function(e){
      Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), true);
    });
    if(window.parent.Screenful.Editor.viewer){
      $div.append(" <span class='pretty'></span>")
      $div.find(".pretty").on("click", function(e){
        Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), false);
        e.stopPropagation();
      });
    }
    if(!isLatest) {
      $div.append("<span class='revive'>Revive</span>");
      $div.find(".revive").on("click", function(e){
        Screenful.History.reviveRevision(Screenful.History.getRevisionID(hist), false);
        e.stopPropagation();
      });
    }
    $div.append("<span class='label'>"+Screenful.Loc.version+" "+versionNumber+"</span>");
  },
  drawInterRevision: function($div, hist){
    $div.append("<div class='arrowTop'></div>");
    $div.append("<div class='arrowMiddle'></div>");
    $div.append("<div class='arrowBottom'></div>");
    $div.append(Screenful.History.printAction(hist));
  },
  zoomRevision: function(revision_id, asSourceCode){
    $(".revision").removeClass("current").removeClass("pretty").each(function(){
      var $this=$(this);
      if(Screenful.History.getRevisionID($this.data("hist"))==revision_id) {
        $this.addClass("current");
        if(!asSourceCode) $this.addClass("pretty");
        var fakeentry=Screenful.History.fakeEntry($this.data("hist"));
        if(fakeentry){
          if(!asSourceCode && window.parent.Screenful.Editor.viewer){
            window.parent.$("#container").removeClass("empty").html("<div id='viewer'></div>");
            window.parent.Screenful.Editor.viewer(window.parent.document.getElementById("viewer"), fakeentry);
          } else {
            window.parent.$("#container").removeClass("empty").html("<div id='editor'></div>");
            window.parent.Screenful.Editor.editor(window.parent.document.getElementById("editor"), fakeentry, true);
          }
          window.parent.$("#container").hide().fadeIn();
        }
      }
    });
  },
  reviveRevision: function(revision_id){
    $(".revision").each(function(){
      var $this=$(this);
      if(Screenful.History.getRevisionID($this.data("hist"))==revision_id) {
        var fakeentry=Screenful.History.fakeEntry($this.data("hist"));
        if(fakeentry){
          window.parent.Screenful.Editor.hideHistory();
          window.parent.$("#container").removeClass("empty").html("<div id='editor'></div>");
          window.parent.Screenful.Editor.editor(window.parent.document.getElementById("editor"), fakeentry);
          window.parent.$("#container").hide().fadeIn();
          window.parent.Screenful.Editor.updateToolbar();
          window.parent.Screenful.Editor.changed();
        }
      }
    });
  },
};
