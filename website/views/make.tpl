%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>Create a dictionary</title>
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful.css" />
    <link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-make.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<link type="text/css" rel="stylesheet" href="../furniture/public.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-make.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-loc-en.js"></script>
		<script type="text/javascript">
		Screenful.Make.suggested="{{suggested}}";
		Screenful.Make.makeUrl="../make.json";
		Screenful.Make.templates=[
			{value: "blank", caption: "(none)"},
			{value: "smd", caption: "Simple Monolingual Dictionary"},
			 {value: "sbd", caption: "Simple Bilingual Dictionary"},
		];
		Screenful.Make.titleHint="Enter a human-readable title such as \"My Esperanto Dictionary\". You will be able to change this later.";
		Screenful.Make.urlHint="This will be your dictionary's address on the web. You will be able to change this later.";
		Screenful.Make.templateHint="You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.";
		Screenful.Make.finishedMessage="Your dictionary is ready.";
		</script>
	</head>
	<body>
		<div id="header">
			<a class="sitehome" href="../"></a>
		  <div class="email ScreenfulUser"></div>
		</div>
	</body>
</html>
