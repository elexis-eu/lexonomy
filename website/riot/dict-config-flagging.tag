<dict-config-flagging>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
		<div class="row">
			<div class="input-field col s6">
				<select id="flag-element">
				</select>
				<label for="flag-element">Flag element</label>
				<span class="helper-text">Select the element which the flags should be put into.</span>
			</div>
		</div>
		<div class="row">
			<div class="col s4">
				<a class="btn waves-effect waves-light" onclick={ doAddEl }>flag <i class="material-icons left">add</i></a>
			</div>
		</div>
		<div class="row flag-info" each={ (flag, index) in this.configData.flags } data-index={ index }>
			<div class="col s1 input-field">
				<input type="text" value={ flag.key } placeholder="key" class="flag-key"/>
				<label>Keyboard shortcut</label>
			</div>
			<div class="col s3 input-field">
				<input type="text" value={ flag.name } placeholder="value" class="flag-name"/>
				<label>Value</label>
			</div>
			<div class="col s3 input-field">
				<input type="text" value={ flag.label } placeholder="label" class="flag-label"/>
				<label>Label</label>
			</div>
			<div class="col s2 input-field">
				<input type="text" value={ flag.color } placeholder="color"  class="flag-color" style={ "background-color:"+flag.color}/>
				<label>Color</label>
			</div>
			<div class="col s1">
				<a class="btn-floating delete-el" data-index={ index } onclick={ doDeleteEl }><i class="material-icons">delete</i></a>
			</div>
		</div>
		<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
		</button>
	</div>
	<style>
		.delete-el {
			float: right;
		}
	</style>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Entry flags', 
			configData: {flag_elements: "", flags: []},
		
			doDeleteEl(event) {
				var el = event.target.parentNode.getAttribute('data-index');
				this.configData = this.getConfigData();
				this.configData.flags.splice(el, 1);
				this.update()
			},

			doAddEl(event) {
				this.configData.flags.push({key: "", name: "", label: "", color: ""});
				this.update();
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
				if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
					if ($('#flag-element option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#flag-element').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					$('select').formSelect();
				}
				M.updateTextFields();
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = {flag_element: "", flags: []}
					if (response.flag_element && response.flag_element != "") {
						this.configData = response;
					}
					this.update();
				});
			},

			getConfigData() {
				var newData = {flag_element: $('#flag-element').val(), flags: []};
				$('.flag-info').each(function() {
					newData.flags.push({
						key: $(this).find('.flag-key').val(),
						name: $(this).find('.flag-name').val(),
						label: $(this).find('.flag-label').val(),
						color: $(this).find('.flag-color').val()
					});
				});
				return newData;
			},

			saveData() {
				console.log(this.getConfigData())
				$('#submit_button').html('Saving...');
				this.props.saveConfigData(this.configId, this.getConfigData());
			}
		}
	</script>
	
</dict-config-flagging>
