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

  $div.append("<div class='title'>Entry editor</div>");
  $div.append("<div class='instro'>Choose what the entry editor will look like.</div>");
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_nerd' "+(json.xonomyMode=="nerd"?"checked='checked'":"")+"/> Nerd mode<label>");
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_laic' "+(json.xonomyMode=="laic"?"checked='checked'":"")+"/> Laic mode<label>");
  $div.find("input").on("change", Editing.wrapChange);
  if(json.xonomyMode=="nerd") $div.append("<div class='instro'>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.</div><div class='instro'><img src='../../../docs/mode-nerd.png' alt='Illustration'/></div>");
  else if(json.xonomyMode=="laic") $div.append("<div class='instro'>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.</div><div class='instro'><img src='../../../docs/mode-laic.png' alt='Illustration'/>");
  $div.append("<div class='instro seeabove'><span class='seeabove'></span> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</div>");
};

Editing.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.xonomyMode="nerd"; if($div.find("#editing_xonomyMode_laic").prop("checked")) ret.xonomyMode="laic";
  return ret;
};
