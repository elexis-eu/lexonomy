var Links={};
Links.change=function(){};

Links.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>Manual linking between entries</div>");
  $div.append("<div class='instro borderBelow'>Elements listed here can be used as target of cross-reference link. For each element, specify unique identifier in the form of placeholders '%(element)'. Eg. element <tt>entry</tt> can have identifier <tt>%(lemma)-%(pos)</tt>, element <tt>sense</tt> can have identifier <tt>%(number)</tt>.</div>");
  $div.append("<div id='elements_list'></div>");
  for(var elName in json) Links.addElement(elName, json[elName]);
  $div.append("<select class='halfwidth' id='elements_new'></select> <button class='iconAdd' onclick='Links.newElement()'>Add</button>");
  for(var elName in xema.elements){
    $("#elements_new").append("<option value='"+elName+"'>"+elName+"</option>");
  }
};
Links.harvest=function(div){
  var ret={};
  var $div=$("#elements_list .linkelement").each(function(index, item){
    var elName=$(item).attr("data-elname");
    ret[elName]={'linkElement': elName, 'identifier': $(item).find('input[name=ident]').val()}
  });

  return ret;
};

Links.addElement=function(elName, details){
console.log(details)
  details=details||{'identifier':''};
  var html="<div class='linkelement' data-elname='"+elName+"'>";
  html+="<button class='iconOnly iconCross floatRight' onclick='Links.removeElement(\""+elName+"\")'>&nbsp;</button>";
  html+="<div class='elName'><span class='tech'><span class='brak'>&lt;</span><span class='elm'>"+elName+"</span><span class='brak'>&gt;</span></span>";
  html+="<span class='ident'><input type='text' name='ident' value='"+details.identifier+"'/></span>";
  html+="</div>";
  html+="</div>";
  $("#elements_list").append(html);
};
Links.removeElement=function(elName){
  $("#elements_list .linkelement[data-elname='"+elName+"']").remove();
  Links.change();
};

Links.newElement=function(){
  var elName=$.trim( $("#elements_new").val() );
  if($("#elements_list .linkelement[data-elname='"+elName+"']").length==0){
    Links.addElement(elName);
    Links.change();
  }
};

