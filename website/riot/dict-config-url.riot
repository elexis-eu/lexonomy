<dict-config-url>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
		<div class="row">
			<div class="col s6 input-field">
					<input class="right-align" id="baseUrl" type="text" disabled value="https://www.lexonomy.eu/"/>
			</div>
			<div class="col s6 input-field">
					<input id="oldurl" type="text" disabled value={ props.dictId } />
					<label for="oldurl">Current URL</label>
			</div>
		</div>
		<div class="row">
			<div class="col s6 input-field">
					<input class="right-align" id="baseUrl" type="text" disabled value="https://www.lexonomy.eu/"/>
			</div>
			<div class="col s6 input-field">
					<input id="url" type="text" class="validate" required minlength="5" pattern="[a-zA-Z0-9\-]*"/>
					<label for="url">New URL</label>
					<span class="helper-text">This will be your dictionary's address on the web. Allowed: characters, numbers, -</span>
			</div>
		</div>
		<div class="row">
			<div class="col s3">
		<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Change <i class="material-icons right">save</i>
		</button>
	</div>
	<div class="col">
		<span id="error" style="display:none">This URL is already taken.</span>
		<span id="success" style="display:none">Your dictionary has been moved to a new URL. <a href="" id="newlink">Go to new dictionary URL</a>.</span>
	</div>
</div>
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Change URL', 
			configData: {searchableElements:[]},
		
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				M.updateTextFields();
			},

			onUpdated() {
			},

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = response;
					$('#search-element').val(this.configData.searchableElements);
					this.update();
				});
			},

			saveData() {
				var newurl = $('#url').val();
				if (newurl != "" && $('#url').hasClass('valid')) {
					$('#submit_button').html('Saving...');
					$.post("/"+this.dictId+"/move.json", {url: newurl}, (response) => {
						if (response.success) {
							$('#success').show();
							$('#newlink').attr('href', '#/'+newurl+'/edit');
						} else {
							$('#error').show();
							$('#submit_button').html('Change');
						}
					});
				}
			}
		}
	</script>
	
</dict-config-url>
