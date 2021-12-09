var Users={};

Users.change=function(){};

Users.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div i18n class='title'>Users</div>");
  $div.append("<div id='users_list'></div>");
  for(var email in json) Users.addUser(email, json[email]);
  $div.append("<input class='textbox halfwidth' id='users_new'/> <button class='iconAdd' onclick='Users.newUser()' i18n>Add</button>");
  $("#users_new").on("keyup", function(event){ if(event.type=="keyup" && event.which==13) Users.newUser(); });
};

Users.addUser=function(email, details){
  details=details||{};
  var html="<div class='user' data-email='"+email+"'>";
  html+="<button class='iconOnly iconCross floatRight' onclick='Users.removeUser(\""+email+"\")'>&nbsp;</button>";
  html+="<div class='email'>"+email+"</div>";
  html+="<div class='rights'>";
  html+="<label><input type='checkbox' class='canEdit' "+(details.canEdit?"checked='checked'":"")+" onchange='Users.change()'/> <span i18n>Edit</span></label>";
  html+="<label><input type='checkbox' class='canConfig' "+(details.canConfig?"checked='checked'":"")+" onchange='Users.change()'/> <span i18n>Configure</span></label>";
  html+="<label><input type='checkbox' class='canDownload' "+(details.canDownload?"checked='checked'":"")+" onchange='Users.change()'/> <span i18n>Download</span></label>";
  html+="<label><input type='checkbox' class='canUpload' "+(details.canUpload?"checked='checked'":"")+" onchange='Users.change()'/> <span i18n>Upload</span></label>";
  html+="</div>";
  html+="</div>";
  $("#users_list").append(html);
};
Users.removeUser=function(email){
  $("#users_list .user[data-email='"+email+"']").remove();
  Users.change();
};
Users.newUser=function(){
  var email=$.trim( $("#users_new").val() );
  if(email!="" && /^[^\@]+\@[^\@]+\.[^\@]+[^\.]$/.test(email)) {
    Users.addUser(email);
    $("#users_new").val("");
    Users.change();
  }
};
Users.harvestUser=function(email){
  var $user=$("#users_list .user[data-email='"+email+"']");
  var ret={};
  ret.canEdit=$user.find("input.canEdit").prop("checked");
  ret.canConfig=$user.find("input.canConfig").prop("checked");
  ret.canDownload=$user.find("input.canDownload").prop("checked");
  ret.canUpload=$user.find("input.canUpload").prop("checked");
  return ret;
}

Users.harvest=function(div){
  var ret={};
  var $div=$("#users_list .user").each(function(index, item){
    var email=$(item).attr("data-email");
    ret[email]=Users.harvestUser(email);
  });
  return ret;
};
