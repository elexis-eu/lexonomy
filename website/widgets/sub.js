var Sub={};
Sub.htmID="";

Sub.extendDocspec=function(docspec, xema){
  //add background colour and captions to elements that can be subentries:
  for(var elName in xema.elements){
    if(subbing[elName]) {
      docspec.elements[elName].backgroundColour=function(jsMe){
        var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
        var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p)});
  			if(id && parents.length>0) {
          return "#e6e6e6";
        }
        return "";
      };
      var incaption=docspec.elements[elName].caption;
      docspec.elements[elName].caption=function(jsMe){
  			var cap="";
  			var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
  			var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p)});
  			if(id && parents.length>0) {
          cap+=+parents.length+" ▼";
  			  cap="<span class='lexonomySubentryCaption' onclick='Xonomy.notclick=true; Sub.menuSubentry(\""+jsMe.htmlID+"\")'>"+cap+"</span>";
        }
        if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
        if(typeof(incaption)=="string") cap=incaption+cap;
  			return cap;
  		};
    }
  }
  //add menu items to parents that can have subentry children:
  for(var parName in xema.elements){
    for(var elName in subbing){
      if(xema.elements[parName].children){
        canHaveSubs=false;
        for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
          if(xema.elements[parName].children[iChild].name==elName){
            canHaveSubs=true; break;
          }
        }
        if(canHaveSubs){
          if(docspec.elements[parName]){
            if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
            docspec.elements[parName].menu.push({
              icon: "/furniture/favicon.png",
              caption: "Find subentries <"+elName+">",
              action: Sub.menuSubentries,
              actionParameter: {elName: elName},
            });
          }
        }
      }
    }
  }
};

Sub.menuSubentry=function(htmlID){
  var jsMe=Xonomy.harvestElement($("#"+htmlID)[0]);
  var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
  var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p)});
  var html="<div class='subinfobox'>";
  if(jsMe.parent() || $("#"+htmlID).closest(".xonomy .layby").length>0){
    if(parents.length==0) html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is not shared with any other entry.</div>";
    else if(parents.length==1) html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is shared with one other entry.</div>";
    else html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is shared with "+parents.length+" other entries.</div>";
  } else {
    if(parents.length==0) html+="<div class='topline'>This subentry is not embedded in any entries.</div>";
    else if(parents.length==1) html+="<div class='topline'>This subentry is embedded in one entry.</div>";
    else html+="<div class='topline'>This subentry is shared by "+parents.length+" entries.</div>";
  }
  if(parents.length>0) {
    html+="<div class='entrylines'>";
    parents.map(function(parent){
      var parentID=parent.getAttributeValue("id", 0);
      var parentTitle=parent.getAttributeValue("title", parentID);
      html+="<div class='entryline' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+parentID+")'>"+parentTitle+"</div>";
    });
    html+="</div>";
  }
  html+="</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
};

Sub.getHeadword=function(){
  var $xml=$($.parseXML(Xonomy.harvest()));
  var hwd=$xml.find(titling.headword).html();
  if(!hwd) hwd="";
  return hwd;
};

Sub.menuSubentries=function(htmlID, param){
  Sub.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Sub.boxSubentries(param.elName))); //create bubble
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Sub.getHeadword()) {
    Sub.searchSubentries();
  } else {
    $(".subbox .waiter").hide();
  }
};

Sub.boxSubentries=function(elName){
  var html="";
  html="<div class='subbox'>"
    html+="<form class='topbar' onsubmit='Sub.searchSubentries(); return false'>";
  		html+="<input name='val' class='textbox focusme' value='"+Sub.getHeadword()+"'/> ";
  		html+="<input name='doctype' type='hidden' value='"+elName+"'/> ";
      html+="<input type='submit' class='button sub' value='&nbsp;'/>";
      html+="<button class='creator' onclick='Sub.newSubentry(\""+elName+"\"); return false;'>New</button>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='insert' onclick='Sub.insertSubentries()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};

Sub.newSubentry=function(elName){
  var xml=Xematron.initialElement(xema, elName);
  Xonomy.newElementChild(Sub.htmlID, xml);
  Xonomy.clickoff();
};

Sub.toggleSubentry=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};

Sub.searchSubentries=function(){
  $(".subbox .choices").hide();
  $(".subbox .bottombar").hide();
  $(".subbox .waiter").show();
  var lemma=$.trim($(".subbox .textbox").val());
  var doctype=$.trim($("input[name=\"doctype\"]").val());
  if(lemma!="") {
    $.get("/"+dictID+"/subget/", {lemma: lemma, doctype: doctype}, function(json){
        $(".subbox .choices").html("");
        if(!json.success){
          $(".subbox .choices").html("<div class='error'>There has been an error getting data from Lexonomy.</div>");
          $(".subbox .waiter").hide();
          $(".subbox .choices").fadeIn();
        } else if(json.total==0){
          $(".subbox .choices").html("<div class='error'>No matches found.</div>");
          $(".subbox .waiter").hide();
          $(".subbox .choices").fadeIn();
        } else {
          for(var iLine=0; iLine<json.entries.length; iLine++){ var line=json.entries[iLine];
            $(".subbox .choices").append("<label><input type='checkbox' onchange='Sub.toggleSubentry(this)'/><span class='inside'>"+line.title+"</span></label>");
            $(".subbox .choices label").last().data("xml", line.xml);
            $(".subbox .waiter").hide();
            $(".subbox .choices").fadeIn();
            $(".subbox .bottombar").show();
          }
        }
    });
  }
};

Sub.insertSubentries=function(){
  $(".subbox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var xml=$label.data("xml");
      Xonomy.newElementChild(Sub.htmlID, xml);
    }
  });
};
