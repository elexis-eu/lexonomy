// @ts-check

// @ts-ignore
window.Xematron={};

//takes a xema, returns a Xonomy docSpec:
/**
 * 
 * @param {Xema} xema 
 * @param {string} stringAsker 
 * @returns 
 */
Xematron.xema2docspec=function(xema, stringAsker){
	/** @type {import('@elexis-eu/xonomy').XonomyDocSpecExternal} */
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
		getElementId(elementName, parentID) {
			const parentXema = parentID ? xema.elements[parentID] : undefined;
			if (parentXema) {
				// find the child that has the element as name.
				const theXemaChild = parentXema.children.find(c => xema.elements[c.name]?.elementName === elementName)
				if (theXemaChild) return theXemaChild.name; // child.name is actually ID/key in xema.elements.
				// no child by this name.
			}
			// we don't know the parent element, is it the root?
			const rootID = xema.root;
			const rootElementName = xema.elements[rootID]?.elementName || rootID;
			if (rootElementName === elementName) return xema.root;

			// not the root, find the least deep element with this name.
			// to do this, we need to find the number of steps to every element definition (with the elementName we're looking for)
			let leastDeep = Number.MAX_SAFE_INTEGER;
			let target = '';

			const seenElements = new Set(); // track processed elements to avoid infinite recursion (since elements may recursively has themselves as children)
			function descend(id, depth = 0) {
				seenElements.add(id);

				if (depth >= leastDeep) return;
				const curElementName = xema.elements[id]?.elementName || id;
				if (curElementName === elementName && depth < leastDeep) {
					leastDeep = depth;
					target = id;
					return;
				}
				// didn't match, try children (at least, those we haven't seen yet). 
				xema.elements[id]?.children?.filter(c => !seenElements.has(c.name)).forEach(c => descend(c.name, depth+1));
			}
			descend(xema.root);
			if (target) return target; // found, return it
			return elementName; // not found
		}
	};
	
	for(var elementID in xema.elements) {
		const xel=xema.elements[elementID]; //the xema element from which we are creating a docSpec element
		const elementName = xel?.elementName || elementID;
		//the docSpec element we are creating
		/** @type {import("@elexis-eu/xonomy").XonomyElementDefinitionExternal} */
		const del = {
			elementName: elementName,
			menu: [],
			inlineMenu: [],
			collapsible: false,
			attributes: {}
		};
		docSpec.elements[elementID] = del;
		
		var submenu=[];

		//children of inl elements have a menu item to unwrap themselves:
		submenu.push({
			caption: "Unwrap <"+elementName+">",
			action: Xonomy.unwrap,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling!="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
			keyCaption: "Ctrl + Shift + X",
		});

		//all elements have a menu item to remove themselves, except the top-level element and except children of inl elements:
		submenu.push({
			caption: "Remove <"+elementName+">",
			action: Xonomy.deleteElement,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
			keyCaption: "Ctrl + Shift + X",
		});

		//all elements have a menu item to duplicate themselves, except the top-level element and except children of inl elements:
		submenu.push({
			caption: "Duplicate <"+elementName+">",
			action: Xonomy.duplicateElement,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==68 },
			keyCaption: "Ctrl + Shift + D",
		});

		//all elements have a menu item to move themselves up and down, except the top-level element, and except children of inl elements, and expect elements that have nowhere to move to:
		submenu.push({
			caption: "Move <"+elementName+"> up",
			action: Xonomy.moveElementUp,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementUp(jsMe.htmlID); },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==38 },
			keyCaption: "Ctrl + Shift + Up",
		});
		submenu.push({
			caption: "Move <"+elementName+"> down",
			action: Xonomy.moveElementDown,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementDown(jsMe.htmlID); },
			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==40 },
			keyCaption: "Ctrl + Shift + Down",
		});

		//all elements have a menu item to merge themselves with a sibling, except the top-level element, and except children of inl elements, and expect elements that have no-one to merge with:
		submenu.push({
			caption: "Merge <"+elementName+"> with previous",
			action: Xonomy.mergeWithPrevious,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getPrecedingSibling() || jsMe.getPrecedingSibling().name!=elementID },
			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==38 },
			keyCaption: "Alt + Shift + Up",
		});
		submenu.push({
			caption: "Merge <"+elementName+"> with next",
			action: Xonomy.mergeWithNext,
			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getFollowingSibling() || jsMe.getFollowingSibling().name!=elementID },
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
		del.canDropTo=Xematron.listParents(xema, elementID);

		//all elements have a fixed position among their siblings if the parent is a 'chd' element:
		del.mustBeAfter=Xematron.listPrecedingSiblings(xema, elementID);
		del.mustBeBefore=Xematron.listFollowingSiblings(xema, elementID)

		//Menu items for adding siblings:
		var submenu=[];
		Xematron.listElements(xema).forEach(function(siblingID){
			const elementName = xema.elements[siblingID]?.elementName || siblingID;
			submenu.push({
				caption: "Add <"+siblingID+">",
				action: Xonomy.newElementBefore,
				actionParameter: Xematron.initialElement(xema, siblingID),
				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingID) || (jsMe.getPrecedingSibling() && jsMe.getPrecedingSibling().name==jsMe.name) || del.mustBeAfter(jsMe).indexOf(siblingID)==-1; },
			});
		});
		submenu.push({
			caption: "Add another <"+elementName+"> before",
			action: Xonomy.newElementBefore,
			actionParameter: Xematron.initialElement(xema, elementID),
			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
		});
		submenu.push({
			caption: "Add another <"+elementName+"> after",
			action: Xonomy.newElementAfter,
			actionParameter: Xematron.initialElement(xema, elementID),
			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
		});
		Xematron.listElements(xema).forEach(function(siblingID){
			const elementName = xema.elements[siblingID]?.elementName || siblingID;
			submenu.push({
				caption: "Add <"+elementName+">",
				action: Xonomy.newElementAfter,
				actionParameter: Xematron.initialElement(xema, siblingID),
				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingID) || (jsMe.getFollowingSibling() && jsMe.getFollowingSibling().name==jsMe.name) || del.mustBeBefore(jsMe).indexOf(siblingID)==-1; },
			});
		});
		submenu.push({
			caption: "Remove all <"+elementName+"> siblings",
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
	}; 
	return docSpec;
};

//takes a xema, returns an initial XML document (as string):
Xematron.xema2xml= function(xema){
	return xema.newXml || Xematron.initialElement(xema, xema.root);
};

//helper functions:
/** Return IDS of all elements that have the target element as child */
Xematron.listParents=function(xema, elementID){
	var list=[];
	for(var someElementID in xema.elements){
		var parent=xema.elements[someElementID];
		if(parent.filling=="chd"){
			if(!parent.children) parent.children=[];
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name==elementID) {
					list.push(someElementID);
					break;
				}
			}
		}
	}
	return list;
};
Xematron.listPrecedingSiblings=function(xema, elementID){
	var list={};
	for(var someElementID in xema.elements){
		var parent=xema.elements[someElementID];
		if(parent.filling=="chd"){
			var templist=[];
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name!=elementID) {
					templist.push(parent.children[i].name);
				} else if(parent.children[i].name==elementID) {
					list[someElementID]=templist;
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
Xematron.listFollowingSiblings=function(xema, elementID){
	var list={};
	for(var someElementID in xema.elements){
		var parent=xema.elements[someElementID];
		if(parent.filling=="chd"){
			var templist=[];
			var found=false;
			for(var i=0; i<parent.children.length; i++){
				if(parent.children[i].name!=elementID && found) {
					templist.push(parent.children[i].name);
				} else if(parent.children[i].name==elementID) {
					found=true;
				}
			}
			list[someElementID]=templist;
		}
	}
	return function(jsMe){
		if(jsMe) for(var parname in list){ if(jsMe.parent() && parname==jsMe.parent().name) return list[parname]; }
		return [];
	};
};
Xematron.initialAttributes=function(xema, elementID){
	var ret="";
	if (xema.elements[elementID] != undefined) {
		for(var attname in xema.elements[elementID].attributes){
		var att=xema.elements[elementID].attributes[attname];
		if(att.optionality=="obligatory") {
			var attvalue="";
			ret+=" "+attname+"='"+Xonomy.xmlEscape(attvalue)+"'";
		}
		}
	}
	return ret;
};
Xematron.initialElement=function(xema, elementID, depth){
	if(!depth) depth=0;
	var el=xema.elements[elementID];
	const elementName = xema.elements[elementID]?.elementName || elementID;
	var ret="<"+elementName+Xematron.initialAttributes(xema, elementID)+">";
	if (el != undefined && el.filling=="chd" && el.children && depth < 10) {
		el.children.forEach(function(child) {
			for(var i=0; i<child.min; i++) ret+=Xematron.initialElement(xema, child.name, depth+1);
		});
	}
	ret+="</"+elementName+">";
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
	if (childName === "lxnm:subentryParent") return true; // always valid
	var ret=false;
	for(var i=0; i<children.length; i++){
		if(children[i].name==childName) { ret=true; break; }
	}
	return ret;
};
/**
 * 
 * @param {any} xema 
 * @param {import('@elexis-eu/xonomy').XonomyElementInstance} jsElement 
 * @param {number} level 
 * @returns 
 */
Xematron.validate=function(xema, jsElement, level){
	if (level == null) level = 0
	var xel=xema.elements[jsElement.id || jsElement.name];
	
	if (jsElement.elementName === "lxnm:subentryParent") {
		return; // a subentry reference - should never be validated.
	} else if(!xel){ //is the element allowed to exist?
		if (level === 0)
			Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The top element should be <"+(xema.elements[xema.root] || {}).elementName || xema.root+">."});
		else 
			Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "No element <"+jsElement.elementName+"> should exist here."});
	}  else {
		//cycle through the attributes the element should have:
		for(var attname in xel.attributes){
			if(xel.attributes[attname].optionality=="obligatory" && !jsElement.getAttribute(attname)){
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element is missing the @"+attname+" attribute."});
			}
		}

		//cycle through the element's attributes:
		for(var i=0; i<jsElement.attributes.length; i++) {
			var jsAttribute=jsElement.attributes[i];
			var xatt=xel.attributes[jsAttribute.name];
			if(!xatt) { //is the attribute allowed to exist?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The <"+jsElement.elementName+"> element should not have an attribute called @"+jsAttribute.name+"."});
			} else if(jsAttribute.value=="") { //is the attribute non-empty?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not be empty."});
			} else if(xatt.filling=="lst" && !Xematron.valuesHave(xatt.values, jsAttribute.value)) { //does the attribute have an allowed value?
				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not have the value @\""+jsAttribute.value+"\"."});
			}
		};

		//if this is an emp element:
		if(xel.filling=="emp") {
			if(jsElement.children.length>0) { //is the element empty like it should?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should be empty."});
			}
		}

		//if this is a lst element:
		if(xel.filling=="lst") {
			if(jsElement.getText()=="") { //does the element have text?
					Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should not be empty."});
			} else if(!Xematron.valuesHave(xel.values, jsElement.getText())) { //does the element have an allowed value?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should not have the value @\""+jsElement.getText()+"\"."});
			}
		}

		//if this is a txt element:
		if(xel.filling=="txt") {
			if(jsElement.getText()=="") { //does the element have text?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should have some text."});
			}
		}

		//if this is an inl element:
		if(xel.filling=="inl") {
			if(jsElement.getText()=="") { //does the element have text?
				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should have some text."});
			}
		}

		//if this is a chd element:
		if(xel.filling=="chd") {
			for(var i=0; i<jsElement.children.length; i++) { //does the element not have text?
				if(jsElement.children[i].type=="text" && jsElement.children[i].value.trim() !== '') { 
					Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should not have any text."});
					break; 
				}
			}
		}

		//if this is an inl or chd element:
		if(xel.filling=="inl" || xel.filling=="chd") {
			for(var i=0; i<xel.children.length; i++){
				const xchild=xel.children[i];
				const xchildel = xema.elements[xchild.name];
				var children=jsElement.getChildElements(xchild.name);
				if( (xchild.min>0 && children.length<xchild.min) || (xchild.max>0 && children.length>xchild.max) )	{
					var msg="Should have ";
					if(xchild.min>0) msg+="at least "+xchild.min;
					if(xchild.min>0 && xchild.max>0) msg+=", ";
					if(xchild.max>0) msg+="at most "+xchild.max;
					msg+=".";
					if(children.length>0) {
						children.forEach(function(item){
							Xonomy.warnings.push({htmlID: item.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchildel.elementName+"> child elements. "+msg});
						});
					} else {
						Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchildel.elementName+"> child elements. "+msg});
					}
				}
			}
		}

		//cycle through the element's children:
		for(var i=0; i<jsElement.children.length; i++) {
			var jsChild=jsElement.children[i];
			if(jsChild.type=="element") {
				if(!Xematron.childrenHave(xel.children, jsChild.id)) {
					Xonomy.warnings.push({htmlID: jsChild.htmlID, text: "The <"+jsElement.name+"> element should not have a child element called <"+jsChild.elementName+">."});
				} else {
					Xematron.validate(xema, jsChild, level+1);
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
						if(Xonomy.docSpec.elements[jsElement.id].mustBeAfter(jsElement).indexOf(jsSibling.id)>-1){
							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should appear after the <"+jsSibling.elementName+"> element, not before it."});
						}
					}
					if(whereAreWe=="before") { //jsSibling is before jsElement == jsElement is after jsSibling
						if(Xonomy.docSpec.elements[jsElement.id].mustBeBefore(jsElement).indexOf(jsSibling.id)>-1){
							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.elementName+"> element should appear before the <"+jsSibling.elementName+"> element, not after it."});
						}
					}
				}
			}
		}
	}
};

/** Get all reachable element IDS used in the xema. Reachable means it has a valid parent, all the way to the root. (so we stop descending at text elements for example.) */
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
