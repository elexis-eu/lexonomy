Xrefs={};

Xrefs.extendDocspec=function(docspec, xema) {
  if (Object.keys(linking).length) {
    for(var parName in xema.elements) {
      if (linking[parName] != undefined) {
        docspec.elements[parName].caption = function(jsMe){
          var cap="";
          cap="<span class='lexonomyXrefsCaption' onclick='Xonomy.notclick=true; Xrefs.linkBox(\""+jsMe.htmlID+"\")'>▼</span>";
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
          return cap;
        };
      }
    }
  }
}

Xrefs.linkBox=function(htmlID) {
  var html = "";
  html = "<div class='xrefsbox'>";
  html += "Link this element to<br/>dictionary: ";
  html += "<select name='xrefdict' class='browser-default' style='display: inline-block; width: auto;' onchange='Xrefs.refreshLinks()'>";
  for (var dict in userDicts) {
    if (userDicts[dict]["id"] != dictId && userDicts[dict]["hasLinks"]) {
      html += "<option value='"+userDicts[dict]["id"]+"'>"+userDicts[dict]["title"]+"</option>";
    }
  }
  html += "</select><br/>";
  html += " target: ";
  html += "<div class='input-field'><input id='xreftarget' name='xreftarget' class='autocomplete'/></div>";
  html += "<button onclick='Xrefs.makeLink(\""+htmlID+"\")'>Link</button>";
  html += "</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  // read dictionary preference from cookie
  if (document.cookie.split('; ').find(row => row.startsWith('linkPref='))) {
    $('[name=xrefdict]').val(document.cookie.split('; ').find(row => row.startsWith('linkPref=')).split('=')[1]);
  }
  Xrefs.refreshLinks();
}

Xrefs.refreshLinks=function() {
  var xrefdict = $("[name=xrefdict]").val();
  $("[name=xreftarget]").empty();
  if (xrefdict != "") {
    var xrefTarget = $("#xreftarget");
    var listData = {};
    var autocompleteData = {};
    console.log("/"+xrefdict+"/linkablelist.json")
    $.get("/"+xrefdict+"/linkablelist.json", (response) => {
      response.links.forEach(item => {
        var text = item.element + ": " + item.link + ((item.preview != "")? " (" + item.preview + ")":"");
        listData[text] = item;
        autocompleteData[text] = null
      });
      xrefTarget.autocomplete({
        data: autocompleteData, 
        limit: 10, 
        onAutocomplete: function(txt) {
          var item = listData[txt];
          if (item) {
            $("#xreftarget").data('element', item.element);
            $("#xreftarget").data('link', item.link);
          }
        }
      })
    });
  }
}

Xrefs.makeLink=function(htmlID) {
  var xrefdict = $("[name=xrefdict]").val();
  var xrefel = $("#xreftarget").data('element');
  var xrefid = $("#xreftarget").data('link');
  var srcid = $("#"+htmlID+" > .tag.opening > .attributes").children("[data-name='lxnm:linkable']").data('value');
  var srcel = $("#"+htmlID).data('name');
  if (xrefel != undefined && xrefid != undefined && xrefel != "" && xrefid != "" && xrefdict != "" && srcid != undefined && srcel != undefined) {
    var srcdict = dictId;
    document.cookie = "linkPref=" + xrefdict + "; path=/" + srcdict;
    $("#"+htmlID+" > .tag.opening > .attributes")
    $.get("/"+dictId+"/links/add", {source_el: srcel, source_id: srcid, target_dict: xrefdict, target_el: xrefel, target_id: xrefid}, function(json){
      if (json.success) {
        Screenful.status('Link created successfully.');
      } else {
        Screenful.status('Error while creating link: ' + json.error);
      }
    });
  }
  Xonomy.destroyBubble();
  Screenful.Editor.addLinks(Screenful.Editor.readUrl.replace("entryread", "entrylinks"), $('#editor'), Screenful.Editor.entryID);
}
