<register>
	<div if={ !messageSent }>
		<div class="row">
			<div class="input-field col s12">
				<input id="email" type="email" class="validate" onkeypress={ doLogin }/>
				<label for="email">Your e-mail</label>
				<span class="helper-text">To get a new account, enter your e-mail address and we will send you instructions.</span>
			</div>
		</div>
		<div class="row">
			<button class="btn waves-effect waves-light" type="submit" name="login" id="loginButton" onclick={ doLogin }>Register
				<i class="material-icons right">send</i>
			</button>
		</div>
	</div>
	<div if={ messageSent } class="row">
		<p>We have sent you an e-mail with instructions on how to create a new account.</p>
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
			errorMessage: '',

			doLogin(event) {
				if ((event.target.id == "email") && event.keyCode != 13) return false;

				this.props.accountOps('register').then((result)=>{
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
</register>
