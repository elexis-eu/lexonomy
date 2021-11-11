<dict-download>
	<nav>
		<div class="nav-wrapper deep-orange lighten-4">
			<div class="col s12">
				<a href="#/{ this.props.dictId }" class="breadcrumb">{ this.props.dictDetails.title }</a>
				<a href="#/{ this.props.dictId }/download" class="breadcrumb">Download</a>
			</div>
		</div>
	</nav>
	<div class="row">
		<div class="col s6 offset-s3">
			<a class="waves-effect waves-light btn" target="_blank" href="/{ this.props.dictId }/download.xml"><i class="material-icons left">file_download</i>Download { this.props.dictId }.xml</a>
		</div>
	</div>

	<script>
		export default {
			dictId: '',
			onMounted() {
				this.dictId = this.props.dictId;
				console.log('download dict '+ this.dictId)
				this.props.loadDictDetail();
				console.log(this.props)
				this.update()
			},
		}
	</script>
</dict-download>
