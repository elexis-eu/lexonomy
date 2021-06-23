var Gmedia = {};
Gmedia.extendDocspec=function(docspec, xema) {
  if (gapi.apikey && gapi.cx) {
    for(var parName in xema.elements){
      if (xema.elements[parName].filling == 'med') {
        var elSpec=docspec.elements[parName];
        var incaption=elSpec.caption;
        elSpec.caption=function(jsMe){
          var cap="";
          cap="<span class='lexonomyGmediaCaption' onclick='Xonomy.notclick=true; Gmedia.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
          return cap;
        };
      }
    }
  }
};

Gmedia.getHeadword=function() {
  var $xml = $($.parseXML(Xonomy.harvest()));
  var hwd = $xml.find(titling.headword).html();
  if(!hwd) hwd = "";
  return hwd;
};

Gmedia.addLink=function(htmlID, target) {
  $('#'+htmlID+' .children div').attr('data-value', target.getAttribute('data-url'));
  $('#'+htmlID+' .children div').removeClass('empty');
  $('#'+htmlID+' .children div .value .word').html(target.getAttribute('data-url'));
  Xonomy.refresh()
};

Gmedia.menuRoot=function(htmlID) {
  var html = "<div class='menu'>";

  var headword = Gmedia.getHeadword();
  if (headword != '') {
    html += headword;
    var url = 'https://customsearch.googleapis.com/customsearch/v1';
    $.get(url, {cx: gapi.cx, key: gapi.apikey, searchType: 'image', imgSize: 'LARGE', rights: 'cc_sharealike', q: headword}, function(json) {
      if (json.items && json.items.length > 0) {
        $('#xonomyBubbleContent .menu').html('');
        json.items.forEach((image) => {
          var imhtml = '<i>' + image.title + '</i><br/>';
          imhtml += '<img onclick="Gmedia.addLink(\'' + htmlID + '\', this)" data-url="' + image.link + '" src="' + image.image.thumbnailLink + '" width="' + image.image.thumbnailWidth + '" height="' + image.image.thumbnailHeight + '">';
          imhtml += '</br>';
          $('#xonomyBubbleContent .menu').append(imhtml)
        });
      } else {
        $('#xonomyBubbleContent .menu').html("no results found");
      }
    });
  } else {
    html += "no headword set";
  }

  html += "</div>";
  document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
  Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
};

