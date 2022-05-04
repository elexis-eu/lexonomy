window.Editing={};

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
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_nerd' value='nerd' "+(json.xonomyMode=="nerd"?"checked='checked'":"")+"/> Nerd mode<label>");
  $div.append("<label><input type='radio' name='editing_xonomyMode' id='editing_xonomyMode_laic' value='laic' "+(json.xonomyMode=="laic"?"checked='checked'":"")+"/> Laic mode<label>");
  if(json.xonomyMode=="nerd") $div.append("<div class='instro'>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.</div><div class='instro'><img src='../../../docs/mode-nerd.png' alt='Illustration'/></div>");
  else if(json.xonomyMode=="laic") $div.append("<div class='instro'>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.</div><div class='instro'><img src='../../../docs/mode-laic.png' alt='Illustration'/>");
  $div.append("<div class='instro seeabove'><span class='seeabove'></span> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</div>");

  $div.append("<br>")

  $div.append("<div class='instro'>Choose the default text editor for node values.</div>");
  $div.append("<label><input type='radio' name='editing_xonomyTextEditor' value='askString' "    +(json.xonomyTextEditor=="askString"    ?"checked='checked'":"")+"/> Single line<label>");
  $div.append("<label><input type='radio' name='editing_xonomyTextEditor' value='askLongString' "+(json.xonomyTextEditor=="askLongString"?"checked='checked'":"")+"/> Multi line<label>");

  if (json.xonomyTextEditor=="askString")          $div.append("<div class='instro'>When editing text in <b>single line mode</b> the user sees a smaller editor.</div><div class='instro'><img src='../../../docs/text-editor-askstring.png' alt='Illustration'/></div>");
  else if (json.xonomyTextEditor=="askLongString") $div.append("<div class='instro'>When editing text in <b>multi line mode</b> the user sees a full-fledged text editor.</div><div class='instro'><img src='../../../docs/text-editor-asklongstring.png' alt='Illustration'/></div>");

  $div.find("input").on("change", Editing.wrapChange);
};

Editing.harvest=function(div){
  var $div=$(div);
  return {
    xonomyMode:       $div.find("input[name='editing_xonomyMode']:checked").val()       || "nerd",
    xonomyTextEditor: $div.find("input[name='editing_xonomyTextEditor']:checked").val() || "askString"
  }
};
