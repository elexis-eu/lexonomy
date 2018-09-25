Screenful.Uilang={
  start: function(){
    var caption=Screenful.Uilang.current;
    for(var i=0; i<Screenful.Uilang.languages.length; i++){
      var lang=Screenful.Uilang.languages[i];
      if(lang.abbr==Screenful.Uilang.current) caption=lang.caption;
    }
    $(".ScreenfulUilang").html("<div class='clickable'>"+caption+" <span class='arrow'>▼</span></div><div class='menu' style='display: none'></div>");
    for(var i=0; i<Screenful.Uilang.languages.length; i++){
      var lang=Screenful.Uilang.languages[i];
      $(".ScreenfulUilang .menu").append("<a href='"+Screenful.Uilang.url.replace("$", lang.abbr)+"'>"+lang.caption+"</a>");
    }
    $(".ScreenfulUilang .clickable").on("click", function(e){
      var $mymenu=$(e.delegateTarget).closest(".ScreenfulUilang").find(".menu");
      $(".menu:visible").not($mymenu).slideUp();
      $mymenu.hide().slideDown();
      e.stopPropagation();
    });
    $(document).on("click", function(e){
      $(".menu:visible").slideUp();
    });
  },
};
$(window).ready(Screenful.Uilang.start);
