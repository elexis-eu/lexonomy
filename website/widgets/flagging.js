var Flagging={};
Flagging.change=function(){};

Flagging.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  var elements=Xematron.listElements(xema);

  var $block=$("<div class='block flag_element'></div>").appendTo($div);
	$block.append("<div class='title'>Flag element</div>");
  $block.append("<select></select>");
  $block.find("select").append("<option value=''>(not set)</option>");
  for(var i=0; i<elements.length; i++){
    $block.find("select").append("<option "+(json.flag_element==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
  }
  $block.find("select").on("change", function(e){Flagging.change();});
  $block.append("<div class='instro'>Select the element which the flags should be put into.</div>");

  var $block=$("<div class='block flags'></div>").appendTo($div);
	$block.append("<div class='title'>Flags</div>");
	$block.append("<textarea class='textbox flags_desc' spellcheck='false'></textarea>");
	$block.find("textarea.flags_desc").val(Flagging.flags2txt(json.flags));
  $block.find("textarea.flags_desc").on("keyup change", function(e){
    if($block.find("textarea.flags_desc").val()!=Flagging.flags2txt(json.flags)) Flagging.change();
  });
  $block.append("<div class='instro'>Specify flags to be used, each line should have the form of a single character hotkey, followed by the flag name, flag label and background CSS color, all comma separated. E.g. '1,bad,Bad entry,SpringGreen'.</div>");
};
Flagging.harvest=function(div){
  var ret={};
  ret.flag_element=$(".pillarform .block.flag_element select").val();
  ret.flags=Flagging.txt2flags($(".pillarform .block.flags textarea").val());
  return ret;
};

Flagging.flags2txt=function(flags){
	flags=flags || [];
	var ret="";
	for(var x=0; x<flags.length; x++){
    ret+=flags[x]["key"] + "," + flags[x]["name"] + "," + flags[x]["label"] + "," + flags[x]["color"] + "\n";
	}
	return ret;
};
Flagging.txt2flags=function(txt){
	var flags=[];
	var rows=txt.split('\n');
	for(var x=0; x<rows.length; x++){
    if (rows[x].length==0)
      continue;
		var columns=rows[x].split(',');
    flags.push({key: columns[0], name: columns[1], label: columns[2], color: columns[3]})
	}
	return flags;
};
