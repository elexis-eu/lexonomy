%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../../libs/screenful/screenful.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../../../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="../../../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
		Screenful.User.loggedin={{!JSON(user["loggedin"])}};
		Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../../../";</script>
		<script type="text/javascript" src="../../../furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-editor.css" />
		<script type="text/javascript" src="../../../libs/screenful/screenful-editor.js"></script>
		<script type="text/javascript" src="../../../widgets/searchability.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../widgets/pillarform.css" />
		<script type="text/javascript" src="../../../widgets/xematron.js"></script>
		<script type="text/javascript">
		var xema={{!JSON(xema)}};
		var titling={{!JSON(titling)}};
		Screenful.Editor.singleton=true;
		Screenful.Editor.entryID="searchability";
		Screenful.Editor.leaveUrl="../../../{{dictID}}/config/";
		Screenful.Editor.readUrl="../../../{{dictID}}/configread.json";
		Screenful.Editor.updateUrl="../../../{{dictID}}/configupdate.json";
		Screenful.Editor.editor=function(div, entry){
			Searchability.change=Screenful.Editor.changed;
			Searchability.render(div, entry.content);
		};
		Screenful.Editor.harvester=function(div){
			return JSON.stringify(Searchability.harvest(div));
		};
		Screenful.Editor.allowSourceCode=true;
		Screenful.Editor.formatSourceCode=function(str){
			return Screenful.formatJson(str);
		};
		Screenful.Editor.validateSourceCode=function(str){
			return Screenful.isWellFormedJson(str);
		};
		Screenful.Editor.cleanupSourceCode=function(str){
			return JSON.parse(str);
		};
		</script>
		<link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />
		%if siteconfig["rtl"]:
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
                %include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle=i18n["Search"], configUrl="searchability", rootPath="../../../")
	</body>
</html>
