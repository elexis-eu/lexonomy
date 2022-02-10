%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
    	<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="../../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../../";</script>
		<script type="text/javascript" src="../../furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="../../furniture/ui.css" />
		<style>
		.title {cursor: pointer;}
		</style>
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
                %include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle="", configUrl="", rootPath="../../")
		<div id="pagebody">
			%if needResave>0:
			<div class="notification">{{needResave}} {{"entry" if needResave==1 else "entries"}} in your dictionary needs to be re-indexed. <a href="../../{{dictID}}/resave/">Do it now&nbsp;»</a></div>
			%end
			<div class="field">
				<div class="signposts">
					<div class="title">{{i18n["Manage dictionary"]}}</div>
					<div class="signpost"><a href="../../{{dictID}}/config/ident/">{{i18n["Description"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/users/">{{i18n["Users"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/publico/">{{i18n["Publishing"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/url/">{{i18n["Change URL"]}}</a></div>
				</div>
				<div class="signposts">
					<div class="title">{{i18n["Entry settings"]}}</div>
					%if hasXemaOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/xema-override/">{{i18n["Structure"]}}</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/xema/">{{i18n["Structure"]}}</a></div>
					%end
					%if hasXemplateOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/xemplate-override/">{{i18n["Formatting"]}}</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/xemplate/">{{i18n["Formatting"]}}</a></div>
					%end
					<div class="signpost"><a href="../../{{dictID}}/config/titling/">{{i18n["Headword list"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/searchability/">{{i18n["Searching"]}}</a></div>
				</div>
				<div class="signposts expert">
					<div class="title">{{i18n["Expert settings"]}}</div>
					%if hasEditingOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/editing-override/">{{i18n["Entry editor"]}}</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/editing/">{{i18n["Entry editor"]}}</a></div>
					%end
					<div class="signpost"><a href="../../{{dictID}}/config/flagging/">{{i18n["Flags"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/autonumber/">{{i18n["Auto-numbering"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/links/">{{i18n["Linking"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/download/">{{i18n["Download settings"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/subbing/">{{i18n["Subentries"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/gapi/">{{i18n["Multimedia API"]}}</a></div>
				</div>
				<div class="signposts sketch">
					<div class="title">{{i18n["Sketch Engine"]}}</div>
					<div class="signpost"><a href="../../{{dictID}}/config/kex/">{{i18n["Connection"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/xampl/">{{i18n["Examples"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/collx/">{{i18n["Collocations"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/thes/">{{i18n["Thesaurus items"]}}</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/defo/">{{i18n["Definitions"]}}</a></div>
				</div>
				<div class="clear"></div>
			</div>
			<div class="dangerzone">
				<div class="inside">
					<a href="javascript:void(null)" class="destroy" onclick="destroy()">{{i18n["Delete the dictionary"]}}</a>
					<script type="text/javascript">
					function destroy(){
						if(confirm("Careful now! You will not be able to undo this.")){
							$.ajax({url: "../../{{dictID}}/destroy.json", dataType: "json", method: "POST", data: {}}).done(function(data){
								if(data.success) window.location="../../";
							});
						}
					}
					</script>
				</div>
			</div>
		</div>
	</body>
</html>
