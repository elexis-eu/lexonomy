%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>Screenful Editor</title>
    <link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful.css" />
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-editor.css" />
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../../libs/screenful/screenful-editor.js"></script>
		<script type="text/javascript" src="../../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<link type="text/css" rel="stylesheet" href="../../libs/xonomy/xonomy.css" />
		<script type="text/javascript" src="../../libs/xonomy/xonomy.js"></script>
		<script type="text/javascript" src="../../widgets/user-docspec.js"></script>
		<script type="text/javascript">
		Screenful.Editor.createUrl="../../users/usercreate.json";
		Screenful.Editor.readUrl="../../users/userread.json";
		Screenful.Editor.updateUrl="../../users/userupdate.json";
		Screenful.Editor.deleteUrl="../../users/userdelete.json";
		Screenful.Editor.viewer=function(div, entry){
			var doc=$.parseXML(entry.content);
			var html="<div class='userdata'>";
				html+="<div class='head'>";
					html+="<div class='title'>"+entry.id+"</div>";
					var lastSeen=doc.documentElement.getAttribute("lastSeen");
					if(lastSeen) html+="<div class='subtitle'><span class='label'>LAST SEEN</span> "+lastSeen+"</div>";
					else html+="<div class='subtitle'><span class='label'>LAST SEEN</span> NEVER</div>";
				html+="</div>";
				html+="<div class='body'>";
					var els=doc.getElementsByTagName("dict");
					if(els.length==0) html+="<div class='nojoy'>No dictionaries</div>"; else {
						for(var i=0; i<els.length; i++){
							var el=els[i];
							html+="<div class='dict'><a href='../../"+el.getAttribute("id")+"/' target='_blank'>"+el.getAttribute("title")+"</a> <span class='id'>"+el.getAttribute("id")+"</span></div>";
						}
					}
				html+="</div>";
			html+="</div>";
			$(div).addClass("viewer").html(html);
		};
		Screenful.Editor.editor=function(div, entry){
			Xonomy.lang="en";
			Xonomy.setMode("nerd");
			docSpec.onchange=Screenful.Editor.changed;
			Xonomy.render((entry ? entry.content : "<newUser email='' password=''/>"), div, docSpec);
			if(!Xonomy.keyNav) Xonomy.startKeyNav(document, document.getElementById("container"));
		};
		Screenful.Editor.harvester=function(div){
			return Xonomy.harvest();
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
		</script>
		<style>
		#toolbar #idbox {width: 20em !important;}
		div.userdata {margin: 15px 5px;}
		div.userdata > div.head {background-image: url(../../furniture/user.png); background-position: left center; background-repeat: no-repeat; padding-left: 80px; min-height: 60px; margin-bottom: 20px;}
		div.userdata > div.head > div.title {font-size: 1.5rem; padding-top: 10px;}
		div.userdata > div.head > div.subtitle {margin-top: 10px; color: #666666;}
		div.userdata > div.head > div.subtitle > span.label {margin-right: 0.25em; font-weight: bold;}
		div.userdata > div.body {}
		div.userdata > div.body > div.nojoy {color: #999999;}
		div.userdata > div.body > div.dict {margin-top: 8px;}
		div.userdata > div.body > div.dict a {display: inline-block; font-size: 1rem; padding: 5px 10px; background-color: #4c9ed9; color: #ffffff; border-radius: 4px; text-decoration: none; line-height: 1.5em;}
		div.userdata > div.body > div.dict a:hover {box-shadow: 0px 0px 2px #999999; color: #eeeeee;}
		div.userdata > div.body > div.dict span.id {color: #999999; margin-left: 0.25em;}
		</style>
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
	</body>
</html>
