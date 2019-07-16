%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>User profile</title>
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-userprofile.css" />
		<link type="text/css" rel="stylesheet" href="../furniture/public.css" />
		<script type="text/javascript">
		Screenful.User.loggedin={{!JSON(user["loggedin"])}};
		Screenful.User.username="{{user['email']}}";
		Screenful.User.ske_username="{{user['ske_username']}}";
		Screenful.User.ske_apiKey="{{user['ske_apiKey']}}";
		Screenful.User.oneclick="{{user['apiKey']}}";
		Screenful.User.sketchengineLoginPage="{{siteconfig['sketchengineLoginPage']}}";
		</script>
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-userprofile.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-loc-en.js"></script>
		<script type="text/javascript">
		Screenful.UserProfile.pwdActionUrl="../changepwd.json";
		Screenful.UserProfile.skeUserNameActionUrl="../changeskeusername.json";
		Screenful.UserProfile.skeApiActionUrl="../changeskeapi.json";
		Screenful.UserProfile.returnUrl="{{redirectUrl}}";
		Screenful.UserProfile.oneclickUpdateUrl="../changeoneclickapi.json";
		</script>
	</head>
	<body>
		<div id="header">
			<a class="sitehome" href="../"></a>
		  <div class="email ScreenfulUser"></div>
		</div>
	</body>
</html>
