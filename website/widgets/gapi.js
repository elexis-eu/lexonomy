var Gapi={};

Gapi.change=function(){};
Gapi.settings={}
Gapi.ifchange=function(event){};

Gapi.render=function(div, json){
  $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

  $div.append("<div i18n class='title'>Image licence</div>");
  $div.append("<select id='Img_licence'><option value='any'>any licence</option><option value='comm'>permits commercial use</option><option value='der'>permits derivative works</option><option value='code'>permits commercial and derivative use</option><option value='public'>public domain</option></select>");
  $div.append("<div i18n class='instro'>Select licence type when searching for images.</div>");
  $div.find("#Img_licence").val(json.image_licence);
  $div.append("<div i18n class='title'>Google Custom Search API key</div>");
  $div.append("<input class='textbox' id='Gapi_key'/>");
  $div.find("#Gapi_key").val(json.apikey);
  $div.append("<div i18n class='instro'>Insert your Google Custom Search API key to allow multimedia search.</div>");
  $div.append("<div i18n class='title'>Custom Search ID</div>");
  $div.append("<input class='textbox' id='Gapi_cx'/>");
  $div.find("#Gapi_cx").val(json.cx);
  $div.append("<div i18n class='instro'>Insert ID of your Custom Search - see <a href='https://developers.google.com/custom-search/v1/introduction'>documentation</a>.</div>");
  $div.append("<hr>");
  $div.append("<div i18n class='title'>Pixabay API key</div>");
  $div.append("<input class='textbox' id='Pixabay_key'/>");
  $div.find("#Pixabay_key").val(json.pixabaykey);
  $div.append("<div i18n class='instro'>Insert your <a href='https://pixabay.com/api/docs/'>Pixabay API key</a>.</div>");
  $div.append("<hr>");
  $div.append("<div i18n class='title'>VoiceRSS API key</div>");
  $div.append("<input class='textbox' id='Voice_key'/>");
  $div.find("#Voice_key").val(json.voicekey);
  $div.append("<div i18n class='instro'>Insert your <a href='http://www.voicerss.org/api/'>VoiceRSS</a> API key to enable text-to-speech.</div>");
  $div.append("<div i18n class='title'>VoiceRSS language</div>");
  $div.append("<select id='Voice_lang'><option value=''>.</option><option value='ar-eg'>Arabic (Egypt)</option><option value='ar-sa'>Arabic (Saudi Arabia)</option><option value='bg-bg'>Bulgarian</option><option value='ca-es'>Catalan</option><option value='zh-cn'>Chinese (China)</option><option value='zh-hk'>Chinese (Hong Kong)</option><option value='zh-tw'>Chinese (Taiwan)</option><option value='hr-hr'>Croatian</option><option value='cs-cz'>Czech</option><option value='da-dk'>Danish</option><option value='nl-be'>Dutch (Belgium)</option><option value='nl-nl'>Dutch (Netherlands)</option><option value='en-au'>English (Australia)</option><option value='en-ca'>English (Canada)</option><option value='en-gb'>English (Great Britain)</option><option value='en-in'>English (India)</option><option value='en-ie'>English (Ireland)</option><option value='en-us'>English (United States)</option><option value='fi-fi'>Finnish</option><option value='fr-ca'>French (Canada)</option><option value='fr-fr'>French (France)</option><option value='fr-ch'>French (Switzerland)</option><option value='de-at'>German (Austria)</option><option value='de-de'>German (Germany)</option><option value='de-ch'>German (Switzerland)</option><option value='el-gr'>Greek</option><option value='he-il'>Hebrew</option><option value='hi-in'>Hindi</option><option value='hu-hu'>Hungarian</option><option value='id-id'>Indonesian</option><option value='it-it'>Italian</option><option value='ja-jp'>Japanese</option><option value='ko-kr'>Korean</option><option value='ms-my'>Malay</option><option value='nb-no'>Norwegian</option><option value='pl-pl'>Polish</option><option value='pt-br'>Portuguese (Brazil)</option><option value='pt-pt'>Portuguese (Portugal)</option><option value='ro-ro'>Romanian</option><option value='ru-ru'>Russian</option><option value='sk-sk'>Slovak</option><option value='sl-si'>Slovenian</option><option value='es-mx'>Spanish (Mexico)</option><option value='es-es'>Spanish (Spain)</option><option value='sv-se'>Swedish</option><option value='ta-in'>Tamil</option><option value='th-th'>Thai</option><option value='tr-tr'>Turkish</option><option value='vi-vn'>Vietnamese</option></select>");
  $div.find("#Voice_lang").val(json.voicelang);
  $div.append("<hr>");
  $div.append("<div i18n class='title'>Auto download images to each entry</div>");
  $div.append("<div i18n class='instro borderBelow'>If you want to add images to each entry automatically, Lexonomy can do that for you. First, go to Entry structure and add element with content type <i>media</i>. When you're ready, select element and number of images you want to add. </div>");
  $div.append("Image element to add: <select class='halfwidth' style='width:20%' id='add_element'></select> Add X images: <input type='text' size='3' value='3' id='add_number'/> <button class='iconAdd' onclick='Gapi.addImages()'>Add images</button><span id='addwait' style='display:none;vertical-align:bottom'><img src='/furniture/loader.gif'/></span>");
  for(var elName in xema.elements){
    if (xema.elements[elName].filling == 'med') {
      $("#add_element").append("<option value='"+elName+"'>"+elName+"</option>");
    }
  }
  $div.append("<div id='addinfo' style='diplay:none'></div>");
};

Gapi.harvest=function(div){
  var $div = $(div);
  var ret = {};
  ret.image_licence = $.trim( $div.find("#Img_licence").val() ) || "code";
  ret.apikey = $.trim( $div.find("#Gapi_key").val() ) || "";
  ret.cx = $.trim( $div.find("#Gapi_cx").val() ) || "";
  ret.pixabaykey = $.trim( $div.find("#Pixabay_key").val() ) || "";
  ret.voicekey = $.trim( $div.find("#Voice_key").val() ) || "";
  ret.voicelang = $.trim( $div.find("#Voice_lang").val() ) || "";
  return ret;
};

Gapi.addImages=function(){
  var addElem = $("#add_element").val();
  var addNumber = $("#add_number").val();
  if (addElem != "" && parseInt(addNumber) > 0) {
    $("#addwait").show();
    $("#addinfo").hide();
    $.ajax({url: Screenful.Editor.addUrl, dataType: "json", method: "POST", data: {addElem: addElem, addNumber: addNumber}}).done(function(data){
      $("#addinfo").html("Adding images to dictionary, please wait...");
      Gapi.waitImages(data["bgjob"]);
    });
  }
}

Gapi.waitImages=function(jobid){
  var imageTimer = setInterval(checkImages, 1000);
  function checkImages() {
    $.get("../../autoimageprogress.json", {"jobid": jobid}).done(function(data) {
      if (data["status"] == "finished") {
        clearInterval(imageTimer);
        $("#addinfo").show();
        $("#addwait").hide();
        $("#addinfo").html("Dictionary now contains automatically added images. <a href='../../edit'>See results.</a>");
      } else if (data["status"] == "failed") {
        $("#addinfo").show();
        clearInterval(imageTimer);
        $("#addinfo").html("Adding images failed :(");
      }
    });

  }
}
