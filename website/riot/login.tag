<login>
	<div class="section">
	<div class="input-field col s6">
		<input type="text" id="username" type="text"/>
		<label for="username">Username</label>
	</div>
	<div class="input-field col s6">
		<input id="password" type="password" onkeypress={ doLogin }/>
		<label for="password">Password</label>
	</div>
  <button class="btn waves-effect waves-light" type="submit" name="login" id="loginButton" onclick={ doLogin }>Submit
    <i class="material-icons right">send</i>
  </button>
	</div>

	<script>
		export default {
			doLogin(event) {
				if ((event.target.id == "username" || event.target.id == "password") && event.keyCode != 13) return false;
				this.props.checkAuth();
			}
		}
	</script>
</login>
