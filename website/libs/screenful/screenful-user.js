Screenful.User={
  start: function(){
    if(Screenful.User.loggedin){
      $(".ScreenfulUser").html("<div class='clickable'>"+Screenful.User.username+" <span class='arrow'>▼</span></div><div class='menu' style='display: none'></div>");
      if(Screenful.User.homeUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.homeUrl+"'>"+Screenful.Loc.home+"</a>");
      if(Screenful.User.logoutUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.logoutUrl+"'>"+Screenful.Loc.logout+"</a>");
      if(Screenful.User.changePwdUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.changePwdUrl+"'>"+Screenful.Loc.changePwd+"</a>");
    } else {
      $(".ScreenfulUser").html("<div class='clickable'>"+Screenful.Loc.anonymous+" <span class='arrow'>▼</span></div><div class='menu' style='display: none'></div>");
      if(Screenful.User.homeUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.homeUrl+"'>"+Screenful.Loc.home+"</a>");
      if(Screenful.User.loginUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.loginUrl+"'>"+Screenful.Loc.login+"</a>");
      if(Screenful.User.signupUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.signupUrl+"'>"+Screenful.Loc.signup+"</a>");
      if(Screenful.User.forgotPwdUrl) $(".ScreenfulUser .menu").append("<a href='"+Screenful.User.forgotPwdUrl+"'>"+Screenful.Loc.forgotPwd+"</a>");
    }
    $(".ScreenfulUser .clickable").on("click", function(e){
      var $mymenu=$(e.delegateTarget).closest(".ScreenfulUser").find(".menu");
      $(".menu").remove($mymenu[0]).slideUp();
      $mymenu.hide().slideDown();
      e.stopPropagation();
    });
    $(document).on("click", function(e){
      $(".menu").slideUp();
    });
  },
};
$(window).ready(Screenful.User.start);
