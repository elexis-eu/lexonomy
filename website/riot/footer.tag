<footer class="page-footer deep-orange lighten-4">
	<div class="container">
		<div class="row">
			<div class="logolint">
				<a target="_blank" href="https://www.muni.cz/" title="Masaryk University"><img class="mulogo" src="/furniture/logo_muni.png"/></a>
				<a target="_blank" href="https://www.sketchengine.co.uk/" title="Sketch Engine"><img class="skelogo" src="/furniture/logo_ske.png"/></a>
			</div>
		</div>
	</div>
	<div class="row" if={ this.props.siteconfig.version }>
		Version: { this.props.siteconfig.version }
	</div>
	<div class="footer-copyright">
		<div class="container">
			Lexonomy is developed as part of <a href="https://elex.is/">ELEXIS</a> project.
			<a class="right" href="https://github.com/elexis-eu/lexonomy" title="GitHub" target="_blank"><img src="/furniture/github.png"/></a>
		</div>
	</div>

	<style>
		.logolint a {vertical-align: middle;}
		.mulogo {width: 127px; height: 60px;}
		.skelogo {width: 105px; height: 39px;}
	</style>

	<script>
		export default {
			onMounted() {
				console.log('foo')
			}
		}
	</script>
</footer>
