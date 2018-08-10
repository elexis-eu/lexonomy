Screenful.Editor={
  start: function(){
    Screenful.createEnvelope();
    $("#envelope").html("<div id='toolbar'></div><div id='container' class='empty'></div><div id='waiter' style='display: none'></div><div id='history' style='display: none'></div>");
    if(Screenful.Editor.historyUrl) $("#history").html("<iframe name='historyframe' frameborder='0' scrolling='auto' src='"+Screenful.Editor.historyUrl+"'/>");
    Screenful.Editor.populateToolbar();
    Screenful.status(Screenful.Loc.ready);
    Screenful.Editor.updateToolbar();
    if(Screenful.Editor.entryID) Screenful.Editor.open(null, Screenful.Editor.entryID);

    //keyboard nav:
    $(document).on("keydown", function(e){
      //console.log(e.which, e.ctrlKey, e.metaKey, e.altKey, e.altGraphKey, e.shiftKey);
      if(e.which==37 && e.altKey){ //arrow left key
        if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.parent.Screenful.Navigator.focusEntryList();
        }
      }
      if(e.which==84 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //T key
        if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.parent.$("#searchbox").focus();
        }
      }
      if(e.which==69 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //E key
        e.preventDefault();
        e.stopImmediatePropagation();
        $("#butEdit:visible").click();
        $("#butView:visible").click();
      }
      if(e.which==83 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //S key
        e.preventDefault();
        e.stopImmediatePropagation();
        $("#butSave:visible").click();
      }
      if(e.which==78 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //N key
        e.preventDefault();
        e.stopImmediatePropagation();
        $("#butNew:visible").click();
      }
    });

    $(document).on("click", function(e){
      if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.User){
        window.parent.$(".menu").slideUp();
      }
    });

  },
  populateToolbar: function(){
    var $toolbar=$("#toolbar");
    if(Screenful.Editor.historyUrl) $("<button id='butHistory' class='iconOnly' title='"+Screenful.Loc.history+"'>&nbsp;</button>").appendTo($toolbar).on("click", Screenful.Editor.history);
    if(Screenful.Editor.allowSourceCode) $("<button id='butSourceCode' class='iconOnly' title='"+Screenful.Loc.sourceCode+"'>&nbsp;</button>").appendTo($toolbar).on("click", Screenful.Editor.sourceCode);
    $("<span id='errorMessage' style='display: none;'></span>").appendTo($toolbar);
    if(!Screenful.Editor.singleton) {
      if(Screenful.Editor.createUrl) {
    		$("<button id='butNew' title='Ctrl + Shift + N' class='iconYes'>"+Screenful.Loc.new+"</button>").appendTo($toolbar).on("click", Screenful.Editor.new);
    		$("<span class='divider'></span>").appendTo($toolbar);
      }
      $("<span id='idlabel'>ID</span>").appendTo($toolbar);
  		$("<input id='idbox'/>").appendTo($toolbar).on("keyup", function(event){
  			if(event.which==27) $("#idbox").val(Screenful.Editor.entryID);
  			if(event.which==13) Screenful.Editor.open(event);
      }).on("keydown", function(e){if(!e.altKey)e.stopPropagation()});;
  		$("<button id='butOpen' class='iconOnly mergeLeft noborder'>&nbsp;</button>").appendTo($toolbar).on("click", Screenful.Editor.open);
  		$("<span class='divider'></span>").appendTo($toolbar);
  	}
    $("<button id='butSave' title='Ctrl + Shift + S' class='iconYes'>"+Screenful.Loc.save+"<span class='star' style='display: none'>*</span></button>").appendTo($toolbar).on("click", Screenful.Editor.save);
    if(Screenful.Editor.viewer) {
  		$("<button id='butEdit' title='Ctrl + Shift + E' class='iconYes'>"+Screenful.Loc.edit+"</button>").appendTo($toolbar).on("click", Screenful.Editor.edit);
  		$("<button id='butView' title='Ctrl + Shift + E' class='iconYes'>"+Screenful.Loc.cancel+"</button>").appendTo($toolbar).on("click", Screenful.Editor.view);
  	}
    if(!Screenful.Editor.singleton) $("<button id='butNonew' class='iconYes'>"+Screenful.Loc.cancel+"</button>").appendTo($toolbar).on("click", Screenful.Editor.nonew);
    if(Screenful.Editor.leaveUrl) $("<button id='butLeave' class='iconYes'>"+Screenful.Loc.cancel+"</button>").appendTo($toolbar).on("click", function(){window.location=Screenful.Editor.leaveUrl});
    if(!Screenful.Editor.singleton) {
      if(Screenful.Editor.createUrl) {
    		$("<button id='butClone' class='iconYes'>"+Screenful.Loc.clone+"</button>").appendTo($toolbar).on("click", Screenful.Editor.clone);
      }
    }
    if(!Screenful.Editor.singleton && Screenful.Editor.deleteUrl) {
      $("<button id='butDelete' class='iconYes'>"+Screenful.Loc.delete+"</button>").appendTo($toolbar).on("click", Screenful.Editor.delete);
    }
    if(Screenful.Editor.allowAutosave) {
      $("<label id='labAutosave'><input type='checkbox' "+(Screenful.Editor.autosaveOn?"checked":"")+" id='chkAutosave'/> "+Screenful.Loc.autosave+"</label>").appendTo($toolbar);
    }
    if(Screenful.Editor.toolbarLinks){
      for(var i=0; i<Screenful.Editor.toolbarLinks.length; i++){
        var link=Screenful.Editor.toolbarLinks[i];
        $("<a class='iconYes' style='background-image: url("+link.image+")' href='"+link.href+"'>"+link.caption+"</a>").appendTo($toolbar);
      }
    }
  },
  entryID: null,
  updateToolbar: function(){
    $("#butHistory").removeClass("pressed");
    $("#butSourceCode").removeClass("pressed");
    if($("#container").hasClass("withHistory")) { //the history pane is open
      $("#butEdit").hide();
      $("#butView").hide();
      $("#butNonew").hide();
      $("#butSave").hide(); $("#butSave .star").hide();
      $("#labAutosave").hide();
      $("#butDelete").hide();
      $("#butSourceCode").hide();
      $("#butClone").hide();
      $("#butHistory").addClass("pressed").show();
    } else if($("#container").hasClass("withSourceCode")) { //the source code editor is open
      $("#butEdit").hide();
      $("#butView").hide();
      $("#butNonew").hide();
      $("#butSave").hide(); $("#butSave .star").hide();
      $("#labAutosave").hide();
      $("#butDelete").hide();
      if(Screenful.Editor.entryID) $("#butHistory").show(); else $("#butHistory").hide();
      $("#butClone").hide();
      $("#butSourceCode").addClass("pressed").show();
    } else if($("#container").hasClass("empty")) { //we have nothing open
      $("#butEdit").hide();
      $("#butView").hide();
      $("#butNonew").hide();
      $("#butSave").hide(); $("#butSave .star").hide();
      $("#labAutosave").hide();
      $("#butDelete").hide();
      $("#butSourceCode").hide();
      $("#butClone").hide();
      if($("#idbox").val()) $("#butHistory").show(); else $("#butHistory").hide();
    } else if(!Screenful.Editor.entryID){ //we have a new entry open
      $("#butEdit").hide();
      $("#butView").hide();
      $("#butNonew").show();
      $("#butSave").show(); $("#butSave .star").hide();
      $("#labAutosave").show();
      $("#butDelete").hide();
      $("#butClone").hide();
      $("#butSourceCode").show();
      $("#butHistory").hide();
    } else if(Screenful.Editor.entryID && $("#viewer").length>0){ //we have an existing entry open for viewing
      $("#butEdit").show();
      $("#butView").hide();
      $("#butNonew").hide();
      $("#butSave").hide(); $("#butSave .star").hide();
      $("#labAutosave").hide();
      $("#butDelete").show();
      $("#butSourceCode").hide();
      $("#butClone").show();
      $("#butHistory").show();
    } else if(Screenful.Editor.entryID && $("#editor").length>0){ //we have an existing entry open for editing
      $("#butEdit").hide();
      $("#butView").show();
      $("#butNonew").hide();
      $("#butSave").show(); $("#butSave .star").hide();
      $("#labAutosave").show();
      $("#butDelete").show();
      $("#butSourceCode").show();
      $("#butClone").show();
      $("#butHistory").show();
    }
    if($("#butNonew:visible").length==0 && $("#butView:visible").length==0){
      $("#butLeave").show();
    } else {
      $("#butLeave").hide();
    }
  },
  new: function(event, content){
    if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
      $("#container").css("right", ""); //remove room for xonomy layby
      Screenful.Editor.needsSaving=false;
      Screenful.Editor.hideHistory();
      id=$("#idbox").val("");
      Screenful.Editor.entryID=null;
      $("#container").removeClass("empty").removeClass("withHistory").removeClass("withSourceCode").html("<div id='editor'></div>");
      var fakeentry=null; if(content) fakeentry={id: null, content: content};
      Screenful.Editor.editor(document.getElementById("editor"), fakeentry);
      if($("#container #editor .xonomy .layby").length>0) $("#container").remove(".withHistory").css("right", "15px"); //make room for xonomy layby
      $("#container").hide().fadeIn();
      Screenful.status(Screenful.Loc.ready);
      Screenful.Editor.updateToolbar();
      if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(null);
    }
  },
  edit: function(event, id){
    if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
      $("#container").css("right", ""); //remove room for xonomy layby
      Screenful.Editor.needsSaving=false;
      Screenful.Editor.hideHistory();
      if(!id) id=Screenful.Editor.entryID;
      if(id) {
        var url=Screenful.Editor.readUrl;
        $("#container").html("").addClass("empty");
        Screenful.Editor.entryID=null;
        $("#idbox").val(id);
        Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
        $.ajax({url: url, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
            Screenful.Editor.updateToolbar();
          } else {
            Screenful.Editor.entryID=data.id;
            $("#idbox").val(data.id);
            $("#container").removeClass("empty").html("<div id='editor'></div>");
            Screenful.Editor.editor(document.getElementById("editor"), data);
            $("#container").hide().fadeIn();
            if($("#container .xonomy .layby").length>0) {
              $("#container").css("right", "15px"); //make room for xonomy layby
            }
            Screenful.status(Screenful.Loc.ready);
            Screenful.Editor.updateToolbar();
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(data.id);
          }
      	});
      }
    }
  },
  view: function(event, id){
    if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
      $("#container").css("right", ""); //remove room for xonomy layby
      Screenful.Editor.needsSaving=false;
      Screenful.Editor.hideHistory();
    	if(!Screenful.Editor.viewer) Screenful.Editor.edit(event, id);
    	else {
    		if(!id) id=Screenful.Editor.entryID;
    		if(id) {
    		  var url=Screenful.Editor.readUrl;
    		  $("#container").removeClass("withHistory").removeClass("withSourceCode").html("").addClass("empty");
    		  Screenful.Editor.entryID=null;
          $("#idbox").val(id);
          Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
    		  $.ajax({url: url, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
      			if(!data.success) {
              Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
              Screenful.Editor.updateToolbar();
      			} else {
      			  Screenful.Editor.entryID=data.id;
      			  $("#idbox").val(data.id);
      			  $("#container").removeClass("empty").html("<div id='viewer'></div>");
              Screenful.Editor.viewer(document.getElementById("viewer"), data);
              $("#container").hide().fadeIn();
      			  Screenful.status(Screenful.Loc.ready);
      			  Screenful.Editor.updateToolbar();
      			  if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(data.id);
      			}
    			});
    		}
    	}
    }
  },
  nonew: function(event){
    Screenful.Editor.open(event, null);
  },
  open: function(event, id){
    if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
      Screenful.Editor.needsSaving=false;
      Screenful.Editor.hideHistory();
      if(!id) id=$.trim( $("#idbox").val() );
      if(!id) {
        $("#container").html("").addClass("empty");
        Screenful.Editor.entryID=null;
        Screenful.status(Screenful.Loc.ready);
        Screenful.Editor.updateToolbar();
        if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(null);
      } else {
        if($("#editor").length>0 && Screenful.Editor.entryID) Screenful.Editor.edit(event, id);
        else Screenful.Editor.view(event, id);
      }
    }
  },
  save: function(event){
    Screenful.Editor.hideHistory();
    var id=Screenful.Editor.entryID;
    var content=Screenful.Editor.harvester(document.getElementById("editor"));
    $("#container").addClass("empty");
    if(!id) { //we are creating a new entry
      Screenful.status(Screenful.Loc.saving, "wait"); //"saving entry..."
      if(Screenful.Editor.saveWaitMsg){
        $("#curtain").show();
        $("#waiter").html(Screenful.Editor.saveWaitMsg).show();
      }
      $.ajax({url: Screenful.Editor.createUrl, dataType: "json", method: "POST", data: {content: content}}).done(function(data){
        $("#waiter").hide();
        $("#curtain").hide();
        if(!data.success) {
          Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save entry"
        } else {
          Screenful.Editor.entryID=data.id;
          $("#idbox").val(data.id);
          if(Screenful.Editor.viewer && !$("#chkAutosave").prop("checked")) {
      			$("#container").removeClass("empty").html("<div id='viewer'></div>");
            Screenful.Editor.viewer(document.getElementById("viewer"), data);
    		  } else {
      			$("#container").removeClass("empty").html("<div id='editor'></div>");
            Screenful.Editor.editor(document.getElementById("editor"), data);
    		  }
          $("#container").hide().fadeIn();
          Screenful.status(Screenful.Loc.ready);
          Screenful.Editor.updateToolbar();
          Screenful.Editor.needsSaving=false;
          if(data.redirUrl) window.location=data.redirUrl;
          if(Screenful.Editor.postCreateRedirUrl) window.location=Screenful.Editor.postCreateRedirUrl;
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
            window.parent.Screenful.Aftersave.batch();
          } else if(Screenful.Aftersave){
            Screenful.Aftersave.batch();
          } else {
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh();
          }
        }
    	});
    } else { //we are updating an existing entry
      Screenful.status(Screenful.Loc.saving, "wait"); //"saving entry..."
      if(Screenful.Editor.saveWaitMsg){
        $("#curtain").show();
        $("#waiter").html(Screenful.Editor.saveWaitMsg).show();
      }
      $.ajax({url: Screenful.Editor.updateUrl, dataType: "json", method: "POST", data: {id: id, content: content}}).done(function(data){
        $("#waiter").hide();
        $("#curtain").hide();
        if(!data.success) {
          Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save entry"
        } else {
          Screenful.Editor.entryID=data.id;
          $("#idbox").val(data.id);
          if(Screenful.Editor.viewer && !$("#chkAutosave").prop("checked")) {
            $("#container").removeClass("empty").html("<div id='viewer'></div>");
            Screenful.Editor.viewer(document.getElementById("viewer"), data);
		      } else {
			      $("#container").removeClass("empty").html("<div id='editor'></div>");
            Screenful.Editor.editor(document.getElementById("editor"), data);
		      }
          $("#container").hide().fadeIn();
          Screenful.status(Screenful.Loc.ready);
          Screenful.Editor.needsSaving=false;
          Screenful.Editor.updateToolbar();
          if(data.redirUrl) window.location=data.redirUrl;
          if(Screenful.Editor.postUpdateRedirUrl) window.location=Screenful.Editor.postUpdateRedirUrl;
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
            window.parent.Screenful.Aftersave.batch();
          } else if(Screenful.Aftersave){
            Screenful.Aftersave.batch();
          } else {
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh();
          }
        }
    	});
    }
  },
  delete: function(event){
    Screenful.Editor.hideHistory();
    var id=Screenful.Editor.entryID;
    if(confirm(Screenful.Loc.deleteConfirm)){ //"are you sure?"
      Screenful.status(Screenful.Loc.deleting, "wait"); //"deleting entry..."
      $.ajax({url: Screenful.Editor.deleteUrl, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
        if(!data.success) {
          Screenful.status(Screenful.Loc.deletingFailed, "warn"); //"failed to delete entry"
        } else {
          if(!Screenful.Editor.historyUrl) {
            Screenful.Editor.entryID=null;
            $("#idbox").val("");
          }
          $("#container").addClass("empty deleted").html("");
          Screenful.status(Screenful.Loc.ready);
          Screenful.Editor.updateToolbar();
          if(Screenful.Editor.postDeleteRedirUrl) window.location=Screenful.Editor.postDeleteRedirUrl;
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
            window.parent.Screenful.Aftersave.batch();
          } else if(Screenful.Aftersave){
            Screenful.Aftersave.batch();
          } else {
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh();
          }
        }
    	});
    }
  },
  needsSaving: false,
  changed: function(){
    Screenful.Editor.needsSaving=true;
    $("#butSave .star").show();
    if($("#chkAutosave").prop("checked")) Screenful.Editor.save();
  },
  history: function(){
    if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
      $("#container").css("right", ""); //remove room for xonomy layby
      Screenful.Editor.needsSaving=false;
      if($("#container").hasClass("withHistory")) {
        Screenful.Editor.hideHistory();
        var id=Screenful.Editor.entryID || $("#idbox").val();;
        Screenful.Editor.view(null, id);
      } else {
        var id=Screenful.Editor.entryID || $("#idbox").val();;
        $("#container").html("").removeClass("withSourceCode").addClass("withHistory");
        $("#history").show();
        Screenful.Editor.updateToolbar();
        $("#container .xonomy .layby").remove();
        window.frames["historyframe"].Screenful.History.go(id);
      }
    }
  },
  hideHistory: function(){
    $("#history").hide();
    if($("#container").hasClass("withHistory")) $("#container").removeClass("withHistory").html("<div id='viewer'></div>");
    Screenful.Editor.updateToolbar();
  },
  clone: function(event){
    if(Screenful.Editor.entryID && $("#editor").length>0){ //we have an existing entry open for editing
      var content=Screenful.Editor.harvester(document.getElementById("editor"));
      Screenful.Editor.new(event, content);
    } else if(Screenful.Editor.entryID && $("#viewer").length>0){ //we have an existing entry open for viewing
      var url=Screenful.Editor.readUrl;
      Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
      $.ajax({url: url, dataType: "json", method: "POST", data: {id: Screenful.Editor.entryID}}).done(function(data){
        if(!data.success) {
          Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
          Screenful.Editor.updateToolbar();
        } else {
          Screenful.Editor.new(event, data.content);
        }
    	});
    }
  },
  sourceCode: function(){
    if($("#container").hasClass("withSourceCode")) {
      Screenful.Editor.hideSourceCode();
    } else {
      var content=Screenful.Editor.harvester(document.getElementById("editor"));
      if(Screenful.Editor.formatSourceCode) content=Screenful.Editor.formatSourceCode(content);
      $("#container").removeClass("withHistory").addClass("withSourceCode");
      $("#container").removeClass("empty").html("<div id='sourceCode'><textarea spellcheck='false'>"+content.replace(/\&/g, "&amp;")+"</textarea></div>");
      $("#container").hide().fadeIn();
      $("#sourceCode textarea").focus().on("keydown", function(e){e.stopPropagation();})
      Screenful.Editor.updateToolbar();
    }
  },
  hideSourceCode: function(){
    var content=$("#sourceCode textarea").val();
    if(Screenful.Editor.validateSourceCode && !Screenful.Editor.validateSourceCode(content)){
      //invalid source code:
      $("#errorMessage").html(Screenful.Loc.invalidSourceCode).fadeIn();
      window.setTimeout(function(){ $("#errorMessage").fadeOut(); }, 1000);
    } else {
      //valid source code:
      if(Screenful.Editor.cleanupSourceCode) content=Screenful.Editor.cleanupSourceCode(content);
      var data={id: Screenful.Editor.entryID, content: content};
      if($("#container").hasClass("withSourceCode")) $("#container").removeClass("withSourceCode").html("<div id='editor'></div>");
      Screenful.Editor.editor(document.getElementById("editor"), data);
      Screenful.Editor.updateToolbar();
      Screenful.Editor.needsSaving=false;
    }
  },
  abandon: function(){
    Screenful.Editor.needsSaving=false;
    $("#idbox").val("");
    Screenful.Editor.open();
  },
};
$(window).ready(Screenful.Editor.start);
