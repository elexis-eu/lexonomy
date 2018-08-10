Screenful.Facetor={
  show: function(){
    console.log("Facetor is showing itself.");
    $("#leftbox").html("<label><input type='checkbox' name='somefacet'/>somefacet</label>");
    $("#leftbox input").on("change", Screenful.Facetor.change);
  },
  hide: function(){
    console.log("Facetor is hiding itself.");
  },
  harvest: function(){
    var ret=null;
    if( $("#leftbox input[name='somefacet']").prop("checked") ) ret="somefacet";
    return ret;
  },
  change: function(){
    Screenful.Navigator.list();
  },
};
