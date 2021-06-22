var Gmedia = {};
Gmedia.extendDocspec=function(docspec, xema) {
  console.log(gapi)
  if (gapi.apikey && gapi.cx) {
      var elSpec=docspec.elements[xema.root];
      var incaption=elSpec.caption;
      elSpec.caption=function(jsMe){
        var cap="";
        cap="<span class='lexonomyGmediaCaption' onclick='Xonomy.notclick=true; Gmedia.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
        if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
        if(typeof(incaption)=="string") cap=incaption+cap;
        return cap;
      };
  }
};

Gmedia.menuRoot=function(htmlID) {
  var html="<div class='menu'>";
  html+="</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag

};
