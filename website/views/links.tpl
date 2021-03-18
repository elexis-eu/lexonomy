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
		<link type="text/css" rel="stylesheet" href="../../furniture/ui.css" />
		<style>
		.title {cursor: pointer;}
		</style>
	</head>
	<body>
                %include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="links", configTitle="", configUrl="", rootPath="../../")
		<div id="pagebody">
			<div class="signposts">
				<div class="title">Outgoing links</div>
				<div>
				%for dict in links["out"]:
					<b>→ {{dict}}</b>
					<ul>
					%for link in links["out"][dict]:
						<li>
						%if link["source_hw"] != "":
							<a href="/{{dictID}}/edit/entry/view{{link["source_entry"]}}">{{link["source_hw"]}}</a> ({{link["source_id"]}})
						%else:
							<a href="/{{dictID}}/edit/entry/view{{link["source_entry"]}}">{{link["source_id"]}}</a> 
						%end
						→
						%if link["target_hw"] != "":
							<a href="/{{link["target_dict"]}}/edit/entry/view{{link["target_entry"]}}">{{link["target_hw"]}}</a> ({{link["target_el"]}} {{link["target_id"]}})
						%else:
							<a href="/{{link["target_dict"]}}/edit/entry/view{{link["target_entry"]}}">{{link["target_el"]}} {{link["target_id"]}}</a>
						%end
						</li>
					%end
					</ul>
				%end
				</div>
			</div>
			<div class="signposts">
				<div class="title">Incoming links</div>
				<div>
				%for dict in links["in"]:
					<b>← {{dict}}</b>
					<ul>
					%for link in links["in"][dict]:
						<li>
						%if link["target_hw"]:
							<a href="/{{dictID}}/edit/entry/view{{link["target_entry"]}}">{{link["target_hw"]}}</a> ({{link["target_id"]}}) 
						%else:
							<a href="/{{dictID}}/edit/entry/view{{link["target_entry"]}}">{{link["target_id"]}}</a> 
						%end
						← 
						%if link["source_hw"]:
 							<a href="/{{link["source_dict"]}}/edit/entry/view{{link["source_entry"]}}">{{link["source_hw"]}}</a> ({{link["source_el"]}} {{link["source_id"]}})
						%else:
							<a href="/{{link["source_dict"]}}/edit/entry/view{{link["source_entry"]}}">{{link["source_el"]}} {{link["source_id"]}}</a>
						%end
						</li>
					%end
					</ul>
				%end
				</div>
			</div>
		</div>
	</body>
</html>
