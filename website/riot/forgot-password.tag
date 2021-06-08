<forgot-password>
	<div if={ !messageSent && tokenValid}>
		<div class="row">
			<div class="input-field col s12">
				<input id="password" type="password" class="validate" onkeypress={ doLogin }/>
				<label for="password">Your password</label>
				<span class="helper-text">Set your password to access Lexonomy.</span>
				<input id="token" type="hidden" value={ this.props.token }/>
			</div>
		</div>
		<div class="row">
			<button class="btn waves-effect waves-light" type="submit" name="login" id="loginButton" onclick={ doLogin }>Set password
				<i class="material-icons right">send</i>
			</button>
		</div>
	</div>
	<div if={ !tokenValid && !checkingToken } class="row">
		<div class="col s12">
			<div class="card red darken-2">
				<div class="card-content white-text">
					<p>This recovery link is invalid. It may have expired or has been used before.</p>
				</div>
			</div>
		</div>
	</div>
	<div if={ checkingToken } class="row">
		<p>Validating recovery token...</p>
	</div>
	<div if={ messageSent } class="row">
		<p>Your password is updated. You can now <a href="#/">log in</a> with your e-mail address and password.</p>
	</div>
	<div if={ errorMessage != ''} class="row">
		<div class="col s6">
			<div class="card red darken-2">
				<div class="card-content white-text">
					<p>{ errorMessage }</p>
				</div>
			</div>
		</div>
	</div>

	<script>
		export default {
			messageSent: false,
			tokenValid: false,
			checkingToken: true,
			errorMessage: '',

			validateToken(token) {
				console.log('validate '+token)
				$.post("/verifytoken.json", {token: token, type: "recovery"}, (response) => {
					if (response.success) {
						this.tokenValid = true;
					}
				}).always(() => {
					this.checkingToken = false;
					this.update();
				});
			},

			onMounted() {
				this.validateToken(this.props.token)
			},

			doLogin(event) {
				if ((event.target.id == "password") && event.keyCode != 13) return false;

				this.props.accountOps('forgotPassword').then((result)=>{
					if (result.success) {
						this.messageSent = true;
						this.update();
					} else {
						this.messageSent = false;
						this.errorMessage = result.errorMessage;
						this.update()
					}
				});
			}
		}
	</script>
</forgot-password>
