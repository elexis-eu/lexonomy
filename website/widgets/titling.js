var Titling={};
Titling.change=function(){};

Titling.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  var elements=Xematron.listElements(xema);

  var $block=$("<div class='block headword'></div>").appendTo($div);
	$block.append("<div class='title'>Headword</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.headword==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Titling.headwordChanged(); Titling.change();});
  $block.append("<div class='instro'>Select the element which contains the entry's headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is.</div>");

  var $block=$("<div class='block headwordSorting'></div>").appendTo($div);
  $block.append("<div class='title'>Headword sorting</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.headwordSorting==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Titling.headwordChanged(); Titling.change();});
  $block.append("<div class='instro'>Select the element which will be used for sorting of headwords in the entry list. If you make no selection here Lexonomy will use the element you chose for headword.</div>");

  var $block=$("<div class='block headwordAnnotations'></div>").appendTo($div);
	$block.append("<div class='title'>Headword annotations</div>");
  $block.append("<div class='scrollbox'><div>");
  if(!json.headwordAnnotations) json.headwordAnnotations=[];
  for(var i=0; i<elements.length; i++){
    $block.find(".scrollbox").append("<div><label class='radio' data-name='"+elements[i]+"'><input type='checkbox' data-name='"+elements[i]+"' "+(json.headwordAnnotations.indexOf(elements[i])>-1?"checked":"")+"/> "+elements[i]+"</label></div>");
  }
  $block.append("<div class='instro'>You can select any elements here whose content you want displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</div>");
  $block.find("input").on("change", Titling.change);
  Titling.headwordChanged();

  var $block=$("<div class='block abc'></div>").appendTo($div);
	$block.append("<div class='title'>Alphabetical order</div>");
	$block.append("<textarea class='textbox abc' spellcheck='false'></textarea>");
	$block.find("textarea.abc").val(Titling.abc2txt(json.abc));
  $block.find("textarea.abc").on("keyup change", function(e){
    if($block.find("textarea.abc").val()!=Titling.abc2txt(json.abc)) Titling.change();
  });
  $block.append("<div class='instro'>This order is used to sort entries alphabetically in the entry list.</div>");
};
Titling.harvest=function(div){
  var ret={};
  ret.headword=$(".pillarform .block.headword select").val();
  ret.headwordSorting=$(".pillarform .block.headwordSorting select").val();
  ret.headwordAnnotations=[];
  $(".pillarform .block.headwordAnnotations .scrollbox label input").each(function(){
    var $input=$(this);
    if($input.prop("checked")) ret.headwordAnnotations.push($input.attr("data-name"));
  });
  ret.abc=Titling.txt2abc($(".pillarform .block.abc textarea").val());
  return ret;
};

Titling.abc2txt=function(abc){
	abc=abc || [];
	var ret="";
	for(var x=0; x<abc.length; x++){
		var line="";
		for(var y=0; y<abc[x].length; y++){ if(line!="") line+=" "; line+=abc[x][y]; }
		if(line!="") ret+=line+"\n";
	}
	return ret;
};
Titling.txt2abc=function(txt){
	var abc=[];
	var rows=txt.split('\n');
	for(var x=0; x<rows.length; x++){
		var line=[];
		var columns=rows[x].split(' ');
		for(var y=0; y<columns.length; y++){
			var char=$.trim(columns[y]);
			if(char!="") line.push(char);
		}
		if(line.length>0) abc.push(line);
	}
	return abc;
};

Titling.headwordChanged=function(){
  var headword=$(".pillarform .block.headword select").val();
  $(".pillarform .block.headwordAnnotations .scrollbox label").each(function(){
    var $label=$(this);
    $label.removeClass("readonly");
    $label.find("input").prop("disabled", false);
    if($label.attr("data-name")==headword){
      $label.addClass("readonly");
      $label.find("input").prop("checked", false).prop("disabled", true);
    }
  });
};
