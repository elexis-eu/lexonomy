var Sub={};

Sub.extendDocspec=function(docspec, xema){
  for(var elName in xema.elements){
    if(elName=="exampleContainer" || elName=="entry") {
      docspec.elements[elName].caption=function(jsMe){
  			var cap="";
  			var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
  			var parents=jsMe.getChildElements("lxnm:subentryParent");
  			if(id) cap+="SUBENTRY ("+parents.length+") ▼";
  			if(cap) cap="<span class='lexonomySubentryCaption "+(parents.length>1?"moreThanOne":"")+"' onclick='Xonomy.notclick=true; Sub.menuSubentry(\""+jsMe.htmlID+"\")'>"+cap+"</span>";
  			return cap;
  		};
    }
  }
};

Sub.menuSubentry=function(htmlID){
  var jsMe=Xonomy.harvestElement($("#"+htmlID)[0]);
  var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
  var title=jsMe.getAttributeValue("lxnm:subentryTitle", id);
  var parents=jsMe.getChildElements("lxnm:subentryParent");
  var html="<div class='subinfobox'>";
  if(jsMe.parent() || $("#"+htmlID).closest(".xonomy .layby").length>0){
    html+="<div class='topline'>";
      html+="SUBENTRY";
    html+="</div>";
    html+="<div class='entrylines'>";
      html+="<div class='entryline' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>";
        html+=title;
      html+="</div>";
    html+="</div>";
  }
  html+="<div class='topline'>";
    html+=""+(parents.length>1?"SHARED BY":"EMBEDDED IN")+" "+parents.length+" "+(parents.length==1?"ENTRY":"ENTRIES")+"";
  html+="</div>";
  if(parents.length>0) {
    html+="<div class='entrylines'>";
    parents.map(function(parent){
      var parentID=parent.getAttributeValue("id", 0);
      var parentTitle=parent.getAttributeValue("title", parentID);
      var parentCount= parent.getAttributeValue("count", 0);
      html+="<div class='entryline' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+parentID+")'>";
      if(parentCount>1) html+="<span class='count'>&nbsp;("+parentCount+")</span>";
        html+=parentTitle;
      html+="</div>";
    });
    html+="</div>";
  }
  html+="</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
};

// Ske.getHeadword=function(){
//   var $xml=$($.parseXML(Xonomy.harvest()));
//   var hwd=$xml.find(titling.headword).html();
//   if(!hwd) hwd="";
//   return hwd;
// };
//
// Ske.menuExamples=function(htmlID, param){
//   Ske.htmlID=htmlID;
//   document.body.appendChild(Xonomy.makeBubble(Ske.boxExamples())); //create bubble
//   if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
//   else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
//   else Xonomy.showBubble($("#"+htmlID));
//   if(Ske.getHeadword()) {
//     Ske.searchExamples();
//   } else {
//     $(".skebox .waiter").hide();
//   }
// };
//
// Ske.boxExamples=function(){
//   var html="";
//   html="<div class='skebox'>"
//     html+="<form class='topbar' onsubmit='Ske.searchExamples(); return false'>";
//   		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
//       html+="<input type='submit' class='button ske' value='&nbsp;'/>";
//     html+="</form>";
//     html+="<div class='waiter'></div>";
//     html+="<div class='choices' style='display: none'></div>";
//     html+="<div class='bottombar' style='display: none;'>";
//       html+="<button class='insert' onclick='Ske.insertExamples()'>Insert</button>";
//     html+="</div>";
//   html+="</div>";
//   return html;
// };
//
// Ske.toggleExample=function(inp){
//   if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
// };
//
// Ske.searchExamples=function(){
//   $(".skebox .choices").hide();
//   $(".skebox .bottombar").hide();
//   $(".skebox .waiter").show();
//   var lemma=$.trim($(".skebox .textbox").val());
//   if(lemma!="") {
//     $.get(rootPath+dictID+"/skeget/", {url: kex.url, corpus: kex.corpus, username: kex.username, apikey: kex.apikey, lemma: lemma}, function(json){
//         $(".skebox .choices").html("");
//         if(json.error && json.error=="Empty result"){
//           $(".skebox .choices").html("<div class='error'>No results found.</div>");
//           $(".skebox .waiter").hide();
//           $(".skebox .choices").fadeIn();
//         }
//         else if(json.Lines) {
//           for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
//             var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
//             var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
//             var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
//             var txt=left+"<b>"+kwic+"</b>"+right;
//             txt=txt.replace("<b> ", " <b>");
//             txt=txt.replace(" </b>", "</b> ");
//             $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleExample(this)'/><span class='inside'>"+txt+"</span></label>");
//             $(".skebox .waiter").hide();
//             $(".skebox .choices").fadeIn();
//             $(".skebox .bottombar").show();
//           }
//         } else {
//           $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
//           $(".skebox .waiter").hide();
//           $(".skebox .choices").fadeIn();
//         }
//     });
//   }
// };
//
// Ske.insertExamples=function(){
//   $(".skebox div.choices label").each(function(){
//     var $label=$(this);
//     if($label.hasClass("selected")){
//       var txt=$label.find("span.inside").html();
//       if(xampl.markup) {
//         txt=txt.replace("<b>", "<"+xampl.markup+">");
//         txt=txt.replace("</b>", "</"+xampl.markup+">");
//       } else {
//         txt=txt.replace("<b>", "");
//         txt=txt.replace("</b>", "");
//       }
//       var xml=xampl.template.replace("$text", txt);
//       Xonomy.newElementChild(Ske.htmlID, xml);
//     }
//   });
// };
