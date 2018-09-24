var Flagging={};
Flagging.change=function(){};

function initColorPicker(elem, c) {
  elem.ColorPicker({
    color: c,
    onShow: function (colpkr) {
      $(colpkr).fadeIn(500);
      return false;
    },
    onHide: function (colpkr) {
      $(colpkr).fadeOut(500);
      return false;
    },
    onSubmit: function(hsb, hex, rgb, el) {
      $(el).val(hex);
      $(el).ColorPickerHide();
    },
    onChange: function (hsb, hex, rgb) {
      $(elem).css('backgroundColor', '#' + hex);
      $(elem).val(hex);
    }
 })
}

function addRow (table, data) {
  if (!data)
    data = {key: "", name: "", label: "", color: ""}
  var $new_row =$("<tr><td><input type='text' size='1' value='" + data["key"] + "'></td>\
                       <td><input type='text' value='" + data["name"] + "'></td>\
                       <td><input type='text' value='" + data["label"] + "'></td>\
                       <td><input type='text' size='9' value='" + data["color"] + "'></td>\
                       <td><button class='iconOnly iconCross'>&nbsp;</button></td>\
                  </tr>").appendTo(table);
  $color = $new_row.find("input:last")
  initColorPicker($color, data["color"]);
  $color.css('background-color', data["color"]);
  $("button.iconCross", $new_row[0]).on("click", function(e) {
    $(e.target).parents("tr").remove();
    Flagging.change();
  })
  $("input").on("change", Flagging.change);
}

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
  $block.append("<table></table");
  var $table = $block.find("table");
  $table.append("<tr><th>Keyboard shortcut</th><th>Value</th><th>Label</th><th>Color</th><th></th></tr>")
  if (json.flags.length == 0)
    addRow ($table)
  else {
    for(var x=0; x<json.flags.length; x++)
      addRow($table, json.flags[x]);
  }
  $block.append("<button class='iconAdd'>Add...</button>");
  $("button.iconAdd").on("click", function() {
    addRow($table)
  })
  $block.append("<div class='instro'>Specify flags to be used when a keyboard shortcut is pressed in the entry list. The respective value will be put into the entry flag element accordingly.</div>");
};
Flagging.harvest=function(div){
  var ret={};
  ret.flag_element=$(".pillarform .block.flag_element select").val();
  ret.flags = []
  $(".pillarform .block.flags table tr").each(function (i, row) {
    var $inputs = $(row).find("input");
    if ($inputs.length > 0)
      ret.flags.push({key: $($inputs[0]).val(), name: $($inputs[1]).val(), label: $($inputs[2]).val(), color: $($inputs[3]).val()})
  })
  return ret;
};
