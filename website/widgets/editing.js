var Editing={};

Editing.wrapChange=function(){
    Editing.change();
    var div=$("#pagebody").parent();
    var obj=Editing.harvest(div);
    div.html("");
    Editing.render(div, obj);
};
Editing.change=function(){};

Editing.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>Entry editor mode</div>");
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_nerd' "+(json.xonomyMode=="nerd"?"checked='checked'":"")+"/> Nerd mode<label>");
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_laic' "+(json.xonomyMode=="laic"?"checked='checked'":"")+"/> Laic mode<label>");
  $div.find("input").on("change", Editing.wrapChange);
  if(json.xonomyMode=="nerd") $div.append("<div class='instro'>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.</div>");
  else if(json.xonomyMode=="laic") $div.append("<div class='instro'>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.</div>");
};

Editing.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.xonomyMode="nerd"; if($div.find("#editing_xonomyMode_laic").prop("checked")) ret.xonomyMode="laic";
  return ret;
};
