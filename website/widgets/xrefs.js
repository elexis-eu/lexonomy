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
  html += "<select name='xrefdict' onchange='Xrefs.refreshLinks()'>";
  for (var dict in userdicts) {
    if (userdicts[dict]["id"] != dictID && userdicts[dict]["hasLinks"]) {
      html += "<option value='"+userdicts[dict]["id"]+"'>"+userdicts[dict]["title"]+"</option>";
    }
  }
  html += "</select>";
  html += " target: ";
  html += "<input name='xreftarget'/>";
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
    var xrefTarget = $("[name=xreftarget]");
    xrefTarget.easyAutocomplete({
      url: rootPath+xrefdict+"/linkablelist.json",
      getValue: "link",
      template: {
        type: "custom",
        method: function(value, item) {
          return "<i>" + item.element + ":</i> <b>" + item.link + "</b>" + ((item.preview != "")? " (" + item.preview + ")":"");
        }
      },
      list: {
        match: {
          enabled: true
        },
        maxNumberOfElements: 15,
        onSelectItemEvent: function() {
          var data = xrefTarget.getSelectedItemData();
          xrefTarget.data('element', data.element);
          xrefTarget.data('link', data.link);
        }
      }
    });
  }
}

Xrefs.makeLink=function(htmlID) {
  var xrefdict = $("[name=xrefdict]").val();
  var xrefel = $("[name=xreftarget]").data('element');
  var xrefid = $("[name=xreftarget]").data('link');
  var srcid = $("#"+htmlID+" > .tag.opening > .attributes").children("[data-name='lxnm:linkable']").data('value');
  var srcel = $("#"+htmlID).data('name');
  if (xrefel != undefined && xrefid != undefined && xrefel != "" && xrefid != "" && xrefdict != "" && srcid != undefined && srcel != undefined) {
    var srcdict = dictID;
    document.cookie = "linkPref=" + xrefdict + "; path=/" + srcdict;
    $("#"+htmlID+" > .tag.opening > .attributes")
    $.get(rootPath+dictID+"/links/add", {source_el: srcel, source_id: srcid, target_dict: xrefdict, target_el: xrefel, target_id: xrefid}, function(json){
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
