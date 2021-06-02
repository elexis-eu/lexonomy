<dict-config-publico>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div class="row">
		<form class="col s12">
			<div class="row">
				<div class="input-field col s10">
					<p>
						<label>
							<input name="publico_public" id="publico_public_private" type="radio" class="with-gap" checked={ !(this.configData.public) } />
							<span>Private</span>
						</label>
						<label>
							<input name="publico_public" id="publico_public_public" type="radio" class="with-gap" checked={ this.configData.public } />
							<span>Public</span>
						</label>
					</p>
					<span class="helper-text"><i>Private</i> means that the dictionary is not publicly viewable.  <i>Public</i> means that the dictionary is publicly viewable.</span>
				</div>
				<div class="input-field col s10" id="publico_licence_info">
					<select id="publico_licence">
						<option each={ licence in licences } value={ licence.id } selected={ this.configData.licence == licence.id }>{ licence.title }</option>
					</select>
					<label>Licence</label>
					<span class="helper-text"></span>
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
			configTitle: 'Publishing', 
			configData: {},
			licences: [
				{
					id: 'cc-by-4.0',
					title: 'Creative Commons Attribution 4.0 International',
					url: 'https://creativecommons.org/licenses/by/4.0/'
				},
				{
					id: 'cc-by-sa-4.0',
					title: 'Creative Commons Attribution Share-Alike 4.0 International',
					url: 'https://creativecommons.org/licenses/by-sa/4.0/'
				},
				{
					id: 'odbl-1.0',
					title: 'Open Database Licence 1.0',
					url: 'https://opendatacommons.org/licenses/odbl/summary/'
				}
			],
			
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				this.fillConfigForm();
				console.log(this.props);
				$('#publico_public_private').on('change', function() {
					if($(this).is(":checked")) {
						$('#publico_licence_info').hide();
					}					
				});
				$('#publico_public_public').on('change', function() {
					if($(this).is(":checked")) {
						$('#publico_licence_info').show();
					}					
				});
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					console.log(this.configData)
					this.update();
					$('#publico_licence').formSelect();
					if (!(this.configData.public)) {
						$('#publico_licence_info').hide();
					}
				});
			},

			getConfigData() {
				var newData = {
					'public': false,
					'licence': ''
				};
				if ($('#publico_public_public').is(':checked')) {
					newData.public = true;
					newData.licence = $('#publico_licence').val();
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
	
</dict-config-publico>
