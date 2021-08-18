var Xemplatron={};
Xemplatron.xema=null;
Xemplatron.xemplate=null;

Xemplatron.xml2html=function(xml, xemplate, xema){
  Xemplatron.xema=xema;
  Xemplatron.xemplate=xemplate;
  if(typeof(xml)=="string") xml=$.parseXML(xml);
  var html=Xemplatron.el2html(xml.documentElement, true, true);
  return html;
};
Xemplatron.el2html=function(el, isFirst, isLast){
  if(!Xemplatron.getXemplate(el).shown) return "";
  var html="";
  var caption="";
  var xema=Xemplatron.xema.elements[el.nodeName]; if(xema && xema.filling=="lst") {
    html=el.textContent;
    if(xema.values) for(var i=0; i<xema.values.length; i++) if(xema.values[i].value==el.textContent) {caption=xema.values[i].caption; break;}
  } else if (xema && xema.filling=="med") {
    var fileType = Xemplatron.detectFileType(el.textContent);
    console.log(fileType)
    switch(fileType) {
      case 'image':
        html = '<img src="'+el.textContent+'" class="media_image"/>';
        break;
      case 'video':
        html = '<video controls class="media_video"><source src="'+el.textContent+'"/></video>';
        break;
      case 'audio':
        html = '<audio controls class="media_audio" src="'+el.textContent+'"/>';
        break;
      default:
        html = el.textContent;
        break;
    }
  } else {
    //obtain the child nodes we want to process, in the other we want to proceess them in:
    var nodes=[];
    for(var iNode=0; iNode<el.attributes.length; iNode++){
      var node=el.attributes[iNode];
      if(node.nodeName.indexOf("xml:")!=0 && node.nodeName.indexOf("lxnm:")!=0){
        var xemplate=Xemplatron.getXemplate(node);
        if(xemplate.order=="before" && xemplate.shown) nodes.push(node);
      }
    }
    for(var iNode=0; iNode<el.childNodes.length; iNode++){
      var node=el.childNodes[iNode];
      if(node.nodeName.indexOf("xml:")!=0 && node.nodeName.indexOf("lxnm:")!=0){
        if(node.nodeType==3) nodes.push(node);
        if(node.nodeType==1){var xemplate=Xemplatron.getXemplate(node); if(xemplate.shown) nodes.push(node);}
      }
    }
    for(var iNode=0; iNode<el.attributes.length; iNode++){
      var node=el.attributes[iNode];
      if(node.nodeName.indexOf("xml:")!=0){var xemplate=Xemplatron.getXemplate(node); if(xemplate.order=="after" && xemplate.shown) nodes.push(node);}
    }
    //process the child nodes:
    for(var iNode=0; iNode<nodes.length; iNode++){
      var node=nodes[iNode];
      var iF=(iNode==0);
      var iL=(iNode==nodes.length-1); if(!iL && nodes[iNode+1].nodeType!=3) iL=(Xemplatron.getXemplate(nodes[iNode+1]).layout=="block");
      if(node.nodeType==1) html+=Xemplatron.el2html(node, iF, iL);
      if(node.nodeType==2) html+=Xemplatron.at2html(node, iF, iL);
      if(node.nodeType==3) html+=Xemplatron.tn2html(node);
    }
  }
  var xemplate=Xemplatron.getXemplate(el);
  //add label:
  if(xemplate.label) html="<span class='label'>"+xemplate.label+"</span>&nbsp;"+html;
  //surround the processed nodes with markup:
  for(var dimension in Xemplatron.styles) if(xemplate[dimension]) html=Xemplatron.getStyle(dimension, xemplate[dimension]).toHtml(xemplate.layout, html, el, isFirst, isLast, caption);
  //should this element inherit the font properties of its parent?
  var clearFont=true;
  if(el.parentNode && Xemplatron.xema.elements[el.parentNode.nodeName] && Xemplatron.xema.elements[el.parentNode.nodeName].filling=="inl") clearFont=false;
  //done:
  return "<"+(xemplate.layout=="block"?"div":"span")+" "+(clearFont?"class='clearFont'":"")+">"+html+"</"+(xemplate.layout=="block"?"div":"span")+">";
};
Xemplatron.at2html=function(at, isFirst, isLast){
  var xemplate=Xemplatron.getXemplate(at);
  var html="";
  var caption="";
  var xema=Xemplatron.xema.elements[at.ownerElement.nodeName]; if(xema) xema=xema.attributes[at.nodeName]; else xema=null;
  if(xema && xema.filling=="lst") {
    html=Xemplatron.xmlEscape(at.nodeValue);
    if(xema.values) for(var i=0; i<xema.values.length; i++) if(xema.values[i].value==at.nodeValue) {caption=xema.values[i].caption; break;}
  } else {
    html+=Xemplatron.xmlEscape(at.nodeValue);
  }
  if(xemplate.label) html="<span class='label'>"+xemplate.label+"</span>&nbsp;"+html;
  for(var dimension in Xemplatron.styles) if(xemplate[dimension]) html=Xemplatron.getStyle(dimension, xemplate[dimension]).toHtml(xemplate.layout, html, at, isFirst, isLast, caption);
  if(xemplate.layout=="block") return "<div class='clearFont'>"+html+"</div>"; else return "<span class='clearFont'>"+html+"</span>";;
};
Xemplatron.tn2html=function(tn){
  var html="";
  html+=Xemplatron.xmlEscape(tn.nodeValue);
  return html;
};

Xemplatron.xmlEscape=function(str) {
  return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};

Xemplatron.getXemplate=function(elat){
  var xemplate=null;
  if(elat.nodeType==1) {
    if(Xemplatron.xemplate[elat.nodeName]) xemplate=Xemplatron.xemplate[elat.nodeName];
    else xemplate={shown: true, layout: "block"};
  }
  else if(elat.nodeType==2) {
    var parentName=elat.ownerElement.nodeName;
    if(Xemplatron.xemplate[parentName] && Xemplatron.xemplate[parentName].attributes && Xemplatron.xemplate[parentName].attributes[elat.nodeName]) xemplate=Xemplatron.xemplate[parentName].attributes[elat.nodeName];
    else xemplate={order: "after", shown: false, layout: "inline"};
  }
  if(xemplate && xemplate.shown=="false") xemplate.shown=false;
  return xemplate;
};

Xemplatron.getStyle=function(dimension, name){
  if(Xemplatron.styles[dimension][name]) return Xemplatron.styles[dimension][name]; else return Xemplatron.defaultStyle;
};
Xemplatron.defaultStyle={toHtml: function(ly, html, n, isF, isL){return html}};
Xemplatron.styles={ //the dimensions are ordered from innermost to outermost
  captioning: {
    "title": "Caption display",
    "replace": {toHtml: function(ly, html, n, isF, isL, cap){return "<span>"+(cap?cap:html)+"</span>"}, title: "Show caption instead of value"},
    "mouseover": {toHtml: function(ly, html, n, isF, isL, cap){return "<span class='caption' title='"+cap.replace("'", "&apos;")+"'>"+html+"</span>"}, title: "Show caption on mouse-over"},
  },
  interactivity: {
    "title": "Interactivity",
    "xref": {toHtml: function(ly, html, n, isF, isL){return "<a class='xref' data-text='"+n.textContent.replace("'", "&apos;")+"'>"+html+"</a>"}, title: "Clickable cross-reference"},
  },
  innerPunc: {
    "title": "Inner punctuation",
    "roundBrackets": {toHtml: function(ly, html, n, isF, isL){return "("+html+")"}, title: "Round brackets"},
    "squareBrackets": {toHtml: function(ly, html, n, isF, isL){return "["+html+"]"}, title: "Square brackets"},
    "curlyBrackets": {toHtml: function(ly, html, n, isF, isL){return "{"+html+"}"}, title: "Curly brackets"},
    "comma": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":", ")}, title: "Comma"},
    "semicolon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":"; ")}, title: "Semicolon"},
    "colon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":": ")}, title: "Colon"},
  },
  textsize: {
    "title": "Text size",
    "smaller": {toHtml: function(ly, html, n, isF, isL){return "<span class='smaller'>"+html+"</span>"}, title: "Smaller"},
    "bigger": {toHtml: function(ly, html, n, isF, isL){return "<span class='bigger'>"+html+"</span>"}, title: "Bigger"},
  },
  weight: {
    "title": "Text weight",
    "bold": {toHtml: function(ly, html, n, isF, isL){return "<span class='bold'>"+html+"</span>"}, title: "Bold"},
  },
  slant: {
    "title": "Text slant",
    "italic": {toHtml: function(ly, html, n, isF, isL){return "<span class='italic'>"+html+"</span>"}, title: "Italic"},
  },
  colour: {
    "title": "Text colour",
    "red": {toHtml: function(ly, html, n, isF, isL){return "<span class='red'>"+html+"</span>"}, title: "Red"},
    "blue": {toHtml: function(ly, html, n, isF, isL){return "<span class='blue'>"+html+"</span>"}, title: "Blue"},
    "green": {toHtml: function(ly, html, n, isF, isL){return "<span class='green'>"+html+"</span>"}, title: "Green"},
    "grey": {toHtml: function(ly, html, n, isF, isL){return "<span class='grey'>"+html+"</span>"}, title: "Grey"},
  },
  outerPunc: {
    "title": "Outer punctuation",
    "roundBrackets": {toHtml: function(ly, html, n, isF, isL){return "("+html+")"}, title: "Round brackets"},
    "squareBrackets": {toHtml: function(ly, html, n, isF, isL){return "["+html+"]"}, title: "Square brackets"},
    "curlyBrackets": {toHtml: function(ly, html, n, isF, isL){return "{"+html+"}"}, title: "Curly brackets"},
    "comma": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":", ")}, title: "Comma"},
    "semicolon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":"; ")}, title: "Semicolon"},
    "colon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":": ")}, title: "Colon"},
  },
  background: {
    "title": "Background colour",
    "yellow": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background yellow'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Yellow"},
    "blue": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background blue'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Blue"},
    "grey": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background grey'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Grey"},
  },
  border: {
    "title": "Box border",
    "dotted": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border dotted'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Dotted"},
    "solid": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border solid'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Thin"},
    "thick": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border thick'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Thick"},
  },
  gutter: {
    "title": "Indentation and bulleting",
    "disk": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "disk", html) }, title: "Round bullet"},
    "square": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "square", html) }, title: "Square bullet"},
    "diamond": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "diamond", html) }, title: "Diamond bullet"},
    "arrow": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "arrow", html) }, title: "Arrow bullet"},
    "indent": {toHtml: function(ly, html, n, isF, isL){ return "<"+(ly=="block"?"div":"span")+" class='indented'>"+html+"</"+(ly=="block"?"div":"span")+">" }, title: "Indent"},
    "hanging": {toHtml: function(ly, html, n, isF, isL){ return "<"+(ly=="block"?"div":"span")+" class='hanging'>"+html+"</"+(ly=="block"?"div":"span")+">" }, title: "Hanging indent"},
    "sensenum0": {title: "Sense number I, II, III...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 0); }},
    "sensenum1": {title: "Sense number 1, 2, 3...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 1); }},
    "sensenum2": {title: "Sense number a, b, c...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 2); }},
    "sensenum3": {title: "Sense number i, ii, iii...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 3); }},
  },
  separation: {
    "title": "Separation from other content",
    "space": {toHtml: function(ly, html, n, isF, isL){ if(ly=="block") return "<div class='space'>"+html+"</div>"; if(ly=="inline") return (isF?"":" ")+html+(isL?"":" ");}, title: "Whitespace"},
  },
};

Xemplatron._getNumberingSymbol=function(num, level){
  var ret="&nbsp;";
  if(level==0) ret=Xemplatron._getRoman(num);
  if(level==1) ret=num.toString();
  if(level==2) ret=Xemplatron._getAbc(num);
  if(level>=3) ret=Xemplatron._getRoman(num).toLowerCase();
  return "<span class='numberingSymbol'>"+ret+"</span>";
}
Xemplatron._getAbc=function(num){
  num=num-1;
  var list="abcdefghijklmnopqrstuvwxyz";
  var ret=list[list.length-1]; if(num<list.length) ret=list[num];
  return ret.toString();
};
Xemplatron._getRoman=function(num){
  num=num-1;
  var list=["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var ret=list[list.length-1]; if(num<list.length) ret=list[num];
  return ret;
};
Xemplatron._hasEponymousSiblings=function(n){
  var num=0;
  var sibling=n.previousSibling; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.previousSibling; }
  var sibling=n.nextSibling; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.nextSibling; }
  return num;
};
Xemplatron._senseNum=function(ly, html, n, startLevel) {
  var symbol="&mdash;";
  if(Xemplatron._hasEponymousSiblings(n)) {
    var num=0;
    var sibling=n; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.previousSibling; }
    if(num) {
      var level=startLevel-1;
      var parent=n; while(parent){ if(parent.nodeName==n.nodeName) level++; parent=parent.parentNode; }
      symbol=Xemplatron._getNumberingSymbol(num, level);
    }
  }
  return Xemplatron._bullet(ly, symbol, html);

}
Xemplatron._bullet=function(ly, name, html){
  var symbol=""; var className="";
  if(name=="square") { symbol="⯀"; className=name; }
  else if(name=="diamond") { symbol="⯁"; className=name; }
  else if(name=="arrow") { symbol="⯈"; className=name; }
  else if(name=="disk") { symbol="⏺"; className=name; }
  else symbol=name;
  if(ly=="block") return "<div class='bulleted "+className+"'><div class='bullet'>"+symbol+"</div> <div class='inside'>"+html+"</div><div class='clear'></div></div>";
  if(ly=="inline") return "<span class='bulleted "+className+"'>"+symbol+"</span>&nbsp;"+html;
}
Xemplatron.detectFileType=function(url) {
  var fileExtension = url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
  console.log('FE'+fileExtension)
  if (['jpg','jpeg','png','gif'].includes(fileExtension)) return 'image';
  if (['avi','mp4','webm'].includes(fileExtension)) return 'video';
  if (['wav','ogg','weba'].includes(fileExtension)) return 'audio';
  return '';
}

if(!module) var module={};
module.exports={
  xml2html: Xemplatron.xml2html
}
