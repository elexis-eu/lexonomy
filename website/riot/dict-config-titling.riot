<dict-config-titling>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
		<div class="row">
			<div class="input-field col s6">
				<select id="headword">
					<option value="">(not set)</option>
				</select>
				<label for="headword">Headword</label>
				<span class="helper-text">Select the element which contains the entry's headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<select id="headwordSorting">
					<option value="">(not set)</option>
				</select>
				<label for="headwordSorting">Headword sorting</label>
				<span class="helper-text">Select the element which will be used for sorting of headwords in the entry list. If you make no selection here Lexonomy will use the element you chose for headword.</span>
			</div>
			<div class="input-field col s6">
				<label>
					<input type="checkbox" id="sortDesc" checked={ configData.sortDesc }/>
					<span>Sort in descending order</span>
				</label>
			</div>
		</div>
		<div class="row">
			<h6>Headword annotations</h6>
		</div>
		<div class="row">
			<div class="col s5">
				<label>
					<input name="hwannotype" type="radio" value="simple" checked={ configData.headwordAnnotationsType == "simple" } onchange={ changeAnnotation }/>
					<span>simple</span>
				</label>
				<br/>
				<div class="input-field">
					<select id="headwordAnnotations" multiple disabled={ configData.headwordAnnotationsType == 'advanced' }>
					</select>
					<span class="helper-text">You can select any elements here whose content you want displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</span>
				</div>
			</div>
			<div class="col s5">
				<label>
					<input name="hwannotype" type="radio" value="advanced" checked={ configData.headwordAnnotationsType == "advanced" } onchange={ changeAnnotation }/>
					<span>advanced</span>
				</label>
				<br/>
				<div class="input-field">
					<textarea id="advancedAnnotations" class="materialize-textarea" placeholder="headword annotations" disabled={ configData.headwordAnnotationsType == 'simple' }>{ this.configData.headwordAnnotationsAdvanced }</textarea>
					<span class="helper-text">You can insert any HTML containing placeholders for elements in the form of '%(element)', e.g. '&lt;b>%(headword)&lt;/b>'.</span>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s8">
				<input data-selected-locale={ this.configData.locale } type="text" id="sort_locale" class="autocomplete" placeholder="Type to search for language"/>
				<label for="sort_locale">Alphabetical order</label>
				<span class="helper-text">Select language to sort entries alphabetically in the entry list.</span>
			</div>
		</div>
		<div class="row">
			<div class="input-field col s6">
				<input value={ this.configData.numberEntries} placeholder="" id="numberEntries" type="number" class=""/>
				<label for="numberEntries">Number of entries to be shown in the entry list at once</label>
				<span class="helper-text">If your dictionary contains large entries (large XML files), it is recommended to reduce this number for quicker loading of entry list.</span>
			</div>
		</div>
		<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
		</button>
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Headword list', 
			configData: {headwordAnnotationsType: 'simple', headwordAnnotations: []},

			changeAnnotation() {
				if ($('[name=hwannotype][value=advanced]').is(':checked')) {
					$('#headwordAnnotations').attr('disabled', 'disabled');
					$('#advancedAnnotations').removeAttr('disabled');
					$('#headwordAnnotations').formSelect();
				} else {
					$('#advancedAnnotations').attr('disabled', 'disabled');
					$('#headwordAnnotations').removeAttr('disabled');
					$('#headwordAnnotations').formSelect();
				}
			},

			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				M.updateTextFields();
				M.textareaAutoResize($('#advancedAnnotations'));
			},

			onUpdated() {
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#headword option').length == 1) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#headword').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					if ($('#headwordSorting option').length == 1) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#headwordSorting').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					if ($('#headwordAnnotations option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							if (key != this.configData.headword) {
								$('#headwordAnnotations').append('<option value="' + key + '">' + key + '</option>');
							}
						});
					}
					if (this.configData.headword != '') {
						$('#headword option[value='+this.configData.headword+']').attr('selected','selected');
					}
					if (this.configData.headwordSorting != '') {
						$('#headwordSorting option[value='+this.configData.headwordSorting+']').attr('selected','selected');
					}
					this.configData.headwordAnnotations.forEach(el => {
						$('#headwordAnnotations option[value='+el+']').attr('selected','selected');
					});


					$('select').formSelect();
				}
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					if (!this.configData.numberEntries) this.configData.numberEntries = 1000;
					if (!this.configData.headwordAnnotationsType) this.configData.headwordAnnotationsType = 'simple';
					if (!this.configData.headwordAnnotations) this.configData.headwordAnnotations = [];
					M.updateTextFields();
					M.textareaAutoResize($('#advancedAnnotations'));

					// fill locale list for autocomplete
					if (this.configData.sort_locale && this.configData.sort_locale != '') {
						$('#sort_locale').data('selected-locale', this.configData.sort_locale);
					}
					var localeList = {};
					var localeData = {};
					var selected = '';
					this.configData.locales.forEach(loc => {
						localeList[loc['lang']] = null;
						localeData[loc['lang']] = loc['code'];
						if (loc['code'] == this.configData.locale) {
							selected = loc['lang'];
						}
					});
					$('#sort_locale').autocomplete({data: localeList});
					$('#sort_locale').data('locales', localeData);
					if (selected != '') {
						$('#sort_locale').val(selected);
					}
					$('#sort_locale').on('change', function() {
						var localeData = $(this).data('locales');
						$(this).data('selected-locale', localeData[$(this).val()]);
					});
					this.update();
				});
			},

			getConfigData() {
				var newData = {
					headword: $('#headword').val(),
					headwordSorting: $('#headwordSorting').val(),
					sortDesc: $('#sortDesc').is(':checked'),
					numberEntries: $('#numberEntries').val(),
					locale: $('#sort_locale').data('selected-locale')
				};
				if ($('[name=hwannotype][value=advanced]').is(':checked')) {
					newData.headwordAnnotationsType = 'advanced';
					newData.headwordAnnotationsAdvanced = $('#advancedAnnotations').val();
				} else {
					newData.headwordAnnotationsType = 'simple';
					newData.headwordAnnotations = $('#headwordAnnotations').val();
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
	
</dict-config-titling>
