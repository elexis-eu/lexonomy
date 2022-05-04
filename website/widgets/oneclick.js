window.Oneclick={};

Oneclick.change=function(){};

Oneclick.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>");
  Oneclick.renderKey(json.apikey);
};
Oneclick.renderKey=function(apikey){
  var $div=$("div#pagebody div.pillarform").html("");
  $div.append("<div class='title'>One-Click Dictionary API key</div>");
  $div.append("<div class='instro'>This key allows external tools such as Sketch Engine to create a dictionary in your account and to populate it with pre-generated entries.</div>");
  if(!apikey){
    $div.append("<div class='apibuttons'><button class='iconAdd' onclick='Oneclick.newKey()'>Generate API key</button></div>");
  } else {
    $div.append("<div class='apikey'>"+apikey+"</div>");
    $div.append("<div class='apibuttons'><button class='iconReload' onclick='Oneclick.newKey()'>Regenerate API key</button> <button class='iconCross' onclick='Oneclick.noKey()'>Remove API key</button></div>");
  }
};

Oneclick.newKey=function(){
  var key=Oneclick.generateKey();
  Oneclick.renderKey(key);
  Oneclick.change();
};
Oneclick.noKey=function(){
  Oneclick.renderKey("");
  Oneclick.change();
};

Oneclick.harvest=function(div){
  var apikey=$("#pagebody div.pillarform div.apikey").html();
  if(!apikey) apikey="";
  var ret={apikey: apikey};
  return ret;
};

Oneclick.generateKey=function(){
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key="";
  while(key.length<32) {
    var i=Math.floor(Math.random() * alphabet.length);
    key+=alphabet[i]
  }
  return key;
};
