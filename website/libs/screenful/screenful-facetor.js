Screenful.Facetor={
  panes: [],
  show: function(){
    //console.log("Facetor is showing itself.");
    $("#leftbox").html("<div/>");
    Screenful.Facetor.panes[0].render($("#leftbox div")[0]);
  },
  hide: function(){
    //console.log("Facetor is hiding itself.");
  },
  report: function(){
    return Screenful.Facetor.panes[0].harvest($("#leftbox div")[0]);
  },
  change: function(){
    Screenful.Navigator.list();
  },
};
