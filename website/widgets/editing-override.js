window.EditingOverride={};
 EditingOverride.change=function(){};

 EditingOverride.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");
  $div.append("<div class='instro'>You can toggle fullscreen view for each of the editing windows using F11/Esc (first click into the editing window).</div>");
  var CodeMirrorOpts = {
    matchBrackets: true,
    lineNumbers: true,
    styleActiveLine: true,
    extraKeys: {
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      "Esc": function(cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
      }
    }
  }

  CodeMirrorOpts.mode="javascript"
  var $block=$("<div class='block theJS'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleJs()'>example</a> JavaScript</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.append("<div class='instro'>You can customize the editor by defining two functions in JavaScript: one that will render the HTML editor from the XML entry and one that will harvest the (edited) HTML back into XML. Click on the example link in the upper right corner to load a sample code.</div>");
  $block.append("<div class='error' style='display: none;'></div>");
  CodeMirrorJS = CodeMirror.fromTextArea($block.find("textarea")[0], CodeMirrorOpts);
  if (json._js)
    CodeMirrorJS.setValue(json._js);
  CodeMirrorJS.on("change", EditingOverride.change);

  CodeMirrorOpts.mode="css"
  var $block=$("<div class='block theCSS'></div>").appendTo($div);
	$block.append("<div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleCss()'>example</a> CSS</div>");
  $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
  $block.append("<div class='instro'>You can customize the editor look and feel by writing your own CSS styles. Click on the example link in the upper right corner to load a sample sheet.</div>");
  $block.append("<div class='error' style='display: none;'></div>");
  CodeMirrorCSS = CodeMirror.fromTextArea($block.find("textarea")[0], CodeMirrorOpts);
  if (json._css)
    CodeMirrorCSS.setValue(json._css);
  CodeMirrorCSS.on("change", EditingOverride.change);
};

 EditingOverride.exampleJs=function(){
  CodeMirrorJS.setValue(
`{
  editor: function(div, entry, uneditable){
    //div = the div into which you should render the editor
    //entry.id = the entry ID (a number, eg. 123), or zero if new entry
    //entry.content = the entry's XML source code, eg. "<entry></headword>hello</headword></entry>"
    //uneditable = true if we want the entry to be uneditable (read-only)
    $(div).html("<div class='myEditor'>HEADWORD: <input class='headword' "+(uneditable?"disabled":"")+"/></div>");
    $(div).find("input.headword").val($($.parseXML(entry.content)).find("headword").html());
  },
  harvester: function(div){
    //div = the div from which you should harvest the contents of the editor
    var headword=$(div).find("input.headword").val();
    return "<entry><headword>"+headword+"</headword></entry>";
  },
  adjustDocSpec: function (docSpec) {
    // NOTE: you normally want to use this method if you don't have a custom editor,
    // but just want to change certain aspects of how Xonomy presents the document.
    $.each(docSpec.elements, function (elementName, elementSpec) {
      // Expand <sense> elements by default.
      if (elementName === 'sense') {
        elementSpec.collapsed = function (jsElement) { return false; }
      }
      // Make <example> read-only
      if (elementName === 'example') {
        elementSpec.isReadOnly = true;
      }
      // Hide <partOfSpeech>.
      if (elementName === 'partOfSpeech') {
        elementSpec.isInvisible = true;
      }
    });
  }
}`
  );
};
 EditingOverride.exampleCss=function(){
  CodeMirrorCSS.setValue(
`div.myEditor {padding: 20px; font-size: 1.25em}
div.myEditor input {font-weight: bold}`
  );
};

 EditingOverride.harvest=function(div){
  var ret={};
  ret._js=CodeMirrorJS.getValue();
  ret._css=CodeMirrorCSS.getValue();
  return ret;
};
