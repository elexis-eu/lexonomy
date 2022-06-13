// @ts-check
/// <reference path="../node_modules/@kcmertens/xonomy/dist/src/xonomy.d.ts"/>


window.Sub = {
  /** @type {{[id: number]: {title: string, id: number, parents?: Array<{id: number, title: string}>, children?: Array<{id: number, title: string}>}}} */
  children: {},
  /** @type {{[id: number]: {title: string, id: number, parents?: Array<{id: number, title: string}>, children?: Array<{id: number, title: string}>}}} */
  parents: {},
  htmlID: '',
  entryID: -1 // NOTE: might be null! when creating new entry.
}

Sub.extendDocspec = function(/** @type {import("@kcmertens/xonomy").XonomyDocSpec} */ docspec, xema, entry) {
  Sub.children = {};
  Sub.parents = {};
  Sub.entryID = entry.id; 

  if (entry.subentries)  { // entry has complete information (it doesn't always, this code is sometimes called from within screenful and then there is lots of info missing), copy it
    entry.subentries.forEach(c => Sub.children[c.id] = c)
    entry.parententries.forEach(p => Sub.parents[p.id] = p)
  } else if (entry.id != null) {
    $.ajax({url: Screenful.Editor.readUrl, dataType: "json", method: "POST", data: {id: entry.id}}).done(function(data){
      data.subentries.forEach(c => Sub.children[c.id] = c)
      data.parententries.forEach(p => Sub.parents[p.id] = p)
      Xonomy.refresh(); // now we know the contents of the subentries, make sure we're not showing "loading..." anywhere anymore.
    });
  }

  // For every element that can contain subentries, add menu entries to search for the subentries
  Object.entries(xema.elements).forEach(([id, element]) => {
    const elementName = element.elementName || id;
    const subentryChildren = element.children.filter(c => subbing[c.name]);
    if (!subentryChildren.length) return;

    /** @type {import("@kcmertens/xonomy").XonomyElementDefinitionExternal} */
    const spec = docspec.elements[id] = docspec.elements[id] || {}
    
    // add menu entry to find new subentries
    spec.menu = spec.menu || [];
    subentryChildren.forEach(child => {
      const childID = child.name; 
      const childConfig = xema.elements[childID];
      const childElementName = childConfig.elementName || childID;

      spec.menu.push({
        icon: "/furniture/favicon.png",
        caption: "Find subentries <" + childElementName + ">",
        action: Sub.subentrySearchMenu,
        actionParameter: { elName: childElementName }, // doctype to search - which is root element name - which is elementName
      });
    });
  });


  // For the subentries themselves, add menu to manage them.
  docspec.elements["lxnm:subentryParent"] = {
    // isReadOnly() { return true },
    caption: (jsMe) => {
      // replace the content of the element with a button that expands a menu
      const subentryID = Number.parseInt(jsMe.getAttribute('id').value, 0);
      const data = Sub.children[subentryID] || {title: "Loading..."}
      const title = data.title;
      
      let cap = `${title} <span class='lexonomySubentryCaption' onclick='Xonomy.notclick=true; Sub.menuSubentry("${jsMe.htmlID}")'>Also used in... ▼</span>`;
      return cap;
    },
    backgroundColour() { return '#e6e6e6'; },
    displayName(jsMe) { 
      const subentryID = Number.parseInt(jsMe.getAttribute('id').value, 0);
      const data = Sub.children[subentryID] || {doctype: "Loading..."}
      return data.doctype;
    },
    menu: [{
      action: Xonomy.deleteElement,
      caption() { return 'Remove this subentry' },
    }],
    attributes: {
      id: { isReadOnly: true }
    },
  }
};


/**
 * The menu when clicking on a subentry instance
 * @param {*} htmlID 
 */
Sub.menuSubentry = function (htmlID) {
  var subentryInstance = Xonomy.harvestElement($("#" + htmlID)[0]);
  var subentryID = subentryInstance.getAttributeValue("id", 0);

  function bubble() {
    var parents = Sub.children[subentryID].parententries.filter(p => p.id !== Sub.entryID); // get other parents of this subentry
    var parentsMessage = 
      parents.length == 0 ? 'not shared with any other entry.' :
      parents.length == 1 ? 'shared with one other entry.' :
      'shared with ' + parents.length + ' other entries.';
    var parentLinks = parents.map(({id, title}) => `<div class="entryline" onclick="window.store.changeEntryId(${id})">${title}</div>`);

    const html = `
      <div class='subinfobox'>
        <div class='topline'><span class='opener' onclick='window.store.changeEntryId(${subentryID})'>This subentry</span> is ${parentsMessage}</div>
        ${parents.length > 0 ? `<div class='entrylines'>${parentLinks.join('')}</div>` : ''}
      </div>`

    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#" + htmlID + " > .inlinecaption")); //anchor bubble to opening tag
  }
  
  function placeholderBubble() {
    document.body.appendChild(Xonomy.makeBubble(`<div>Loading parents...</div>`))
    Xonomy.showBubble($("#" + htmlID + " > .inlinecaption"));
  }

  if (Sub.children[subentryID] && Sub.children[subentryID].parententries) {// we already know where else this subentry is used
    bubble() 
    return;
  }

  // we don't, retrieve the info, save it, then show the bubble
  placeholderBubble();
  $.ajax({url: Screenful.Editor.readUrl,method: "POST",data: {id: subentryID}})
  .then(r => Sub.children[subentryID] = r)
  .then(bubble);
};

Sub.getHeadword = function () {
  var $xml = $($.parseXML(Xonomy.harvest()));
  var hwd = $xml.find(titling.headword).html().replace(/(<([^>]+)>)/gi, "");
  if (!hwd) hwd = "";
  return hwd;
};

/**
 * Menu when clicking elements that may contain subentries. 
 * Contains option to search for subentries, etc.
 * 
 * @param {*} htmlID 
 * @param {*} param 
 */
Sub.subentrySearchMenu = function (htmlID, param) {
  Sub.htmlID = htmlID;
  document.body.appendChild(Xonomy.makeBubble(Sub.boxSubentries(param.elName))); //create bubble
  if (Xonomy.lastClickWhat == "openingTagName") Xonomy.showBubble($("#" + htmlID + " > .tag.opening > .name")); //anchor bubble to opening tag
  else if (Xonomy.lastClickWhat == "closingTagName") Xonomy.showBubble($("#" + htmlID + " > .tag.closing > .name")); //anchor bubble to closing tag
  else Xonomy.showBubble($("#" + htmlID));
  if (Sub.getHeadword()) {
    Sub.searchSubentries();
    // select all text in the input so the user can easily type something else
    $('.subbox input[name="val"]').select();
  } else {
    $(".subbox .waiter").hide();
  }
};

Sub.boxSubentries = function (elName) {
  return `
  <div class='subbox'>
    <form class='topbar' onsubmit='Sub.searchSubentries(); return false'>
      <input name='val' class='textbox focusme' value='${Sub.getHeadword()}'/>
      <input name='doctype' type='hidden' value='${elName}'/> 
      <input type='submit' class='button sub' value='&nbsp;'/>
      <button class='creator' onclick='Sub.newSubentry("${elName}"); return false;'>New</button>
    </form>
    <div class='waiter'></div>
    <div class='choices' style='display: none'></div>
    <div class='bottombar' style='display: none;'>
      <button class='insert' onclick='Sub.insertSubentries()'>Insert</button>
    </div>
  </div>`
};

Sub.newSubentry = function (elName) {
  var xml = Xematron.initialElement(xema, elName);
  Xonomy.newElementChild(Sub.htmlID, xml);
  Xonomy.clickoff();
};

Sub.toggleSubentry = function (inp) {
  if ($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
};

Sub.searchSubentries = function () {
  $(".subbox .choices").hide();
  $(".subbox .bottombar").hide();
  $(".subbox .waiter").show();
  var lemma = $.trim($(".subbox .textbox").val());
  var doctype = $.trim($("input[name=\"doctype\"]").val());
  if (lemma != "") {
    $.get("/" + dictId + "/subget/", { lemma: lemma, doctype: doctype }, function (json) {
      $(".subbox .choices").html("");
      if (!json.success) {
        $(".subbox .choices").html("<div class='error'>There has been an error getting data from Lexonomy.</div>");
        $(".subbox .waiter").hide();
        $(".subbox .choices").fadeIn();
      } else if (json.total == 0) {
        $(".subbox .choices").html("<div class='error'>No matches found.</div>");
        $(".subbox .waiter").hide();
        $(".subbox .choices").fadeIn();
      } else {
        for (var iLine = 0; iLine < json.entries.length; iLine++) {
          var line = json.entries[iLine];
          $(".subbox .choices").append("<label><input type='checkbox' onchange='Sub.toggleSubentry(this)'/><span class='inside'>" + line.title + "</span></label>");
          $(".subbox .choices label").last().data("id", line.id);
          $(".subbox .choices label").last().data("title", line.title);
          $(".subbox .choices label").last().data("doctype", line.doctype);
          $(".subbox .waiter").hide();
          $(".subbox .choices").fadeIn();
          $(".subbox .bottombar").show();
        }
      }
    });
  }
};

Sub.insertSubentries = function () {
  $(".subbox div.choices label").each(function () {
    var $label = $(this);
    if ($label.hasClass("selected")) {
      var id = $label.data("id");
      var title = $label.data("title")
      var doctype = $label.data("doctype")
      Sub.children[id] = {id: id, title: title, doctype: doctype}
      Xonomy.newElementChild(Sub.htmlID, `<lxnm:subentryParent xmlns:lxnm="http://www.lexonomy.eu/" id="${id}"/>`);
    }
  });
};