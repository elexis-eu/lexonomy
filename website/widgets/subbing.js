var Subbing={};

Subbing.change=function(){};

Subbing.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>Subentries</div>");
  $div.append("<div class='instro borderBelow'>Elements listed here function as subentries which can be shared by multiple entries.</div>");
  $div.append("<div id='elements_list'></div>");
  for(var elName in json) Subbing.addElement(elName, json[elName]);
  $div.append("<select class='halfwidth' id='elements_new'></select> <button class='iconAdd' onclick='Subbing.newElement()'>Add</button>");
  for(var elName in xema.elements){
    $("#elements_new").append("<option value='"+elName+"'>"+elName+"</option>");
  }
};

Subbing.addElement=function(elName, details){
  details=details||{};
  var html="<div class='subelement' data-elname='"+elName+"'>";
  html+="<button class='iconOnly iconCross floatRight' onclick='Subbing.removeElement(\""+elName+"\")'>&nbsp;</button>";
  html+="<div class='elName'><span class='tech'><span class='brak'>&lt;</span><span class='elm'>"+elName+"</span><span class='brak'>&gt;</span></span></div>";
  html+="<div class='settings'>";
  html+="<span class='opener closed' onclick='Subbing.toggleSettings(\""+elName+"\")'>Settings...</span>";
  html+="<div class='inside' style='display: none'>";
  html+="TBD";
  // html+="<label><input type='checkbox' class='canEdit' "+(details.canEdit?"checked='checked'":"")+" onchange='Users.change()'/> Edit</label>";
  // html+="<label><input type='checkbox' class='canConfig' "+(details.canConfig?"checked='checked'":"")+" onchange='Users.change()'/> Configure</label>";
  // html+="<label><input type='checkbox' class='canDownload' "+(details.canDownload?"checked='checked'":"")+" onchange='Users.change()'/> Download</label>";
  // html+="<label><input type='checkbox' class='canUpload' "+(details.canUpload?"checked='checked'":"")+" onchange='Users.change()'/> Upload</label>";
  html+="</div>";
  html+="</div>";
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

Subbing.toggleSettings=function(elName){
  var $el=$("#elements_list .subelement[data-elname='"+elName+"']");
  if($el.find(".settings .inside:visible").length==0){
    $el.find(".settings .inside").slideDown("fast");
    $el.find(".settings .opener").removeClass("closed").addClass("opened");
  } else {
    $el.find(".settings .inside").slideUp("fast");
    $el.find(".settings .opener").removeClass("opened").addClass("closed");
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
