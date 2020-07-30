var XemaDesigner={};
XemaDesigner.onchange=function(){};
XemaDesigner.isValidXmlName=function(str){
	if(str=="") return false;
	if(/[:=\s\"\']/.test(str)) return false;
	try{ $.parseXML("<"+str+"/>"); } catch(err){ return false; }
	return true;
};
XemaDesigner.isEmptyObject=function(obj) {
  for(var prop in obj) if(Object.prototype.hasOwnProperty.call(obj, prop)) return false;
  return true;
};

XemaDesigner.xema=null;

XemaDesigner.start=function(xema){ //the editor can be an HTML element, or the string ID of one.
	XemaDesigner.xema=xema;
	if(typeof(editor)=="string") editor=document.getElementById(editor);
	var $editor=$("#editor").addClass("designer");
	$editor.append("<div class='list'></div><div class='details'></div>");
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(xema.root);
};

XemaDesigner.getParentlessElements=function(){
	var ret=[];
	var childNames=[];
	for(var elName in XemaDesigner.xema.elements){
		if(XemaDesigner.canHaveChildren(elName)){
			XemaDesigner.xema.elements[elName].children.forEach(function(child){
				childNames.push(child.name);
			});
		}
	}
	for(var elName in XemaDesigner.xema.elements){
		if(elName!=XemaDesigner.xema.root && childNames.indexOf(elName)==-1) ret.push(elName);
	}
	return ret;
};
XemaDesigner.hasAttributes=function(elName){
	return XemaDesigner.xema.elements[elName].attributes && !XemaDesigner.isEmptyObject(XemaDesigner.xema.elements[elName].attributes);
};
XemaDesigner.hasChildren=function(elName){
	if((XemaDesigner.xema.elements[elName].filling=="chd" || XemaDesigner.xema.elements[elName].filling=="inl") && !XemaDesigner.xema.elements[elName].children) XemaDesigner.xema.elements[elName].children=[];
	return (XemaDesigner.xema.elements[elName].filling=="chd" || XemaDesigner.xema.elements[elName].filling=="inl") && XemaDesigner.xema.elements[elName].children.length>0;
};
XemaDesigner.canHaveChildren=function(elName){
	if((XemaDesigner.xema.elements[elName].filling=="chd" || XemaDesigner.xema.elements[elName].filling=="inl") && !XemaDesigner.xema.elements[elName].children) XemaDesigner.xema.elements[elName].children=[];
	return (XemaDesigner.xema.elements[elName].filling=="chd" || XemaDesigner.xema.elements[elName].filling=="inl")
};
XemaDesigner.canElementHaveValues=function(elName){
	return (XemaDesigner.xema.elements[elName].filling=="lst")
};
XemaDesigner.canAttributeHaveValues=function(elName, atName){
	return (XemaDesigner.xema.elements[elName].attributes[atName].filling=="lst")
};

XemaDesigner.listNodes=function(){
	var $list=$(".designer .list");
	var scrollTop=$list.scrollTop();
	$list.html("");
	XemaDesigner.listElement(XemaDesigner.xema.root, $list, 0);
	XemaDesigner.resizeBlinders();
	var parentless=XemaDesigner.getParentlessElements();
	if(parentless.length>0){
		$("<div class='title'><span>Unattached elements</span></div>").appendTo($list);
		parentless.forEach(function(elName){ XemaDesigner.listElement(elName, $list, 0); });
	}
	$list.scrollTop(scrollTop);
}
var elNamesDone=[];
XemaDesigner.listElement=function(elName, $list, level){
	var isSuspect=(XemaDesigner.xema._dtd ? true : false); //all xemas that originate from a DTD are inherently suspect
	if(XemaDesigner.xema.elements[elName] && (!isSuspect || elNamesDone.indexOf(elName)==-1)){
		elNamesDone.push(elName);
		var hasEponymousAscendant=($list.closest(".container."+elName.replace(/\./g, "\\.")).length>0);
		var collapsed="";
			if((XemaDesigner.hasAttributes(elName) || XemaDesigner.hasChildren(elName)) && !hasEponymousAscendant) collapsed+=" hasChildren";
			var parName=$list.closest(".container").find(".element").first().data("elName");
			if(XemaDesigner.xema.elements[elName]._collapsedUnder && XemaDesigner.xema.elements[elName]._collapsedUnder[parName]) collapsed+=" collapsed";
			if(level>5) collapsed+=" collapsed";
		var $c=$("<div class='container "+elName+" "+collapsed+"'></div>").appendTo($list);
		$("<div class='horizontal'><span class='plusminus'></span></div>").appendTo($c).on("click", function(event){ XemaDesigner.plusminus( $(event.delegateTarget.parentNode) ) });
		var html="<span class='tech'><span class='brak'>&lt;</span><span class='elm'>"+elName+"</span><span class='brak'>&gt;</span></span>";
		$("<div class='clickable element "+(XemaDesigner.xema.root==elName?"root":"")+"'>"+html+"</div>").appendTo($c).data("elName", elName).on("click", function(event){XemaDesigner.selectElement( $(event.delegateTarget).data("elName") )});
		if((XemaDesigner.hasAttributes(elName) || XemaDesigner.hasChildren(elName)) && !hasEponymousAscendant) {
			var $sublist=$("<div class='children'></div>").appendTo($c);
			if(XemaDesigner.hasAttributes(elName)) {
				for(var atName in XemaDesigner.xema.elements[elName].attributes){
					var $c=$("<div class='container'></div>").appendTo($sublist);
					$("<div class='horizontal'></div>").appendTo($c);
					var html="<span class='tech'><span class='ats'>@</span><span class='att'>"+atName+"</span></span>";
					$("<div class='clickable attribute'>"+html+"</div>").appendTo($c).data("elName", elName).data("atName", atName).on("click", function(event){XemaDesigner.selectAttribute( $(event.delegateTarget).data("elName"), $(event.delegateTarget).data("atName") )});;
				}
			}
			if(XemaDesigner.hasChildren(elName)) {
				if(true){
					XemaDesigner.xema.elements[elName].children.forEach(function(item){
						var childName=item.name;
						XemaDesigner.listElement(childName, $sublist, level+1);
					});
				}
			}
			var $blinder=$("<div class='blinder'></div>").appendTo($sublist);
			XemaDesigner.resizeBlinders($blinder);
		}
	}
};
XemaDesigner.plusminus=function($divContainer){
	var elName=$divContainer.find(".element").first().data("elName");
	var parName=$divContainer.parent().closest(".container").find(".element").first().data("elName");
	var el=XemaDesigner.xema.elements[elName];
	if($divContainer.hasClass("collapsed")){
		$divContainer.removeClass("collapsed");
		if(el._collapsedUnder) delete el._collapsedUnder[parName];
	} else {
		$divContainer.addClass("collapsed");
		if(!el._collapsedUnder) el._collapsedUnder={}; el._collapsedUnder[parName]=true;
	}
	XemaDesigner.resizeBlinders();
}
XemaDesigner.resizeBlinders=function($blinder){
	if($blinder){
		go($blinder)
	} else {
		$(".designer .blinder").each(function(){
			var $blinder=$(this);
			go($blinder)
		});
	}
	function go($blinder){
		var $prev=$blinder.prev();
		if($prev.length>0){
			$blinder.css({top: $prev.position().top+16});
		}
	}
};

XemaDesigner.selectElement=function(elName){
	$(".designer .list *").removeClass("current");
	$(".designer .list .element").each(function(){if($(this).data("elName")==elName) $(this).addClass("current")});
	XemaDesigner.renderElement(elName);
};
XemaDesigner.selectAttribute=function(elName, atName){
	$(".designer .list *").removeClass("current");
	$(".designer .list .attribute").each(function(){if($(this).data("elName")==elName && $(this).data("atName")==atName) $(this).addClass("current")});
	XemaDesigner.renderAttribute(elName, atName);
};

XemaDesigner.renderElement=function(elName){
	var $details=$(".designer .details").html("");
	XemaDesigner.renderElementName(elName);
	XemaDesigner.renderElementAttributes(elName);
	XemaDesigner.renderElementFilling(elName);
	if(XemaDesigner.canHaveChildren(elName)) XemaDesigner.renderElementChildren(elName);
	if(XemaDesigner.canElementHaveValues(elName)) XemaDesigner.renderElementValues(elName);
	//$details.hide().fadeIn("fast");
};
XemaDesigner.renderAttribute=function(elName, atName){
	var $details=$(".designer .details").html("");
	XemaDesigner.renderAttributeName(elName, atName);
	XemaDesigner.renderAttributeFilling(elName, atName);
	if(XemaDesigner.canAttributeHaveValues(elName, atName)) XemaDesigner.renderAttributeValues(elName, atName);
	//$details.hide().fadeIn("fast");
};

XemaDesigner.deleteElement=function(elName){
	delete XemaDesigner.xema.elements[elName];
	XemaDesigner.deleteChildRefs(elName);
	XemaDesigner.listNodes();
	$(".designer .details").html("");
	XemaDesigner.onchange();
};
XemaDesigner.deleteAttribute=function(elName, atName){
	delete XemaDesigner.xema.elements[elName].attributes[atName];
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.deleteChildRefs=function(elName){
	for(var parName in XemaDesigner.xema.elements){
		var par=XemaDesigner.xema.elements[parName];
		if(par.filling=="chd" || par.filling=="inl") {
			var children=[];
			par.children.forEach(function(item){ if(item.name!=elName) children.push(item); });
			par.children=children;
		}
	}
	XemaDesigner.onchange();
};

XemaDesigner.setRoot=function(elName){
	$(".designer .details").html("");
	XemaDesigner.xema.root=elName;
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};

XemaDesigner.renderElementName=function(elName){
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Element</div>");
	$("<input class='textbox tech elName'/>").appendTo($block).val(elName).on("keyup change", function(event){
		$(".designer .errInvalidRename").hide();
		$(".designer .errRenameExists").hide();
		if(event.type=="keyup" && event.which==13) XemaDesigner.renameElement(elName, $(".designer input.elName").val()); //enter
		else {
			if(event.type=="keyup" && event.which==27) $(".designer input.elName").val(elName); //escape
			if($(event.target).val()!=elName) {
				$(".designer .butRename").show(); $(".designer .butRenameCancel").show(); $(".designer .butDeleteElement").hide();
			}
			else {
				$(".designer .butRename").hide(); $(".designer .butRenameCancel").hide(); $(".designer .butDeleteElement").show();
				$(".designer .errInvalidRename").hide(); $(".designer .errRenameExists").hide();
			}
		}
	});
	$("<button class='butRename iconAccept'>Rename</button>").hide().appendTo($block).on("click", function(event){ XemaDesigner.renameElement(elName, $(".designer input.elName").val()) });
	$("<button class='butRenameCancel iconCancel'>Cancel renaming</button>").hide().appendTo($block).on("click", function(event){
		$(".designer input.elName").val(elName);
		$(".designer .butRename").hide(); $(".designer .butRenameCancel").hide(); $(".designer .butDeleteElement").show();
	});
	if(XemaDesigner.xema.root!=elName) $("<button class='butDeleteElement iconCross'>Delete element</button>").appendTo($block).on("click", function(event){ XemaDesigner.deleteElement(elName) });
	$("<div class='warn errInvalidRename'>Cannot rename, not a valid XML name.</div>").appendTo($block).hide();
	$("<div class='warn errRenameExists'>Cannot rename, such element already exists.</div>").appendTo($block).hide();
};
XemaDesigner.renderAttributeName=function(elName, atName){
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Attribute</div>");
	$("<input class='textbox tech atName'/>").appendTo($block).val(atName).on("keyup change", function(event){
		$(".designer .errInvalidAtName").hide();
		$(".designer .errAtNameExists").hide();
		if(event.type=="keyup" && event.which==13) XemaDesigner.renameAttribute(elName, atName, $(".designer input.atName").val()); //enter
		else {
			if(event.type=="keyup" && event.which==27) $(".designer input.atName").val(atName); //escape
			if($(event.target).val()!=atName) $(".designer .butRename").show(); else $(".designer .butRename").hide();
		}
	});
	$("<button class='butRename iconAccept'>Rename</button>").hide().appendTo($block).on("click", function(event){ XemaDesigner.renameAttribute(elName, atName, $(".designer input.atName").val()) });
	$("<button class='butDeleteAttribute iconCross'>Delete attribute</button>").appendTo($block).on("click", function(event){ XemaDesigner.deleteAttribute(elName, atName) });
	$("<div class='warn errInvalidAtName'>Cannot rename, not a valid XML name.</div>").appendTo($block).hide();
	$("<div class='warn errAtNameExists'>Cannot rename, such attribute already exists.</div>").appendTo($block).hide();
};

XemaDesigner.renameElement=function(elName, newName){
	if(!XemaDesigner.isValidXmlName(newName)){
		$(".designer .errInvalidRename").show();
	} else if(XemaDesigner.xema.elements[newName]) {
		$(".designer .errRenameExists").show();
	} else {
		XemaDesigner.xema.elements[newName]=XemaDesigner.xema.elements[elName];
		delete XemaDesigner.xema.elements[elName];
		if(XemaDesigner.xema.root==elName) XemaDesigner.xema.root=newName;
		var pars=XemaDesigner.renameChildRefs(elName, newName);
		XemaDesigner.listNodes();
		XemaDesigner.selectElement(newName);
		XemaDesigner.onchange();
	}
};
XemaDesigner.renameAttribute=function(elName, atName, newName){
	if(!XemaDesigner.isValidXmlName(newName)){
		$(".designer .errInvalidAtName").show();
	} else if(XemaDesigner.xema.elements[elName].attributes[newName]) {
		$(".designer .errAtNameExists").show();
	} else {
		XemaDesigner.xema.elements[elName].attributes[newName]=XemaDesigner.xema.elements[elName].attributes[atName];
		delete XemaDesigner.xema.elements[elName].attributes[atName];
		XemaDesigner.listNodes();
		XemaDesigner.selectAttribute(elName, newName);
		XemaDesigner.onchange();
	}
};
XemaDesigner.renameChildRefs=function(elName, newName){
	for(var parName in XemaDesigner.xema.elements){
		var par=XemaDesigner.xema.elements[parName];
		if(par.filling=="chd" || par.filling=="inl") {
			par.children.forEach(function(item){ if(item.name==elName) item.name=newName; });
		}
	}
	XemaDesigner.onchange();
};

XemaDesigner.renderElementAttributes=function(elName){
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title tight'>Attributes</div>");
	if(XemaDesigner.hasAttributes(elName)) {
		var $table=$("<table></table>").appendTo($block);
		for(var atName in XemaDesigner.xema.elements[elName].attributes){
			var at=XemaDesigner.xema.elements[elName].attributes[atName];
			var $row=$("<tr><td class='cell1'></td><td class='cell2'></td><td class='cell9'></td></tr>").appendTo($table);

			var html="<span class='tech'><span class='ats'>@</span><span class='att'>"+atName+"</span></span>";
			$(html).appendTo($row.find("td.cell1")).data("atName", atName).on("click", function(event){ XemaDesigner.selectAttribute(elName, $(event.delegateTarget).data("atName")); });

			var $settings=$("<span><label class='radio'><input type='radio' name='"+atName+"' value='optional' "+(at.optionality=="optional"?"checked":"")+"/>optional</label> <label class='radio'><input type='radio' name='"+atName+"' value='obligatory' "+(at.optionality=="obligatory"?"checked":"")+"/>obligatory</label></span>").appendTo($row.find("td.cell2"));
			$settings.find("input").data("atName", atName).on("click change", function(event){
				XemaDesigner.changeOptionality(elName, $(event.target).data("atName"), $(event.target).val());
			});

			$("<button class='iconOnly iconArrowUp'>&nbsp;</button>").data("atName", atName).appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveAttributeUp(elName, $(event.delegateTarget).data("atName")) });
			$("<button class='iconOnly iconArrowDown'>&nbsp;</button>").data("atName", atName).appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveAttributeDown(elName, $(event.delegateTarget).data("atName")) });
			$("<button class='iconOnly iconCross'>&nbsp;</button>").data("atName", atName).appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.deleteAttribute(elName, $(event.delegateTarget).data("atName")) });
		}
	}
	$("<button class='butAtNewOpener iconAdd'>Add...</button>").appendTo($block).on("click", function(event){
		$(".designer .butAtNewOpener").hide(); $(".designer .txtAtNew").show().focus(); $(".designer .butAtNew").show(); $(".designer .butAtNewCancel").show();
	});
	$("<input class='textbox tech atName txtAtNew'/>").hide().appendTo($block).on("keyup change", function(event){
		$(".designer .errInvalidAtName").hide(); $(".designer .errAtNameExists").hide();
		if(event.type=="keyup" && event.which==13) XemaDesigner.addAttribute(elName, $(".designer input.txtAtNew").val());
		else if(event.type=="keyup" && event.which==27){ $(".designer input.txtAtNew").val(""); $(".designer .txtAtNew").hide().focus(); $(".designer .butAtNew").hide(); $(".designer .butAtNewCancel").hide(); $(".designer .butAtNewOpener").show(); }
	});
	$("<button class='butAtNew iconAccept'>Add</button>").hide().appendTo($block).on("click", function(event){ XemaDesigner.addAttribute(elName, $(".designer input.atName").val()) });
	$("<button class='butAtNewCancel iconCancel'>Cancel</button>").hide().appendTo($block).on("click", function(event){
		$(".designer .errInvalidAtName").hide(); $(".designer .errAtNameExists").hide(); $(".designer input.txtAtNew").val(""); $(".designer .txtAtNew").hide().focus(); $(".designer .butAtNew").hide(); $(".designer .butAtNewCancel").hide(); $(".designer .butAtNewOpener").show();
	});
	$("<div class='warn errInvalidAtName'>Cannot add, not a valid XML name.</div>").appendTo($block).hide();
	$("<div class='warn errAtNameExists'>Cannot add, such attribute already exists.</div>").appendTo($block).hide();
}
XemaDesigner.renderElementChildren=function(elName){
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title tight'>Child elements</div>");
	if(XemaDesigner.hasChildren(elName)) {
		var $table=$("<table></table>").appendTo($block);
		XemaDesigner.xema.elements[elName].children.forEach(function(child){
			var $row=$("<tr><td class='cell1'></td><td class='cell2'></td><td class='cell9'></td></tr>").appendTo($table);

			var html="<span class='tech'><span class='brak'>&lt;</span><span class='elm'>"+child.name+"</span><span class='brak'>&gt;</span></span>";
			$(html).appendTo($row.find("td.cell1")).data("elName", child.name).on("click", function(event){ XemaDesigner.selectElement($(event.delegateTarget).data("elName")); });
			child.min=parseInt(child.min); child.max=parseInt(child.max);
			var $settings=$("<span>min <input class='textbox min' value='"+(child.min?child.min:"")+"'/> max <input class='textbox max' value='"+(child.max?child.max:"")+"'/><button class='change iconAccept'>Change</button><button class='cancel iconCancel'>Cancel</button></span>").appendTo($row.find("td.cell2"));
			$settings.find("input.min").data("orig", (child.min?child.min:"")).data("childName", child.name);
			$settings.find("input.max").data("orig", (child.max?child.max:"")).data("childName", child.name);
			$settings.find("button").data("childName", child.name).hide();
			$settings.find("input").on("keyup change", function(event){
				if(event.type=="keyup" && event.which==27){
						$settings.find("button").hide();
						$settings.find("input.min").val($settings.find("input.min").data("orig"));
						$settings.find("input.max").val($settings.find("input.max").data("orig"));
				} else if(event.type=="keyup" && event.which==13){
						XemaDesigner.changeMinMax(elName, child.name, $settings.find("input.min").val(), $settings.find("input.max").val());
				} else {
					$settings.find("button").show();
				}
			});
			$settings.find("button.change").on("click", function(event){
				XemaDesigner.changeMinMax(elName, child.name, $settings.find("input.min").val(), $settings.find("input.max").val());
			});
			$settings.find("button.cancel").on("click", function(event){
				$settings.find("button").hide();
				$settings.find("input.min").val($settings.find("input.min").data("orig"));
				$settings.find("input.max").val($settings.find("input.max").data("orig"));
			});

			$("<button class='iconOnly iconArrowUp'>&nbsp;</button>").data("elName", child.name).appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveElementUp(elName, $(event.delegateTarget).data("elName")) });
			$("<button class='iconOnly iconArrowDown'>&nbsp;</button>").data("elName", child.name).appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveElementDown(elName, $(event.delegateTarget).data("elName")) });
			$("<button class='iconOnly iconCross'>&nbsp;</button>").appendTo($row.find("td.cell9")).data("elName", child.name).on("click", function(event){ XemaDesigner.detachElement(elName, $(event.delegateTarget).data("elName")) });
		});
	}
	$("<button class='butElNewOpener iconAdd'>Add...</button>").appendTo($block).on("click", function(event){
		$(".designer .butElNewOpener").hide(); $(".designer .txtElNew").show().focus(); $(".designer .butElNew").show(); $(".designer .butElNewCancel").show();
	});
	$("<input class='textbox tech elName txtElNew'/>").hide().appendTo($block).on("keyup change", function(event){
		$(".designer .errInvalidElName").hide();
		if(event.type=="keyup" && event.which==13) XemaDesigner.addElement(elName, $(".designer input.txtElNew").val());
		else if(event.type=="keyup" && event.which==27){ $(".designer input.txtElNew").val(""); $(".designer .txtElNew").hide().focus(); $(".designer .butElNew").hide(); $(".designer .butElNewCancel").hide(); $(".designer .butElNewOpener").show(); }
	});
	$("<button class='butElNew iconAccept'>Add</button>").hide().appendTo($block).on("click", function(event){ XemaDesigner.addElement(elName, $(".designer input.txtElNew").val()) });
	$("<button class='butElNewCancel iconCancel'>Cancel</button>").hide().appendTo($block).on("click", function(event){
		$(".designer .errInvalidElName").hide(); $(".designer input.txtElNew").val(""); $(".designer .txtElNew").hide().focus(); $(".designer .butElNew").hide(); $(".designer .butElNewCancel").hide(); $(".designer .butElNewOpener").show();
	});
	$("<div class='warn errInvalidElName'>Cannot add, not a valid XML name.</div>").appendTo($block).hide();
}

XemaDesigner.addAttribute=function(elName, atName){
	if(!XemaDesigner.xema.elements[elName].attributes) XemaDesigner.xema.elements[elName].attributes={};
	if(!XemaDesigner.isValidXmlName(atName)){
		$(".designer .errInvalidAtName").show();
	} else if(XemaDesigner.xema.elements[elName].attributes[atName]) {
		$(".designer .errAtNameExists").show();
	} else {
		XemaDesigner.xema.elements[elName].attributes[atName]={optionality: "optional", filling: "txt"};
		XemaDesigner.listNodes();
		XemaDesigner.selectElement(elName);
		XemaDesigner.onchange();
	}
};
XemaDesigner.addElement=function(parName, elName){
	if(!XemaDesigner.isValidXmlName(elName)){
		$(".designer .errInvalidElName").show();
	} else {
			if(!XemaDesigner.xema.elements[elName]) XemaDesigner.xema.elements[elName]={filling: "chd", children: [], attributes: {}};
		XemaDesigner.xema.elements[parName].children.push({name: elName, min: 0, max: 0, rec: 0});
		XemaDesigner.listNodes();
		XemaDesigner.selectElement(parName);
		XemaDesigner.onchange();
	}
};
XemaDesigner.detachElement=function(parName, elName){
	var par=XemaDesigner.xema.elements[parName];
	var children=[];
	par.children.forEach(function(item){ if(item.name!=elName) children.push(item); });
	par.children=children;
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(parName);
	XemaDesigner.onchange();
};
XemaDesigner.changeMinMax=function(parName, childName, min, max){
	XemaDesigner.xema.elements[parName].children.forEach(function(child){
		if(child.name==childName){
			if($.trim(min)=="") min=0; else if($.isNumeric(min)) min=Math.abs(Math.floor(min)); else min=child.min;
			if($.trim(max)=="") max=0; else if($.isNumeric(max)) max=Math.abs(Math.floor(max)); else max=child.max;
			if(max>0 && max<min) max=min;
			child.min=min;
			child.max=max;
		}
	});
	XemaDesigner.selectElement(parName);
	XemaDesigner.onchange();
};
XemaDesigner.changeOptionality=function(elName, atName, optionality){
	XemaDesigner.xema.elements[elName].attributes[atName].optionality=optionality;
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};

XemaDesigner.renderElementFilling=function(elName){
	var el=XemaDesigner.xema.elements[elName];
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Content</div>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='chd' "+(el.filling=="chd"?"checked":"")+"/>Child elements</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='txt' "+(el.filling=="txt"?"checked":"")+"/>Text</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='inl' "+(el.filling=="inl"?"checked":"")+"/>Text with markup</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='lst' "+(el.filling=="lst"?"checked":"")+"/>Value from list</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='emp' "+(el.filling=="emp"?"checked":"")+"/>Empty</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='med' "+(el.filling=="med"?"checked":"")+"/>Media</label>");
	$block.find("input").on("click change", function(event){
		XemaDesigner.changeElementFilling(elName, $(event.target).val());
	});
};
XemaDesigner.renderAttributeFilling=function(elName, atName){
	var at=XemaDesigner.xema.elements[elName].attributes[atName];
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Content</div>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='txt' "+(at.filling=="txt"?"checked":"")+"/>Text</label>");
	$block.append("<label class='radio'><input type='radio' name='filling' value='lst' "+(at.filling=="lst"?"checked":"")+"/>Value from list</label>");
	$block.find("input").on("click change", function(event){
		XemaDesigner.changeAttributeFilling(elName, atName, $(event.target).val());
	});
};
XemaDesigner.changeElementFilling=function(elName, filling){
	var el=XemaDesigner.xema.elements[elName];
	el.filling=filling;
	if(filling=="chd" || filling=="inl") {
		if(!el.children) el.children=[];
		//delete el.values;
	}
	else if(filling=="lst") {
		//delete el.children;
		if(!el.values) el.values=[];
	} else {
		//delete el.children;
		//delete el.values;
	}
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.changeAttributeFilling=function(elName, atName, filling){
	var at=XemaDesigner.xema.elements[elName].attributes[atName];
	at.filling=filling;
	if(filling=="lst") {
		if(!at.values) at.values=[];
	} else {
		//delete at.values;
	}
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};

XemaDesigner.renderElementValues=function(elName){
	var el=XemaDesigner.xema.elements[elName];
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title tight'>Values</div>");
	if(el.values.length>0) {
		var $table=$("<table></table>").appendTo($block);
		el.values.forEach(function(obj){
			var $row=$("<tr><td class='cell1'></td><td class='cell9'></td></tr>").appendTo($table);
			$row.find("td.cell1").append("<input class='textbox val'/><input class='textbox cap'/>");
			$row.find("td.cell1").append("<button class='change iconAccept'>Change</button><button class='cancel iconCancel'>Cancel</button>");
			$row.find("input.val").data("orig", obj.value).val(obj.value);
			$row.find("input.cap").data("orig", obj.caption).val(obj.caption);
			$row.find("button").hide();
			$row.find("input").on("keyup change", function(event){
				$row.find("button").show();
				if(event.type=="keyup" && event.which==27){
					$row.find("button").hide();
					$row.find("input.val").val($row.find("input.val").data("orig"));
					$row.find("input.cap").val($row.find("input.cap").data("orig"));
				} if(event.type=="keyup" && event.which==13){
					XemaDesigner.changeElementValue(elName, obj.value, $row.find("input.val").val(), $row.find("input.cap").val());
				}
			});
			$row.find("button.change").on("click", function(event){
				XemaDesigner.changeElementValue(elName, obj.value, $row.find("input.val").val(), $row.find("input.cap").val());
			});
			$row.find("button.cancel").on("click", function(event){
				$row.find("button").hide();
				$row.find("input.val").val($row.find("input.val").data("orig"));
				$row.find("input.cap").val($row.find("input.cap").data("orig"));
			});
			$("<button class='iconOnly iconArrowUp'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveElementValueUp(elName, obj.value) });
			$("<button class='iconOnly iconArrowDown'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveElementValueDown(elName, obj.value) });
			$("<button class='iconOnly iconCross'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.deleteElementValue(elName, obj.value) });
		});
	}
	$("<button class='butNewValue iconAdd'>Add...</button>").appendTo($block).on("click", function(event){
		$block.find("button.butNewValue").hide();
		$block.find("input.new").show().first().focus();
		$block.find("button.butNewValueOK").show();
		$block.find("button.butNewValueCancel").show();
	});
	$("<input class='textbox new val'/>").appendTo($block);
	$("<input class='textbox new cap'/>").appendTo($block);
	$block.find("input.new").hide().on("keyup change", function(event){
		if(event.type=="keyup" && event.which==27){
			$block.find("input.new").hide().val("");
			$block.find("button.butNewValueOK").hide();
			$block.find("button.butNewValueCancel").hide();
			$block.find("button.butNewValue").show();
		} if(event.type=="keyup" && event.which==13){
			XemaDesigner.addElementValue(elName, $block.find("input.new.val").val(), $block.find("input.new.cap").val());
		}
	});
	$("<button class='butNewValueOK iconAccept'>Add</button>").hide().appendTo($block).on("click", function(event){
		XemaDesigner.addElementValue(elName, $block.find("input.new.val").val(), $block.find("input.new.cap").val());
	});
	$("<button class='butNewValueCancel iconCancel'>Cancel</button>").hide().appendTo($block).on("click", function(event){
		$block.find("input.new").hide().val("");
		$block.find("button.butNewValueOK").hide();
		$block.find("button.butNewValueCancel").hide();
		$block.find("button.butNewValue").show();
	});
};
XemaDesigner.renderAttributeValues=function(elName, atName){
	var at=XemaDesigner.xema.elements[elName].attributes[atName];
	var $block=$("<div class='block'></div>").appendTo($(".designer .details"));
	$block.append("<div class='title'>Values</div>");
	if(at.values.length>0) {
		var $table=$("<table></table>").appendTo($block);
		at.values.forEach(function(obj){
			var $row=$("<tr><td class='cell1'></td><td class='cell9'></td></tr>").appendTo($table);
			$row.find("td.cell1").append("<input class='textbox val'/><input class='textbox cap'/>");
			$row.find("td.cell1").append("<button class='change iconAccept'>Change</button><button class='cancel iconCancel'>Cancel</button>");
			$row.find("input.val").data("orig", obj.value).val(obj.value);
			$row.find("input.cap").data("orig", obj.caption).val(obj.caption);
			$row.find("button").hide();
			$row.find("input").on("keyup change", function(event){
				$row.find("button").show();
				if(event.type=="keyup" && event.which==27){
					$row.find("button").hide();
					$row.find("input.val").val($row.find("input.val").data("orig"));
					$row.find("input.cap").val($row.find("input.cap").data("orig"));
				} if(event.type=="keyup" && event.which==13){
					XemaDesigner.changeAttributeValue(elName, atName, obj.value, $row.find("input.val").val(), $row.find("input.cap").val());
				}
			});
			$row.find("button.change").on("click", function(event){
				XemaDesigner.changeAttributeValue(elName, atName, obj.value, $row.find("input.val").val(), $row.find("input.cap").val());
			});
			$row.find("button.cancel").on("click", function(event){
				$row.find("button").hide();
				$row.find("input.val").val($row.find("input.val").data("orig"));
				$row.find("input.cap").val($row.find("input.cap").data("orig"));
			});
			$("<button class='iconOnly iconArrowUp'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveAttributeValueUp(elName, atName, obj.value) });
			$("<button class='iconOnly iconArrowDown'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.moveAttributeValueDown(elName, atName, obj.value) });
			$("<button class='iconOnly iconCross'>&nbsp;</button>").appendTo($row.find("td.cell9")).on("click", function(event){ XemaDesigner.deleteAttributeValue(elName, atName, obj.value) });
		});
	}
	$("<button class='butNewValue iconAdd'>Add...</button>").appendTo($block).on("click", function(event){
		$block.find("button.butNewValue").hide();
		$block.find("input.new").show().first().focus();
		$block.find("button.butNewValueOK").show();
		$block.find("button.butNewValueCancel").show();
	});
	$("<input class='textbox new val'/>").appendTo($block);
	$("<input class='textbox new cap'/>").appendTo($block);
	$block.find("input.new").hide().on("keyup change", function(event){
		if(event.type=="keyup" && event.which==27){
			$block.find("input.new").hide().val("");
			$block.find("button.butNewValueOK").hide();
			$block.find("button.butNewValueCancel").hide();
			$block.find("button.butNewValue").show();
		} if(event.type=="keyup" && event.which==13){
			XemaDesigner.addAttributeValue(elName, atName, $block.find("input.new.val").val(), $block.find("input.new.cap").val());
		}
	});
	$("<button class='butNewValueOK iconAccept'>Add</button>").hide().appendTo($block).on("click", function(event){
		XemaDesigner.addAttributeValue(elName, atName, $block.find("input.new.val").val(), $block.find("input.new.cap").val());
	});
	$("<button class='butNewValueCancel iconCancel'>Cancel</button>").hide().appendTo($block).on("click", function(event){
		$block.find("input.new").hide().val("");
		$block.find("button.butNewValueOK").hide();
		$block.find("button.butNewValueCancel").hide();
		$block.find("button.butNewValue").show();
	});
};

XemaDesigner.deleteElementValue=function(elName, value){
	var objs=[];
	XemaDesigner.xema.elements[elName].values.forEach(function(obj){
		if(obj.value!=value) objs.push(obj);
	});
	XemaDesigner.xema.elements[elName].values=objs;
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.deleteAttributeValue=function(elName, atName, value){
	var objs=[];
	XemaDesigner.xema.elements[elName].attributes[atName].values.forEach(function(obj){
		if(obj.value!=value) objs.push(obj);
	});
	XemaDesigner.xema.elements[elName].attributes[atName].values=objs;
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};
XemaDesigner.changeElementValue=function(elName, oldValue, newValue, newCaption){
	newValue=$.trim(newValue); newCaption=$.trim(newCaption);
	if(newValue!="") {
		XemaDesigner.xema.elements[elName].values.forEach(function(obj){
			if(obj.value==oldValue) { obj.value=newValue; obj.caption=newCaption; }
		});
	}
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.changeAttributeValue=function(elName, atName, oldValue, newValue, newCaption){
	newValue=$.trim(newValue); newCaption=$.trim(newCaption);
	if(newValue!="") {
		XemaDesigner.xema.elements[elName].attributes[atName].values.forEach(function(obj){
			if(obj.value==oldValue) { obj.value=newValue; obj.caption=newCaption; }
		});
	}
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};
XemaDesigner.addElementValue=function(elName, value, caption){
	value=$.trim(value); caption=$.trim(caption);
	if(value!="") XemaDesigner.xema.elements[elName].values.push({value: value, caption: caption});
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.addAttributeValue=function(elName, atName, value, caption){
	value=$.trim(value); caption=$.trim(caption);
	if(value!="") XemaDesigner.xema.elements[elName].attributes[atName].values.push({value: value, caption: caption});
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};

XemaDesigner.moveElementUp=function(parName, childName){
	var par=XemaDesigner.xema.elements[parName];
	var iMe=-1; par.children.forEach(function(obj, i){ if(obj.name==childName) iMe=i; });
	var temp=par.children[iMe-1]; par.children[iMe-1]=par.children[iMe]; par.children[iMe]=temp;
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(parName);
	XemaDesigner.onchange();
};
XemaDesigner.moveElementDown=function(parName, childName){
	var par=XemaDesigner.xema.elements[parName];
	var iMe=-1; par.children.forEach(function(obj, i){ if(obj.name==childName) iMe=i; });
	var temp=par.children[iMe+1]; par.children[iMe+1]=par.children[iMe]; par.children[iMe]=temp;
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(parName);
	XemaDesigner.onchange();
};
XemaDesigner.moveElementValueUp=function(elName, value){
	var el=XemaDesigner.xema.elements[elName];
	var iMe=-1; el.values.forEach(function(obj, i){ if(obj.value==value) iMe=i; });
	var temp=el.values[iMe-1]; el.values[iMe-1]=el.values[iMe]; el.values[iMe]=temp;
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.moveElementValueDown=function(elName, value){
	var el=XemaDesigner.xema.elements[elName];
	var iMe=-1; el.values.forEach(function(obj, i){ if(obj.value==value) iMe=i; });
	var temp=el.values[iMe+1]; el.values[iMe+1]=el.values[iMe]; el.values[iMe]=temp;
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.moveAttributeValueUp=function(elName, atName, value){
	var at=XemaDesigner.xema.elements[elName].attributes[atName];
	var iMe=-1; at.values.forEach(function(obj, i){ if(obj.value==value) iMe=i; });
	var temp=at.values[iMe-1]; at.values[iMe-1]=at.values[iMe]; at.values[iMe]=temp;
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};
XemaDesigner.moveAttributeValueDown=function(elName, atName, value){
	var at=XemaDesigner.xema.elements[elName].attributes[atName];
	var iMe=-1; at.values.forEach(function(obj, i){ if(obj.value==value) iMe=i; });
	var temp=at.values[iMe+1]; at.values[iMe+1]=at.values[iMe]; at.values[iMe]=temp;
	XemaDesigner.selectAttribute(elName, atName);
	XemaDesigner.onchange();
};
XemaDesigner.moveAttributeUp=function(elName, atName){
	var el=XemaDesigner.xema.elements[elName];
	var keys=[]; for(var key in el.attributes) keys.push(key);
	var iMe=-1; keys.forEach(function(key, i){ if(key==atName) iMe=i; });
	var temp=keys[iMe-1]; keys[iMe-1]=keys[iMe]; keys[iMe]=temp;
	keys.forEach(function(key){ var obj=el.attributes[key]; delete el.attributes[key]; el.attributes[key]=obj; });
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
XemaDesigner.moveAttributeDown=function(elName, atName){
	var el=XemaDesigner.xema.elements[elName];
	var keys=[]; for(var key in el.attributes) keys.push(key);
	var iMe=-1; keys.forEach(function(key, i){ if(key==atName) iMe=i; });
	var temp=keys[iMe+1]; keys[iMe+1]=keys[iMe]; keys[iMe]=temp;
	keys.forEach(function(key){ var obj=el.attributes[key]; delete el.attributes[key]; el.attributes[key]=obj; });
	XemaDesigner.listNodes();
	XemaDesigner.selectElement(elName);
	XemaDesigner.onchange();
};
