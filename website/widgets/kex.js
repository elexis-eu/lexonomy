var Kex={};

Kex.change=function(){};

Kex.ifchange=function(event){
  var $inp=$(event.delegateTarget);
  if($inp.val()!=$inp.data("origval")) Kex.change();
};

Kex.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div class='title'>Sketch Engine URL</div>");
  $div.append("<input class='textbox' id='kex_url'/>");
  $div.find("#kex_url").val(json.url).data("origval", json.url).on("change keyup", Kex.ifchange);
  $div.append("<div class='instro'>The path to the <code>run.cgi</code> script in Sketch Engine. For most users this should be <code>https://api.sketchengine.co.uk/bonito/run.cgi</code>. Do not change this unless you are using a local installation of Sketch Engine.</div>");

  $div.append("<div class='title'>Your Sketch Engine user name</div>");
  $div.append("<input class='textbox' id='kex_username'/>");
  $div.find("#kex_username").val(json.username).data("origval", json.username).on("change keyup", Kex.ifchange);
  $div.append("<div class='instro'>The name you use to log into Sketch Engine.");

  $div.append("<div class='title'>Your Sketch Engine API key</div>");
  $div.append("<input class='textbox' id='kex_apikey'/>");
  $div.find("#kex_apikey").val(json.apikey).data("origval", json.apikey).on("change keyup", Kex.ifchange);
  $div.append("<div class='instro'>An API key is a string of letters and numbers, for example <code>MZTAN7CA91YTXVPBNABUPR3X2OKLJKJ9</code>. Generate one in the <b>API Access</b> facility in Sketch Engine, then copy and paste it in here.");

  $div.append("<div class='title'>Corpus name</div>");
  $div.append("<input class='textbox' id='kex_corpus'/>");
  $div.find("#kex_corpus").val(json.corpus).data("origval", json.corpus).on("change keyup", Kex.ifchange);
  $div.append("<div class='instro'>The identifier Sketch Engine uses internally for the corpus from which you want to pull data into your dictionary, for example <code>bnc2</code> for the British National Corpus.</div>");
};

Kex.harvest=function(div){
  var $div=$(div);
  var ret={};
  ret.url=$.trim( $div.find("#kex_url").val() );
  ret.corpus=$.trim( $div.find("#kex_corpus").val() );
  ret.username=$.trim( $div.find("#kex_username").val() );
  ret.apikey=$.trim( $div.find("#kex_apikey").val() );
  return ret;
};
