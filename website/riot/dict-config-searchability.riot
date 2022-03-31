<dict-config-searchability>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
			<div class="row">
				<div class="input-field col s6">
					<select id="search-element" multiple>
					</select>
					<label for="search-element">Searchable elements</label>
					<span class="helper-text">The contents of elements you select here will be searchable (in addition to each entry's headword).</span>
				</div>
			</div>
			<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
			</button>
	</div>
	<style>
		.delete-el, .add-el {
			float: right;
		}
	</style>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Searching', 
			configData: {searchableElements:[]},
		
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				console.log(this.props);
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#search-element option').length == 0) {
						console.log(this.configData)
						console.log(this.configData.searchableElements)
						console.log(this.props.dictConfigs.titling.headword)
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							if (key == this.props.dictConfigs.titling.headword) {
								$('#search-element').append('<option value="' + key + '" selected disabled>' + key + '</option>');
							} else {
								var checked = (this.configData.searchableElements.includes(key))? 'selected':'';
								$('#search-element').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
							}
						});
					}
					$('#search-element').val(this.configData.searchableElements);
					$('select').formSelect();
				}
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					$('#search-element').val(this.configData.searchableElements);
					this.update();
				});
			},

			getConfigData() {
				var newData = {searchableElements: $('#search-element').val()};
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-searchability>
