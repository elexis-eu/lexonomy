var EditingOverride={};
 EditingOverride.change=function(){};

 EditingOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  var code=json._js;
  var $block=$("<div class='block theJS'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleJs()'>example</a> JavaScript</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theJS textarea").val()!=$div.find(".block.theJS textarea").data("origval"))  EditingOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var code=json._css;
  var $block=$("<div class='block theCSS'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleCss()'>example</a> CSS</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theCSS textarea").val()!=$div.find(".block.theCSS textarea").data("origval"))  EditingOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");
};

 EditingOverride.exampleJs=function(){
  $(".pillarform .block.theJS textarea").val(
`{
  editor: function(div, entry, uneditable){
    //div = the div into which you should render the editor
    //entry.id = the entry ID (a number, eg. 123), or zero if new entry
    //entry.content = the entry's XML source code, eg. "<entry></headword>hello</headword></entry>"
    //uneditable = true if we want the entry to be uneditable (read-only)
    $(div).html("<div class='myEditor'>HEADWORD: <input class='headword' "+(uneditable?"disabled":"")+"/></div>");
    $(div).find("input.headword").val($($.parseXML(entry.content)).find("headword").html());
  },
  harvester: function(div){
    //div = the div from which you should harvest the contents of the editor
    var headword=$(div).find("input.headword").val();
    return "<entry><headword>"+headword+"</headword></entry>";
  }
}`
  );
};
 EditingOverride.exampleCss=function(){
  $(".pillarform .block.theCSS textarea").val(
`div.myEditor {padding: 20px; font-size: 1.25em}
div.myEditor input {font-weight: bold}`
  );
};

 EditingOverride.harvest=function(div){
  var ret={};
  ret._js=$(".pillarform .block.theJS textarea").val();
  ret._css=$(".pillarform .block.theCSS textarea").val();
  return ret;
};
