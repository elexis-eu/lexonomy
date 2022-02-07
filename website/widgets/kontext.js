var Kontext={};

Kontext.change=function(){};

Kontext.settings={
  defaultURL: "https://www.clarin.si/kontext/"
}

Kontext.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Kontext.change();
};

Kontext.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>KonText URL</div>");
  $div.append("<input class='textbox' id='kontext_url'/>");
  if (json.url == "" || json.url == undefined) {
    json.url = Kontext.settings.defaultURL;
  }
  $div.find("#kontext_url").val(json.url).data("origval", json.url).on("change keyup", Kontext.ifchange);
  $div.append("<div class='instro'>The URL of the KonText installation where external links should point. Defaults to <code>https://www.clarin.si/kontext/</code>. </div>");

  $div.append("<div class='title'>Corpus name</div>");
    $div.append("<input class='textbox' id='kontext_corpus' value='Retrieving available corpora from KonText, please wait...' disabled/>");
    var corpus_input = $("#kontext_corpus");
    corpus_input.data("corpname", json.corpus);
    $.get({
      url: "/" + dictId + "/kontext/corpora",
    }).done(function(res) {
        Kontext.corpora = res.corpus_list;
        corpus_input.easyAutocomplete({
          theme: "blue-light",
          data: Kontext.corpora,
          getValue: "name",
          list: {
            maxNumberOfElements: 20,
            match: {
              enabled: true,
              method : function(element, phrase) {
                return element.indexOf(phrase) !== -1;
              }
            },
            onSelectItemEvent: function() {
              var new_corpus = corpus_input.getSelectedItemData().corpus_id;
              if (json.corpus != new_corpus) {
                corpus_input.data("corpus_id", new_corpus)
                Kontext.change()
              }
            }
          },
          placeholder: "Type to search in the list of corpora",
          template: {
            type: "custom",
            method: function(value, item) {
              return item.name + " (" + item.desc + "; " + item.size_info + ")";
            }
          }
        })
        corpus_input.prop("disabled", false)
        if (json.corpus) {
          var corpus = res.corpus_list.find(function(el) {return el.corpus_id == json.corpus});
          if (corpus) {
            corpus_input.val(corpus.name);
            $("<div class='instro'>Currently selected corpus: " + corpus.name + "</div>").insertAfter($("#kontext_corpus").parent());
          } else {
            corpus_input.val("Your current corpus is no longer available, please select a new one.");
          }
        } else {
          corpus_input.val("");
        }
      })
    $div.append("<div class='instro'>Select a KonText corpus from the list of corpora available to you.</div>");

  $div.append("<div class='title'>Concordance query</div>");
  $div.append("<input class='textbox' id='kontext_concquery'/>");
  $div.find("#kontext_concquery").val(json.concquery).data("origval", json.concquery).on("change keyup", Kontext.ifchange);
  $div.append("<div class='instro'>The CQL query that will be used to obtain concordance from KonText. You can use placeholders for elements in the form of '%(element)', e.g. '[lemma=\"%(headword)\"]'. If left empty the 'simple' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</div>");

  if (!json.searchElements) {
    json.searchElements = [];
  }
  $div.append("<div class='title'>Additional search elements</div>");
  $div.append("<div class='scrollbox'>");
  var $scrollbox = $div.find(".scrollbox");
  var elements=Xematron.listElements(xema);
  for(var i=0; i<elements.length; i++){
    var available = ["txt","lst"].indexOf(xema.elements[elements[i]].filling) != -1;
    $scrollbox.append("<div><label class='radio' data-name='"+elements[i]+"'>\
          <input type='checkbox' data-name='"+elements[i]+"' "+(json.searchElements.indexOf(elements[i])>-1?"checked":"")+ " " + (available?"":"disabled") + "/> \
          "+elements[i]+"</label></div>");
  }
  $scrollbox.find("label").on("click", Kontext.change);
  $scrollbox.parent().append("<div class='instro'>You can select any textual elements here whose content you would like to search for in KonText. A menu will be displayed next to all these elements like for the root entry element.</div>");

  var $block=$("<div class='block container'></div>").appendTo($div);
	$block.append("<div class='title'>Example container</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.container==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Kontext.containerChanged();});
  $block.append("<div class='instro'>Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</div>");

  var $block=$("<div class='block template'></div>").appendTo($div);
	$block.append("<div class='title'>XML template</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(json.template).data("origval", json.template).on("change keyup", function(e){
    Kontext.validateTemplate();
  });
  $block.append("<div class='instro'>This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <code>$text</code> is.</div>");
  $block.append("<div class='error' style='display: none;'></div>");
  Kontext.validateTemplate();

  var $block=$("<div class='block markup'></div>").appendTo($div);
	$block.append("<div class='title'>Headword mark-up</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(none)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.markup==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.append("<div class='instro'>Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</div>");

};

Kontext.containerChanged=function(){
  var container=$(".pillarform .block.container select").val();
  var template=$.trim($(".pillarform .block.template textarea").val());
  if(!template && container) {
    $(".pillarform .block.template textarea").val(Kontext.composeTemplate(container));
  } else {
    try{
      var xml=$.parseXML(template);
    }catch(ex){}
    if(container && (xml.documentElement.localName!=container)){
      $(".pillarform .block.template textarea").val(Kontext.composeTemplate(container));
    }
  }
  Kontext.validateTemplate();
};

Kontext.validateTemplate=function(){
  var container=$(".pillarform .block.container select").val();
  var template=$.trim($(".pillarform .block.template textarea").val());
  if(container && template) {
    try{
      var xml=$.parseXML(template);
      $(".pillarform .block.template .error").hide();
      if(container && xml.documentElement.localName!=container) {
          $(".pillarform .block.template .error").html("The top-level element should be <code>"+container+"</code>.").show();
      } else {
        if(!/\$text/.test(template)) {
          $(".pillarform .block.template .error").html("The <code>$text</code> symbol is missing.").show();
        }
      }
    }catch(ex){
      $(".pillarform .block.template .error").html("The XML is invalid.").show();
    }
  }
};

Kontext.composeTemplate=function(topElement){
  var xml=$.parseXML(Xematron.initialElement(xema, topElement));
  var els=xml.getElementsByTagName("*");
  for(var i=0; i<els.length; i++){
    var el=els[i];
    if(xema.elements[el.localName].filling=="txt" || xema.elements[el.localName].filling=="inl") {
      el.innerHTML="$text";
      break;
    }
  }
  return xml.documentElement.outerHTML;
};

Kontext.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.url=$.trim( $div.find("#kontext_url").val() ) || Kontext.settings.defaultURL;
  ret.corpus=$("#kontext_corpus").data("corpus_id") || ""
  ret.concquery=$.trim( $div.find("#kontext_concquery").val() );
  ret.searchElements=[];
  $(".pillarform .scrollbox label input").each(function(){
    var $input=$(this);
    if($input.prop("checked")) ret.searchElements.push($input.attr("data-name"));
  });
  ret.container=$(".pillarform .block.container select").val();
  ret.template=$(".pillarform .block.template textarea").val();
  ret.markup=$(".pillarform .block.markup select").val();  
  return ret;
};

Kontext.extendDocspec=function(docspec, xema){
  if(kontext.corpus) {
    if(!subbing[xema.root]) {
      var elSpec=docspec.elements[xema.root];
      var incaption=elSpec.caption;
      elSpec.caption=function(jsMe){
        var cap="";
        cap="<span class='lexonomyKontextCaption' onclick='Xonomy.notclick=true; Kontext.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
        if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
        if(typeof(incaption)=="string") cap=incaption+cap;
        return cap;
      };
    }
  }
};

Kontext.menuRoot=function(htmlID, additional=false){
  var html="<div class='menu'>";
  if (!additional) {
    if(kontext.container) {
      html+="<div class='menuItem' onclick='Kontext.menuExamples(\""+htmlID+"\", \"layby\")'>";
        html+="<span class='icon'><img src='../../../furniture/kontext.png'/></span> ";
        html+="Find examples <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+kontext.container+"</span><span class='punc'>&gt;</span></span>";
      html+="</div>";
    }
  }
  if (additional) {
    var headword = encodeURIComponent(Kontext.getSearchword(htmlID));
  } else {
    var headword = encodeURIComponent(Kontext.getHeadword());
  }
  if(headword) {
    html+="<div class='menuItem')'>";
        html+="<a target='kontext' href='/"+dictId+"/kontext/conc?lemma="+headword+"&redir=1'>";
        html+="<span class='icon'><img src='../../../furniture/kontext.png'/></span> ";
        html+="Show concordance";
      html+="</a>";
    html+="</div>";
  }
  html+="</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
};
Kontext.getHeadword=function(){
  var $xml=$($.parseXML(Xonomy.harvest()));
  var hwd=$xml.find(titling.headword).html();
  if(!hwd) hwd="";
  return hwd;
};
Kontext.getSearchword=function(elementID){
  return Xonomy.harvestElement(document.getElementById(elementID)).getText();
};
Kontext.menuExamples=function(htmlID, param){
  if(param=="layby") Kontext.htmlID=null; else  Kontext.htmlID=htmlID;
  document.body.appendChild(Xonomy.makeBubble(Kontext.boxExamples())); //create bubble
  $("input[name=kontextsearchtype]").on("click", function() {
    var val = $(this).val() == "kontextsimple"
    $("#kontextsimple").nextAll("input").first().prop("disabled", !val)
    $("#kontextcql").nextAll("input").first().prop("disabled", val)
  })
  if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
  else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#"+htmlID));
  if(Kontext.getHeadword()) {
    Kontext.searchExamples();
  } else {
    $(".kontextbox .waiter").hide();
  }
};
Kontext.boxExamples=function(){
  var html="";
  html="<div class='kontextbox'>"
    html+="<form class='topbar' onsubmit='Kontext.searchExamples(); return false'>";
      if (kontext.concquery.length > 0) {
        html+="<input id='kontextsimple' type='radio' name='kontextsearchtype' value='kontextsimple'/>";
        html+="<label for='kontextsimple'>Simple search: </label>";
        html+="<input disabled name='val' class='textbox simple' value='"+Kontext.getHeadword()+"'/> ";
        html+="<input id='kontextcql' type='radio' name='kontextsearchtype' checked value='kontextcql'/>";
        html+="<label for='kontextcql'>CQL: </label>";
        html+="<input name='val' class='textbox cql focusme' value='"+Kontext.getCQL(kontext.concquery)+"'/> ";
      } else {
        html+="<input id='kontextsimple' type='radio' name='kontextsearchtype' checked value='kontextsimple'/>";
        html+="<label for='kontextsimple'>Simple search: </label>";
        html+="<input name='val' class='textbox simple focusme' value='"+Kontext.getHeadword()+"'/> ";
        html+="<input id='kontextcql' type='radio' name='kontextsearchtype' value='kontextcql'/>";
        html+="<label for='kontextcql'>CQL: </label>";
        html+="<input name='val' class='textbox cql' disabled/> ";
      }
      html+="<input type='submit' class='button kontext' value='&nbsp;'/>";
    html+="</form>";
    html+="<div class='waiter'></div>";
    html+="<div class='choices' style='display: none'></div>";
    html+="<div class='bottombar' style='display: none;'>";
      html+="<button class='prevnext' id='butKontextNext'>More »</button>";
      html+="<button class='prevnext' id='butKontextPrev'>«</button>";
      html+="<button class='insert' onclick='Kontext.insertExamples()'>Insert</button>";
    html+="</div>";
  html+="</div>";
  return html;
};
Kontext.toggleExample=function(inp){
  if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};
Kontext.searchExamples=function(fromp){
  $("#butKontextPrev").hide();
  $("#butKontextNext").hide();
  $(".kontextbox .choices").hide();
  $(".kontextbox .bottombar").hide();
  $(".kontextbox .waiter").show();
  var query=$.trim($(".kontextbox input.textbox:enabled").val());
  var querytype=$("input[name=kontextsearchtype]:checked").val();
  if(query!="") {
    $.get("/"+dictId+"/kontext/conc/", {querytype: querytype, query: query, fromp: fromp}, function(json){
        $(".kontextbox .choices").html("");
        if(json.error && json.error=="Empty result"){
          $(".kontextbox .choices").html("<div class='error'>No results found.</div>");
          $(".kontextbox .waiter").hide();
          $(".kontextbox .choices").fadeIn();
        }
        else if(json.Lines) {
          if(json.pagination.prevPage) $("#butKontextPrev").show().on("click", function(){ Kontext.searchExamples(json.pagination.prevPage); $("div.kontextbox button.prevnext").off("click"); });
          if(json.pagination.nextPage) $("#butKontextNext").show().on("click", function(){ Kontext.searchExamples(json.pagination.nextPage); $("div.kontextbox button.prevnext").off("click"); });
          for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
            var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
            var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
            var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
            var txt=left+"<b>"+kwic+"</b>"+right;
            txt=txt.replace("<b> ", " <b>");
            txt=txt.replace(" </b>", "</b> ");
            $(".kontextbox .choices").append("<label><input type='checkbox' onchange='Kontext.toggleExample(this)'/><span class='inside'>"+txt+"</span></label>");
            $(".kontextbox .waiter").hide();
            $(".kontextbox .choices").fadeIn();
            $(".kontextbox .bottombar").show();
          }
        } else {
          $(".kontextbox .choices").html("<div class='error'>There has been an error getting data from KonText.</div>");
          $(".kontextbox .waiter").hide();
          $(".kontextbox .choices").fadeIn();
        }
    });
  }
};
Kontext.getCQL=function(cql){
  var $xml=$($.parseXML(Xonomy.harvest()));
  var ret = cql.replace(/%\([^)]+\)/g, function (el) {
    return $xml.find(el.substring(2, el.length - 1)).html();
  })
  return ret;
};

Kontext.insertExamples=function(){
  $(".kontextbox div.choices label").each(function(){
    var $label=$(this);
    if($label.hasClass("selected")){
      var txt=$label.find("span.inside").html();
      if(kontext.markup) {
        txt=txt.replace("<b>", "<"+kontext.markup+">");
        txt=txt.replace("</b>", "</"+kontext.markup+">");
      } else {
        txt=txt.replace("<b>", "");
        txt=txt.replace("</b>", "");
      }
      var xml=kontext.template.replace("$text", txt);
      if(Kontext.htmlID) Xonomy.newElementChild(Kontext.htmlID, xml); else Xonomy.newElementLayby(xml);
    }
  });
};
