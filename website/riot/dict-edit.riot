<dict-edit>
	<div class="row">
		<div class="col s10 offset-s1">
			<h3 class="header">{ this.props.dictDetails.title }</h3>
		</div>
	</div>
	<div if={ this.doctypes.length > 1 } class="row doctypes">
		<div class="col s12">
			<ul class="tabs">
				<li each={ type in this.doctypes } active={ type == this.doctype } class="tab col s2"><a onclick={ doChangeDoctype } doctype={ type }>{ type }</a></li>
			</ul>
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
			<dict-edit-entry  entryId={ this.selectedEntry } selectedId={ this.selectedId } dictId={ this.dictId } dictConfigs={ this.props.dictConfigs } userAccess={ this.props.userAccess } userInfo={ this.props.userInfo } userDicts={ this.userDicts }></dict-entry-edit>
		</div>

	</div>

	<script>
		export default {
			dictId: '',
			dictConfigs: {},
			doctype: 'entry',
			doctypes: ['entry'],
			entryList: [],
			entryCount: 0,
			selectedEntry: '',
			selectedId: '',
			userDicts: [],

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

			doChangeDoctype(e) {
				var newdoctype = e.target.getAttribute('doctype');
				if (newdoctype != this.doctype) {
					this.doctype = newdoctype;
					route("/"+this.dictId+"/edit/"+newdoctype);
					this.loadList();
					this.update();
				}
			},

			onMounted() {
				this.dictId = this.props.dictId;
				this.doctype = this.props.doctype;
				this.doctypes = this.props.doctypes;
				console.log('list edit dict '+ this.dictId + this.doctype + this.props.entryId)
				this.props.loadDictDetail();
				this.loadList();
				$.get("/userdicts.json", (response) => {
					this.userDicts = response.dicts;
				});
			},

			onUpdated() {
				this.doctypes = this.props.doctypes;
				if (this.props.entryId && this.props.entryId != "") {
					this.selectedId = this.props.entryId;
				}
				console.log('list edit dict update'+ this.dictId+this.doctype+this.props.entryId)
				$('select').formSelect();
				$('select').siblings('input').attr("data-constrainwidth", false);
				console.log(this.doctypes)
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
	.doctypes {
		margin-bottom: 0px;
	}
	li.tab[active] {
		background-color: transparent;
		color: #ee6e73;
		border-bottom: 2px solid;
	}
	li.tab a {
		cursor: pointer;
	}
	</style>
</dict-edit>

