var XemaOverride={};
XemaOverride.change=function(){};

XemaOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  var $block=$("<div class='block schemaType'></div>").appendTo($div);
	$block.append("<div class='title'>Schema type</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option "+(json.xonomyDocSpec ? "selected='selected'" : "")+" value='xonomyDocSpec'>Xonomy document specification</option>");
  $block.find("select").on("change", function(e){XemaOverride.change();});
  $block.append("<div class='instro'>Bla bla...</div>");

  var code=json.xonomyDocSpec;
  var $block=$("<div class='block theSchema'></div>").appendTo($div);
	$block.append("<div class='title'>Document specification</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theSchema textarea").val()!=$div.find(".block.template textarea").data("origval")) XemaOverride.change();
  });
  $block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var $block=$("<div class='block newXml'></div>").appendTo($div);
	$block.append("<div class='title'>Template for new entries</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(json.newXml).data("origval", json.newXml).on("change keyup", function(e){
    if($div.find(".block.theSchema textarea").val()!=$div.find(".block.template textarea").data("origval")) XemaOverride.change();
  });
  $block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");
};
XemaOverride.harvest=function(div){
  var ret={};
  ret.root="school";
  ret.elements={"school": {}, "teachers": {}};
  ret.xonomyDocSpec=$(".pillarform .block.theSchema textarea").val();
  ret.newXml=$(".pillarform .block.newXml textarea").val();
  console.log(ret);
  return ret;
};
