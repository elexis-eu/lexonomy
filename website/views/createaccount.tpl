%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		% include("head.tpl")
		<title>Create your account</title>
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful.css" />
    <link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-createaccount.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<link type="text/css" rel="stylesheet" href="../furniture/public.css" />
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-createaccount.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-loc-en.js"></script>
		<script type="text/javascript">
		Screenful.CreateAccount.actionUrl="../createaccount.json";
		Screenful.CreateAccount.returnUrl="{{redirectUrl}}";
		Screenful.CreateAccount.token="{{token}}";
		Screenful.CreateAccount.tokenValid={{!JSON(tokenValid)}};
		</script>
	</head>
	<body>
		<div id="header">
			<a class="sitehome" href="../"></a>
		  <div class="email ScreenfulUser"></div>
		</div>
	</body>
</html>
