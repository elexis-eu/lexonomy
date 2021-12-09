var Searchability={};
Searchability.change=function(){};

Searchability.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  var elements=Xematron.listElements(xema);

  var $block=$("<div class='block searchableElements'></div>").appendTo($div);
	$block.append("<div i18n class='title'>Searchable elements</div>");
  $block.append("<div class='scrollbox long'><div>");
  if(!json.searchableElements) json.searchableElements=[];
  for(var i=0; i<elements.length; i++){
    $block.find(".scrollbox").append("<div><label class='radio' data-name='"+elements[i]+"'><input type='checkbox' data-name='"+elements[i]+"' "+(json.searchableElements.indexOf(elements[i])>-1?"checked":"")+"/> "+elements[i]+"</label></div>");
  }
  $block.append("<div i18n class='instro'>The contents of elements you select here will be searchable (in addition to each entry's headword).</div>");
  $block.find("input").on("change", Searchability.change);

  $(".pillarform .block.searchableElements .scrollbox label").each(function(){
    var $label=$(this);
    if($label.attr("data-name")==titling.headword){
      $label.addClass("readonly");
      $label.find("input").prop("checked", true).prop("disabled", true);
    }
  });
};
Searchability.harvest=function(div){
  var ret={};
  ret.searchableElements=[];
  $(".pillarform .block.searchableElements .scrollbox label input").each(function(){
    var $input=$(this);
    if($input.prop("checked") && !$input.prop("disabled")) ret.searchableElements.push($input.attr("data-name"));
  });
  return ret;
};
