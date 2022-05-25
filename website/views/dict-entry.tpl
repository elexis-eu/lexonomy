%import json
%import re
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>{{re.sub(r"\<[^\<\>]+\>", "", title)}} | {{dictTitle}}</title>
		<meta property="og:title" content="{{re.sub(r"\<[^\<\>]+\>", "", title)}}" />
		<meta property="og:site_name" content="{{dictTitle}}"/>
		<meta property="og:url" content="{{siteconfig["baseUrl"]}}{{dictID}}/{{entryID}}/" />
		<meta name="twitter:url" content="{{siteconfig["baseUrl"]}}{{dictID}}/{{entryID}}/" />
		<meta property="og:image" content="{{siteconfig["baseUrl"]}}furniture/preview.gif" />
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="{{siteconfig["baseUrl"]}}";</script>
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}furniture/public.css" />
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}widgets/xemplatron.js"></script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}widgets/xemplatron.css" />
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}widgets/gmedia.js"></script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}widgets/gmedia.css" />
		<style>
		{{!css}}
		</style>
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body class="entrypage">
		<div id="header">
                        <a class="sitehome" href="../">
%if siteconfig["readonly"]:
<span class="readonly">READ-ONLY</span>
%end
</a>
		  <div class="email ScreenfulUser"></div>
		</div>

		<div class="invelope">
			<div id="dictheader">
				<div class="titleContainer"><span class="dictTitle"><a class="dictTitle" href="{{siteconfig["baseUrl"]}}{{dictID}}/">{{dictTitle}}</a>
%if user["dictAccess"]:
<a href="{{siteconfig["baseUrl"]}}{{dictID}}/edit/" class="editLink">Edit</a>
%end
</span></div>
				<form class="searchContainer" action="{{siteconfig["baseUrl"]}}{{dictID}}/search/" method="GET"><span class="searchbox"><input class="searchbox" name="q"/><input type="submit" class="submit" value="&nbsp;"/></span></form>
			</div>
		</div>

		<div class="midlope">
			<div class="invelope">
				<div id="viewer" class="viewer">{{!html}}</div>
				<div id="nabes">
					%for nabe in nabes:
						<a {{"class=current" if nabe["id"]==entryID else ""}} href="{{siteconfig["baseUrl"]}}{{dictID}}/{{nabe["id"]}}">{{!nabe["title"]}}</a>
					%end
				</div>
				<div class="clear"></div>
			</div>
		</div>

		<script type="text/javascript">
			$("#viewer").find("a.xref").each(function(){
				var $a=$(this);
				$a.attr("href", "../search/?q="+encodeURIComponent($a.attr("data-text")));
			});
		</script>

		<div class="invelope bottom">
			<div id="dictfooter">
				<div class="right"><a href="{{siteconfig["baseUrl"]}}">Lexonomy</a></div>
				<div><a href="{{siteconfig["baseUrl"]}}{{dictID}}/">{{dictTitle}}</a></div>
                                %if "licence" in publico and siteconfig["licences"][publico["licence"]]: 
                                        <a href="{{siteconfig["licences"][publico["licence"]]["url"]}}" target="_blank"><img src="{{siteconfig["baseUrl"]}}/{{siteconfig["licences"][publico["licence"]]["icon"]}}" alt="{{siteconfig["licences"][publico["licence"]]["title"]}}"/></a>
                                %end
                                %if "licence" in publico and siteconfig["licences"][publico["licence"]]["canDownloadXml"]:
					<a class="xml" href="{{siteconfig["baseUrl"]}}{{dictID}}/{{entryID}}.xml" target="_blank">XML</a>
				%end
			</div>
		</div>

                {{!siteconfig["trackingCode"]}}
	</body>
</html>
