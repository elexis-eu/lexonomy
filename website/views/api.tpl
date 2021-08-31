<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>Lexonomy API</title>
		<script type="text/javascript" src="libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="libs/screenful/screenful-loc-en.js"></script>
		<link type="text/css" rel="stylesheet" href="furniture/public.css" />
	</head>
	<body>
		<div class="invelope top">
			<h1>Lexonomy API documentation and test</h1>
			<p>{{siteconfig["baseUrl"]}}api</p>

			<hr/>
			<h2>List all dictionaries metadata</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listDict</p>
			<textarea id="input_listDict" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54"
}</textarea>
			<button onclick="listDict()">Post</button> and watch your console.
			<script type="text/javascript">
			function listDict(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listDict").val();
				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
			<h2>List dictionaries metadata for selected language</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listDict</p>
			<textarea id="input_listDict2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54",
  "lang": "sl"
}</textarea>
			<button onclick="listDict2()">Post</button> and watch your console.
			<script type="text/javascript">
			function listDict2(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listDict2").val();
				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
			<h2>List dictionaries metadata for selected language, with links only</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listDict</p>
			<textarea id="input_listDict3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54",
  "lang": "sl",
  "withLinks": true
}</textarea>
			<button onclick="listDict3()">Post</button> and watch your console.
			<script type="text/javascript">
			function listDict3(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listDict3").val();
				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
	</body>
</html>
