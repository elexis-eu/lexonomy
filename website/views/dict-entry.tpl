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
		<script type="text/javascript" src="../../widgets/xemplatron.js"></script>
		<link type="text/css" rel="stylesheet" href="../../widgets/xemplatron.css" />
		<style>
		{{!css}}
		</style>
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
				<div class="titleContainer"><span class="dictTitle"><a class="dictTitle" href="../../{{dictID}}/">{{dictTitle}}</a>
%if user["dictAccess"]:
<a href="../../<%=dictID%>/edit/" class="editLink">Edit</a>
%end
</span></div>
				<form class="searchContainer" action="../../{{dictID}}/search/" method="GET"><span class="searchbox"><input class="searchbox" name="q"/><input type="submit" class="submit" value="&nbsp;"/></span></form>
			</div>
		</div>

		<div class="midlope">
			<div class="invelope">
				<div id="viewer" class="viewer">{{!html}}</div>
				<div id="nabes">
					%for nabe in nabes:
						<a {{"class=current" if nabe["id"]==entryID else ""}} href="../../{{dictID}}/{{nabe["id"]}}">{{!nabe["title"]}}</a>
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
				<div class="right"><a href="../../">Lexonomy</a></div>
				<div><a href="../../{{dictID}}/">{{dictTitle}}</a></div>
                                %if "licence" in publico and siteconfig["licences"][publico["licence"]]: 
                                        <a href="{{siteconfig["licences"][publico["licence"]]["url"]}}" target="_blank"><img src="../../{{siteconfig["licences"][publico["licence"]]["icon"]}}" alt="{{siteconfig["licences"][publico["licence"]]["title"]}}"/></a>
                                %end
                                %if "licence" in publico and siteconfig["licences"][publico["licence"]]["canDownloadXml"]:
					<a class="xml" href="../../{{dictID}}/{{entryID}}.xml" target="_blank">XML</a>
				%end
			</div>
		</div>

                {{siteconfig["trackingCode"]}}
	</body>
</html>
