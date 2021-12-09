var Subbing={};

Subbing.change=function(){};

Subbing.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div i18n class='title'>Subentries</div>");
  $div.append("<div i18n class='instro borderBelow'>Elements listed here function as subentries which can be shared by multiple entries.</div>");
  $div.append("<div id='elements_list'></div>");
  for(var elName in json) Subbing.addElement(elName, json[elName]);
  $div.append(
    "<select class='halfwidth' id='elements_new'></select> <button class='iconAdd' onclick='Subbing.newElement()' i18n>Add</button>"
  );
  for(var elName in xema.elements){
    $("#elements_new").append("<option value='"+elName+"'>"+elName+"</option>");
  }
};

Subbing.addElement=function(elName, details){
  details=details||{};
  var html="<div class='subelement' data-elname='"+elName+"'>";
  html+="<button class='iconOnly iconCross floatRight' onclick='Subbing.removeElement(\""+elName+"\")'>&nbsp;</button>";
  html+="<div class='elName'><span class='tech'><span class='brak'>&lt;</span><span class='elm'>"+elName+"</span><span class='brak'>&gt;</span></span></div>";
  html+="</div>";
  $("#elements_list").append(html);
};
Subbing.removeElement=function(elName){
  $("#elements_list .subelement[data-elname='"+elName+"']").remove();
  Subbing.change();
};
Subbing.newElement=function(){
  var elName=$.trim( $("#elements_new").val() );
  if($("#elements_list .subelement[data-elname='"+elName+"']").length==0){
    Subbing.addElement(elName);
    Subbing.change();
  }
};

Subbing.harvestElement=function(elName){
  var $element=$("#elements_list .subelement[data-elname='"+elName+"']");
  var ret={};
  // ret.canEdit=$user.find("input.canEdit").prop("checked");
  // ret.canConfig=$user.find("input.canConfig").prop("checked");
  // ret.canDownload=$user.find("input.canDownload").prop("checked");
  // ret.canUpload=$user.find("input.canUpload").prop("checked");
  return ret;
}

Subbing.harvest=function(div){
  var ret={};
  var $div=$("#elements_list .subelement").each(function(index, item){
    var elName=$(item).attr("data-elname");
    ret[elName]=Subbing.harvestElement(elName);
  });
  return ret;
};
