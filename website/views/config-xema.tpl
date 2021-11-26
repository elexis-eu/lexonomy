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
		<script type="text/javascript" src="../../../widgets/xema-designer.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../widgets/xema-designer.css" />
		<script type="text/javascript">
		Screenful.Editor.singleton=true;
		Screenful.Editor.entryID="xema";
		Screenful.Editor.leaveUrl="../../../{{dictID}}/config/";
		Screenful.Editor.readUrl="../../../{{dictID}}/configread.json";
		Screenful.Editor.updateUrl="../../../{{dictID}}/configupdate.json";
		Screenful.Editor.editor=function(div, entry){
			XemaDesigner.start(entry.content);
			XemaDesigner.onchange=Screenful.Editor.changed;
			if(entry.content._xonomyDocSpec) { //the user is switching back from own schema
				delete entry.content._xonomyDocSpec;
				delete entry.content._newXml;
				window.setTimeout(Screenful.Editor.changed, 100);
			}
			if(entry.content._dtd) { //the user is switching back from DTD
				delete entry.content._dtd;
				window.setTimeout(Screenful.Editor.changed, 100);
			}
		};
		Screenful.Editor.harvester=function(div){
			for(var el in XemaDesigner.xema.elements){
				for(var prop in XemaDesigner.xema.elements[el]){
					if(prop.indexOf("_")==0) delete XemaDesigner.xema.elements[el][prop];
				}
			}
			return JSON.stringify(XemaDesigner.xema);
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
			{image: "../../../furniture/cog.png", caption: "Use your own schema...", href: "../../../{{dictID}}/config/xema-override/"}
		];
		</script>
		<link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />
		%if siteconfig["rtl"]:
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
                %include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle=i18n["Entry structure"], configUrl="xema", rootPath="../../../")
	</body>
</html>
