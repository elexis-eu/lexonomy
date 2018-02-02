var XemaOverride={};
XemaOverride.change=function(){};

XemaOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  var $block=$("<div class='block schemaType'></div>").appendTo($div);
	$block.append("<div class='title'>Schema type</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option "+(json.xonomyDocSpec ? "selected='selected'" : "")+" value='xonomyDocSpec'>Xonomy Document Specification</option>");
  $block.find("select").on("change", function(e){XemaOverride.change();});
  $block.append("<div class='instro'>A <a href='http://www.lexiconista.com/xonomy/' target='_blank'>Xonomy Document Specification</a> is a JavaScript object which configures the Xonomy XML editor used in Lexonomy.</div>");

  var code=json._xonomyDocSpec;
  var $block=$("<div class='block theSchema'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemaOverride.exampleDocspec()'>example</a> Document specification</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theSchema textarea").val()!=$div.find(".block.theSchema textarea").data("origval")) XemaOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var code=json._newXml;
  var $block=$("<div class='block newXml'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemaOverride.exampleNewXml()'>example</a> Template for new entries</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.newXml textarea").val()!=$div.find(".block.newXml textarea").data("origval")) XemaOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");
};

XemaOverride.exampleDocspec=function(){
  $(".pillarform .block.theSchema textarea").val(
`{
  elements: {
    "entry": {},
    "headword": {hasText: true}
  }
}`
  );
};
XemaOverride.exampleNewXml=function(){
  $(".pillarform .block.newXml textarea").val(
`<entry><headword></headword></entry>`
  );
};

XemaOverride.harvest=function(div){
  var ret={};
  ret._xonomyDocSpec=$(".pillarform .block.theSchema textarea").val();
  ret._newXml=$(".pillarform .block.newXml textarea").val();

  //understand the docspec a little:
  ret.elements={};
  var Xonomy={}; eval("var docspec="+ret._xonomyDocSpec+";");
  for(var elName in docspec.elements){
    ret.elements[elName]={};
  }

  //understand what the top-level element:
  var match=ret._newXml.match(/^\<([^ \>\/]+)/);
  if(match) ret.root=match[1];
  if(!ret.elements[ret.root]) for(var elName in ret.elements) {ret.root=elName; break;}

  return ret;
};
