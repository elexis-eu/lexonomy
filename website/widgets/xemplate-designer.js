var XemplateDesigner={};
XemplateDesigner.xemplate=null;
XemplateDesigner.dictID = null;

XemplateDesigner.start=function(xema, xemplate, dictID){ //the editor can be an HTML element, or the string ID of one.
	XemaDesigner.xema=xema;
	XemplateDesigner.xema=xema;
  XemplateDesigner.xemplate=xemplate;
  XemplateDesigner.dictID = dictID;
	if(typeof(editor)=="string") editor=document.getElementById(editor);
	var $editor=$("#editor").addClass("designer");
	// $editor.append("<div class='list'></div><div class='details narrow'></div><div class='preview'></div>");
  // XemaDesigner.renderElement=XemplateDesigner.renderElement;
  // XemaDesigner.renderAttribute=XemplateDesigner.renderAttribute;
  // Render XML structure
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(xema.root);
	// XemplateDesigner.renderPreview();
};
XemplateDesigner.onchange=function(){
	XemplateDesigner.refreshPreview();
};

XemplateDesigner.renderPreview=function(){
	var $details=$(".designer .preview").html("");
	var $block=$("<div class='block'></div>").appendTo($(".designer .preview"));
	$block.append("<div class='title'><span class='reload' onclick='XemplateDesigner.reloadPreviewXml()'>reload random entry</span> Preview</div>");
	var $area=$("<div class='area viewer'></div>").appendTo($(".designer .preview"));
	var $area=$("<div class='noentries' style='display: none'>The dictionary has no entries yet.</div>").appendTo($(".designer .preview"));
	XemplateDesigner.reloadPreviewXml();
};
XemplateDesigner.previewXml="";
XemplateDesigner.reloadPreviewXml=function(){
	$.ajax({url: "/"+this.dictID+"/randomone.json", dataType: "json", method: "POST"}).done(function(data){
		if(data.id>0) {
      var doc = (new DOMParser()).parseFromString(data.xml, 'text/xml');
			XemplateDesigner.previewXml=doc;
			XemplateDesigner.refreshPreview();
			$(".designer .preview .area").hide().fadeIn();
		} else {
			$(".designer .preview .area").hide();
			$(".designer .preview .noentries").show();
		}
	});
};
XemplateDesigner.refreshPreview=function(){
	var html=Xemplatron.xml2html(XemplateDesigner.previewXml, XemplateDesigner.xemplate, XemplateDesigner.xema);
	var $details=$(".designer .preview .area").html(html);
}

XemplateDesigner.getElementXemplate=function(elName){
  if(!XemplateDesigner.xemplate[elName]) {
		if(elName==XemaDesigner.xema.root) XemplateDesigner.xemplate[elName]={shown: false, layout: "block"};
		else XemplateDesigner.xemplate[elName]={shown: true, layout: "block"};
	}
  if(XemplateDesigner.xemplate[elName].shown=="false") XemplateDesigner.xemplate[elName].shown=false;
  return XemplateDesigner.xemplate[elName];
};
XemplateDesigner.getAttributeXemplate=function(elName, atName){
  var x=XemplateDesigner.getElementXemplate(elName);
  if(!x.attributes) x.attributes={};
  if(!x.attributes[atName]) x.attributes[atName]={order: "after", shown: false, layout: "inline"};
  if(x.attributes[atName].shown=="false") x.attributes[atName].shown=false;
  return x.attributes[atName];
};

XemplateDesigner.renderElement=function(elName){
	var $details=$(".designer .details").html("");
  XemplateDesigner.renderElementShown(elName);
  if(XemplateDesigner.getElementXemplate(elName).shown) {
    if(XemaDesigner.xema.root!=elName) XemplateDesigner.renderElementLayout(elName);
    XemplateDesigner.renderElementStyles(elName);
    XemplateDesigner.renderElementLabel(elName);
  }
};
XemplateDesigner.renderAttribute=function(elName, atName){
	var $details=$(".designer .details").html("");
  XemplateDesigner.renderAttributeShown(elName, atName);
  if(XemplateDesigner.getAttributeXemplate(elName, atName).shown) {
    XemplateDesigner.renderAttributeOrder(elName, atName);
    XemplateDesigner.renderAttributeLayout(elName, atName);
    XemplateDesigner.renderAttributeStyles(elName, atName);
    XemplateDesigner.renderAttributeLabel(elName, atName);
  }
};

XemplateDesigner.renderElementLabel=function(elName){
	var x=XemplateDesigner.getElementXemplate(elName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Label</div>");
	$block.append("<input class='textbox' value='"+(x.label?x.label.replace("'", "&apos;").replace(">", "&gt;").replace("<", "&lt;"):"")+"'/>");
	$block.find("input").on("change", function(event){
		XemplateDesigner.changeElementLabel(elName, $(event.target).val());
	});
};
XemplateDesigner.renderAttributeLabel=function(elName, atName){
	var x=XemplateDesigner.getAttributeXemplate(elName, atName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Label</div>");
	$block.append("<input class='textbox' value='"+(x.label?x.label.replace("'", "&apos;").replace(">", "&gt;").replace("<", "&lt;"):"")+"'/>");
	$block.find("input").on("change", function(event){
    XemplateDesigner.changeAttributeLabel(elName, atName, $(event.target).val());
	});
};
XemplateDesigner.changeElementLabel=function(elName, label){
  var x=XemplateDesigner.getElementXemplate(elName);
  x.label=label;
  XemaDesigner.selectElement(elName);
  XemplateDesigner.onchange();
};
XemplateDesigner.changeAttributeLabel=function(elName, atName, label){
  var x=XemplateDesigner.getAttributeXemplate(elName, atName);
  x.label=label;
  XemaDesigner.selectAttribute(elName, atName);
  XemplateDesigner.onchange();
};

XemplateDesigner.renderElementShown=function(elName){
	var x=XemplateDesigner.getElementXemplate(elName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Visibility</div>");
	$block.append("<label class='radio'><input type='radio' name='shown' value='true' "+(x.shown?"checked":"")+"/>Shown</label>");
	$block.append("<label class='radio'><input type='radio' name='shown' value='false' "+(!x.shown?"checked":"")+"/>Hidden</label>");
	$block.find("input").on("click change", function(event){
		XemplateDesigner.changeElementShown(elName, $(event.target).val());
	});
};
XemplateDesigner.renderAttributeShown=function(elName, atName){
	var x=XemplateDesigner.getAttributeXemplate(elName, atName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Visibility</div>");
	$block.append("<label class='radio'><input type='radio' name='shown' value='true' "+(x.shown?"checked":"")+"/>Shown</label>");
	$block.append("<label class='radio'><input type='radio' name='shown' value='false' "+(!x.shown?"checked":"")+"/>Hidden</label>");
	$block.find("input").on("click change", function(event){
    XemplateDesigner.changeAttributeShown(elName, atName, $(event.target).val());
	});
};
XemplateDesigner.changeElementShown=function(elName, shown){
  var x=XemplateDesigner.getElementXemplate(elName);
  x.shown=(shown=="true" ? true : false);
  XemaDesigner.selectElement(elName);
  XemplateDesigner.onchange();
};
XemplateDesigner.changeAttributeShown=function(elName, atName, shown){
  var x=XemplateDesigner.getAttributeXemplate(elName, atName);
  x.shown=(shown=="true" ? true : false);
  XemaDesigner.selectAttribute(elName, atName);
  XemplateDesigner.onchange();
};

XemplateDesigner.renderAttributeOrder=function(elName, atName){
	var x=XemplateDesigner.getAttributeXemplate(elName, atName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Position</div>");
	$block.append("<label class='radio'><input type='radio' name='order' value='before' "+(x.order=="before"?"checked":"")+"/>Before element content</label>");
	$block.append("<label class='radio'><input type='radio' name='order' value='after' "+(x.order=="after"?"checked":"")+"/>After element content</label>");
	$block.find("input").on("click change", function(event){
    XemplateDesigner.changeAttributeOrder(elName, atName, $(event.target).val());
	});
};
XemplateDesigner.changeAttributeOrder=function(elName, atName, val){
  var x=XemplateDesigner.getAttributeXemplate(elName, atName);
  x.order=val;
  XemaDesigner.selectAttribute(elName, atName);
  XemplateDesigner.onchange();
};

XemplateDesigner.renderElementLayout=function(elName){
	var x=XemplateDesigner.getElementXemplate(elName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Layout</div>");
	$block.append("<label class='radio'><input type='radio' name='layout' value='block' "+(x.layout=="block"?"checked":"")+"/>Line break before and after</label>");
	$block.append("<label class='radio'><input type='radio' name='layout' value='inline' "+(x.layout=="inline"?"checked":"")+"/>Inline</label>");
	$block.find("input").on("click change", function(event){
		XemplateDesigner.changeElementLayout(elName, $(event.target).val());
	});
};
XemplateDesigner.renderAttributeLayout=function(elName, atName){
	var x=XemplateDesigner.getAttributeXemplate(elName, atName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Layout</div>");
	$block.append("<label class='radio'><input type='radio' name='layout' value='block' "+(x.layout=="block"?"checked":"")+"/>Line break before and after</label>");
	$block.append("<label class='radio'><input type='radio' name='layout' value='inline' "+(x.layout=="inline"?"checked":"")+"/>Inline</label>");
	$block.find("input").on("click change", function(event){
		XemplateDesigner.changeAttributeLayout(elName, atName, $(event.target).val());
	});
};
XemplateDesigner.changeElementLayout=function(elName, val){
  var x=XemplateDesigner.getElementXemplate(elName);
  x.layout=val;
  XemaDesigner.selectElement(elName);
  XemplateDesigner.onchange();
};
XemplateDesigner.changeAttributeLayout=function(elName, atName, val){
  var x=XemplateDesigner.getAttributeXemplate(elName, atName);
  x.layout=val;
  XemaDesigner.selectAttribute(elName, atName);
  XemplateDesigner.onchange();
};

XemplateDesigner.renderElementStyles=function(elName){
	var x=XemplateDesigner.getElementXemplate(elName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title tight'>Appearance</div>");
  var $table=$("<table></table>").appendTo($block);
  var dims=[]; for(var dim in Xemplatron.styles) dims.push(dim); dims.reverse();
  for(var iDim=0; iDim<dims.length; iDim++){
    var dim=dims[iDim];
		var qualifies=true;
		if((dim=="separation" || dim=="gutter") && XemaDesigner.xema.root==elName) qualifies=false;
		if((dim=="innerPunc" || dim=="weight" || dim=="slant" || dim=="colour" || dim=="textsize") && (XemaDesigner.xema.elements[elName].filling=="chd" || XemaDesigner.xema.elements[elName].filling=="med")) qualifies=false;
		if((dim=="captioning") && XemaDesigner.xema.elements[elName].filling!="lst") qualifies=false;
		if(qualifies) {
	    var $row=$("<tr><td class='cell1'></td><td class='cell9'></td></tr>").appendTo($table);
	    $row.find("td.cell1").append("<div class='caption'>"+Xemplatron.styles[dim].title+"</div>");
	    $row.find("td.cell9").append("<select name='"+dim+"' class='"+(!x[dim]?"none":"")+"'><option value=''>(none)</option></select>");
	    for(var styleID in Xemplatron.styles[dim]) if(styleID!="title") {
	      $row.find("select").append("<option value='"+styleID+"' "+(x[dim]&&x[dim]==styleID?"selected='selected'":"")+">"+Xemplatron.styles[dim][styleID].title+"</option>");
	      $row.find("select").on("change", function(event){
	        XemplateDesigner.changeElementStyle(elName, $(event.target).prop("name"), $(event.target).val());
	      });
	    }
		}
  }
};
XemplateDesigner.renderAttributeStyles=function(elName, atName){
	var x=XemplateDesigner.getAttributeXemplate(elName, atName);
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title tight'>Appearance</div>");
  var $table=$("<table></table>").appendTo($block);
  var dims=[]; for(var dim in Xemplatron.styles) dims.push(dim); dims.reverse();
  for(var iDim=0; iDim<dims.length; iDim++){
    var dim=dims[iDim];
		var qualifies=true;
		if((dim=="captioning") && XemaDesigner.xema.elements[elName].attributes[atName].filling!="lst") qualifies=false;
		if(qualifies) {
	    var $row=$("<tr><td class='cell1'></td><td class='cell9'></td></tr>").appendTo($table);
	    $row.find("td.cell1").append("<div class='caption'>"+Xemplatron.styles[dim].title+"</div>");
	    $row.find("td.cell9").append("<select name='"+dim+"' class='"+(!x[dim]?"none":"")+"'><option value=''>(none)</option></select>");
	    for(var styleID in Xemplatron.styles[dim]) if(styleID!="title") {
	      $row.find("select").append("<option value='"+styleID+"' "+(x[dim]&&x[dim]==styleID?"selected='selected'":"")+">"+Xemplatron.styles[dim][styleID].title+"</option>");
	      $row.find("select").on("change", function(event){
	        XemplateDesigner.changeAttributeStyle(elName, atName, $(event.target).prop("name"), $(event.target).val());
	      });
	    }
		}
  }
};
XemplateDesigner.changeElementStyle=function(elName, dim, val){
  var x=XemplateDesigner.getElementXemplate(elName);
  x[dim]=val;
  XemaDesigner.selectElement(elName);
  XemplateDesigner.onchange();
};
XemplateDesigner.changeAttributeStyle=function(elName, atName, dim, val){
  var x=XemplateDesigner.getAttributeXemplate(elName, atName);
  x[dim]=val;
  XemaDesigner.selectAttribute(elName, atName);
  XemplateDesigner.onchange();
};
