var subbing={
  "entry": {persist: true},
  "exampleContainer": {persist: true},
};

var Sub={};

Sub.extendDocspec=function(docspec, xema){
  //add background colour and captions to elements that can be subentries:
  for(var elName in xema.elements){
    if(subbing[elName]) {
      docspec.elements[elName].backgroundColour=function(jsMe){
        var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
        if(id) return "#eeeeee";
        return "";
      };
      docspec.elements[elName].caption=function(jsMe){
  			var cap="";
  			var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
  			var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p)});
  			if(id) cap+="("+parents.length+") ▼";
  			if(cap) cap="<span class='lexonomySubentryCaption' onclick='Xonomy.notclick=true; Sub.menuSubentry(\""+jsMe.htmlID+"\")'>"+cap+"</span>";
  			return cap;
  		};
    }
  }
  //add menu items to parents that can have subentry children:

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
