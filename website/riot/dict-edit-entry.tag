<dict-edit-entry>
	<div>
		<div class="row">
			<div class="xonomy-envelope">
				<div id="toolbar"></div>
				<div id="container" class="empty"></div>
				<div id="waiter" style="display: none"></div>
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
				if (this.entryId != '') {
					$.post("/"+this.dictId+"/entryread.json", {id: this.entryId}, (response) => {
						console.log('response')
						console.log(response)
						Screenful.Editor.createUrl="/"+this.dictId+"/entrycreate.json";
						Screenful.Editor.readUrl="/"+this.dictId+"/entryread.json";
						Screenful.Editor.updateUrl="/"+this.dictId+"/entryupdate.json";
						Screenful.Editor.deleteUrl="/"+this.dictId+"/entrydelete.json";
						var xema = this.dictConfigs.xema;
						var xemplate = this.dictConfigs.xemplate;
						kex = this.dictConfigs.kex;
						subbing = this.dictConfigs.subbing;
						xampl = this.dictConfigs.xampl;
						thes = this.dictConfigs.thes;
						collx = this.dictConfigs.collx;
						defo = this.dictConfigs.defo;
						var titling = this.dictConfigs.titling;
						var flagging = this.dictConfigs.flagging;
						linking = this.dictConfigs.linking;
						var editing = this.dictConfigs.editing;
						var userAccess = this.props.userAccess;
						var dictId = this.dictId;

						if (editing["_js"]) {
							var customizeEditor = editing["_js"];
							var usingOwnEditor = customizeEditor.editor && customizeEditor.harvester;
						} else {
							var customizeEditor = null;
							var usingOwnEditor = false;
						}

						if (!xemplate[xema.root]) xemplate[xema.root] = {shown: false};
						if (xemplate[xema.root].shown == "false") xemplate[xema.root].shown = false;
						Screenful.Editor.viewer=null;
						if(xemplate._xsl || xemplate._css || xemplate[xema.root].shown) {
							Screenful.Editor.viewer = function (div, entry) {
								if (entry.contentHtml.length == 0) {
									var doc = (new DOMParser()).parseFromString(entry.content, 'text/xml');
									entry.contentHtml = Xemplatron.xml2html(doc, xemplate, xema);
								}
								$(div).addClass("viewer").html(entry.contentHtml);
								$(div).find("a.xref").on("click", function(e){
									var text = $(e.delegateTarget).attr("data-text");
									window.parent.$("#searchbox").val(text);
									window.parent.Screenful.Navigator.list();
								});
							};
						}

						Screenful.Editor.editor = function (div, entry, uneditable) {
							if (!userAccess.canEdit) {
								uneditable = true;
							}
							Xonomy.lang = "en";

							newXml = "";
							if (xema["_xonomyDocSpec"]) {
								var docSpec = xema["_xonomyDocSpec"];
								if (xema["_newXml"]) {
									newXml = xema["_newXml"];
								}
							} else if (xema["_dtd"]) {
								var xmlStructure = parseDTD(xema["_dtd"]);
								var docSpec = struct2Xonomy(xmlStructure);
								newXml = initialDocument(xmlStructure);
							} else {
								var docSpec = Xematron.xema2docspec(xema, editing["xonomyTextEditor"]);
							}
							if (!newXml) {
								newXml = Xematron.xema2xml(xema); 
							}

							docSpec.allowModeSwitching = true;
							docSpec.onModeSwitch = function (mode) {
								Cookies.set("xonomyMode_" + dictId, mode);
								window.parent.$(".doctypes").removeClass("laic");
								window.parent.$(".doctypes").removeClass("nerd");
								window.parent.$(".doctypes").addClass(mode);
							};
							if (!uneditable) {
								docSpec.allowLayby=true;
								docSpec.laybyMessage="This is your temporary lay-by for entry fragments. You can drag and drop XML elements here.";
							}
							Xonomy.setMode(Cookies.get("xonomyMode_" + dictId) || editing["xonomyMode"]);
							Ske.extendDocspec(docSpec, xema);
							Sub.extendDocspec(docSpec, xema);
							Xrefs.extendDocspec(docSpec, xema);
							docSpec.onchange = Screenful.Editor.changed;
							if (uneditable) {
								for (elName in docSpec.elements) docSpec.elements[elName].isReadOnly = true;
								if (docSpec.unknownElement && typeof(docSpec.unknownElement) == "object") docSpec.unknownElement.isReadOnly = true;
								if (docSpec.unknownElement && typeof(docSpec.unknownElement) == "function") {
									var func = docSpec.unknownElement;
									docSpec.unknownElement = function(elName){
										var ret = func(elName);
										ret.isReadOnly = true;
										return ret;
									}
								}
							}

							if (!usingOwnEditor) {
								if (customizeEditor && customizeEditor.adjustDocSpec) customizeEditor.adjustDocSpec(docSpec);
								Xonomy.render((entry ? entry.content : newXml), div, docSpec);
								if(!Xonomy.keyNav) Xonomy.startKeyNav(document, document.getElementById("container"));
							} else {
								customizeEditor.editor(div, entry ? entry : {content: newXml, id: 0}, uneditable);
							}
						};
						Screenful.Editor.harvester=function(div){
							if(!usingOwnEditor){
								return Xonomy.harvest();
							} else {
								return customizeEditor.harvester(div);
							}
						};
						Screenful.Editor.allowSourceCode = true;
						Screenful.Editor.formatSourceCode = function(str) {
							return Screenful.formatXml(str);
						};
						Screenful.Editor.validateSourceCode = function(str) {
							return Screenful.isWellFormedXml(str);
						};
						Screenful.Editor.cleanupSourceCode = function(str) {
							return Screenful.cleanupXml(str);
						};

						// history
						Screenful.History.historyUrl = "/"+this.dictId+"/history.json";
						Screenful.History.isDeletion = function(revision) {
							return revision.action=="delete" || revision.action=="purge";
						};
						Screenful.History.getRevisionID = function(revision) {
							return revision.revision_id;
						};
						Screenful.History.printAction = function(revision) {
							var content = "";
							//actions: delete | create | update | purge
							//historiography: {apikey: apikey} | {uploadStart: uploadStart, filename: filename}
							content += "<div style='white-space: nowrap'>";
							if (revision.action=="create") content += "<b>Created</b>";
							else if (revision.action=="update") content += "<b>Changed</b>";
							else if (revision.action=="delete") content += "<b>Deleted</b>";
							else if (revision.action=="purge") content += "<b>Bulk-deleted</b>";
							if (revision.historiography.uploadStart) content += " while uploading";
							if (revision.historiography.apikey) content += " through API";
							if (revision.historiography.refactoredFrom) content += " as a subentry of <a href='javascript:void(null)' onclick='parent.Screenful.Editor.open(null, "+revision.historiography.refactoredFrom+")'>"+revision.historiography.refactoredFrom+"</a>";
							content += "</div>";
							if (revision.email) content += "<div style='white-space: nowrap'><b>By:</b> "+revision.email+"</div>";
							content += "<div style='white-space: nowrap'><b>When:</b> "+revision.when+"</div>";
							return content;
						};
						Screenful.History.fakeEntry = function(revision) {
							return {id: revision.entry_id, content: revision.content, contentHtml: revision.contentHtml};
						};


						console.log(response)
						if (response.content != undefined) {
							Screenful.Editor.populateToolbar();
							Screenful.status(Screenful.Loc.ready);
							Screenful.Editor.updateToolbar();
							Screenful.Editor.open(null,this.entryId);
						}
					});
				}
			},

		}
	</script>

</dict-edit-entry>

