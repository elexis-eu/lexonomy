<dict-edit-entry>
	<div>
		<div class="row">
			<div class="col s10 offset-s1">
				<h3 class="header">{ this.props.entryId }</a></h3>
			</div>
		</div>
		<div class="row">
			<div class="xonomy" id="editor"></div>
		</div>
	</div>
	<script>
		export default {
			moreEntries: [],
			entryId: '',
			dictId: '',

			onUpdated() {
				console.log('list dict edit entry '+ this.props.dictId+'-'+this.props.entryId)
				this.entryId = this.props.entryId;
				this.dictId = this.props.dictId;
				console.log(this.props)
				Screenful.Editor.createUrl="/"+this.dictId+"/entrycreate.json";
				Screenful.Editor.readUrl="/"+this.dictId+"/entryread.json";
				Screenful.Editor.updateUrl="/"+this.dictId+"/entryupdate.json";
				Screenful.Editor.deleteUrl="/"+this.dictId+"/entrydelete.json";
				Screenful.Editor.editor=function(div, entry, uneditable){
		      Xonomy.lang="en";
					newXml="<entry/>";
					xema = {"root": "entry", "elements": {"entry": {"filling": "chd", "values": [], "children": [{"name": "word_cz", "min": 1, "max": 1, "rec": 0}, {"name": "word_en", "min": 0, "max": 0, "rec": 0}, {"name": "word_de", "min": 0, "max": 0, "rec": 0}, {"name": "word_fr", "min": 0, "max": 0, "rec": 0}, {"name": "word_sp", "min": 0, "max": 0, "rec": 0}, {"name": "word_ru", "min": 0, "max": 0, "rec": 0}, {"name": "var", "min": 0, "max": 0, "rec": 0}, {"name": "styl", "min": 0, "max": 1, "rec": 0}, {"name": "def", "min": 0, "max": 0, "rec": 0}, {"name": "def_en", "min": 0, "max": 0, "rec": 0}, {"name": "examples", "min": 0, "max": 1, "rec": 0}, {"name": "reference", "min": 0, "max": 0, "rec": 0}, {"name": "comment", "min": 0, "max": 0, "rec": 0}, {"name": "files", "min": 0, "max": 1, "rec": 0}, {"name": "src", "min": 0, "max": 1, "rec": 0}], "attributes": {}}, "word_cz": {"filling": "txt", "children": [], "attributes": {}}, "word_en": {"filling": "txt", "children": [], "attributes": {}}, "word_de": {"filling": "txt", "children": [], "attributes": {}}, "word_fr": {"filling": "txt", "children": [], "attributes": {}}, "word_sp": {"filling": "txt", "children": [], "attributes": {}}, "word_ru": {"filling": "txt", "children": [], "attributes": {}}, "var": {"filling": "txt", "children": [], "attributes": {}}, "styl": {"filling": "lst", "children": [], "attributes": {}, "values": [{"value": "odborn\u00fd term\u00edn", "caption": "odborn\u00fd term\u00edn"}, {"value": "standard", "caption": "standard"}, {"value": "slang", "caption": "slang"}, {"value": "zastaral\u00e9", "caption": "zastaral\u00e9"}, {"value": "sporn\u00e9", "caption": "sporn\u00e9"}]}, "def": {"filling": "txt", "children": [], "attributes": {}}, "def_en": {"filling": "txt", "children": [], "attributes": {}}, "examples": {"filling": "chd", "children": [{"name": "example", "min": 0, "max": 0, "rec": 0}], "attributes": {}}, "example": {"filling": "txt", "children": [], "attributes": {}}, "reference": {"filling": "chd", "children": [], "attributes": {}}, "comment": {"filling": "chd", "children": [], "attributes": {}}, "files": {"filling": "med", "children": [], "attributes": {}}, "src": {"filling": "lst", "children": [], "attributes": {}, "values": [{"value": "IS", "caption": "IS"}, {"value": "glos\u00e1\u0159", "caption": "glos\u00e1\u0159"}]}}}
					var docSpec=Xematron.xema2docspec(xema, "entry");
					console.log(docSpec)
	        Xonomy.render((entry ? entry.content : newXml), div, docSpec);
				};
				Screenful.Editor.editor(document.getElementById("editor"));
			},

		}
	</script>

</dict-edit-entry>

