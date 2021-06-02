<dict-config>
	<dict-config-nav dictId={ this.dictId } dictTitle={ this.props.dictDetails.title }/>
	<div class="row">
		<div class="col s10 offset-s1">
			<div class="row">
				<div class="col s3">
					<h5 class="header">Manage dictionary</h5>
					<div class="collection">
						<a href="#/{ this.dictId }/config/ident" class="collection-item">Description</a>
						<a href="#/{ this.dictId }/config/users" class="collection-item">Users</a>
						<a href="#/{ this.dictId }/config/publico" class="collection-item">Publishing</a>
						<a href="#/{ this.dictId }/config/url" class="collection-item">Change URL</a>
					</div>
				</div>
				<div class="col s3">
					<h5 class="header">Entry settings</h5>
					<div class="collection">
						<a if={ !this.props.dictDetails.xemaOverride } href="#/{ this.dictId }/config/xema" class="collection-item">Structure</a>
						<a if={ this.props.dictDetails.xemaOverride } href="#/{ this.dictId }/config/xema-override" class="collection-item">Structure</a>
						<a if={ !this.props.dictDetails.xemplateOverride } href="#/{ this.dictId }/config/xemplate" class="collection-item">Formatting</a>
						<a if={ this.props.dictDetails.xemplateOverride } href="#/{ this.dictId }/config/xemplate-override" class="collection-item">Formatting</a>
						<a href="#/{ this.dictId }/config/titling" class="collection-item">Headword list</a>
						<a href="#/{ this.dictId }/config/searchability" class="collection-item">Searching</a>
					</div>
				</div>
				<div class="col s3">
					<h5 class="header">Expert settings</h5>
					<div class="collection">
						<a if={ !this.props.dictDetails.editingOverride } href="#/{ this.dictId }/config/editing" class="collection-item">Entry editor</a>
						<a if={ this.props.dictDetails.editingOverride } href="#/{ this.dictId }/config/editing-override" class="collection-item">Entry editor</a>
						<a href="#/{ this.dictId }/config/flagging" class="collection-item">Flags</a>
						<a href="#/{ this.dictId }/config/autonumber" class="collection-item">Auto-numbering</a>
						<a href="#/{ this.dictId }/config/links" class="collection-item">Manual linking</a>
						<a href="#/{ this.dictId }/config/download" class="collection-item">Download settings</a>
						<a href="#/{ this.dictId }/config/subbing" class="collection-item">Subentries</a>
					</div>
				</div>
				<div class="col s3">
					<h5 class="header">Sketch Engine</h5>
					<div class="collection">
						<a href="#/{ this.dictId }/config/kex" class="collection-item">Connection</a>
						<a href="#/{ this.dictId }/config/xampl" class="collection-item">Examples</a>
						<a href="#/{ this.dictId }/config/collx" class="collection-item">Collocations</a>
						<a href="#/{ this.dictId }/config/thes" class="collection-item">Thesaurus items</a>
						<a href="#/{ this.dictId }/config/defo" class="collection-item">Definitions</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<script>
		export default {
			dictId: '',
			onMounted() {
				this.dictId = this.props.dictId;
				console.log('config dict '+ this.dictId)
				this.props.loadDictDetail();
				console.log(this.props)
				this.update()
			},
		}
	</script>
</dict-config>
