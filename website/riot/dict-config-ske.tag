<dict-config-ske>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
			<div class="row">
        <div class="input-field col s10">
          <input value={ this.configData.kex.url } placeholder="" id="kex_url" type="text" class=""/>
					<label for="kex_url">Sketch Engine URL</label>
					<span class="helper-text">The URL of the Sketch Engine installation where external links should point. Defaults to <tt>https://app.sketchengine.eu</tt>. Do not change this unless you are using a local installation of Sketch Engine.</span>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s10">
          <input value={ this.configData.kex.apiurl } placeholder="" id="kex_apiurl" type="text" class=""/>
					<label for="kex_apiurl">Sketch Engine API URL</label>
					<span class="helper-text">The path to the <tt>run.cgi</tt> API script in Sketch Engine. Defaults to <tt>https://api.sketchengine.eu/bonito/run.cgi</tt>. Do not change this unless you are using a local installation of Sketch Engine.</span>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s10">
					<label for="kex_corpus">Corpus name</label>
					<span class="helper-text">Select a Sketch Engine corpus from the list of corpora available to you.</span>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s10">
          <input value={ this.configData.kex.concquery} placeholder="" id="kex_concquery" type="text" class=""/>
					<label for="kex_concquery">Concordance query</label>
					<span class="helper-text">The CQL query that will be used to obtain concordance from Sketch Engine. You can use placeholders for elements in the form of '%(element)', e.g. '[lemma="%(headword)"]'. If left empty the 'simple' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</span>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s10">
          <input value={ this.configData.kex.concsampling} placeholder="" id="kex_concsampling" type="number" class=""/>
					<label for="kex_concsampling">Sample size</label>
					<span class="helper-text">Whether to apply automatic sampling of the concordance. Any non-zero value means to automatically create a random sample of that size.</span>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s10">
					<select id="kex_searchElements" multiple>
					</select>
					<label for="kex_searchElements">Additional search elements</label>
					<span class="helper-text">You can select any textual elements here whose content you would like to search for in Sketch Engine. A menu will be displayed next to all these elements like for the root entry element.</span>
				</div>
			</div>
			<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
			</button>
	</div>
	<style>
		#kex_concsampling {
			width: 4em;
		}
		#kex_searchElements {
			width: 10em;
		}
	</style>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Sketch Engine connection', 
			configData: {
				kex: {url: 'https://app.sketchengine.eu', apiurl: 'https://api.sketchengine.eu/bonito/run.cgi', concsampling: 0, searchElements: []},
				xampl: {},
				collx: {},
				defo: {},
				thes: {},
			},
		
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				M.updateTextFields();
				console.log(this.props);
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements && $('#kex_searchElements option').length == 0) {
					Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
						if (info.filling == 'txt' || info.filling == 'lst') {
							var checked = this.configData.kex.searchElements.includes(key)? 'checked':'';
							$('#kex_searchElements').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
						}
					});
					$('select').formSelect();
				}
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					if (!this.configData.kex.concsampling || this.configData.kex.concsampling == '') {
						this.configData.kex.concsampling = 0;
					}
					if (!response.kex.searchElements) {
						this.configData.kex.searchElements = [];
					}
					M.updateTextFields();
					this.update();
				});
			},

			getConfigData() {
				var newData = {};
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-ske>
