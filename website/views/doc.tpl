%import json
%import markdown
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>{{doc["title"]}}</title>
		<meta property="og:title" content="{{doc["title"]}}" />
		<meta property="og:site_name" content="Lexonomy"/>
		<meta property="og:url" content="{{siteconfig["baseUrl"]}}/docs/{{doc["id"]}}/" />
		<meta name="twitter:url" content="{{siteconfig["baseUrl"]}}/docs/{{doc["id"]}}/" />
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
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
		<link type="text/css" rel="stylesheet" href="../../furniture/public.css" />
		<link type="text/css" rel="stylesheet" href="../../furniture/github-markdown.css" />
	</head>
	<body class="doc">
		<div id="header">
                        <a class="sitehome" href="../">
%if siteconfig["readonly"]:
<span class="readonly">READ-ONLY</span>
%end
</a>
		  <div class="email ScreenfulUser"></div>
		</div>


		<div class="invelope top">
			<div class="markdown">
				<div class="markdown-body">
					{{!doc["html"]}}
				</div>
			</div>
			<div class="clear"></div>
		</div>


		<div class="invelope bottom">
			<div id="sitefooter">
				<div class="right"><a href="https://github.com/elexis-eu/lexonomy" class="github" title="GitHub" target="_blank"></a></div>
				<div>Lexonomy is developed as part of <a href="https://elex.is/">ELEXIS</a> project.</div>
				<div class="logolint">
					<a class="muni" target="_blank" href="https://www.muni.cz/" title="Masaryk University"></a>
					<a class="ske" target="_blank" href="https://www.sketchengine.co.uk/" title="Sketch Engine"></a>
				</div>
			</div>
		</div>

		{{siteconfig["trackingCode"]}}
	</body>
</html>
