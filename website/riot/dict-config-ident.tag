<dict-config-ident>
	<div class="row">
		<div class="col s10 offset-s1">
			<h3 class="header">
				<i class="material-icons">settings</i>
				{ this.props.dictDetails.title } - Ident
			</h3>
		</div>
	</div>
	<div class="row">
	</div>
	<script>
		export default {
			dictId: '',
			configId: '',
			onMounted() {
				this.dictId = this.props.dictId;
				this.configId = this.props.configId;
				console.log('config dict '+ this.dictId + '-' + this.configId)
				this.props.loadDictDetail();
				console.log(this.props)
			},
		}
	</script>
	
</dict-config-ident>
