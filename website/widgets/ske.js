var Ske={};
Ske.htmID="";

Ske.settings={
  headwordElement: "",
  examples: {containerElement: "", textElement: "", markupElement: ""}
};
Ske.makeSettings=function(){
  for(var elName in rollo){
    if(rollo[elName].headword && !Ske.settings.headwordElement) Ske.settings.headwordElement=elName;
    if(rollo[elName].exampleContainer && !Ske.settings.examples.containerElement) Ske.settings.examples.containerElement=elName;
    if(rollo[elName].exampleText && !Ske.settings.examples.textElement) Ske.settings.examples.textElement=elName;
    if(rollo[elName].exampleHeadwordMarkup && !Ske.settings.examples.markupElement) Ske.settings.examples.markupElement=elName;
  }
}

Ske.extendDocspec=function(docspec, xema){
  if(kex.url && kex.corpus && kex.username && kex.apikey) {
    for(var parName in xema.elements){
      if(xema.elements[parName].children){
        canHaveExamples=false;
        for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
          if(xema.elements[parName].children[iChild].name==xampl.container){
            canHaveExamples=true; break;
          }
        }
        if(canHaveExamples){
          if(docspec.elements[parName]){
            if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
            docspec.elements[parName].menu.push({
              icon: rootPath+"furniture/ske.png",
              caption: "Find examples...",
              action: Ske.menuExamples,
            });
          }
        }
      }
    }
  }
};

Ske.getHeadword=function(){
  var $xml=$($.parseXML(Xonomy.harvest()));
  var hwd=$xml.find(titling.headword).html();
  if(!hwd) hwd="";
  return hwd;
};

Ske.menuExamples=function(htmlID, param){
  Ske.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Ske.boxExamples())); //create bubble
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Ske.getHeadword()) {
    Ske.searchExamples();
  } else {
    $(".skebox .waiter").hide();
  }
};

Ske.boxExamples=function(){
  var html="";
  html="<div class='skebox'>"
    html+="<form class='topbar' onsubmit='Ske.searchExamples(); return false'>";
  		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
      html+="<input type='submit' class='button ske' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='insert' onclick='Ske.insertExamples()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};

Ske.toggleExample=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};

Ske.searchExamples=function(){
  $(".skebox .choices").hide();
  $(".skebox .bottombar").hide();
  $(".skebox .waiter").show();
  var lemma=$.trim($(".skebox .textbox").val());
  if(lemma!="") {
    $.get(rootPath+dictID+"/skeget/", {url: kex.url, corpus: kex.corpus, username: kex.username, apikey: kex.apikey, lemma: lemma}, function(json){
        $(".skebox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".skebox .choices").html("<div class='error'>No results found.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }
        else if(json.Lines) {
          for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
            var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
            var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
            var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
            var txt=left+"<b>"+kwic+"</b>"+right;
            txt=txt.replace("<b> ", " <b>");
            txt=txt.replace(" </b>", "</b> ");
            $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleExample(this)'/><span class='inside'>"+txt+"</span></label>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
            $(".skebox .bottombar").show();
          }
        } else {
          $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }
    });
  }
};

Ske.insertExamples=function(){
  $(".skebox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var txt=$label.find("span.inside").html();
      if(xampl.markup) {
        txt=txt.replace("<b>", "<"+xampl.markup+">");
        txt=txt.replace("</b>", "</"+xampl.markup+">");
      } else {
        txt=txt.replace("<b>", "");
        txt=txt.replace("</b>", "");
      }
      var xml=xampl.template.replace("$text", txt);
      Xonomy.newElementChild(Ske.htmlID, xml);
    }
  });
};
