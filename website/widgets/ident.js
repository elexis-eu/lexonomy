var Ident={};

Ident.change=function(){};

Ident.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Ident.change();
};

Ident.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>Dictionary name</div>");
  $div.append("<input class='textbox' id='ident_title'/>");
  $div.find("#ident_title").val(json.title).data("origval", json.title).on("change keyup", Ident.ifchange);
  $div.append("<div class='instro'>A human-readable title for your dictionary, such as <i>My Esperanto Dictionary</i>.</div>");

  $div.append("<div class='title'>Dictionary description</div>");
  $div.append("<textarea class='textbox' id='ident_blurb' spellcheck='false'></textarea>");
  $div.find("#ident_blurb").val(json.blurb).data("origval", json.blurb).on("change keyup", Ident.ifchange);
  $div.append("<div class='instro'>This will appear on your dictionary's home page. You can leave it blank if you prefer.<br/>You can use <a href='https://daringfireball.net/projects/markdown/' target='_blank'>Markdown</a> here.</div>");

  $div.append("<div class='title'>Main language</div>");
  $div.append("<input class='textbox' id='ident_lang'/>");
  var lang_input = $("#ident_lang");
  var lang_found = langs.find(element => element.code == json.lang);
  if (lang_found) {
    lang_input.val(lang_found.lang);
  } else {
    lang_input.val(json.lang);
  }
  lang_input.data("origval", lang_input.val).on("change keyup", Ident.ifchange);
  lang_input.easyAutocomplete({
    theme: "blue-light",
    data: langs,
    placeholder: "Type to search for language, or write your custom info",
    getValue: "lang",
    list: {
      match: {
        enabled: true,
      },
    },
  });

  $div.append("<div class='instro'>Language of dictionary entries, used to sort dictionaries on your home page. You can select language from the list, or write down your own.</div>");

  $div.append("<div class='title'>Metadata from CLARIN repository</div>");
  $div.append("<input class='textbox' id='ident_handle'/>");
  $div.find("#ident_handle").val(json.handle);
  $div.append("<div class='instro'>Link to metadata recorded in CLARIN repository, provide URL to 'handle' link, eg. <tt>http://hdl.handle.net/api/handles/11356/1094</tt>.</div>");
};

Ident.harvest=function(div){
  var $div = $(div);
  var ret = {};
  ret.title = $.trim( $div.find("#ident_title").val() );
  ret.blurb = $.trim( $div.find("#ident_blurb").val() );
  var lang_found = langs.find(element => element.lang == $.trim($div.find("#ident_lang").val()));
  if (lang_found) {
    ret.lang = lang_found.code;
  } else {
    ret.lang = $.trim($div.find("#ident_lang").val());
  }
  ret.handle = $.trim( $div.find("#ident_handle").val() );
  return ret;
};
