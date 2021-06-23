var Gapi={};

Gapi.change=function(){};
Gapi.settings={}
Gapi.ifchange=function(event){};

Gapi.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>Google Custom Search API key</div>");
  $div.append("<input class='textbox' id='Gapi_key'/>");
  $div.find("#Gapi_key").val(json.apikey);
  $div.append("<div class='instro'>Insert your Google Custom Search API key to allow multimedia search.</div>");
  $div.append("<div class='title'>Custom Search ID</div>");
  $div.append("<input class='textbox' id='Gapi_cx'/>");
  $div.find("#Gapi_cx").val(json.cx);
  $div.append("<div class='instro'>Insert ID of your Custom Search - see <a href='https://developers.google.com/custom-search/v1/introduction'>documentation</a>.</div>");
};

Gapi.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.apikey=$.trim( $div.find("#Gapi_key").val() ) || "";
  ret.cx=$.trim( $div.find("#Gapi_cx").val() ) || "";
  return ret;
};
