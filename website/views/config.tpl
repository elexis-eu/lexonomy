%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
    		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful-loc-en.js"></script>
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
	</head>
	<body>
                %include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle="", configUrl="", rootPath="../../")
		<div id="pagebody">
			%if needResave>0:
			<div class="notification">{{needResave}} {{"entry" if needResave==1 else "entries"}} in your dictionary needs to be re-indexed. <a href="../../{{dictID}}/resave/">Do it now&nbsp;»</a></div>
			%end
			<div class="field">
				<div class="signposts">
					<div class="title">Manage dictionary</div>
					<div class="signpost"><a href="../../{{dictID}}/config/ident/">Description</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/users/">Users</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/publico/">Publishing</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/url/">Change URL</a></div>
				</div>
				<div class="signposts">
					<div class="title">Entry settings</div>
					%if hasXemaOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/xema-override/">Structure</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/xema/">Structure</a></div>
					%end
					%if hasXemplateOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/xemplate-override/">Formatting</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/xemplate/">Formatting</a></div>
					%end
					<div class="signpost"><a href="../../{{dictID}}/config/titling/">Headword list</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/searchability/">Searching</a></div>
				</div>
				<div class="signposts expert">
					<div class="title">Expert settings</div>
					%if hasEditingOverride:
					<div class="signpost"><a href="../../{{dictID}}/config/editing-override/">Entry editor</a></div>
					%else:
					<div class="signpost"><a href="../../{{dictID}}/config/editing/">Entry editor</a></div>
					%end
					<div class="signpost"><a href="../../{{dictID}}/config/flagging/">Flags</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/autonumber/">Auto-numbering</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/links/">Linking</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/download/">Download settings</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/subbing/">Subentries</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/gapi/">Google API</a></div>
				</div>
				<div class="signposts sketch">
					<div class="title">Sketch Engine</div>
					<div class="signpost"><a href="../../{{dictID}}/config/kex/">Connection</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/xampl/">Examples</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/collx/">Collocations</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/thes/">Thesaurus items</a></div>
					<div class="signpost"><a href="../../{{dictID}}/config/defo/">Definitions</a></div>
				</div>
				<div class="clear"></div>
			</div>
			<div class="dangerzone">
				<div class="inside">
					<a href="javascript:void(null)" class="destroy" onclick="destroy()">Delete the dictionary</a>
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
