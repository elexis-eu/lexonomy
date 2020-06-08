var Autonumber={};
Autonumber.change=function(){};

Autonumber.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>Auto-numbering of elements</div>");
  $div.append("<div class='instro borderBelow'>If you need to number some of entry elements automatically, Lexonomy can do that for you. First, go to Entry structure and add element/attribute where you want to store the number. Eg. in element <tt>sense</tt> add attribute <tt>number</tt>. When you're ready, select element to number (eg. <tt>sense</tt>) and element/attribute to store numbering (eg. <tt>@number</tt>). Lexonomy will fill the numbers where missing.</div>");
  $div.append("Element to number: <select onchange='Autonumber.changeElem()' class='halfwidth' style='width:20%' id='elements'></select> Add numbers to: <select class='halfwidth' style='width:20%' id='children'></select> <button class='iconAdd' onclick='Autonumber.addNumbers()'>Add numbers</button>");
  for(var elName in xema.elements){
    $("#elements").append("<option value='"+elName+"'>"+elName+"</option>");
  }
};

Autonumber.changeElem=function(){
  $("#children").find('option').remove();
  var elem = $("#elements").val();
  for(var atName in xema.elements[elem]['attributes']){
    $("#children").append("<option value='@"+atName+"'>@"+atName+"</option>");
  }
  for(var child in xema.elements[elem]['children']){
    $("#children").append("<option value='"+xema.elements[elem]['children'][child].name+"'>"+xema.elements[elem]['children'][child].name+"</option>");
  }
};

Autonumber.addNumbers=function(){
  var countElem = $("#elements").val();
  var storeElem = $("#children").val();
  if (countElem != "" && storeElem != "") {
    Screenful.status(Screenful.Loc.saving, "wait"); //"saving entry..."
    $.ajax({url: Screenful.Editor.numberUrl, dataType: "json", method: "POST", data: {countElem: countElem, storeElem: storeElem}}).done(function(data){
      $("#waiter").hide();
      $("#curtain").hide();
      if(!data.success) {
        Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save entry"
      } else {
        Screenful.status(Screenful.Loc.ready);
      }
    });

  }
}
