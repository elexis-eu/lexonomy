var Publico={};

Publico.wrapChange=function(){
    Publico.change();
    var div=$("#pagebody").parent();
    var obj=Publico.harvest(div);
    div.html("");
    Publico.render(div, obj);
};
Publico.change=function(){};

Publico.cleanup=function(json){
  if(json.public===undefined) json.public=false;
  if(!json.licence || !siteconfig.licences[json.licence]) for(var lic in siteconfig.licences){ json.licence=lic; break; }
}

Publico.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  Publico.cleanup(json);

  if(json.public=="true") json.public=true; else if(json.public=="false") json.public=false;
  $div.append("<div class='title'>Access level</div>");
  $div.append("<label><input type='radio' name='publico_public' id='publico_public_0' "+(!json.public?"checked='checked'":"")+"/> Private<label>");
  $div.append("<label><input type='radio' name='publico_public' id='publico_public_1' "+(json.public?"checked='checked'":"")+"/> Public<label>");
  $div.find("input").on("change", Publico.wrapChange);
  if(!json.public) $div.append("<div class='instro'><b>Private</b> means that the dictionary is not publicly viewable.</div>");
  else if(json.public) $div.append("<div class='instro'><b>Public</b> means that the dictionary is publicly viewable.</div>");

  if(json.public) {
    $div.append("<div class='title'>Licence</div>");
    $div.append("<select id='publico_licence'></select>");
    for(var licID in siteconfig.licences) $div.find("select").append("<option value='"+licID+"'>"+siteconfig.licences[licID].title+"</option>");
    $div.find("select").val(json.licence).on("change", Publico.wrapChange);
    if(siteconfig.licences[json.licence] && siteconfig.licences[json.licence].url) {
      $div.append("<div class='instro'>More information about this licence: <a href='"+siteconfig.licences[json.licence].url+"' target='_blank'>"+siteconfig.licences[json.licence].url+"</a></div>");
    }
  }
};

Publico.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.public=false; if($div.find("#publico_public_1").prop("checked")) ret.public=true;
  ret.licence=$div.find("#publico_licence").val();
  return ret;
};
