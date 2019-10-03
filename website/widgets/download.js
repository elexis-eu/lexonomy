var Download={};

Download.change=function(){};

Download.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Download.change();
};

Download.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>Download xslt script</div>");
  $div.append("<textarea class='textbox' id='download_xslt' spellcheck='false'></textarea>");
  $div.find("#download_xslt").val(json.xslt).data("origval", json.xslt).on("change keyup", Download.ifchange);
  $div.append("<div class='instro'>If input is not a valid xslt, no transform is applied.</div>");
};

Download.harvest=function(div){
  var $div=$(div);
  var ret={};
  var xslt = $div.find("#download_xslt").val();

  try {
    parsed_xslt = $.parseXML(xslt);
    ret.xslt = xslt;
  }
  catch(e) {
    ret.xslt = "Failed to parse xslt";
  }

  return ret;
};
