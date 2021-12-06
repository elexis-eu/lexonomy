var Subbing={};

Subbing.change=function(){};

Subbing.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='title'>Subentries</div>");
  $div.append("<div class='instro borderBelow'>Elements listed here function as subentries which can be shared by multiple entries.</div>");
  $div.append("<div id='elements_list' class='clearfix'></div>");
  for(var elName in json) Subbing.addElement(elName, json[elName]);
  $div.append("<select class='halfwidth' id='elements_new'></select> <button class='iconAdd' onclick='Subbing.newElement()'>Add</button>");
  for(var elName in xema.elements){
    $("#elements_new").append("<option value='"+elName+"'>"+elName+"</option>");
  }
};

// we need some way to render the confirmed element
// a pair of: render that checks whether already exists
// and delete that just deletes whatever we already had

Subbing.removeAttribute = function(elName, attName) {
  $(`[data-elname="${elName}"] [data-attribute="${attName}"]`).remove();
}

Subbing.addAttribute = function(elName, attName, attValue) {
  const target = $(`[data-elname="${elName}"] .attributes`);
  if (target.find(`[data-attribute="${attName}"]`).length) return; // already exists
  
  const html = `
  <div data-attribute="${attName}">
    <label>
    ${attName} ${ 
      xema.elements[elName] && xema.elements[elName].attributes[attName] && xema.elements[elName].attributes[attName].values && xema.elements[elName].attributes[attName].values.length
        ? `<select class="attributevalue halfwidth" onchange="Subbing.change()">${xema.elements[elName].attributes[attName].values.map(({value}) => `<option ${attValue === value ? 'selected' : ''}>${value}</option>`).join('')}</select>` 
        : `<input type="text" placeholder="value" value="${attValue == null ? '' : attValue}" title="Enter the required value, leave empty for any value"></input>`
    }
    </label>
    <button class="iconOnly iconCross floatRight" title="Remove attribute '${attName}'" onclick="Subbing.removeAttribute('${elName}', '${attName}')"></button>
  </div>
  `;
  target.append(html);
};

Subbing.newAttribute=function(elName) {
  const attributeName = $(`[data-elname="${elName}"] .newAttribute`).val();
  Subbing.addAttribute(elName, attributeName, undefined);
  Subbing.change();
};

Subbing.addElement=function(elName, details){
  details=details||{};
  
  const html = `
  <div class='subelement' data-elname='${elName}'>
    <button class='iconOnly iconCross floatRight' onclick='Subbing.removeElement("${elName}")'>&nbsp;</button>
    <div class='elName'><span class='tech'><span class='brak'>&lt;</span><span class='elm'>${elName}</span><span class='brak'>&gt;</span></span></div>
    <div style="padding-left: 2em;">
      ${(() => {
        // render the already selected attributes from details here
        // and a line to add a new one
        // add new:
        if (xema && xema.elements[elName] && Object.keys(xema.elements[elName].attributes).length) {
          return `
          <div class="attributes"></div>
            <div>
              <label>Attribute requirement: <select class="halfwidth newAttribute">${Object.keys(xema.elements[elName].attributes).sort().map(k => `<option>${k}</option>`)}</select></label>
              <button class="iconAdd" onclick="Subbing.newAttribute('${elName}')">Add</button>
            </div>
          </div>
          `
        } else {
          return '';
        };
        
      })()}
    </div>
  `
  $("#elements_list").append(html);
  Object.entries(details.attributes || {}).forEach(([name, value]) => Subbing.addAttribute(elName, name, value));
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
  var ret= { 
    attributes: {} 
  };
  
  $element.find('[data-attribute]').each((i, el) => {
    const att = $(el).attr('data-attribute');
    const val = $(el).find('input, select').val();
    ret.attributes[att] = val;
  });

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
