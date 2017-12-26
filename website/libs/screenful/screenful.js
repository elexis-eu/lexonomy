var Screenful={
  createEnvelope: function(scrollable){
    var html="<div id='envelope' class='"+(scrollable?"scrollable":"")+"'></div>";
    if(window.parent==window || (window.parent!=window && !window.parent.Screenful)) html+="<div id='statusbar'></div>";
    if($("#footer").length>0) $("#footer").before(html); else $("body").append(html);
    Screenful.resize();
    $(window).on("resize", Screenful.resize);
    $("body").append("<div id='curtain' style='display: none'></div>")
  },
  resize: function(){
    var headerHeight=$("#header").outerHeight() | 0;
    var footerHeight=$("#footer").outerHeight() | 0;
    var statusbarHeight=$("#statusbar").outerHeight() | 0;
    $("#statusbar").css("bottom", (footerHeight+1)+"px");
    $("#envelope").css("top", headerHeight+"px");
    $("#envelope").css("bottom", (footerHeight+statusbarHeight+2)+"px");
  },
  status: function(str, style){
    if(window.parent!=window && window.parent.Screenful) window.parent.Screenful.status(str, style);
    else {
      if(style=="wait") str="<span class='wait'></span>"+str;
      if(style=="warn") str="<span class='warn'></span>"+str;
      $("#statusbar").html(str);
    }
  },

  wycLastID: 0,
  wycCache: {},
  wyc: function(url, callback){ //a "when-you-can" function for delayed rendering: gets json from url, passes it to callback, and delayed-returns html-as-string from callback
  	Xonomy.wycLastID++;
  	var wycID="screenful_wyc_"+Xonomy.wycLastID;
  	if(Xonomy.wycCache[url]) return callback(Xonomy.wycCache[url]);
  	$.ajax({url: url, dataType: "json", method: "POST"}).done(function(data){
  			$("#"+wycID).replaceWith(callback(data));
  			Xonomy.wycCache[url]=data;
  	});
  	return "<span class='wyc' id='"+wycID+"'></span>";
  },

  formatXml: function(xml) { //stolen from https://gist.github.com/sente/1083506
      var formatted = '';
      var reg = /(>)(<)(\/*)/g;
      xml = xml.replace(reg, '$1\r\n$2$3');
      var pad = 0;
      jQuery.each(xml.split('\r\n'), function(index, node) {
          var indent = 0;
          if (node.match( /.+<\/\w[^>]*>$/ )) {
              indent = 0;
          } else if (node.match( /^<\/\w/ )) {
              if (pad != 0) {
                  pad -= 1;
              }
          } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
              indent = 1;
          } else {
              indent = 0;
          }

          var padding = '';
          for (var i = 0; i < pad; i++) {
              padding += '  ';
          }

          formatted += padding + node + '\r\n';
          pad += indent;
      });

      return formatted;
  },
  cleanupXml: function(xml){
    return xml.trim().replace(/\>[\r\n]+\s*\</g, "><");
  },
  isWellFormedXml: function(xml){
    var doc=null;
    try{doc=$.parseXML(xml);} catch(e){}
    if(doc) return true;
    return false;
  },
  isWellFormedJson: function(json){
    var obj=null;
    try{obj=JSON.parse(json);} catch(e){}
    if(obj) return true;
    return false;
  },
  formatJson: function(json){
    if(typeof(json)=="string") json=JSON.parse(json);
    return JSON.stringify(json, null, "  ");
  },
};
