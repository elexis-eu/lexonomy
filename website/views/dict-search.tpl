%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>{{q}} | {{dictTitle}}</title>
		<meta property="og:title" content="{{q}}" />
		<meta property="og:site_name" content="{{dictTitle}}"/>
		<meta property="og:url" content={{siteconfig["baseUrl"]}}{{dictID}}/?q={{q}}" />
		<meta name="twitter:url" content={{siteconfig["baseUrl"]}}{{dictID}}/?q={{q}}" />
		<meta property="og:image" content={{siteconfig["baseUrl"]}}furniture/preview.gif" />
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
		<script type="text/javascript" src="../../widgets/xematron.js"></script>
		<script type="text/javascript" src="../../widgets/xemplatron.js"></script>
		<link type="text/css" rel="stylesheet" href="../../widgets/xemplatron.css" />
		<script type="text/javascript">
			$(window).ready(function(){
				var regexp=new RegExp("{{q}}", "gi");
				$("#crossroads > div > a").each(function(){
					var text=$(this).html();
					var $text=$("<span>"+text+"</span>");
					$text.find("span.headword, span.redirector").each(function(){
						var $this=$(this);
						$this.html($this.html().replace(regexp, function(match){ return "<span class='searchtext'>"+match+"</span>"; }));
					});
					$(this).html($text.html());
				});
			});
		</script>
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
<a href="../../{{dictID}}/edit/" class="editLink">Edit</a>
%end
</span></div>
				<form class="searchContainer" action="../../{{dictID}}/search/" method="GET"><span class="searchbox"><input class="searchbox" name="q" value="{{q}}"/><input type="submit" class="submit" value="&nbsp;"/></span></form>
			</div>
		</div>

		<div class="midlope">
			<div class="invelope">
				<div id="crossroads">
					%if len(entries)==0:
					<div class="nojoy">?</div>
					%end
					%for e in entries:
						<div>
							<a href="../../{{dictID}}/{{e["id"]}}/"><span class="bullet">»</span>&nbsp;{{!e["title"]}}</a>
						</div>
					%end
				</div>
				<div id="nabes">
					%for n in nabes:
						<a href="../../{{dictID}}/{{n["id"]}}/">{{!n["title"]}}</a>
					%end
				</div>
				<div class="clear"></div>
			</div>
		</div>

		<div class="invelope bottom">
			<div id="dictfooter">
				<div class="right"><a href="../../">Lexonomy</a></div>
				<div><a href="../../{{dictID}}/">{{dictTitle}}</a></div>
                                %if "licence" in publico and siteconfig["licences"][publico["licence"]]: 
                                        <a href="{{siteconfig["licences"][publico["licence"]]["url"]}}" target="_blank"><img src="../{{siteconfig["licences"][publico["licence"]]["icon"]}}" alt="{{siteconfig["licences"][publico["licence"]]["title"]}}"/></a>
                                %end

			</div>
		</div>

                {{siteconfig["trackingCode"]}}
	</body>
</html>
