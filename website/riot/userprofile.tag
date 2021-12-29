<userprofile>
	<div>
		<!-- Sketch Engine account -->
		<div class="row" if={ 'sketchengineLoginPage' in this.siteconfig && this.siteconfig.sketchengineLoginPage != "" && this.props.userInfo.ske_username != '' }>
			<div class="col">
				<p><strong>Sketch Engine login</strong></p>
				<p>Your Lexonomy account is linked to your Sketch Engine account <strong>{ this.props.userInfo.ske_username }</strong>
					<br/>
					<a href={ this.siteconfig.sketchengineLoginPage }>Link to a different Sketch Engine account&nbsp;»</a>
				</p>
			</div>
		</div>
		<div class="row" if={ 'sketchengineLoginPage' in this.siteconfig && this.siteconfig.sketchengineLoginPage != "" && this.props.userInfo.ske_username == '' }>
			<div class="col">
				<p><strong>Sketch Engine login</strong></p>
				<p><a href={ this.siteconfig.sketchengineLoginPage }>Link Lexonomy to your Sketch Engine account&nbsp;»</a>
				</p>
			</div>
		</div>
		<div class="row" if={ !('sketchengineLoginPage' in this.siteconfig) || this.siteconfig.sketchengineLoginPage == "" }>
			<div class="col">
				<p><strong>Sketch Engine login</strong></p>
				<p if={ this.skeuserMessage != '' }>{ this.skeuserMessage }</p>
				<div class="input-field col s12">
					<input id="skeusername" type="text" class="validate" value={ this.props.userInfo.ske_username }/>
					<label for="skeusername">Sketch Engine login</label>
					<span class="helper-text">Set your login username to Sketch Engine.</span>
				</div>
				<div class="col">
					<button class="btn waves-effect waves-light" type="submit" onclick={ doChangeUser }>Change username
						<i class="material-icons right">send</i>
					</button>
				</div>
			</div>
		</div>
		<hr/>
		<!-- Sketch Engine API key -->
		<div class="row">
			<div class="col">
				<p><strong>Sketch Engine API key</strong></p>
				<p if={ this.skeapiMessage != '' }>{ this.skeapiMessage }</p>
				<p if={ 'sketchengineLoginPage' in this.siteconfig && this.siteconfig.sketchengineLoginPage != "" }>
					Unless you need special setup, Please, <a href={ this.siteconfig.sketchengineLoginPage }>login via Sketch Engine</a> to set API key automatically.
				</p>
			</div>
		</div>
		<div class="row">
				<div class="input-field col s12">
					<input id="skeapi" type="text" class="validate" value={ this.props.userInfo.ske_apiKey }/>
					<label for="skeapi">Sketch Engine API key</label>
					<span class="helper-text">Set your API key for Sketch Engine.</span>
				</div>
				<div class="col">
					<button class="btn waves-effect waves-light" type="submit" onclick={ doChangeKey }>Change API key
						<i class="material-icons right">send</i>
					</button>
				</div>
		</div>
		<hr/>
		<!-- Lexonomy API key -->
		<div class="row" if={ this.apiMessage != '' }>
			<p>{ this.apiMessage }</p>
		</div>
		<div class="row">
			<div class="col">
				<p><strong>Lexonomy API key</strong></p>
				<p>This key allows external tools such as Sketch Engine to create a dictionary in your account and to populate it with pre-generated entries.</p>
				<p if={ this.props.userInfo.apiKey != ''}><strong>{ this.props.userInfo.apiKey }</strong></p>
			</div>
		</div>
		<div class="row">
			<div class="col col-3">
				<button class="btn waves-effect waves-light" type="submit" onclick={ doNewKey }>Generate new API key
				<i class="material-icons right">autorenew</i>
			</button>
		</div>
		<div class="col col-3">
			<button class="btn waves-effect waves-light" type="submit" onclick={ doDeleteKey }>Remove API key
			<i class="material-icons right">delete</i>
		</button>
	</div>
		</div>
		<hr/>
		<!-- set new password -->
		<div class="row" if={ this.passMessage != '' }>
			<p>{ this.passMessage }</p>
		</div>
		<div class="row">
			<div class="input-field col s12">
				<input id="password" type="password" class="validate" />
				<label for="password">New password</label>
				<span class="helper-text">Set your password to access Lexonomy.</span>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<button class="btn waves-effect waves-light" type="submit" onclick={ doChangePass }>Change password
					<i class="material-icons right">send</i>
				</button>
			</div>
		</div>
		
	</div>

	<script>
		export default {
			passMessage: '',
			apiMessage: '',
			skeuserMessage: '',
			skeapiMessage: '',
			siteconfig: {},
			onMounted() {
				if (Object.keys(this.props.siteconfig) == 0) {
					$.get("/siteconfigread.json", (response) => {
						this.siteconfig = response;
						this.update();
					});
				} else {
					this.siteconfig = this.props.siteconfig;
					this.update();
				}
				M.updateTextFields();
			},

			doChangePass(event) {
				if ($('#password').val() != '') {
					$.post("/changepwd.json", {password: $('#password').val()}, (response) => {
						if (response.success) {
							this.passMessage = 'Password changed.';
							this.update();
						} else {
							this.passMessage = 'There was an error saving the password.';
							this.update();
						}
					});
				}
			},

			doChangeUser(event) {
				if ($('#skeusername').val() != '') {
					$.post("/changeskeusername.json", {ske_userName: $('#skeusername').val()}, (response) => {
						if (response.success) {
							this.skeuserMessage = 'Username changed.';
							this.update();
						} else {
							this.skeuserMessage = 'There was an error saving the username.';
							this.update();
						}
					});
				}
			},

			doChangeKey(event) {
				if ($('#skeapi').val() != '') {
					$.post("/changeskeapi.json", {ske_apiKey: $('#skeapi').val()}, (response) => {
						if (response.success) {
							this.skeapiMessage = 'API key changed.';
							this.update();
						} else {
							this.skeapiMessage = 'There was an error saving the API key.';
							this.update();
						}
					});
				}
			},

			doNewKey(event) {
				var newkey = this.generateKey();
				$.post("/changeoneclickapi.json", {apiKey: newkey}, (response) => {
					if (response.success) {
						this.apiMessage = 'API key changed.';
						this.props.userInfo.apiKey = newkey;
						this.update();
					} else {
						this.apiMessage = 'There was an error saving the API key.';
						this.update();
					}
				});
			},

			doDeleteKey(event) {
				$.post("/changeoneclickapi.json", {apiKey: ""}, (response) => {
					if (response.success) {
						this.apiMessage = 'API key deleted.';
						this.props.userInfo.apiKey = "";
						this.update();
					} else {
						this.apiMessage = 'There was an error saving the API key.';
						this.update();
					}
				});
			},

			generateKey() {
				var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
				var key="";
				while(key.length<32) {
					var i=Math.floor(Math.random() * alphabet.length);
					key+=alphabet[i];
				}
				return key;
			}
		}
	</script>
</userprofile>
