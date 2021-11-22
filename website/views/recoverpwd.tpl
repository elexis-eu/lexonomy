%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>Reset your password</title>
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful.css" />
    <link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-recoverpwd.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<link type="text/css" rel="stylesheet" href="../furniture/public.css" />
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-recoverpwd.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript">
		Screenful.RecoverPwd.actionUrl="../recoverpwd.json";
		Screenful.RecoverPwd.returnUrl="{{redirectUrl}}";
		Screenful.RecoverPwd.token="{{token}}";
		Screenful.RecoverPwd.tokenValid={{!JSON(tokenValid)}};
		</script>
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
		<div id="header">
			<a class="sitehome" href="../"></a>
		  <div class="email ScreenfulUser"></div>
		</div>
	</body>
</html>
