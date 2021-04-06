<dict-edit-entry>
	<div>
		<!--<div class="row">
			<div class="col s10 offset-s1">
				<h3 class="header">{ this.props.entryId }</a></h3>
			</div>
		</div>-->
		<div class="row">
			<div id="container" class="xonomy-envelope">
				<div id="toolbar"></div>
				<div class="xonomy" id="editor"></div>
				<div id="statusbar"></div>
			</div>
		</div>
		<div class="row">
		</div>
	</div>
	<script>
		export default {
			moreEntries: [],
			entryId: '',
			dictId: '',
			dictConfigs: {},

			onUpdated() {
				console.log('list dict edit entry '+ this.props.dictId+'-'+this.props.entryId)
				this.entryId = this.props.entryId;
				this.dictId = this.props.dictId;
				this.dictConfigs = this.props.dictConfigs;
				$.post("/"+this.dictId+"/entryread.json", {id: this.entryId}, (response) => {
					Screenful.Editor.createUrl="/"+this.dictId+"/entrycreate.json";
					Screenful.Editor.readUrl="/"+this.dictId+"/entryread.json";
					Screenful.Editor.updateUrl="/"+this.dictId+"/entryupdate.json";
					Screenful.Editor.deleteUrl="/"+this.dictId+"/entrydelete.json";
					xema = this.dictConfigs.xema;
					Screenful.Editor.editor=function(div, entry, uneditable){
						Xonomy.lang="en";
						newXml="<entry/>";
						var docSpec=Xematron.xema2docspec(xema, "entry");
						Xonomy.render((entry ? entry : newXml), div, docSpec);
					};
					Screenful.Editor.allowSourceCode=true;
					Screenful.Editor.formatSourceCode=function(str){
						return Screenful.formatXml(str);
					};
					Screenful.Editor.validateSourceCode=function(str){
						return Screenful.isWellFormedXml(str);
					};
					Screenful.Editor.cleanupSourceCode=function(str){
						return Screenful.cleanupXml(str);
					};
					if (response.content != undefined) {
						Screenful.Editor.editor(document.getElementById("editor"), response.content);
						Screenful.Editor.populateToolbar();
						Screenful.Editor.updateToolbar();
					}
				});
			},

		}
	</script>

</dict-edit-entry>

