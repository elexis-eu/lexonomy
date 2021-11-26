%import json,re
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
		<script type="text/javascript" src="../../../widgets/editing.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../widgets/pillarform.css" />
		<script type="text/javascript">
		var siteconfig={{!re.sub(r"\<","&lt;",JSON(siteconfig))}};
		Screenful.Editor.singleton=true;
		Screenful.Editor.entryID="editing";
		Screenful.Editor.leaveUrl="../../../{{dictID}}/config/";
		Screenful.Editor.readUrl="../../../{{dictID}}/configread.json";
		Screenful.Editor.updateUrl="../../../{{dictID}}/configupdate.json";
		Screenful.Editor.editor=function(div, entry){
			Editing.change=Screenful.Editor.changed;
			if(!entry.content.xonomyMode) entry.content.xonomyMode="nerd";
			if(!entry.content.xonomyTextEditor) entry.content.xonomyTextEditor="askString";
			Editing.render(div, entry.content);
			if(entry.content._js) { //the user is disabling any entry editor customizations
				delete entry.content._js;
				delete entry.content._css;
				window.setTimeout(Screenful.Editor.changed, 100);
			}
		};
		Screenful.Editor.harvester=function(div){
			return JSON.stringify(Editing.harvest(div));
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
		Screenful.Editor.toolbarLinks=[
			{image: "../../../furniture/cog.png", caption: "Customize entry editor...", href: "../../../{{dictID}}/config/editing-override/"}
		];
		</script>
		<link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />		
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
                %include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle=i18n["Entry editor"], configUrl="editing", rootPath="../../../")
	</body>
</html>
