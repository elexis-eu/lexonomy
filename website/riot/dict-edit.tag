<dict-edit>
	<div class="row">
		<div class="col s10 offset-s1">
			<h3 class="header">{ this.props.dictDetails.title }</h3>
		</div>
	</div>
	<div class="divider"></div>
	<div class="row">
		<div class="col s3">
			<div class="entry-list collection">
				<list-headword each={ entry in this.entryList } entryData={ entry } active={entry.id == this.props.entryId} change-entry-edit={ changeEntryEdit }/>
			</div>
		</div>
		<div class="col s9">
			<dict-edit-entry if={ this.selectedEntry != "" } entryId={ this.selectedEntry } dictId={ this.dictId } dictConfigs={ this.props.dictConfigs }></dict-entry-edit>
		</div>

	</div>

	<script>
		export default {
			dictId: '',
			dictConfigs: {},
			doctype: 'entry',
			entryList: [],
			entryCount: 0,
			selectedEntry: "628",

			loadList() {
				$.post("/" + this.dictId + "/" + this.doctype + "/entrylist.json", {searchtext: '', modifier: 'start', howmany: 10}, (response) => {
					console.log(response)
					this.entryList = response.entries;
					this.entryCount = response.total;
					this.update();
				});
			},

			changeEntryEdit(i) {
				console.log('onclick')
				console.log(i)
				//$('#editor').html(i)
				this.selectedEntry = i;
				this.update();
			},

			onMounted() {
				this.dictId = this.props.dictId;
				console.log('list edit dict '+ this.dictId)
				this.props.loadDictDetail();
				this.loadList();
			},

			onUpdated() {
				console.log('list edit dict update'+ this.dictId)
			}
		}
	</script>

	<style>
	</style>
</dict-edit>

