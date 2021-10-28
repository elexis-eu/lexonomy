<dict-config-editing>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div if={ (!this.configData._js || this.configData._js == "") && !this.override }>
		<div class="row">
			<div class="input-field col s10">
				<p>
					<label>
						<input name="xonomyMode" id="xonomyMode_nerd" type="radio" class="with-gap" checked={ this.configData.xonomyMode == "nerd" } onchange={ changeInfo } />
						<span>Nerd mode</span>
					</label>
					<label>
						<input name="xonomyMode" id="xonomyMode_laic" type="radio" class="with-gap" checked={ this.configData.xonomyMode == "laic" } onchange={ changeInfo }/>
						<span>Laic mode</span>
					</label>
				</p>
				<span class="helper-text">Choose what the entry editor will look like.</span>
			</div>
		</div>
		<div class="row">
			<div class="col s10" id="info_nerd">
				<p>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.</div><div class='instro'><img src='/docs/mode-nerd.png' alt='Illustration'/>
					<br/> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</p>
			</div>
			<div class="col s10" id="info_laic">
				<p>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.</div><div class='instro'><img src='/docs/mode-laic.png' alt='Illustration'/>
					<br/> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</p>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s10">
				<p>
					<label>
						<input name="xonomyTextEditor" id="xonomyTextEditor_string" type="radio" class="with-gap" checked={ this.configData.xonomyTextEditor == "askString" } onchange={ changeInfo }/>
						<span>Single line</span>
					</label>
					<label>
						<input name="xonomyTextEditor" id="xonomyTextEditor_longstring" type="radio" class="with-gap" checked={ this.configData.xonomyTextEditor == "askLongString" } onchange={ changeInfo }/>
						<span>Multi line</span>
					</label>
				</p>
				<span class="helper-text">Choose the default text editor for node values.</span>
			</div>
		</div>
		<div class="row">
			<div class="col s10" id="info_string">
				<p>When editing text in <b>single line mode</b> the user sees a smaller editor.</div><div class='instro'><img src='/docs/text-editor-askstring.png' alt='Illustration'/></p>
			</div>
			<div class="col s10" id="info_longstring">
				<p>When editing text in <b>multi line mode</b> the user sees a full-fledged text editor.</div><div class='instro'><img src='/docs/text-editor-asklongstring.png' alt='Illustration'/></p>
			</div>
		</div>
		<div class="row">
			<div class="col s10">
				<button class="btn waves-effect waves-light" onclick={ startOverride } >Customize entry editor <i class="material-icons right">edit</i>
				</button>
			</div>
		</div>
	</div>
	<div if={ (this.configData._js && this.configData._js != "") || this.override }>
			<div class="row">
				<div class="input-field col s10">
					<textarea id="editor_js" class="materialize-textarea" placeholder="">{ this.configData._js }</textarea>
					<label for="editor_js">JavaScript</label>
					<span class="helper-text">You can customize the editor by defining two functions in JavaScript: one that will render the HTML editor from the XML entry and one that will harvest the (edited) HTML back into XML. If you would like to see an example, <a onclick={ exampleJS }>click here to load a sample JavaScript code</a>.</span>
				</div>
			</div>
			<div class="row">
				<div class="input-field col s10">
					<textarea id="editor_css" class="materialize-textarea" placeholder="">{ this.configData._css }</textarea>
					<label for="editor_css">CSS</label>
					<span class="helper-text">You can customize the editor look and feel by writing your own CSS styles. If you would like to see an example, <a onclick={ exampleCSS }>click here to load a sample CSS style</a>.</span>
				</div>
			</div>
		<div class="row">
			<div class="col s10">
				<button class="btn waves-effect waves-light" onclick={ stopOverride } >Disable entry editor customizations <i class="material-icons right">edit</i>
				</button>
			</div>
		</div>
	</div>
	<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
	</button>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Entry editor',
			override: false,
			configData: {
				xonomyMode: "nerd", 
				xonomyTextEditor: "askString",
				_js: "",
				_css: ""
			},

			changeInfo() {
				if ($("#xonomyMode_laic").is(":checked")) {
					$('#info_nerd').hide();
					$('#info_laic').show();
				} else {
					$('#info_nerd').show();
					$('#info_laic').hide();
				}
				if ($("#xonomyTextEditor_longstring").is(":checked")) {
					$('#info_string').hide();
					$('#info_longstring').show();
				} else {
					$('#info_string').show();
					$('#info_longstring').hide();
				}
			},

			startOverride() {
				this.override = true;
				this.update();
			},

			stopOverride() {
				this.override = false;
				this.configData._js = '';
				this.configData._css = '';
				this.update();
			},

			exampleJS() {
				$('#editor_js').val(
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
}`);
				M.textareaAutoResize($('#editor_js'));
			},

			exampleCSS() {
				$('#editor_css').val(
`div.myEditor {padding: 20px; font-size: 1.25em}
div.myEditor input {font-weight: bold}`
				);
				M.textareaAutoResize($('#editor_css'));
			},
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				console.log(this.props);
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					console.log(this.configData)
					if (response._js && response._js != "") {
						this.override = true;
					}
					this.update();
					this.changeInfo();
					M.updateTextFields();
					if (this.override) {
						M.textareaAutoResize($('#editor_css'));
						M.textareaAutoResize($('#editor_js'));
					}
				});
			},

			getConfigData() {
				var newData = {
					xonomyMode: "nerd",
					xonomyTextEditor: "askString",
					_js: "",
					_css: ""
				};
				if ($("#xonomyMode_laic").is(":checked")) {
					newData.xonomyMode = "laic";
				}
				if ($("#xonomyTextEditor_longstring").is(":checked")) {
					newData.xonomyTextEditor = "askLongString";
				}
				if (this.override) {
					newData._js = $('#editor_js').val();
					newData._css = $('#editor_css').val();
				}
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-editing>
