<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		%include("head.tpl")
		<title>Lexonomy API</title>
		<script type="text/javascript" src="libs/screenful/screenful.js"></script>
		<script type="text/javascript" src="libs/screenful/screenful-loc-{{siteconfig['lang']}}.js"></script>
		%if siteconfig["rtl"]:
			<link type="text/css" rel="stylesheet" href="{{siteconfig["baseUrl"]}}/furniture/rtl.css" />
		%end
</head>
	<body>
		<div class="invelope top">
			<h1>Lexonomy API documentation and test</h1>
			<p>Lexonomy also supports <a href="https://elexis-eu.github.io/elexis-rest/">ELEXIS REST API</a> - calls <tt>dictionaries, about, list, lemma, tei</tt>. Use your API key as <tt>X-API-KEY</tt>.</p>
			<hr/>
			<p>Following calls are Lexonomy API with specific information.</p>
			<p><b>API URL:</b> {{siteconfig["baseUrl"]}}api</p>

			<hr/>
			<h2>List languages used in dictionaries</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listLang</p>
			<textarea id="input_listLang" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54"
}</textarea>
			<button onclick="listLang()">Post</button> and watch your console.
			<script type="text/javascript">
			function listLang(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listLang").val();
				$.ajax("/api/listLang", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
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
			<h2>Find links, from headword in language</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listLinks</p>
			<textarea id="input_listLinks1" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54",
  "headword": "zopet",
  "sourceLanguage": "sl"
}</textarea>
			<button onclick="listLinks1()">Post</button> and watch your console.
			<script type="text/javascript">
			function listLinks1(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listLinks1").val();
				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
			<h2>Find links, headword with specific dictionary</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listLinks</p>
			<textarea id="input_listLinks2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54",
  "headword": "zopet",
  "sourceLanguage": "sl",
  "sourceDict": "elexis-zrcsazu-pletersnik"
}</textarea>
			<button onclick="listLinks2()">Post</button> and watch your console.
			<script type="text/javascript">
			function listLinks2(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listLinks2").val();
				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
			<h2>Find links, headword to target language</h2>
			<p>POST {{siteconfig["baseUrl"]}}api/listLinks</p>
			<textarea id="input_listLinks3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{
  "email": "rambousek@gmail.com",
  "apikey": "8VBOZ1COTZT5YPGL05GKTZKV006RXJ54",
  "headword": "zopet",
  "sourceLanguage": "sl",
  "targetLanguage": "en"
}</textarea>
			<button onclick="listLinks3()">Post</button> and watch your console.
			<script type="text/javascript">
			function listLinks3(){
				//var json=JSON.parse($("#input_makeDict").val());
				var json=$("#input_listLinks3").val();
				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
					console.log(data);
				});
			}
			</script>
			<hr/>
	</body>
</html>
