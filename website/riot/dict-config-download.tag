<dict-config-download>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div class="row">
		<form class="col s12">
			<div class="row">
				<div class="input-field col s10">
					<textarea id="download_xslt" class="materialize-textarea" placeholder="">{ this.configData.xslt }</textarea>
					<label for="download_xslt">XSLT transformation on download</label>
					<span class="helper-text">You can use this functionality to automatically apply an XSLT transformation when the dictionary is downloaded. If you do not input valid XSLT here, no transformation will be applied.</span>
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
			configTitle: 'Download settings', 
			configData: {xslt: ''},
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
					M.textareaAutoResize($('#download_xslt'));
				});
			},

			saveData() {
				var xslt = $('#download_xslt').val();
				try {
					var data = {xslt: xslt};
					parsed_xslt = $.parseXML(xslt);
					$('#submit_button').html('Saving...');
					this.props.saveConfigData(this.configId, data);
				} catch(e) {
					alert('Failed to parse XSLT');
				}
			}
		}
	</script>
	
</dict-config-download>
