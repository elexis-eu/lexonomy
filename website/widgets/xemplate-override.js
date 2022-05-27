window.XemplateOverride={};
XemplateOverride.change=function(){};

XemplateOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  var code=json._xsl;
  var $block=$("<div class='block theXSL'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemplateOverride.exampleXsl()'>example</a> XSL</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theXSL textarea").val()!=$div.find(".block.theXSL textarea").data("origval")) XemplateOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var code=json._css;
  var $block=$("<div class='block theCSS'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemplateOverride.exampleCss()'>example</a> CSS</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theCSS textarea").val()!=$div.find(".block.theCSS textarea").data("origval")) XemplateOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");
};

XemplateOverride.exampleXsl=function(){
  $(".pillarform .block.theXSL textarea").val(
`<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="entry">
    <div class='myEntry'><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="headword">
    <span class='myHeadword'><xsl:apply-templates/></span>
  </xsl:template>
</xsl:stylesheet>`
  );
};
XemplateOverride.exampleCss=function(){
  $(".pillarform .block.theCSS textarea").val(
`div.myEntry {font-family: serif; font-size: 1.25em}
div.myEntry span.myHeadword {font-weight: bold}`
  );
};

XemplateOverride.harvest=function(div){
  var ret={};
  ret._xsl=$(".pillarform .block.theXSL textarea").val();
  ret._css=$(".pillarform .block.theCSS textarea").val();
  return ret;
};
