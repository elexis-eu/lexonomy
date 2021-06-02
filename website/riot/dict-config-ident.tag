<dict-config-ident>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div class="row">
		<form class="col s12">
			<div class="row">
        <div class="input-field col s10">
          <input value={ this.configData.title } placeholder="My Dictionary" id="ident_title" type="text" class="validate"/>
					<label for="ident_title">Dictionary name</label>
					<span class="helper-text">A human-readable title for your dictionary, such as <i>My Esperanto Dictionary</i>.</span>
				</div>
				<div class="input-field col s10">
					<textarea id="ident_blurb" class="materialize-textarea" placeholder="Yet another Lexonomy dictionary.">{ this.configData.blurb }</textarea>
					<label for="ident_blurb">Dictionary description</label>
					<span class="helper-text">This will appear on your dictionary's home page. You can leave it blank if you prefer.<br/>You can use <a href='https://daringfireball.net/projects/markdown/' target='_blank'>Markdown</a> here.</span>
				</div>
				<div class="input-field col s10">
					<input value={ this.configData.lang } type="text" id="ident_lang" class="autocomplete" placeholder="Type to search for language, or write your custom info">
					<label for="ident_lang">Main language</label>
					<span class="helper-text">Language of dictionary entries, used to sort dictionaries on your home page. You can select language from the list, or write down your own.</span>
				</div>
			</div>
			<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
			</button>

		</form>
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Description', 
			configData: {},
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
					this.update();
					M.updateTextFields();
					M.textareaAutoResize($('#ident_blurb'));
					var langs_data = {};
					this.configData.langs.forEach(lang => {
						langs_data[lang['lang']] = null;
					});
					$('#ident_lang').autocomplete({data: langs_data});
				});
			},

			getConfigData() {
				var newData = {
					'title': $('#ident_title').val(),
					'blurb': $('#ident_blurb').val(),
					'lang': $('#ident_lang').val()
				};
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-ident>
