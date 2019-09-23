%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="../../../libs/screenful/screenful.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful.css" />
		<script type="text/javascript" src="../../../libs/screenful/screenful-loc-en.js"></script>
		<script type="text/javascript" src="../../../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
		Screenful.User.loggedin={{!JSON(user["loggedin"])}};
		Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../../../";</script>
		<script type="text/javascript" src="../../../furniture/screenful-user-config.js"></script>

		<link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-move.css" />
		<script type="text/javascript" src="../../../libs/screenful/screenful-move.js"></script>
		<script type="text/javascript">
		Screenful.Move.current="{{dictID}}";
		Screenful.Move.actionUrl="../../../{{dictID}}/move.json";
		Screenful.Move.finishedMessage="Your dictionary has been moved to a new URL.";
		</script>


		<link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />
	</head>
	<body>
                %include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle="Name and description", configUrl="ident", rootPath="../../../")
	</body>
</html>
