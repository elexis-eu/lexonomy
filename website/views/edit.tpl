%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
	<head>
		%include("head.tpl")
		<title>{{dictTitle}}</title>
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful.js"></script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}libs/screenful/screenful.css" />
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
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}libs/screenful/screenful-navigator.css?2018-02-04" />
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful-navigator.js?2018-02-04"></script>
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/js.cookie.js"></script>
		<script type="text/javascript">
		Screenful.Navigator.listUrl="{{siteconfig["baseUrl"]}}{{dictID}}/{{doctype}}/entrylist.json";
		Screenful.Navigator.listByIdUrl="{{siteconfig["baseUrl"]}}{{dictID}}/{{doctype}}/entrylist.json";
		Screenful.Navigator.stepSize={{!JSON(numberEntries)}};
		Screenful.Navigator.showNumbers=false;
		Screenful.Navigator.sortDesc=false;
		Screenful.Navigator.editorUrl="{{siteconfig["baseUrl"]}}{{dictID}}/{{doctype}}/entryeditor/";
		Screenful.Navigator.modifiers=[
			{value: "start", caption: Screenful.Loc["starts like this"]},
			{value: "exact", caption: Screenful.Loc["is exactly"]},
			{value: "wordstart", caption: Screenful.Loc["contains a word that starts like this"]},
			{value: "substring", caption: Screenful.Loc["contains this sequence of characters"]},
		];
		Screenful.Navigator.renderer=function(div, entry, searchtext, modifier){
			var $xml=$($.parseXML(entry.content));
			var text=entry.title;
			if(searchtext!=""){
				searchtext=searchtext.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
				$text=$("<span>"+text+"</span>");
				$text.find("span.headword, span.redirector").each(function(){
					var $this=$(this);
					if(modifier=="start") {
						var regexp=new RegExp("^"+searchtext, "gi");
						$this.html($this.html().replace(regexp, function(match){ return "<span class='searchtext'>"+match+"</span>"; }));
					} else if(modifier=="wordstart") {
						var regexp=new RegExp("(^| )("+searchtext+")", "gi");
						$this.html($this.html().replace(regexp, function(match, $1, $2){ return $1+"<span class='searchtext'>"+$2+"</span>"; }));
					} else if(modifier=="substring") {
						var regexp=new RegExp(searchtext, "gi");
						$this.html($this.html().replace(regexp, function(match){ return "<span class='searchtext'>"+match+"</span>"; }));
					} else if(modifier=="exact") {
						var regexp=new RegExp("^"+searchtext+"$", "gi");
						$this.html($this.html().replace(regexp, function(match){ return "<span class='searchtext'>"+match+"</span>"; }));
					}

				});
				text=$text.html();
			}
			$(div).html(text);
		};
		Screenful.Navigator.entryDeleteUrl="{{siteconfig["baseUrl"]}}{{dictID}}/entrydelete.json";

		Screenful.Navigator.flags={{!JSON(flagging["flags"])}};
		Screenful.Navigator.entryFlagUrl="{{siteconfig["baseUrl"]}}{{dictID}}/entryflag.json";

		$(function() {
			var selectedID = "{{selectedID}}";
			if (selectedID != "") {
				$('[name=editframe]').on("load", function() {
					var editorWindow = $('[name=editframe]').contents()[0];
					if (selectedID.match(/^[0-9]*$/)) {
						editorWindow.defaultView.Screenful.Editor.edit(null, selectedID);
						$('[name=editframe]').contents().find('#butEdit').click();

					}
					if (selectedID.match(/^view[0-9]*$/)) {
						editorWindow.defaultView.Screenful.Editor.view(null, selectedID.substring(4));
						$('[name=editframe]').contents().find('#butView').click();
					}
				});
			}
		});
		</script>
		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}libs/screenful/screenful-aftersave.css" />
		<script type="text/javascript" src="{{siteconfig["baseUrl"]}}libs/screenful/screenful-aftersave.js"></script>
		<script type="text/javascript">
		Screenful.Aftersave.message="Indexing...";
		Screenful.Aftersave.actionUrl="{{siteconfig["baseUrl"]}}{{dictID}}/resave.json";
		Screenful.Aftersave.maximizeUrl="{{siteconfig["baseUrl"]}}{{dictID}}>/resave/";
		</script>

		<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}furniture/ui.css" />
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
	</head>
	<body class="edit">
                %include("header.tpl", i18n=i18n,user=user, dictID=dictID, dictTitle=dictTitle, current="edit", rootPath=siteconfig["baseUrl"], doctype=doctype, doctypes=doctypes)
		<script>
	    var mode=Cookies.get("xonomyMode_{{dictID}}") || "{{xonomyMode}}";
			$(".doctypes").addClass(mode);
	  </script>
	</body>
</html>
