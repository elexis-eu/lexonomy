window.Download={};

Download.change=function(){};

Download.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Download.change();
};

Download.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>XSLT transformation on download</div>");
  $div.append("<textarea class='textbox' id='download_xslt' spellcheck='false'></textarea>");
  $div.find("#download_xslt").val(json.xslt).data("origval", json.xslt).on("change keyup", Download.ifchange);
  $div.append("<div class='instro'>You can use this functionality to automatically apply an XSLT transformation when the dictionary is downloaded. If you do not input valid XSLT here, no transformation will be applied.</div>");
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
