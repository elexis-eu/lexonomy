<dict-config-subbing>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
			<div class="row element-info" each={ element in this.configData.elements } data-element={ element }>
				<div class="col s7">
					<a class="btn-floating delete-el" data-element={ element } onclick={ doDeleteEl }><i class="material-icons">delete</i></a>
					<p><strong>{ element }</strong></p>
				</div>
			</div>
			<div class="row">
				<div class="input-field col s6">
					<select id="new-element">
					</select>
					<label for="new-element">Subentry element</label>
					<span class="helper-text">Elements listed here function as subentries which can be shared by multiple entries.</span>
				</div>
				<div class="col s1">
					<a class="btn-floating add-el" onclick={ doAddEl }><i class="material-icons">add</i></a>
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
			configTitle: 'Subentries', 
			configData: {elements:[]},
		
			doDeleteEl(event) {
				var el = event.target.parentNode.getAttribute('data-element');
				this.configData.elements = this.configData.elements.filter(val => val != el);
				this.update()
			},

			doAddEl(event) {
				if ($('#new-element').val() != '') {
					this.configData.elements.push($('#new-element').val());
					this.update();
				}
			},

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
					if ($('#new-element option').length == 0) {
						Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
							$('#new-element').append('<option value="' + key + '">' + key + '</option>');
						});
					}
					$('select').formSelect();
				}
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = {elements:[]}
					for (var key in response) {
						this.configData.elements.push(key);
					}
					this.update();
				});
			},

			getConfigData() {
				var newData = {};
				$('.element-info').each(function() {
					var el = $(this).data('element');
					newData[el] = {};
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
	
</dict-config-subbing>
