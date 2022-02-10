var XemaOverride={};
XemaOverride.change=function(){};

XemaOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  var $block=$("<div class='block schemaType'></div>").appendTo($div);
	$block.append("<div i18n class='title'>Schema type</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option "+(json._dtd ? "selected='selected'" : "")+" value='dtd'>DTD (Document Type Definition)</option>");
  $block.find("select").append("<option "+(json._xonomyDocSpec ? "selected='selected'" : "")+" value='xonomyDocSpec'>Xonomy Document Specification</option>");
  $block.find("select").on("change", function(e){XemaOverride.changeSchemaType(); XemaOverride.change();});
  $block.append("<div i18n class='instro xonomyDocSpec'>A <a href='http://www.lexiconista.com/xonomy/' target='_blank'>Xonomy Document Specification</a> is a JavaScript object which configures the Xonomy XML editor used in Lexonomy.</div>");
  $block.append("<div i18n class='instro dtd'><a href='https://en.wikipedia.org/wiki/Document_type_definition' target='_blank' i18n>Document Type Definitions</a><span i18n> are a popular formalism for defining the structure of XML documents.</span></div>");

  var code=json._dtd;
  var $block=$("<div class='block theDTD'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemaOverride.exampleDTD()' i18n>example</a><span i18n> Your DTD</span></div>");
  $block.append("<textarea class='textbox tall' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theSchema textarea").val()!=$div.find(".block.theSchema textarea").data("origval")) XemaOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var code=json._xonomyDocSpec;
  var $block=$("<div class='block theSchema'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemaOverride.exampleDocspec()' i18n>example</a><span i18n> Document specification</span></div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.theSchema textarea").val()!=$div.find(".block.theSchema textarea").data("origval")) XemaOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  var code=json._newXml;
  var $block=$("<div class='block newXml'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick='XemaOverride.exampleNewXml()' i18n>example</a><span i18n> Template for new entries</span></div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.find("textarea").val(code).data("origval", code).on("change keyup", function(e){
    if($div.find(".block.newXml textarea").val()!=$div.find(".block.newXml textarea").data("origval")) XemaOverride.change();
  });
  //$block.append("<div class='instro'>Bla bla...</div>");
  $block.append("<div class='error' style='display: none;'></div>");

  XemaOverride.changeSchemaType();
};

XemaOverride.exampleDTD=function(){
  $(".pillarform .block.theDTD textarea").val(
`<!ELEMENT entry (headword)>
<!ELEMENT headword (#PCDATA)>`
  );
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

XemaOverride.changeSchemaType=function(){
  var schemaType=$(".pillarform .block.schemaType select").val();
  $(".pillarform .block.schemaType .instro").hide();
  $(".pillarform .block.schemaType .instro."+schemaType).show();
  $(".pillarform .block").not(".schemaType").hide();
  if(schemaType=="xonomyDocSpec"){
    $(".pillarform .block.theSchema").show();
    $(".pillarform .block.newXml").show();
  } else if(schemaType=="dtd"){
    $(".pillarform .block.theDTD").show();
  }
};

XemaOverride.harvest=function(div){
  var ret={};
  var schemaType=$(".pillarform .block.schemaType select").val();
  if(schemaType=="xonomyDocSpec"){
    ret._xonomyDocSpec=$(".pillarform .block.theSchema textarea").val();
    ret._newXml=$(".pillarform .block.newXml textarea").val();

    //understand the docspec a little:
    ret.elements={};
    var Xonomy={}; eval("var docspec="+ret._xonomyDocSpec+";");
    for(var elName in docspec.elements){
      ret.elements[elName]={};
    }

    //understand who the top-level element is:
    var match=ret._newXml.match(/^\<([^ \>\/]+)/);
    if(match) ret.root=match[1];
    if(!ret.elements[ret.root]) for(var elName in ret.elements) {ret.root=elName; break;}
  } else if(schemaType=="dtd"){
    ret._dtd=$(".pillarform .block.theDTD textarea").val();

    //understand the DTD:
    var xmlStructure=parseDTD(ret._dtd);
    var xema=struct2Xema(xmlStructure);
    ret.root=xema.root;
    ret.elements=xema.elements;
    //console.log(ret);
  }
  return ret;
};
