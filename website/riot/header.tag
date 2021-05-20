<header>
	<ul if={ props.showDictMenu } id="dropdown-menu-dict" class="dropdown-content">
		<li if={ props.userAccess && props.userAccess.canEdit }><a href="#/{ props.dictId }">View</a></li>
		<li if={ props.userAccess && props.userAccess.canEdit }><a href="#/{ props.dictId }/edit">Edit</a></li>
		<li if={ props.userAccess && props.userAccess.canConfig }><a href="#/{ props.dictId }/config">Configure</a></li>
		<li if={ props.userAccess && props.userAccess.canDownload }><a href="#/{ props.dictId }/download">Download</a></li>
		<li if={ props.userAccess && props.userAccess.canUpload }><a href="#/{ props.dictId }/upload">Upload</a></li>
	</ul>
	<ul if={ !props.authorized } id="dropdown-menu-anon" class="dropdown-content">
	  <li><a href="#!">Log in</a></li>
	  <li><a href="#!">Get an account</a></li>
	  <li><a href="#!">Forgot your password?</a></li>
	</ul>
	<ul if={ props.authorized } id="dropdown-menu-user" class="dropdown-content">
	  <li><a href="#/" onclick={ doLogout }>Log out</a></li>
	  <li><a href="#/">Your profile</a></li>
	</ul>

	<nav>
	  <div class="nav-wrapper deep-orange lighten-4">
	    <a href="#" class="brand-logo"><img style="height:50px;position:relative;top:5px" class="site-logo" src="/furniture/lexonomy_logo_blue_on_transparent_with_bleed.png"/></a>
	    <ul id="nav-mobile" class="right hide-on-med-and-down">
				<li if={ props.showDictMenu }><a class="dropdown-trigger" href="#/" data-target="dropdown-menu-dict">Dictionary<i class="material-icons right">arrow_drop_down</i></a></li>
	      <li if={ !props.authorized }><a class="dropdown-trigger" href="#/" data-target="dropdown-menu-anon">anonymous user<i class="material-icons right">arrow_drop_down</i></a></li>
	      <li if={ props.authorized }><a class="dropdown-trigger" href="#/" data-target="dropdown-menu-user">{props.userInfo.username}<i class="material-icons right">arrow_drop_down</i></a></li>
	    </ul>
	  </div>
	</nav>

	<script>
		export default {
			doLogout(event) {
				this.props.logOut();
			}, 
			
			onUpdated() {
				console.log('header up')
				console.log(this.props)
				$(document).ready(function() {
					$(".dropdown-trigger").dropdown({coverTrigger: false});
				});
			},

			onMounted() {
				console.log('heade m')
			}
		}

		$(document).ready(function() {
			$(".dropdown-trigger").dropdown({coverTrigger: false});
		});
	</script>
</header>
