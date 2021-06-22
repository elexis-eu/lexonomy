var Gapi={};

Gapi.change=function(){};
Gapi.settings={}
Gapi.ifchange=function(event){};

Gapi.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>Google Custom Search API</div>");
  $div.append("<input class='textbox' id='Gapi_key'/>");
  $div.find("#Gapi_key").val(json.apikey);
  $div.append("<div class='instro'>Insert your Google Custom Search API to allow multimedia search.</div>");
};

Gapi.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.apikey=$.trim( $div.find("#Gapi_key").val() ) || "";
  return ret;
};
