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
		<script type="text/javascript" src="../../libs/screenful/screenful-loc-en.js"></script>
		<link type="text/css" rel="stylesheet" href="../../libs/node_modules/@kcmertens/xonomy/dist/xonomy.css" />
		<script type="text/javascript" src="../../libs/node_modules/@kcmertens/xonomy/dist/xonomy.js"></script>
		<script type="text/javascript" src="../../widgets/user-docspec.js"></script>
		<script type="text/javascript">
		Screenful.Editor.readUrl="../../dicts/dictread.json";
		Screenful.Editor.viewer=function(div, entry){
			var doc=$.parseXML(entry.content);
			var html="<div class='dictdata'>";
				html+="<div class='head'>";
					var el=doc.documentElement;
					html+="<div class='dict'><a href='../../"+el.getAttribute("id")+"/' target='_blank'>"+el.getAttribute("title")+"</a> <span class='id'>"+el.getAttribute("id")+"</span></div>";
				html+="</div>";
				html+="<div class='body'>";
					var els=doc.getElementsByTagName("user");
					if(els.length==0) html+="<div class='nojoy'>No users</div>"; else {
						for(var i=0; i<els.length; i++){
							var el=els[i];
							html+="<div class='user'>"+el.getAttribute("email")+"</div>";
						}
					}
				html+="</div>";
			html+="</div>";
			$(div).addClass("viewer").html(html);
		};
		</script>
		<style>
		#toolbar #idbox {width: 20em !important;}
		div.dictdata {margin: 15px 5px;}
		div.dictdata > div.head {margin-bottom: 10px;}
		div.dictdata > div.head > div.dict {margin-top: 8px;}
		div.dictdata > div.head > div.dict a {display: inline-block; font-size: 1.25rem; padding: 5px 10px; background-color: #4c9ed9; color: #ffffff; border-radius: 4px; text-decoration: none; line-height: 1.5em;}
		div.dictdata > div.head > div.dict a:hover {box-shadow: 0px 0px 2px #999999; color: #eeeeee;}
		div.dictdata > div.head > div.dict span.id {color: #999999; margin-left: 0.25em;}
		div.userdata > div.body {}
		div.userdata > div.body > div.nojoy {color: #999999;}
		</style>
	</head>
	<body>
	</body>
</html>
