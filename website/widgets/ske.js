window.Ske={};
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
Ske.getHeadword=function(){
  var $xml = $($.parseXML(Xonomy.harvest()));
  var hwd = $xml.find(titling.headword).html().replace(/(<([^>]+)>)/gi, "");
  if(!hwd) hwd = "";
  return hwd;
};
Ske.getSearchword=function(elementID){
  return Xonomy.harvestElement(document.getElementById(elementID)).getText();
};
Ske.getCQL=function(cql){
  var $xml=$($.parseXML(Xonomy.harvest()));
  var ret = cql.replace(/%\([^)]+\)/g, function (el) {
    return $xml.find(el.substring(2, el.length - 1)).html();
  })
  return ret;
};
Ske.getConcordance=function(htmlID){
  var operations = [];
  if (htmlID) { // menus for additional elements
    var simplequery = Ske.getSearchword(htmlID);
    operations.push({"name":"iquery","arg":simplequery,"active":true,"query":{"queryselector":"iqueryrow","iquery":simplequery}});
  } else if (kex.concquery.length > 0) {
    var cql = Ske.getCQL(kex.concquery);
    operations.push({"name":"cql","arg":cql,"active":true,"query":{"queryselector":"cqlrow","cql":cql}});
  } else {
    var simplequery = Ske.getHeadword();
    operations.push({"name":"iquery","arg":simplequery,"active":true,"query":{"queryselector":"iqueryrow","iquery":simplequery}});
  }
  if (kex.concsampling > 0)
    operations.push({"name":"sample","arg":kex.concsampling,"query":{"q":"r"+kex.concsampling},"active":true});
  return JSON.stringify(operations);
};
Ske.extendDocspec=function(docspec, xema){
  if(kex.corpus) {
    if(!subbing[xema.root]) {
      var elSpec=docspec.elements[xema.root];
      var incaption=elSpec.caption;
      elSpec.caption=function(jsMe){
        var cap="";
        cap="<span class='lexonomySkeCaption' onclick='Xonomy.notclick=true; Ske.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
        if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
        if(typeof(incaption)=="string") cap=incaption+cap;
        return cap;
      };
    }
  }

  if(kex.apiurl && kex.corpus && ske_username && ske_apiKey && ske_username != "" && ske_apiKey != "") {
    for(var parName in xema.elements){
      if(kex.searchElements.indexOf(parName) != -1) {
        docspec.elements[parName].caption = function(jsMe){
          var cap="";
          cap="<span class='lexonomySkeCaption' onclick='Xonomy.notclick=true; Ske.menuRoot(\""+jsMe.htmlID+"\", true)'>▼</span>";
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
          return cap;
        };
      }
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
              icon: "/furniture/ske.png",
              caption: "Find examples <"+xampl.container+">",
              action: Ske.menuExamples,
            });
          }
        }

        canHaveCollx=false;
        for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
          if(xema.elements[parName].children[iChild].name==collx.container){
            canHaveCollx=true; break;
          }
        }
        if(canHaveCollx){
          if(docspec.elements[parName]){
            if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
            docspec.elements[parName].menu.push({
              icon: "/furniture/ske.png",
              caption: "Find collocations <"+collx.container+">",
              action: Ske.menuCollx,
            });
          }
        }

        canHaveThes=false;
        for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
          if(xema.elements[parName].children[iChild].name==thes.container){
            canHaveThes=true; break;
          }
        }
        if(canHaveThes){
          if(docspec.elements[parName]){
            if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
            docspec.elements[parName].menu.push({
              icon: "/furniture/ske.png",
              caption: "Find thesaurus items <"+thes.container+">",
              action: Ske.menuThes,
            });
          }
        }

        canHaveDefo=false;
        for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
          if(xema.elements[parName].children[iChild].name==defo.container){
            canHaveDefo=true; break;
          }
        }
        if(canHaveDefo){
          if(docspec.elements[parName]){
            if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
            docspec.elements[parName].menu.push({
              icon: "/furniture/ske.png",
              caption: "Find definitions <"+defo.container+">",
              action: Ske.menuDefo,
            });
          }
        }


      }
    }
  }
};

Ske.menuRoot=function(htmlID, additional=false){
  var html="<div class='menu'>";
  if (!additional) {
    if(xampl.container) {
      html+="<div class='menuItem' onclick='Ske.menuExamples(\""+htmlID+"\", \"layby\")'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Find examples <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+xampl.container+"</span><span class='punc'>&gt;</span></span>";
      html+="</div>";
    }
    if(collx.container) {
      html+="<div class='menuItem' onclick='Ske.menuCollx(\""+htmlID+"\", \"layby\")'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Find collocations <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+collx.container+"</span><span class='punc'>&gt;</span></span>";
      html+="</div>";
    }
    if(thes.container) {
      html+="<div class='menuItem' onclick='Ske.menuThes(\""+htmlID+"\", \"layby\")'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Find thesaurus items <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+thes.container+"</span><span class='punc'>&gt;</span></span>";
      html+="</div>";
    }
    if(defo.container) {
      html+="<div class='menuItem' onclick='Ske.menuDefo(\""+htmlID+"\", \"layby\")'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Find definitions items <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+defo.container+"</span><span class='punc'>&gt;</span></span>";
      html+="</div>";
    }
  }
  if (additional) {
    var headword = encodeURIComponent(Ske.getSearchword(htmlID))
    var conc = encodeURIComponent(Ske.getConcordance(htmlID))
  } else {
    var headword = encodeURIComponent(Ske.getHeadword())
    var conc = encodeURIComponent(Ske.getConcordance())
  }
  var corpus = encodeURIComponent(kex.corpus)
  if(headword) {
    html+="<div class='menuItem')'>";
      html+="<a target='ske' href='" + kex.url + "/#wordsketch?corpname="+corpus+"&lemma="+headword+"&showresults=1'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Show word sketch";
      html+="</a>";
    html+="</div>";
    html+="<div class='menuItem')'>";
        html+="<a target='ske' href='" + kex.url + "/#concordance?corpname="+corpus+"&showresults=1&operations="+conc+"'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Show concordance";
      html+="</a>";
    html+="</div>";
    html+="<div class='menuItem')'>";
      html+="<a target='ske' href='" + kex.url + "/#thesaurus?corpname="+corpus+"&lemma="+headword+"&showresults=1'>";
        html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
        html+="Show thesaurus";
      html+="</a>";
    html+="</div>";
  }
  html+="</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
};

Ske.menuExamples=function(htmlID, param){
  if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Ske.boxExamples())); //create bubble
  $("input[name=skesearchtype]").on("click", function() {
    var val = $(this).val() == "skesimple"
    $("#skesimple").nextAll("input").first().prop("disabled", !val)
    $("#skecql").nextAll("input").first().prop("disabled", val)
  })
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
      if (kex.concquery.length > 0) {
        html+="<input id='skesimple' type='radio' name='skesearchtype' value='skesimple'/>";
        html+="<label for='skesimple'>Simple search: </label>";
        html+="<input disabled name='val' class='textbox simple' value='"+Ske.getHeadword()+"'/> ";
        html+="<input id='skecql' type='radio' name='skesearchtype' checked value='skecql'/>";
        html+="<label for='skecql'>CQL: </label>";
        html+="<input name='val' class='textbox cql focusme' value='"+Ske.getCQL(kex.concquery)+"'/> ";
      } else {
        html+="<input id='skesimple' type='radio' name='skesearchtype' checked value='skesimple'/>";
        html+="<label for='skesimple'>Simple search: </label>";
        html+="<input name='val' class='textbox simple focusme' value='"+Ske.getHeadword()+"'/> ";
        html+="<input id='skecql' type='radio' name='skesearchtype' value='skecql'/>";
        html+="<label for='skecql'>CQL: </label>";
        html+="<input name='val' class='textbox cql' disabled/> ";
      }
      html+="<input type='submit' class='button ske' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='prevnext' id='butSkeNext'>More »</button>";
      html+="<button class='prevnext' id='butSkePrev'>«</button>";
      html+="<button class='insert' onclick='Ske.insertExamples()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};
Ske.toggleExample=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};
Ske.searchExamples=function(fromp){
  $("#butSkePrev").hide();
  $("#butSkeNext").hide();
  $(".skebox .choices").hide();
  $(".skebox .bottombar").hide();
  $(".skebox .waiter").show();
  var query=$.trim($(".skebox input.textbox:enabled").val());
  var querytype=$("input[name=skesearchtype]:checked").val();
  if(query!="") {
    $.get("/"+dictId+"/skeget/xampl/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, querytype: querytype, query: query, fromp: fromp}, function(json){
        $(".skebox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".skebox .choices").html("<div class='error'>No results found.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }
        else if(json.Lines) {
          if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
          if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
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
      if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
    }
  });
};

Ske.menuThes=function(htmlID, param){
  if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Ske.boxThes())); //create bubble
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Ske.getHeadword()) {
    Ske.searchThes();
  } else {
    $(".skebox .waiter").hide();
  }
};
Ske.boxThes=function(){
  var html="";
  html="<div class='skebox'>"
    html+="<form class='topbar' onsubmit='Ske.searchThes(); return false'>";
  		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
      html+="<input type='submit' class='button ske' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='prevnext' id='butSkeNext'>More »</button>";
      html+="<button class='prevnext' id='butSkePrev'>«</button>";
      html+="<button class='insert' onclick='Ske.insertThes()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};
Ske.toggleThes=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};
Ske.searchThes=function(fromp){
  $("#butSkePrev").hide();
  $("#butSkeNext").hide();
  $(".skebox .choices").hide();
  $(".skebox .bottombar").hide();
  $(".skebox .waiter").show();
  var lemma=$.trim($(".skebox .textbox").val());
  if(lemma!="") {
    $.get("/"+dictId+"/skeget/thes/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
        $(".skebox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".skebox .choices").html("<div class='error'>No results found.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }

        // $(".skebox .choices").append(JSON.stringify(json, null, "  "));
        // $(".skebox .waiter").hide();
        // $(".skebox .choices").fadeIn();

        else if(json.Words) {
          // if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
          // if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
          for(var iLine=0; iLine<json.Words.length; iLine++){ var line=json.Words[iLine];
            var txt=line.word;
            $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleThes(this)'/><span class='inside'>"+txt+"</span></label>");
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
Ske.insertThes=function(){
  $(".skebox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var txt=$label.find("span.inside").html();
      var xml=thes.template.replace("$text", txt);
      if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
    }
  });
};

Ske.menuCollx=function(htmlID, param){
  if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Ske.boxCollx())); //create bubble
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Ske.getHeadword()) {
    Ske.searchCollx();
  } else {
    $(".skebox .waiter").hide();
  }
};
Ske.boxCollx=function(){
  var html="";
  html="<div class='skebox'>"
    html+="<form class='topbar' onsubmit='Ske.searchCollx(); return false'>";
  		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
      html+="<input type='submit' class='button ske' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='prevnext' id='butSkeNext'>More »</button>";
      html+="<button class='prevnext' id='butSkePrev'>«</button>";
      html+="<button class='insert' onclick='Ske.insertCollx()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};
Ske.toggleCollx=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};
Ske.searchCollx=function(fromp){
  $("#butSkePrev").hide();
  $("#butSkeNext").hide();
  $(".skebox .choices").hide();
  $(".skebox .bottombar").hide();
  $(".skebox .waiter").show();
  var lemma=$.trim($(".skebox .textbox").val());
  if(lemma!="") {
    $.get("/"+dictId+"/skeget/collx/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
        $(".skebox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".skebox .choices").html("<div class='error'>No results found.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }

        // $(".skebox .choices").append(JSON.stringify(json, null, "  "));
        // $(".skebox .waiter").hide();
        // $(".skebox .choices").fadeIn();

        else if(json.Items) {
          // if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
          // if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
          for(var iLine=0; iLine<json.Items.length; iLine++){ var line=json.Items[iLine];
            var txt=line.word;
            $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleCollx(this)'/><span class='inside'>"+txt+"</span></label>");
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
Ske.insertCollx=function(){
  $(".skebox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var txt=$label.find("span.inside").html();
      var xml=collx.template.replace("$text", txt);
      if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
    }
  });
};

Ske.menuDefo=function(htmlID, param){
  if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Ske.boxDefo())); //create bubble
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Ske.getHeadword()) {
    Ske.searchDefo();
  } else {
    $(".skebox .waiter").hide();
  }
};
Ske.boxDefo=function(){
  var html="";
  html="<div class='skebox'>"
    html+="<form class='topbar' onsubmit='Ske.searchDefo(); return false'>";
  		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
      html+="<input type='submit' class='button ske' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='prevnext' id='butSkeNext'>More »</button>";
      html+="<button class='prevnext' id='butSkePrev'>«</button>";
      html+="<button class='insert' onclick='Ske.insertDefo()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};
Ske.toggleDefo=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};
Ske.searchDefo=function(fromp){
  $("#butSkePrev").hide();
  $("#butSkeNext").hide();
  $(".skebox .choices").hide();
  $(".skebox .bottombar").hide();
  $(".skebox .waiter").show();
  var lemma=$.trim($(".skebox .textbox").val());
  if(lemma!="") {
    $.get("/"+dictId+"/skeget/defo/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
        $(".skebox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".skebox .choices").html("<div class='error'>No results found.</div>");
          $(".skebox .waiter").hide();
          $(".skebox .choices").fadeIn();
        }
        else if(json.Lines) {
          if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
          if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
          for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
            var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
            var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
            var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
            //var txt=left+"<b>"+kwic+"</b>"+right;
            var txt=left+kwic+right;
            // txt=txt.replace("<b> ", " <b>");
            // txt=txt.replace(" </b>", "</b> ");
            $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleDefo(this)'/><span class='inside'>"+txt+"</span></label>");
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
Ske.insertDefo=function(){
  $(".skebox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var txt=$label.find("span.inside").html();
      // if(xampl.markup) {
      //   txt=txt.replace("<b>", "<"+xampl.markup+">");
      //   txt=txt.replace("</b>", "</"+xampl.markup+">");
      // } else {
      //   txt=txt.replace("<b>", "");
      //   txt=txt.replace("</b>", "");
      // }
      var xml=defo.template.replace("$text", txt);
      if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
    }
  });
};
