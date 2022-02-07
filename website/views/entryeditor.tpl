%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
  <head>
    %include("head.tpl")
    <title>Screenful Editor</title>
    <script type="text/javascript">var rootPath="../../../";</script>
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful.css" />
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-editor.css" />
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-theme-blue.css" />
    <script type="text/javascript" src="../../../libs/screenful/screenful.js"></script>
    <script type="text/javascript" src="../../../libs/screenful/screenful-editor.js"></script>
    <script type="text/javascript" src="../../../libs/screenful/screenful-loc-en.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../libs/xonomy/xonomy.css" />
    <script type="text/javascript" src="../../../libs/xonomy/xonomy.js?2018-02-02"></script>
    <script type="text/javascript" src="../../../widgets/xematron.js"></script>
    <script type="text/javascript" src="../../../libs/xonomy-tools/dtdconvert/dtd2xonomy.js"></script>
    <script type="text/javascript" src="../../../widgets/xemplatron.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/xemplatron.css" />
    <script type="text/javascript" src="../../../widgets/xrefs.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/xrefs.css" />
    <script type="text/javascript" src="../../../widgets/gmedia.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/gmedia.css" />
    <script type="text/javascript" src="../../../widgets/ske.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/ske.css" />
    <script type="text/javascript" src="../../../widgets/kontext.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/kontext.css" />
    <script type="text/javascript" src="../../../widgets/sub.js"></script>
    <link type="text/css" rel="stylesheet" href="../../../widgets/sub.css" />
    <script type="text/javascript" src="../../../libs/js.cookie.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/easy-autocomplete.min.css" integrity="sha256-fARYVJfhP7LIqNnfUtpnbujW34NsfC4OJbtc37rK2rs=" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/easy-autocomplete.themes.min.css" integrity="sha256-kK9BInVvQN0PQuuyW9VX2I2/K4jfEtWFf/dnyi2C0tQ=" crossorigin="anonymous" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/jquery.easy-autocomplete.min.js" integrity="sha256-aS5HnZXPFUnMTBhNEiZ+fKMsekyUqwm30faj/Qh/gIA=" crossorigin="anonymous"></script>
    <style>
      .xonomy div.layby.open {width: 55%}
      {{!css}}
      {{!editing.get("_css")}}
    </style>
    %if "_js" in editing:
      <script type="text/javascript">
        var customizeEditor={{!editing["_js"]}};
        var usingOwnEditor=customizeEditor.editor && customizeEditor.harvester;
      </script>
    %else:
      <script type="text/javascript">
        var customizeEditor=null;
        var usingOwnEditor=false;
      </script>
    %end
    %if user["loggedin"] == False:
    <script type="text/javascript">
      if (window.parent) {
        window.parent.location="/";
      } else {
        window.location="/";
      }
    </script>
    %end
    <script type="text/javascript">
    Screenful.Editor.createUrl="../../../{{dictID}}/entrycreate.json";
    Screenful.Editor.readUrl="../../../{{dictID}}/entryread.json";
    Screenful.Editor.updateUrl="../../../{{dictID}}/entryupdate.json";
    Screenful.Editor.deleteUrl="../../../{{dictID}}/entrydelete.json";
    var dictID="{{dictID}}";
    var xema={{!JSON(xema)}};
    var xemplate={{!JSON(xemplate)}};
    var kontext={{!JSON(kontext)}};
    var kex={{!JSON(kex)}};
    var subbing={{!JSON(subbing)}};
    var xampl={{!JSON(xampl)}};
    var thes={{!JSON(thes)}};
    var collx={{!JSON(collx)}};
    var defo={{!JSON(defo)}};
    var titling={{!JSON(titling)}};
    var flagging={{!JSON(flagging)}};
    var linking={{!JSON(linking)}};
    var userdicts={{!JSON(userdicts)}};
    var gapi={{!JSON(gapi)}};
    var ske_username = {{!JSON(user.get("ske_username"))}};
    var ske_apiKey = {{!JSON(user.get("ske_apiKey"))}};
    if(!xemplate[xema.root]) xemplate[xema.root]={shown: false};
    if(xemplate[xema.root].shown=="false") xemplate[xema.root].shown=false;
    Screenful.Editor.viewer=null;
    if(xemplate._xsl || xemplate._css || xemplate[xema.root].shown) {
      Screenful.Editor.viewer=function(div, entry){
        if (entry.contentHtml.length == 0) {
          var doc=(new DOMParser()).parseFromString(entry.content, 'text/xml');
          entry.contentHtml=Xemplatron.xml2html(doc, xemplate, xema);
        }
        $(div).addClass("viewer").html(entry.contentHtml);
        $(div).find("a.xref").on("click", function(e){
          var text=$(e.delegateTarget).attr("data-text");
          window.parent.$("#searchbox").val(text);
          window.parent.Screenful.Navigator.list();
        });
        Gmedia.addVoice(entry);
      };
    }

    Screenful.Editor.editor=function(div, entry, uneditable){
      %if not user["canEdit"]:
	uneditable=true;
      %end
      Xonomy.lang="en";

      var newXml="";
      %if "_xonomyDocSpec" in xema:
        var docSpec={{xema["_xonomyDocSpec"]}};
        %if xema["_newXml"]:
          newXml=`{{xema["_newXml"]}}`;
        %end
      %elif "_dtd" in xema:
        var xmlStructure=parseDTD(`{{!xema["_dtd"]}}`);
        var docSpec=struct2Xonomy(xmlStructure);
        newXml=initialDocument(xmlStructure);
      %else:
        var docSpec=Xematron.xema2docspec(xema, "{{editing.get("xonomyTextEditor")}}");
      %end
      if(!newXml) newXml=Xematron.xema2xml(xema);

      docSpec.allowModeSwitching=true;
      docSpec.onModeSwitch=function(mode){
        Cookies.set("xonomyMode_{{dictID}}", mode);
        window.parent.$(".doctypes").removeClass("laic");
        window.parent.$(".doctypes").removeClass("nerd");
        window.parent.$(".doctypes").addClass(mode);
      };
      if(!uneditable) {
        docSpec.allowLayby=true;
        docSpec.laybyMessage="This is your temporary lay-by for entry fragments. You can drag and drop XML elements here.";
      }
      Xonomy.setMode(Cookies.get("xonomyMode_{{dictID}}") || "{{editing["xonomyMode"]}}");
      Xrefs.extendDocspec(docSpec, xema);
      Gmedia.extendDocspec(docSpec, xema);
      Ske.extendDocspec(docSpec, xema);
      Kontext.extendDocspec(docSpec, xema);
      Sub.extendDocspec(docSpec, xema);
      docSpec.onchange=Screenful.Editor.changed;
      if(uneditable) {
        for(elName in docSpec.elements) docSpec.elements[elName].isReadOnly=true;
        if(docSpec.unknownElement && typeof(docSpec.unknownElement)=="object") docSpec.unknownElement.isReadOnly=true;
        if(docSpec.unknownElement && typeof(docSpec.unknownElement)=="function") {
          var func=docSpec.unknownElement;
          docSpec.unknownElement=function(elName){
            var ret=func(elName);
            ret.isReadOnly=true;
            return ret;
          }
        }
      }

      if(!usingOwnEditor){
        if(customizeEditor && customizeEditor.adjustDocSpec)
          customizeEditor.adjustDocSpec(docSpec);
        Xonomy.render((entry ? entry.content : newXml), div, docSpec);
        if(!Xonomy.keyNav) Xonomy.startKeyNav(document, document.getElementById("container"));
      } else {
        customizeEditor.editor(div, entry ? entry : {content: newXml, id: 0}, uneditable);
      }
      Gmedia.addVoice();
    };
    Screenful.Editor.harvester=function(div){
      if(!usingOwnEditor){
        return Xonomy.harvest();
      } else {
        return customizeEditor.harvester(div);
      }
    };
    Screenful.Editor.allowSourceCode=true;
    Screenful.Editor.formatSourceCode=function(str){
      return Screenful.formatXml(str);
    };
    Screenful.Editor.validateSourceCode=function(str){
      return Screenful.isWellFormedXml(str);
    };
    Screenful.Editor.cleanupSourceCode=function(str){
      return Screenful.cleanupXml(str);
    };
    </script>
    <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-history.css" />
    <script type="text/javascript" src="../../../libs/screenful/screenful-history.js"></script>
    <script type="text/javascript">
    Screenful.History.historyUrl="../../../{{dictID}}/history.json";
    Screenful.History.isDeletion=function(revision){
      return revision.action=="delete" || revision.action=="purge";
    };
    Screenful.History.getRevisionID=function(revision){
      return revision.revision_id;
    };
    Screenful.History.printAction=function(revision){
      var content="";
      //actions: delete | create | update | purge
      //historiography: {apikey: apikey} | {uploadStart: uploadStart, filename: filename}
      content+="<div style='white-space: nowrap'>";
        if(revision.action=="create") content+="<b>Created</b>";
        else if(revision.action=="update") content+="<b>Changed</b>";
        else if(revision.action=="delete") content+="<b>Deleted</b>";
        else if(revision.action=="purge") content+="<b>Bulk-deleted</b>";
        if(revision.historiography.uploadStart) content+=" while uploading";
        if(revision.historiography.apikey) content+=" through API";
        if(revision.historiography.refactoredFrom) content+=" as a subentry of <a href='javascript:void(null)' onclick='parent.Screenful.Editor.open(null, "+revision.historiography.refactoredFrom+")'>"+revision.historiography.refactoredFrom+"</a>";
      content+="</div>";
      if(revision.email) content+="<div style='white-space: nowrap'><b>By:</b> "+revision.email+"</div>";
      content+="<div style='white-space: nowrap'><b>When:</b> "+revision.when+"</div>";
      return content;
      //return revision.action+", "+revision.email+", "+revision.when+", "+JSON.stringify(revision.historiography, null, "<br/>");
    };
    Screenful.History.fakeEntry=function(revision){
      return {id: revision.entry_id, content: revision.content, contentHtml: revision.contentHtml};
    };
    </script>
  </head>
  <body>
  </body>
</html>
