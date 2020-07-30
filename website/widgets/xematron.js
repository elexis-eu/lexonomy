var Xematron={};

//takes a xema, returns a Xonomy docSpec:
Xematron.xema2docspec=function(xema, stringAsker){
	var docSpec={
		elements: {},
		unknownElement: function(elName){
			if(elName.indexOf("lxnm:")==0) return {
				isReadOnly: true,
				isInvisible: true,
			};
			return {
				oneliner: function(jsMe){ return !jsMe.hasElements(); },
				menu: [{caption: "Delete", action: Xonomy.deleteElement, hideIf: function(jsMe){return !jsMe.parent();}}],
			};
		},
		unknownAttribute: function(elName, atName){
			if(atName.indexOf("lxnm:")==0) return {
				isReadOnly: true,
				isInvisible: true,
			};
			return  {
				menu: [{caption: "Delete", action: Xonomy.deleteAttribute}],
			};
		},
		validate: function(jsElement){ Xematron.validate(xema, jsElement); },
	};
	var elnames=[]; for(var elname in xema.elements) elnames.push(elname); elnames.forEach(function(elname){
		var xel=xema.elements[elname]; //the xema element from which we are creating a docSpec element
		var del={}; docSpec.elements[elname]=del; //the docSpec element we are creating
		del.menu=[];
		del.inlineMenu=[];
		del.collapsible=false;

		var submenu=[];

		//children of inl elements have a menu item to unwrap themselves:
		submenu.push({
			caption: "Unwrap <"+elname+">",
			action: Xonomy.unwrap,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling!="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
			keyCaption: "Ctrl + Shift + X",
		});

		//all elements have a menu item to remove themselves, except the top-level element and except children of inl elements:
		submenu.push({
			caption: "Remove <"+elname+">",
			action: Xonomy.deleteElement,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
			keyCaption: "Ctrl + Shift + X",
		});

		//all elements have a menu item to duplicate themselves, except the top-level element and except children of inl elements:
		submenu.push({
			caption: "Duplicate <"+elname+">",
			action: Xonomy.duplicateElement,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==68 },
			keyCaption: "Ctrl + Shift + D",
		});

		//all elements have a menu item to move themselves up and down, except the top-level element, and except children of inl elements, and expect elements that have nowhere to move to:
		submenu.push({
			caption: "Move <"+elname+"> up",
			action: Xonomy.moveElementUp,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementUp(jsMe.htmlID); },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==38 },
			keyCaption: "Ctrl + Shift + Up",
		});
		submenu.push({
			caption: "Move <"+elname+"> down",
			action: Xonomy.moveElementDown,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementDown(jsMe.htmlID); },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==40 },
			keyCaption: "Ctrl + Shift + Down",
		});

		//all elements have a menu item to merge themselves with a sibling, except the top-level element, and except children of inl elements, and expect elements that have no-one to merge with:
		submenu.push({
			caption: "Merge <"+elname+"> with previous",
			action: Xonomy.mergeWithPrevious,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getPrecedingSibling() || jsMe.getPrecedingSibling().name!=elname },
			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==38 },
			keyCaption: "Alt + Shift + Up",
		});
		submenu.push({
			caption: "Merge <"+elname+"> with next",
			action: Xonomy.mergeWithNext,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getFollowingSibling() || jsMe.getFollowingSibling().name!=elname },
			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==40 },
			keyCaption: "Alt + Shift + Down",
		});

		if(submenu.length>0) {
			del.menu.push({
				caption: "This element",
				menu: submenu,
				expanded: true,
			});
		}

		//txt elements are easy:
		if(xel.filling=="txt"){
			del.hasText=true;
			del.oneliner=true;
			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
			// del.collapsible=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
			// del.collapsed=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
		}

		//lst elements are like txt elements but they also have a picklist:
		if(xel.filling=="lst"){
			del.hasText=true;
			del.oneliner=true;
			del.asker=Xonomy.askPicklist;
			del.askerParameter=[];
			xel.values.forEach(function(obj){
				del.askerParameter.push({ value: obj.value, caption: obj.caption });
			});
		}

		//med elements are like txt:
		if(xel.filling=="med"){
			del.hasText=true;
			del.oneliner=true;
			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
		}

		del.attributes={};
		var submenu=[];
		var attnames=[]; for(var attname in xel.attributes) attnames.push(attname); attnames.forEach(function(attname){
			var xatt=xel.attributes[attname]; //the xema attribute from which we are creating a docSpec attribute
			var datt={}; del.attributes[attname]=datt; //the docSpec attribute we are creating
			datt.menu=[];

			//txt attributes are easy:
			if(xatt.filling=="txt"){
				datt.asker=Xonomy[stringAsker] || Xonomy.askLongString;
			}

			//lst attributes are like txt attributes but they also have a picklist:
			if(xatt.filling=="lst"){
				datt.asker=Xonomy.askPicklist;
				datt.askerParameter=[];
				xatt.values.forEach(function(obj){
					datt.askerParameter.push({ value: obj.value, caption: obj.caption });
				});
			}

			//every attribute's owner element has a menu item to add the attribute:
			submenu.push({
				caption: "Add @"+attname+"",
				action: Xonomy.newAttribute,
				actionParameter: {name: attname, value: ""},
				hideIf: function(jsMe){ return jsMe.hasAttribute(attname); },
			});

			//every attribute has a menu item to remove itself:
			datt.menu.push({
				caption: "Remove @"+attname+"",
				action: Xonomy.deleteAttribute,
				keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
				keyCaption: "Ctrl + Shift + X",
			});

		}); //end of loop over attributes
		if(submenu.length>0) {
			del.menu.push({
				caption: "Attributes",
				menu: submenu,
			});
		}

		//chd elements have menu items for adding children:
		if(xel.filling=="chd"){
			if(!xel.children) xel.children=[];
			var submenu=[];
			xel.children.forEach(function(obj){
				submenu.push({
					caption: "Add <"+obj.name+">",
					action: Xonomy.newElementChild,
					actionParameter: Xematron.initialElement(xema, obj.name),
				});
			});
			if(submenu.length>0) {
				del.menu.push({
					caption: "Child elements",
					menu: submenu,
				});
			}
			//del.collapsible=function(jsMe){ return (jsMe.internalParent ? true : false); };
			//del.collapsed=true;
			del.collapsible=true;
			del.collapsed=function(jsMe){ return (jsMe.internalParent ? true : false); };
		}

		//inl elements have inline menu items for wrapping:
		if(xel.filling=="inl"){
			del.hasText=true;
			del.oneliner=true;
			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
			if(!xel.children) xel.children=[];
			xel.children.forEach(function(obj){
				del.inlineMenu.push({
					caption: "Wrap with <"+obj.name+">",
					action: Xonomy.wrap,
					actionParameter: {template: "<"+obj.name+Xematron.initialAttributes(xema, obj.name)+">$</"+obj.name+">", placeholder: "$"},
				});
			});
			// del.collapsible=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
			// del.collapsed=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
		}

		//all elements can be dragged-and-droped:
		del.canDropTo=Xematron.listParents(xema, elname);

		//all elements have a fixed position among their siblings if the parent is a 'chd' element:
		del.mustBeAfter=Xematron.listPrecedingSiblings(xema, elname);
		del.mustBeBefore=Xematron.listFollowingSiblings(xema, elname)

		//Menu items for adding siblings:
		var submenu=[];
		Xematron.listElements(xema).forEach(function(siblingName){
			submenu.push({
				caption: "Add <"+siblingName+">",
				action: Xonomy.newElementBefore,
				actionParameter: Xematron.initialElement(xema, siblingName),
				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingName) || (jsMe.getPrecedingSibling() && jsMe.getPrecedingSibling().name==jsMe.name) || del.mustBeAfter(jsMe).indexOf(siblingName)==-1; },
			});
		});
		submenu.push({
			caption: "Add another <"+elname+"> before",
			action: Xonomy.newElementBefore,
			actionParameter: Xematron.initialElement(xema, elname),
			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
		});
		submenu.push({
			caption: "Add another <"+elname+"> after",
			action: Xonomy.newElementAfter,
			actionParameter: Xematron.initialElement(xema, elname),
			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
		});
		Xematron.listElements(xema).forEach(function(siblingName){
			submenu.push({
				caption: "Add <"+siblingName+">",
				action: Xonomy.newElementAfter,
				actionParameter: Xematron.initialElement(xema, siblingName),
				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingName) || (jsMe.getFollowingSibling() && jsMe.getFollowingSibling().name==jsMe.name) || del.mustBeBefore(jsMe).indexOf(siblingName)==-1; },
			});
		});
		submenu.push({
			caption: "Remove all <"+elname+"> siblings",
			action: Xonomy.deleteEponymousSiblings,
			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().getChildElements(jsMe.name).length<2; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==90 },
			keyCaption: "Ctrl + Shift + Z",
		});
		if(submenu.length>0) {
			del.menu.push({
				caption: "Sibling elements",
				menu: submenu,
			});
		}

	}); //end of loop over elements
	return docSpec;
};

//takes a xema, returns an initial XML document (as string):
Xematron.xema2xml= function(xema){
	return xema.newXml || Xematron.initialElement(xema, xema.root);
};

//helper functions:
Xematron.listParents=function(xema, elname){
	var list=[];
	for(var parname in xema.elements){
		var parent=xema.elements[parname];
		if(parent.filling=="chd"){
			if(!parent.children) parent.children=[];
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name==elname) {
					list.push(parname);
					break;
				}
			}
		}
	}
	return list;
};
Xematron.listPrecedingSiblings=function(xema, elname){
	var list={};
	for(var parname in xema.elements){
		var parent=xema.elements[parname];
		if(parent.filling=="chd"){
			var templist=[];
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name!=elname) {
					templist.push(parent.children[i].name);
				} else if(parent.children[i].name==elname) {
					list[parname]=templist;
					break;
				}
			}
		}
	}
	return function(jsMe){
		if(jsMe) for(var parname in list){ if(jsMe.parent() && parname==jsMe.parent().name) return list[parname]; }
		return [];
	};
};
Xematron.listFollowingSiblings=function(xema, elname){
	var list={};
	for(var parname in xema.elements){
		var parent=xema.elements[parname];
		if(parent.filling=="chd"){
			var templist=[];
			var found=false;
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name!=elname && found) {
					templist.push(parent.children[i].name);
				} else if(parent.children[i].name==elname) {
					found=true;
				}
			}
			list[parname]=templist;
		}
	}
	return function(jsMe){
		if(jsMe) for(var parname in list){ if(jsMe.parent() && parname==jsMe.parent().name) return list[parname]; }
		return [];
	};
};
Xematron.initialAttributes=function(xema, elname){
	var ret="";
	for(var attname in xema.elements[elname].attributes){
		var att=xema.elements[elname].attributes[attname];
		if(att.optionality=="obligatory") {
			var attvalue="";
			ret+=" "+attname+"='"+Xonomy.xmlEscape(attvalue)+"'";
		}
	}
	return ret;
};
Xematron.initialElement=function(xema, elname, depth){
	if(!depth) depth=0;
	var el=xema.elements[elname];
	var ret="<"+elname+Xematron.initialAttributes(xema, elname)+">";
	if(el.filling=="chd" && el.children && depth<10){
		el.children.forEach(function(child){
			for(var i=0; i<child.min; i++) ret+=Xematron.initialElement(xema, child.name, depth+1);
		});
	}
	ret+="</"+elname+">";
	return ret;
};
Xematron.valuesHave=function(values, value){
	var ret=false;
	for(var i=0; i<values.length; i++){
		if(values[i].value==value) { ret=true; break; }
	}
	return ret;
};
Xematron.childrenHave=function(children, childName){
	var ret=false;
	for(var i=0; i<children.length; i++){
		if(children[i].name==childName) { ret=true; break; }
	}
	return ret;
};
Xematron.validate=function(xema, jsElement){
	var xel=xema.elements[jsElement.name];
	if(!xel){ //is the element allowed to exist?
		Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The top element should be <"+xema.root+">."});
	} else {

		//cycle through the attributes the element should have:
		for(var attname in xel.attributes){
			if(xel.attributes[attname].optionality=="obligatory" && !jsElement.getAttribute(attname)){
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element is missing the @"+attname+" attribute."});
			}
		}

		//cycle through the element's attributes:
		for(var i=0; i<jsElement.attributes.length; i++) {
			var jsAttribute=jsElement.attributes[i];
			var xatt=xel.attributes[jsAttribute.name];
			if(!xatt) { //is the attribute allowed to exist?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The <"+jsElement.name+"> element should not have an attribute called @"+jsAttribute.name+"."});
			} else if(jsAttribute.value=="") { //is the attribute non-empty?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not be empty."});
			} else if(xatt.filling=="lst" && !Xematron.valuesHave(xatt.values, jsAttribute.value)) { //does the attribute have an allowed value?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not have the value @\""+jsAttribute.value+"\"."});
			}
		};

		//if this is an emp element:
		if(xel.filling=="emp") {
			if(jsElement.children.length>0) { //is the element empty like it should?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should be empty."});
			}
		}

		//if this is a lst element:
		if(xel.filling=="lst") {
			if(jsElement.getText()=="") { //does the element have text?
					Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not be empty."});
			} else if(!Xematron.valuesHave(xel.values, jsElement.getText())) { //does the element have an allowed value?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not have the value @\""+jsElement.getText()+"\"."});
			}
		}

		//if this is a txt element:
		if(xel.filling=="txt") {
			if(jsElement.getText()=="") { //does the element have text?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should have some text."});
			}
		}

		//if this is an inl element:
		if(xel.filling=="inl") {
			if(jsElement.getText()=="") { //does the element have text?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should have some text."});
			}
		}

		//if this is a chd element:
		if(xel.filling=="chd") {
			var hasTextChild=false; for(var i=0; i<jsElement.children.length; i++) if(jsElement.children[i].type=="text"){ hasTextChild=true; break; }
			if(hasTextChild) { //does the element not have text?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not have any text."});
			}
		}

		//if this is an inl or chd element:
		if(xel.filling=="inl" || xel.filling=="chd") {
			for(var i=0; i<xel.children.length; i++){
				xchild=xel.children[i];
				var children=jsElement.getChildElements(xchild.name);
				if( (xchild.min>0 && children.length<xchild.min) || (xchild.max>0 && children.length>xchild.max) )	{
					var msg="Should have ";
					if(xchild.min>0) msg+="at least "+xchild.min;
					if(xchild.min>0 && xchild.max>0) msg+=", ";
					if(xchild.max>0) msg+="at most "+xchild.max;
					msg+=".";
					if(children.length>0) {
						children.forEach(function(item){
							Xonomy.warnings.push({htmlID: item.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchild.name+"> child elements. "+msg});
						});
					} else {
						Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchild.name+"> child elements. "+msg});
					}
				}
			}
		}

		//cycle through the element's children:
		for(var i=0; i<jsElement.children.length; i++) {
			var jsChild=jsElement.children[i];
			if(jsChild.type=="element") {
				if(!Xematron.childrenHave(xel.children, jsChild.name)) {
					Xonomy.warnings.push({htmlID: jsChild.htmlID, text: "The <"+jsElement.name+"> element should not have a child element called <"+jsChild.name+">."});
				} else {
					Xematron.validate(xema, jsChild);
				}
			}
		}

		//cycle through the element's siblings:
		if(jsElement.parent()){
			var parent=jsElement.parent();
			var whereAreWe="before";
			for(var i=0; i<parent.children.length; i++) {
				var jsSibling=parent.children[i];
				if(jsSibling==jsElement){
					whereAreWe="after";
				} else {
					if(whereAreWe=="after") { //jsSibling is after jsElement == jsElement is before jsSibling
						if(Xonomy.docSpec.elements[jsElement.name].mustBeAfter(jsElement).indexOf(jsSibling.name)>-1){
							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should appear after the <"+jsSibling.name+"> element, not before it."});
						}
					}
					if(whereAreWe=="before") { //jsSibling is before jsElement == jsElement is after jsSibling
						if(Xonomy.docSpec.elements[jsElement.name].mustBeBefore(jsElement).indexOf(jsSibling.name)>-1){
							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should appear before the <"+jsSibling.name+"> element, not after it."});
						}
					}
				}
			}
		}
	}
};

Xematron.listElements=function(xema){
	var ret=[];
	var done=[];
	var doElement=function(elName){
		if(xema.elements[elName]){
			if(ret.indexOf(elName)==-1){
				ret.push(elName);
				done.push(elName);
				if((xema.elements[elName].filling=="chd" || xema.elements[elName].filling=="inl") && xema.elements[elName].children){
					for(var i=0; i<xema.elements[elName].children.length; i++) {
						doElement(xema.elements[elName].children[i].name);
					}
				}
			}
		}
	};
	doElement(xema.root);
	for(var elName in xema.elements) if(done.indexOf(elName)==-1) ret.push(elName);
	return ret;

};
