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
};

Ident.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.title=$.trim( $div.find("#ident_title").val() );
  ret.blurb=$.trim( $div.find("#ident_blurb").val() );
  return ret;
};
