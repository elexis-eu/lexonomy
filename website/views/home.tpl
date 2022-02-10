%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>Lexonomy</title>
		<meta property="og:title" content="Lexonomy" />
		<meta property="og:site_name" content="Lexonomy"/>
		<meta name="description" content="A platform for writing and publishing dictionaries" />
		<meta property="og:description" content="A platform for writing and publishing dictionaries" />
		<meta property="og:image" content="{{siteconfig["baseUrl"]}}furniture/preview.gif" />
		<meta property="og:url" content="{{siteconfig["baseUrl"]}}" />
		<meta name="twitter:url" content="{{siteconfig["baseUrl"]}}" />
		<script type="text/javascript" src="libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		<script type="text/javascript" src="libs/screenful/screenful-user.js"></script>
		<link type="text/css" rel="stylesheet" href="libs/screenful/screenful-user.css" />
		<link type="text/css" rel="stylesheet" href="libs/screenful/screenful-theme-blue.css" />
		<script type="text/javascript">
                Screenful.User.loggedin={{!JSON(user["loggedin"])}};
                Screenful.User.username="{{user['email']}}";
		</script>
		<script type="text/javascript">var rootPath="";</script>
		<script type="text/javascript" src="furniture/screenful-user-config.js"></script>
		<link type="text/css" rel="stylesheet" href="furniture/public.css" />
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body class="sitehome">
		<div id="header">
                        <a class="sitehome" href="../">
%if siteconfig["readonly"]:
<span class="readonly">READ-ONLY</span>
%end
</a>
		  <div class="email ScreenfulUser"></div>
		</div>

		<div class="invelope top">
			<div class="leftie">
				<div class="welcome">
					{{!siteconfig["welcome"]}}
				</div>
			</div>
			<div class="rightie">
				%if siteconfig["readonly"]:
					<div class="readonly">
						<div class="readonlyTitle">READ-ONLY</div>
						Lexonomy is undergoing maintenance and is currently in read-only mode.
						Normal operation will resume as soon as possible.
						Sorry for the inconvenience.
					</div>
				%else:
					%if not user["loggedin"]:
						<div class="usertop">
							<div class="title">{{i18n["Registered user login"]}}</div>
							<div class="subtitle"><a href="signup/">{{i18n["Get an account"]}}</a> | <a href="forgotpwd/">{{i18n["Forgot your password?"]}}</a></div>
						</div>
						<form id="login" onsubmit="return false">
							<div class="field email"><div class="label">{{i18n["E-mail address"]}}</div><input class="textbox email"/></div>
							<div class="field password"><div class="label">{{i18n["Password"]}}</div><input class="textbox password" type="password"/></div>
							<div class="field submit"><button>{{i18n["Log in"]}}</button></div>
							<div class="error" style="display: none">{{i18n["Invalid e-mail address or password."]}}</div>
						</form>
						<script type="text/javascript">
						$(window).ready(function(){
							$("form#login").on("submit", function(e){
					      var email=$("form#login div.field.email input").val();
					      var password=$("form#login div.field.password input").val();
					      if(email!="" && password!="") {
									$.ajax({url: "login.json", dataType: "json", method: "POST", data: {email: email, password: password}}).done(function(data){
							      if(data.success) window.location.reload();
							      else $("form#login div.error").show();
							    });
								}
					      return false;
					    });
						});
						</script>
						<div class="orline"><span>{{i18n["Other ways to log in"]}}</span></div>
            %if error != "":
                <div class="error">{{i18n["Sketch Engine login error:"]}} {{error}}</div>
            %end
            %if siteconfig["sketchengineLoginPage"]:
            <div class="skelogin">
              <a href="{{siteconfig["sketchengineLoginPage"]}}">{{i18n["Sign up or log in with"]}} <img style="width:105px;height:39px;" alt="Sketch Engine" title="Sketch Engine" src="furniture/logo_ske.png"/> »</a>
            </div>
            %end
					%else:
						<div class="usertop">
							<div class="title">{{user["email"]}}</div>
							<div class="subtitle"><a href="logout/">{{i18n["Log out"]}}</a> | <a href="userprofile/">{{i18n["Your profile"]}}</a></div>
						</div>
						<div class="yourdicts">{{i18n["Your dictionaries"]}}</div>
						%for dict in dicts:
							<div class="dict" id="dict_{{dict["id"]}}">
								%if dict.get("broken"):
								<img src="/furniture/cancel.png"/>
								%end
								<a class="dictTitle" href="{{dict["id"]}}/">{{dict["title"]}}</a>
								%if dict.get("currentUserCanDelete"):
                                                                    <a class="dictAction" href="javascript:void(null)" onclick="destroyDict('{{dict["id"]}}')">{{i18n["Delete"]}}</a>
                                                                %end
								<a class="dictAction" href="javascript:void(null)" onclick="cloneDict('{{dict["id"]}}')">{{i18n["Clone"]}}</a>
							</div>
						%end
						<script type="text/javascript">
						function destroyDict(dictID){
							if(confirm("Careful now! You will not be able to undo this.")){
								$.ajax({url: "./"+dictID+"/destroy.json", dataType: "json", method: "POST", data: {}}).done(function(data){
									if(data.success) {
										$("#dict_"+dictID).slideUp("fast", function(){ $("#dict_"+dictID).remove() });
									};
								});
							}
						}
						function cloneDict(dictID){
							$.ajax({url: "./"+dictID+"/clone.json", dataType: "json", method: "POST", data: {}}).done(function(data){
								if (data.success) {
									var clone = '<div class="dict" id="dict_' + data.dictID + '"><a class="dictTitle" href="' + data.dictID + '/">' + data.title +'</a>';
									clone += '<a class="dictAction" href="javascript:void(null)" onclick="destroyDict(\'' + data.dictID + '\')">Delete</a> ';
									clone += '<a class="dictAction" href="javascript:void(null)" onclick="cloneDict(\'' + data.dictID + '\')">Clone</a></div>';
									$(clone).insertAfter($("#dict_"+dictID));
								}
							});
						}
						</script>
						<div class="createdict"><a href="make/">{{i18n["Create a dictionary"]}}</a></div>
						%if user["isAdmin"]:
							<div class="yourdicts">{{i18n["Administration"]}}</div>
							<div class="adminlink"><a href="users/">{{i18n["Users"]}}</a> <a href="dicts/">{{i18n["Dictionaries"]}}</a></div>
						%end
					%end
				%end
			</div>
			<div class="clear"></div>
		</div>



		<div class="invelope bottom">
			<div id="sitefooter">
				<div class="right"><a href="https://github.com/elexis-eu/lexonomy" class="github" title="GitHub" target="_blank"></a></div>
				%if version != "":
				<div>{{i18n["Build version:"]}} {{version}}</div>
				%end
			</div>
		</div>

		{{!siteconfig["trackingCode"]}}
	</body>
</html>