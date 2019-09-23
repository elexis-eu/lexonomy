%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../libs/screenful/screenful.js"></script>
    <link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful.css" />
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
		<link type="text/css" rel="stylesheet" href="../../libs/screenful/screenful-download.css" />
		<script type="text/javascript" src="../../libs/screenful/screenful-download.js"></script>
		<script type="text/javascript">
		Screenful.Download.items=[
			{url: "../../{{dictID}}/download.xml", title: "{{dictID}}.xml"}
		];
		</script>
		<link type="text/css" rel="stylesheet" href="../../furniture/ui.css" />
	</head>
	<body>
		%include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="download", configTitle="", configUrl="", rootPath="../../")
	</body>
</html>
