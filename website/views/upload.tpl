%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
    <link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="../../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../../";</script>
		<script type="text/javascript" src="../../furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-upload.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful-upload.js"></script>
		<script type="text/javascript">
		Screenful.Upload.url="../../{{dictID}}/upload.html";
		</script>
		<link type="text/css" rel="stylesheet" href="../../furniture/ui.css" />
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body>
		%include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="upload", configTitle="", configUrl="", rootPath="../../")
	</body>
</html>
