Xrefs={};

Xrefs.extendDocspec=function(docspec, xema) {
  if (Object.keys(linking).length) {
    for(var parName in xema.elements) {
      if (linking[parName] != undefined) {
        console.log(parName)
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
    if (userdicts[dict]["id"] != dictID) {
      html += "<option value='"+userdicts[dict]["id"]+"'>"+userdicts[dict]["title"]+"</option>";
    }
  }
  html += "</select>";
  html += " target: ";
  html += "<select name='xreftarget'>";
  html += "</select>";
  html += "<button onclick='Xrefs.makeLink(\""+htmlID+"\")'>Link</button>";
  html += "</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  Xrefs.refreshLinks();
}

Xrefs.refreshLinks=function() {
  var xrefdict = $("[name=xrefdict]").val();
  $("[name=xreftarget]").empty();
  if (xrefdict != "") {
    $.get(rootPath+xrefdict+"/linkablelist.json", function(json){
      for (var link in json.linkables) {
        $("[name=xreftarget]").append(new Option(json.linkables[link]["element"]+": "+json.linkables[link]["link"], json.linkables[link]["element"]+":/:"+json.linkables[link]["link"]));
      }
    });
  }
}

Xrefs.makeLink=function(htmlID) {
  var xrefdict = $("[name=xrefdict]").val();
  var xrefval = $("[name=xreftarget]").val();
  var srcid = $("#"+htmlID+" > .tag.opening > .attributes").children("[data-name='lxnm:linkable']").data('value');
  var srcel = $("#"+htmlID).data('name');
  if (xrefval != "" && xrefdict != "" && srcid != undefined && srcel != undefined) {
    var xrefar = xrefval.split(":/:")
    var xrefel = xrefar[0];
    var xrefid = xrefar[1];
    var srcdict = dictID;
    $("#"+htmlID+" > .tag.opening > .attributes")
    $.get(rootPath+dictID+"/links/add", {source_el: srcel, source_id: srcid, target_dict: xrefdict, target_el: xrefel, target_id: xrefid}, function(json){
      console.log(json);
    });
  }
  Xonomy.destroyBubble();
}
