%import json
%import re
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<meta property="og:title" content="{{dictTitle}}" />
		<meta property="og:site_name" content="{{dictTitle}}"/>
		<meta name="description" content="{{re.sub(r"\<[^\<\>]+\>", "", dictBlurb)}}" />
		<meta property="og:description" content="{{re.sub(r"\<[^\<\>]+\>", "", dictBlurb)}}" />
		<meta property="og:url" content="{{siteconfig["baseUrl"]}}{{dictID}}/" />
		<meta name="twitter:url" content="{{siteconfig["baseUrl"]}}{{dictID}}/" />
		<meta property="og:image" content="{{siteconfig["baseUrl"]}}furniture/preview.gif" />
		<script type="text/javascript" src="../libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-loc-en.js"></script>
		<script type="text/javascript" src="../libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="../";</script>
		<script type="text/javascript" src="../furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="../furniture/public.css" />
		%if publico["public"]:
			<script type="text/javascript">
				$(window).ready(random);
				function random(){
					$("#randoms .randomizer").addClass("animated");
					$.ajax({url: "../{{dictID}}/random.json", dataType: "json", method: "POST"}).done(function(data){
						$("#randoms .list").html("");
						if(!data.more && data.entries.length<30) $("#randoms").addClass("short"); else $("#randoms").removeClass("short");
						if(data.more) $("#randoms").addClass("hasMore"); else $("#randoms").removeClass("hasMore");
						for(var i=0; i<data.entries.length; i++){
							var html="<a href='../{{dictID}}/"+data.entries[i].id+"/'>"+data.entries[i].title+"</a> ";
							$("#randoms .list").append(html);
						}
						$("#randoms .randomizer").removeClass("animated");
						$("#randoms").hide().fadeIn();
					});
				}
			</script>
		%end
	</head>
	<body class="homepage">
		<div id="header">
                        <a class="sitehome" href="../">
%if siteconfig["readonly"]:
<span class="readonly">READ-ONLY</span>
%end
</a>
		  <div class="email ScreenfulUser"></div>
		</div>

		<div class="invelope top">
			<div id="dictheader">
				<div class="titleContainer"><span class="dictTitle"><a class="dictTitle" href="../{{dictID}}/">{{dictTitle}}</a>
%if user["dictAccess"]:
<a href="../{{dictID}}/edit/" class="editLink">Edit</a>
%end
</span></div>
				%if publico["public"]:
					<form class="searchContainer" action="../{{dictID}}/search/" method="GET"><span class="searchbox"><input class="searchbox" name="q"/><input type="submit" class="submit" value="&nbsp;"/></span></form>
				%end
			</div>
			<div id="dictblurb" class="{{"centered" if len(re.sub(r"\<[^\<\>]+\>", "", dictBlurb)) < 300 or "\n" in dictBlurb else ""}}">
				{{!dictBlurb}}
			</div>
			%if publico["public"]:
				<div id="randoms">
					<div class="randomizer" onclick="random()"></div>
					<div class="list"></div>
				</div>
			%end
		</div>

		<div class="invelope bottom">
			<div id="dictfooter">
				<div class="right"><a href="../">Lexonomy</a></div>
				<div><a href="{{siteconfig["baseUrl"]}}{{dictID}}/">{{dictTitle}}</a></div>
				%if "licence" in publico and siteconfig["licences"][publico["licence"]]: 
					<a href="{{siteconfig["licences"][publico["licence"]]["url"]}}" target="_blank"><img src="../{{siteconfig["licences"][publico["licence"]]["icon"]}}" alt="{{siteconfig["licences"][publico["licence"]]["title"]}}"/></a>
				%end
			</div>
		</div>

		{{!siteconfig["trackingCode"]}}
	</body>
</html>
