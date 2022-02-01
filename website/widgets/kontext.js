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
      url: "/" + dictID + "/kontext/corpora",
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
  return ret;
};
