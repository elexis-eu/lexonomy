<dict-config-users>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title } configId={ this.configId } configTitle={ this.configTitle }/>
	<div>
			<div class="row user-info" each={ user in this.configData.users } data-email={ user.email }>
				<div class="col s7">
					<a class="btn-floating delete-user" data-email={ user.email} onclick={ doDeleteUser }><i class="material-icons">delete</i></a>
					<p><strong>{ user.email }</strong></p>
					<p>
						<span class="user-checkbox">
							<label>
								<input type="checkbox" name="canEdit" checked={ user.canEdit }/>
								<span>Edit</span>
							</label>
						</span>
						<span class="user-checkbox">
							<label>
								<input type="checkbox" name="canConfig" checked={ user.canConfig }/>
								<span>Configure</span>
							</label>
						</span>
						<span class="user-checkbox">
							<label>
								<input type="checkbox" name="canDownload" checked={ user.canDownload }/>
								<span>Download</span>
							</label>
						</span>
						<span class="user-checkbox">
							<label>
								<input type="checkbox" name="canUpload" checked={ user.canUpload }/>
								<span>Upload</span>
							</label>
						</span>
					</p>
				</div>
			</div>
			<div class="row">
        <div class="input-field col s6">
          <input id="new-email" type="email" class="validate" >
          <label for="new-email">Add user with e-mail</label>
				</div>
				<div class="col s1">
					<a class="btn-floating add-user" onclick={ doAddUser }><i class="material-icons">add</i></a>
				</div>
			</div>
			<button class="btn waves-effect waves-light" onclick={ saveData } id="submit_button">Save <i class="material-icons right">save</i>
			</button>
	</div>
	<style>
		.user-checkbox {
			padding-right: 2em;
		}
		.delete-user, .add-user {
			float: right;
		}
	</style>
	<script>
		export default {
			dictId: '',
			configId: '',
			configTitle: 'Users', 
			configData: {users:[]},
		
			doDeleteUser(event) {
				var email = event.target.parentNode.getAttribute('data-email');
				this.configData.users = this.configData.users.filter(user => user.email != email);
				this.update()
			},

			doAddUser(event) {
				if ($('#new-email').val() != '') {
					this.configData.users.push({email: $('#new-email').val()});
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

			async fillConfigForm() {
				this.props.loadConfigData(this.configId).then((response)=>{
					this.configData = {users:[]}
					for (var key in response) {
						var info = response[key];
						info.email = key;
						this.configData.users.push(info);
					}
					this.update();
				});
			},

			getConfigData() {
				var newData = {};
				$('.user-info').each(function() {
					var email = $(this).data('email');
					newData[email] = {
						canEdit: $(this).find('[name=canEdit]').is(':checked'),
						canConfig: $(this).find('[name=canConfig]').is(':checked'),
						canDownload: $(this).find('[name=canDownload]').is(':checked'),
						canUpload: $(this).find('[name=canUpload]').is(':checked'),
					};
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
	
</dict-config-users>
