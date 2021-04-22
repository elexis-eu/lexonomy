<dict-edit>
	<div class="row">
		<div class="col s10 offset-s1">
			<h3 class="header">{ this.props.dictDetails.title }</h3>
		</div>
	</div>
	<div class="divider"></div>
	<div class="row">
		<div class="col s3">
			<div class="row">
				<input type="text" id="searchBox" placeholder="search" class="col s6" onkeypress={ runSearch }/>
				<div class="col s3">
				<div class="input-field">
					<select id="searchType">
						<option value="" disabled selected>?</option>
						<option value="start">starts like this</option>
						<option value="exact">is exactly</option>
						<option value="wordstart">contains a word that starts like this</option>
						<option value="substring">contains this sequence of characters</option>
					</select>
				</div>
			</div>
			</div>
			<div class="entry-list collection">
				<list-headword each={ entry in this.entryList } entryData={ entry } active={entry.id == this.props.entryId} change-entry-edit={ changeEntryEdit }/>
			</div>
		</div>
		<div class="col s9">
			<dict-edit-entry  entryId={ this.selectedEntry } dictId={ this.dictId } dictConfigs={ this.props.dictConfigs } userAccess={ this.props.userAccess }></dict-entry-edit>
		</div>

	</div>

	<script>
		export default {
			dictId: '',
			dictConfigs: {},
			doctype: 'entry',
			entryList: [],
			entryCount: 0,
			selectedEntry: '',

			loadList() {
				var searchtext = '';
				var modifier = 'start';
				if ($('#searchType').val() != null) {
					modifier = $('#searchType').val();
				}
				if ($('#searchBox').val() != '') {
					searchtext = $('#searchBox').val();
				}
				$.post("/" + this.dictId + "/" + this.doctype + "/entrylist.json", {searchtext: searchtext, modifier: modifier, howmany: 100}, (response) => {
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

			runSearch(e) {
				if (e.keyCode == 13) {
					this.loadList();
				}
			},

			onMounted() {
				this.dictId = this.props.dictId;
				console.log('list edit dict '+ this.dictId)
				this.props.loadDictDetail();
				this.loadList();
			},

			onUpdated() {
				console.log('list edit dict update'+ this.dictId)
				$('select').formSelect();
				$('select').siblings('input').attr("data-constrainwidth", false);
			}
		}
	</script>

	<style>
	ul.select-dropdown, ul.dropdown-content {
		width: 200% !important;
	  li > span {
		  white-space: nowrap;
	  }
	}
	.entry-list {
		max-height: 80%;
		overflow-y: auto;
	}
	</style>
</dict-edit>

