var Titling={};
Titling.change=function(){};

Titling.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  var elements=Xematron.listElements(xema);

  var $block=$("<div class='block headword'></div>").appendTo($div);
	$block.append("<div i18n class='title'>Headword</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.headword==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Titling.headwordChanged(); Titling.change();});
  $block.append("<div i18n class='instro'>Select the element which contains the entry's headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is.</div>");

  var $block=$("<div class='block headwordSorting'></div>").appendTo($div);
  $block.append("<div i18n class='title'>Headword sorting</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.headwordSorting==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Titling.headwordChanged(); Titling.change();});
  $block.append("<input type='checkbox' id='sortDesc' " + (json.headwordSortDesc ? "checked" : "") + " style='margin-top: 1em'>")
  $block.append("<label for='sortDesc' i18n>Sort in descending order</label>")
  $("#sortDesc").on("change", Titling.change);
  $block.append("<div i18n class='instro'>Select the element which will be used for sorting of headwords in the entry list. If you make no selection here Lexonomy will use the element you chose for headword.</div>");

  var $block=$("<div class='block headwordAnnotations'></div>").appendTo($div);
  if(!json.headwordAnnotationsType)
    json.headwordAnnotationsType="simple";
  if(!json.headwordAnnotations)
    json.headwordAnnotations=[];
  if(!json.headwordAnnotationsAdvanced)
    json.headwordAnnotationsAdvanced="";
  $block.append("<div i18n class='title'>Headword annotations</div>");

  $block.append("<div class='half'>\
        <input type='radio' name='hwannotype' id='simple' value='simple' "+(json.headwordAnnotationsType=="simple"?"checked":"")+">\
        <label for='simple' i18n>simple</label>\
        <div class='scrollbox "+(json.headwordAnnotationsType=="simple"?"":"disabled")+"'>\
        </div></div>");
  var $scrollbox = $block.find(".scrollbox");
  for(var i=0; i<elements.length; i++){
    $scrollbox.append("<div "+(json.headwordAnnotationsType=="simple"?"":"style='display: none'")+"><label class='radio' data-name='"+elements[i]+"'>\
          <input type='checkbox' data-name='"+elements[i]+"' "+(json.headwordAnnotations.indexOf(elements[i])>-1?"checked":"")+"/> \
          "+elements[i]+"</label></div>");
  }
  $scrollbox.parent().append("<div i18n class='instro'>You can select any elements here whose content you want displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</div>");

  $block.append(" <div class='half'>\
        <input type='radio' name='hwannotype' id='advanced' value='advanced' "+(json.headwordAnnotationsType=="advanced"?"checked":"")+">\
        <label for='advanced' i18n>advanced</label>\
        <textarea class='advancedAnnotations' "+(json.headwordAnnotationsType=="advanced"?"":"disabled")+">"+json.headwordAnnotationsAdvanced+"</textarea>\
        <div i18n class='instro'>You can insert any HTML containing placeholders for elements in the form of '%(element)', e.g. '&lt;b&gt;%(headword)&lt;/b&gt;'.</div></div>");
  var $textarea = $block.find("textarea");

  $block.find("input").on("change", Titling.change);
  $block.find("input[type='radio']").on("change", function () {
    $scrollbox.toggleClass("disabled");
    $scrollbox.find("div").toggle();
    $textarea.prop('disabled', function(i, v) { return !v; });
  })
  Titling.headwordChanged();

  var $block=$("<div class='block abc'></div>").appendTo($div);
	$block.append("<div i18n class='title'>Alphabetical order</div>");
  $block.append("<input class='textbox' id='sort_locale'/>");
  var lang_input = $("#sort_locale");
  var lang_found = langs.find(element => element.code == json.locale);
  if (lang_found) {
    lang_input.val(lang_found.lang);
  }
  lang_input.data("origval", lang_input.val);

  lang_input.easyAutocomplete({
    theme: "blue-light",
    data: langs,
    placeholder: Screenful.loc("Type to search for language"),
    getValue: "lang",
    list: {
      maxNumberOfElements: 20,
      match: {
        enabled: true,
      },
      onSelectItemEvent: function() {
        if (json.locale != lang_input.val()) {
          Titling.change();
        }
      }
    },
  });
  
  $block.append("<div i18n class='instro'>Select language to sort entries alphabetically in the entry list.</div>");

  var $numberEntries=$("<div class='block abc'></div>").appendTo($div);
	$numberEntries.append("<div i18n class='title'>Number of entries to be shown in the entry list at once</div>");
	$numberEntries.append("<input type='number' id='numberEntries'></input>");
    var $inpt = $numberEntries.find("input#numberEntries");
    var $ne = json.numberEntries || 1000; // just hardcoded, at least better than before. Ideally, this would come from siteconfig.numberEntries
    $inpt.val("" + $ne);
    $inpt.on("keyup change", function(e){
        Titling.change();
    });
    $numberEntries.append("<div i18n class='instro'>If your dictionary contains large entries (large XML files), it is recommended to reduce this number for quicker loading of entry list.</div>");
};
Titling.harvest=function(div){
  var ret={};
  ret.headword=$(".pillarform .block.headword select").val();
  ret.headwordSorting=$(".pillarform .block.headwordSorting select").val();
  ret.headwordSortDesc=$("#sortDesc").prop("checked");
  ret.headwordAnnotations=[];
  ret.headwordAnnotationsType=$('[name="hwannotype"]:checked').val();
  ret.headwordAnnotationsAdvanced=$(".advancedAnnotations").val();
  ret.numberEntries=Number($("input#numberEntries").val());
  $(".pillarform .block.headwordAnnotations .scrollbox label input").each(function(){
    var $input=$(this);
    if($input.prop("checked")) ret.headwordAnnotations.push($input.attr("data-name"));
  });
  var lang_found = langs.find(element => element.lang == $.trim($("#sort_locale").val()));
  if (lang_found) {
    ret.locale = lang_found.code;
  }
  return ret;
};

Titling.headwordChanged=function(){
  var headword=$(".pillarform .block.headword select").val();
  $(".pillarform .block.headwordAnnotations .scrollbox label").each(function(){
    var $label=$(this);
    $label.removeClass("readonly");
    $label.find("input").prop("disabled", false);
    if($label.attr("data-name")==headword){
      $label.addClass("readonly");
      $label.find("input").prop("checked", false).prop("disabled", true);
    }
  });
};
