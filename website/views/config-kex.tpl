%import json
%JSON=json.dumps
<!DOCTYPE HTML>
<html>
    <head>
        %include("head.tpl")
        <title>{{dictTitle}}</title>
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
        <script type="text/javascript" src="../../../widgets/kex.js"></script>
        <link type="text/css" rel="stylesheet" href="../../../widgets/pillarform.css" />
        <script type="text/javascript" src="../../../widgets/xematron.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/easy-autocomplete.min.css" integrity="sha256-fARYVJfhP7LIqNnfUtpnbujW34NsfC4OJbtc37rK2rs=" crossorigin="anonymous" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/easy-autocomplete.themes.min.css" integrity="sha256-kK9BInVvQN0PQuuyW9VX2I2/K4jfEtWFf/dnyi2C0tQ=" crossorigin="anonymous" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/easy-autocomplete/1.3.5/jquery.easy-autocomplete.min.js" integrity="sha256-aS5HnZXPFUnMTBhNEiZ+fKMsekyUqwm30faj/Qh/gIA=" crossorigin="anonymous"></script>
        <script type="text/javascript">
        var xema={{!JSON(xema)}};
        Screenful.Editor.singleton=true;
        Screenful.Editor.entryID="kex";
        Screenful.Editor.leaveUrl="../../../{{dictID}}/config/";
        Screenful.Editor.readUrl="../../../{{dictID}}/configread.json";
        Screenful.Editor.updateUrl="../../../{{dictID}}/configupdate.json";
        Screenful.Editor.editor=function(div, entry){
            Kex.change=Screenful.Editor.changed;
            Kex.render(div, entry.content);
        };
        Screenful.Editor.harvester=function(div){
            return JSON.stringify(Kex.harvest(div));
        };
        Screenful.Editor.allowSourceCode=true;
        Screenful.Editor.formatSourceCode=function(str){
            return Screenful.formatJson(str);
        };
        Screenful.Editor.validateSourceCode=function(str){
            return Screenful.isWellFormedJson(str);
        };
        Screenful.Editor.cleanupSourceCode=function(str){
            return JSON.parse(str);
        };
        var ske_username = "{{user["ske_username"]}}";
        var ske_apiKey = "{{user["ske_apiKey"]}}";
        </script>
        <link type="text/css" rel="stylesheet" href="../../../furniture/ui.css" />
    </head>
    <body>
                %include("header.tpl", user=user, dictID=dictID, dictTitle=dictTitle, current="config", configTitle="Sketch Engine connection", configUrl="kex", rootPath="../../../")
    </body>
</html>
