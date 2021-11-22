%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>Lexonomy Users</title>
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-navigator.css" />
		<script type="text/javascript" src="../libs/screenful/screenful-navigator.js"></script>
		<script type="text/javascript">
		Screenful.Navigator.listUrl="../users/userlist.json";
		Screenful.Navigator.stepSize=1000;
		Screenful.Navigator.showNumbers=false;
		Screenful.Navigator.sortDesc=false;
		Screenful.Navigator.flags="[]";
		Screenful.Navigator.editorUrl="../users/editor/";
		Screenful.Navigator.renderer=function(div, entry, searchtext){
			var text=entry.title;
			var regexp=new RegExp(searchtext, "gi");
			if(searchtext!="") text=text.replace(regexp, function(match){ return "<span class='searchtext'>"+match+"</span>"; });
			$(div).html(text);
		};
		</script>		
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
		<div id="header" style="padding: 10px 14px; height: 38px; border-bottom: 1px solid #1e6bcf;">
		  <a class="sitehome" href="../"></a>
		  <div class="email ScreenfulUser"></div>
		</div>
	</body>
</html>
