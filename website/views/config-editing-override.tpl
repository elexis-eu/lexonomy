%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
    <head>
        %include("head.tpl")
        <title>{{dictTitle}}</title>
    
        <script>var require = { paths: { vs: '../../../libs/node_modules/monaco-editor/min/vs' } };</script>
        <link  href="../../../libs/node_modules/monaco-editor/min/vs/editor/editor.main.css" rel="stylesheet" data-name="vs/editor/editor.main"/>
        <script src="../../../libs/node_modules/monaco-editor/min/vs/loader.js"></script>
        <script src="../../../libs/node_modules/monaco-editor/min/vs/editor/editor.main.nls.js"></script>
        <script src="../../../libs/node_modules/monaco-editor/min/vs/editor/editor.main.js"></script>
        
        <script type="text/javascript" src="../../../libs/screenful/screenful.js"></script>

        <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful.css" />
        <script type="text/javascript" src="../../../libs/screenful/screenful-loc-en.js"></script>
        <script type="text/javascript" src="../../../libs/screenful/screenful-user.js"></script>
        <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-user.css" />
        <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-theme-blue.css" />
        <script type="text/javascript">
        Screenful.User.loggedin={{!JSON(user["loggedin"])}};
        Screenful.User.username="{{user['email']}}";
        </script>
        <script type="text/javascript">var rootPath="../../../";</script>
        <script type="text/javascript" src="../../../furniture/screenful-user-config.js"></script>
        <link type="text/css" rel="stylesheet" href="../../../libs/screenful/screenful-editor.css" />
        <script type="text/javascript" src="../../../libs/screenful/screenful-editor.js"></script>
        <script type="text/javascript" src="../../../widgets/editing-override.js"></script>
        <link type="text/css" rel="stylesheet" href="../../../widgets/pillarform.css" />
        <script type="text/javascript">
        Screenful.Editor.singleton=true;
        Screenful.Editor.entryID="editing";
        Screenful.Editor.leaveUrl="../../../{{dictID}}/config/";
        Screenful.Editor.readUrl="../../../{{dictID}}/configread.json";
        Screenful.Editor.updateUrl="../../../{{dictID}}/configupdate.json";
        Screenful.Editor.editor=function(div, entry){
            EditingOverride.change=Screenful.Editor.changed;
            EditingOverride.render(div, entry.content);
        };
        Screenful.Editor.harvester=function(div){
            return JSON.stringify(EditingOverride.harvest(div));
        };
        Screenful.Editor.allowSourceCode=false;
        Screenful.Editor.toolbarLinks=[
            {image: "../../../furniture/cancel.png", caption: "Disable entry editor customizations...", href: "../../../{{dictID}}/config/editing/"}
        ];
        </script>
        <link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />
    </head>
    <body>
         %include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle="Entry editor", configUrl="editing-override", rootPath="../../../")
    </body>
</html>
