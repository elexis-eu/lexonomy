var Kex={};

Kex.change=function(){};

Kex.settings={
  defaultURL: "https://app.sketchengine.eu/",
  defaultAPIURL: "https://api.sketchengine.eu/bonito/run.cgi"
}

Kex.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Kex.change();
};

Kex.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div i18n class='title'>Sketch Engine URL</div>");
  $div.append("<input class='textbox' id='kex_url'/>");
  $div.find("#kex_url").val(json.url).data("origval", json.url).on("change keyup", Kex.ifchange);
  $div.append("<div i18n class='instro'>The URL of the Sketch Engine installation where external links should point. Defaults to <code>https://app.sketchengine.eu</code>. Do not change this unless you are using a local installation of Sketch Engine.</div>");

  $div.append("<div i18n class='title'>Sketch Engine API URL</div>");
  $div.append("<input class='textbox' id='kex_apiurl'/>");
  $div.find("#kex_apiurl").val(json.apiurl).data("origval", json.apiurl).on("change keyup", Kex.ifchange);
  $div.append("<div i18n class='instro'>The path to the <code>run.cgi</code> API script in Sketch Engine. Defaults to <code>https://api.sketchengine.eu/bonito/run.cgi</code>. Do not change this unless you are using a local installation of Sketch Engine.</div>");

  $div.append("<div i18n class='title'>Corpus name</div>");
  if (ske_username && ske_apiKey) {
    $div.append("<input class='textbox' id='kex_corpus' value='Retrieving available corpora from Sketch Engine, please wait...' disabled/>");
    var corpus_input = $("#kex_corpus");
    corpus_input.data("corpname", json.corpus);
    $.get({
      url: "/skeget/corpora",
    }).done(function(res) {
        Kex.corpora = {"user": [], "shared": [], "featured": [], "preloaded": []}
        res.data.forEach(function(e) {
          if (e.is_shared)
            Kex.corpora.shared.push(e)
          else if (e.owner_id)
            Kex.corpora.user.push(e)
          else if (e.is_featured)
            Kex.corpora.featured.push(e)
          else
            Kex.corpora.preloaded.push(e)
        })
        corpus_input.easyAutocomplete({
          theme: "blue-light",
          data: Kex.corpora,
          getValue: "name",
          categories: [
            {listLocation: "user", header: "<strong>Your own corpora</strong>", maxNumberOfElements: 20},
            {listLocation: "shared", header: "<strong>Corpora shared with you</strong>", maxNumberOfElements: 20},
            {listLocation: "featured", header: "<strong>Featured preloaded corpora</strong>", maxNumberOfElements: 20},
            {listLocation: "preloaded", header: "<strong>Other preloaded corpora</strong>", maxNumberOfElements: 20},
          ],
          list: {
            maxNumberOfElements: 20,
            match: {
              enabled: true,
              method : function(element, phrase) {
                return element.indexOf(phrase) !== -1;
              }
            },
            onSelectItemEvent: function() {
              var new_corpus = corpus_input.getSelectedItemData().corpname
              if (json.corpus != new_corpus) {
                corpus_input.data("corpname", new_corpus)
                Kex.change()
              }
            }
          },
          placeholder: "Type to search in the list of corpora",
          template: {
            type: "custom",
            method: function(value, item) {
              var size = ""
              if (item.sizes) {
                size = ", " + (item.sizes.tokencount / 1000000).toFixed(2) + "M tokens";
              }
              return item.name + " (" + item.language_name + size + ") <a style='display: inline; text-decoration: none' href='" + $.trim($("#kex_url").val()) + "#dashboard?corp_info=1&corpname=" + encodeURIComponent(item.corpname) + "' target='ske'>ℹ️</a>";
            }
          }
        })
        corpus_input.prop("disabled", false)
        if (json.corpus) {
          var corpus = res.data.find(function(el) {return el.corpname == json.corpus});
          if (corpus) {
            corpus_input.val(corpus.name);
            $("<div i18n class='instro'>Currently selected corpus: " + corpus.name + ", show <a style='display: inline; text-decoration: none' href='" + $.trim($("#kex_url").val()) + "#dashboard?corp_info=1&corpname=" + corpus.corpname + "' target='ske'>detailed corpus info ℹ️</a></div>").insertAfter($("#kex_corpus").parent());
          } else {
            corpus_input.val("Your current corpus is no longer available, please select a new one.");
          }
        } else {
          corpus_input.val("");
        }
      })
    $div.append("<div i18n class='instro'>Select a Sketch Engine corpus from the list of corpora available to you.</div>");
  } else
    $div.append("<span i18nh>Please setup your Sketch Engine account in your <a href='/userprofile'>profile</a> settings to be able to select a corpus.</span>")

  $div.append("<div i18n class='title'>Concordance query</div>");
  $div.append("<input class='textbox' id='kex_concquery'/>");
  $div.find("#kex_concquery").val(json.concquery).data("origval", json.concquery).on("change keyup", Kex.ifchange);
  $div.append("<div i18n class='instro'>The CQL query that will be used to obtain concordance from Sketch Engine. You can use placeholders for elements in the form of '%(element)', e.g. '[lemma=\"%(headword)\"]'. If left empty the 'simple' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</div>");
  $div.append("<input type='number' min='0' placeholder='0' class='textbox' style='width: auto' id='kex_concsampling'/>");
  $div.find("#kex_concsampling").val(json.concsampling).data("origval", json.concsampling).on("change keyup", Kex.ifchange);
  $div.append("<div i18n class='instro'>Whether to apply automatic sampling of the concordance. Any non-zero value means to automatically create a random sample of that size.</div>");

  if (!json.searchElements) {
    json.searchElements = [];
  }
  $div.append("<div i18n class='title'>Additional search elements</div>");
  $div.append("<div class='scrollbox'>");
  var $scrollbox = $div.find(".scrollbox");
  var elements=Xematron.listElements(xema);
  for(var i=0; i<elements.length; i++){
    var available = ["txt","lst"].indexOf(xema.elements[elements[i]].filling) != -1;
    $scrollbox.append("<div><label class='radio' data-name='"+elements[i]+"'>\
          <input type='checkbox' data-name='"+elements[i]+"' "+(json.searchElements.indexOf(elements[i])>-1?"checked":"")+ " " + (available?"":"disabled") + "/> \
          "+elements[i]+"</label></div>");
  }
  $scrollbox.find("label").on("click", Kex.change);
  $scrollbox.parent().append("<div i18n class='instro'>You can select any textual elements here whose content you would like to search for in Sketch Engine. A menu will be displayed next to all these elements like for the root entry element.</div>");
};

Kex.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.url=$.trim( $div.find("#kex_url").val() ) || Kex.settings.defaultURL;
  ret.apiurl=$.trim( $div.find("#kex_apiurl").val() ) || Kex.settings.defaultAPIURL;
  ret.corpus=$("#kex_corpus").data("corpname") || ""
  ret.concquery=$.trim( $div.find("#kex_concquery").val() );
  ret.concsampling=$.trim( Math.max(0, $div.find("#kex_concsampling").val()));
  ret.searchElements=[];
  $(".pillarform .scrollbox label input").each(function(){
    var $input=$(this);
    if($input.prop("checked")) ret.searchElements.push($input.attr("data-name"));
  });
  return ret;
};
