// @ts-check
// Instruct the javascript type checking to use this file 
// Enables autocomplete on the 'monaco' object :) (when editing in VSCode)
/// <reference path="../libs/node_modules/monaco-editor/monaco.d.ts"/> 

/** @type {monaco.editor.IStandaloneCodeEditor} */
var jsEditor;
/** @type {monaco.editor.IStandaloneCodeEditor} */
var cssEditor;

var div;
var json;
var EditingOverride = {
  change: function() {},
  render: function(_div, _json) {
    div=_div; json=_json;
    init();
  },
  exampleJs: function () {
    jsEditor.setValue(
`
// do not edit the name of this variable
var customizeEditor = {
  /**
   * @param {HTMLDivElement} div
   * @param {{content: string, id?: number}} entry - the dictionary entry in xml form
   * @param {boolean} uneditable
   */
  editor: function(div, entry, uneditable){
    //div = the div into which you should render the editor
    //entry.id = the entry ID (a number, eg. 123), or zero if new entry
    //entry.content = the entry's XML source code, eg. "<entry></headword>hello</headword></entry>"
    //uneditable = true if we want the entry to be uneditable (read-only)
    $(div).html("<div class='myEditor'>HEADWORD: <input class='headword' "+(uneditable?"disabled":"")+"/></div>");
    $(div).find("input.headword").val($($.parseXML(entry.content)).find("headword").html());
  },
  /**
   * @param {HTMLDivElement} div - the xonomy root div
   * @returns {string}
   */
  harvester: function(div){
    //div = the div from which you should harvest the contents of the editor
    var headword=$(div).find("input.headword").val();
    return "<entry><headword>"+headword+"</headword></entry>";
  },
  /** 
   * @param {XonomyDocSpecExternal} docSpec - the "document specification", the editor rules for every element and attribute
   * @returns {void}
   */
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
  },
  exampleCss: function () {
    cssEditor.setValue(
`div.myEditor {padding: 20px; font-size: 1.25em}
div.myEditor input {font-weight: bold}`
    );
  },
  harvest: function(div) {
    var ret = {};
    ret._js = jsEditor.getValue();
    ret._css = cssEditor.getValue();
    return ret;
  }
};


var editorInitialized = false;
function init() {
  if (!window.monaco) {
    // render and monaco are both initialized asynchronously, so we need to poll to find out when we can setup the page
    setTimeout(init, 500);
    return;
  }


  $(div).append(`
  <div id='pagebody' class='notop'>
    <div class='pillarform'>
      <div class='instro'>You can toggle fullscreen view for each of the editing windows using F11/Esc (first click into the editing window).</div>
      <div class='block theJS'>
        <div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleJs()'>example</a> JavaScript</div>
        <div id='jsEditor' style='min-height: 600px'></div>
        <div class='instro'>You can customize the editor by defining two functions in JavaScript: one that will render the HTML editor from the XML entry and one that will harvest the (edited) HTML back into XML. Click on the example link in the upper right corner to load a sample code.</div>
        <div class='error' style='display: none;'></div>
      </div>
      <div class='block theCSS'>
        <div class='title'><a href='javascript:void(null)' onclick=' EditingOverride.exampleCss()'>example</a> CSS</div><div class='block theCSS'></div>
        <div id='cssEditor' style='min-height: 600px'></div><div class='block theCSS'></div>
        <div class='instro'>You can customize the editor look and feel by writing your own CSS styles. Click on the example link in the upper right corner to load a sample sheet.</div><div class='block theCSS'></div>
        <div class='error' style='display: none;'></div><div class='block theCSS'></div>  
      </div>
    </div>
  </div>
  `)

  /** @type {Promise} */
  let editorTypeDefinitionsLoaded = undefined;

  if (editorInitialized) { 
    // ugh already initialized, but screenful just deleted our dom :(
    // redo setup.
    jsEditor.dispose();
    cssEditor.dispose();
    editorTypeDefinitionsLoaded = Promise.resolve();
  } else {
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    
    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      allowJs: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    });

    editorTypeDefinitionsLoaded = Promise.all(
      [
        '../../../libs/node_modules/@kcmertens/xonomy/dist/src/xonomy.d.ts',
        '../../../libs/node_modules/@types/jquery/JQueryStatic.d.ts',
        '../../../libs/node_modules/@types/jquery/JQuery.d.ts'
      ]
      .map(path => 
        fetch(path)
        .then(r => r.text())
        .then(fileContents => {
          // We must replace all import/export statements to make sure all type definitions are considered "global"
          // If we don't, monaco won't autocomplete types because it requires the definitions to be imported (i.e. import * from '...')
          // Which is bollocks, as we're trying to set up an environment where everything is global
          fileContents = fileContents.replace(/export declare|export default Xonomy;|\/\/\/.*?\n|import/g, '')
          return {
            fileUri: path,
            fileContents
          }
        })
      )
    )
    .then(libs => libs.forEach(({fileContents, fileUri}) => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(fileContents, fileUri);
      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      monaco.editor.createModel(fileContents, 'typescript', monaco.Uri.parse(fileUri));
    }))
  }
  
  editorTypeDefinitionsLoaded.then(() => {
    jsEditor = monaco.editor.create(document.getElementById('jsEditor'), {
      value: json._js,
      language: 'javascript',
      minimap: { enabled: false },
      wordBasedSuggestions: false,
      roundedSelection: false,
    });
  
    cssEditor = monaco.editor.create(document.getElementById('cssEditor'), { 
      value: json._css,
      language: 'css',
      minimap: { enabled: false },
      wordBasedSuggestions: true
    });
  });
  
  editorInitialized = true;
}

// https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-javascript-defaults
// https://raw.githubusercontent.com/microsoft/monaco-editor-samples/main/browser-script-editor/index.html