Screenful.ForgotPwd={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'></form>");
    $("#middlebox").append("<div class='message'>"+Screenful.Loc.forgotPwdEmail+"</div>");
    $("#middlebox").append("<div class='url'><a href='mailto:"+Screenful.ForgotPwd.email+"'>"+Screenful.ForgotPwd.email+"</a></div>");
  },
};
$(window).ready(Screenful.ForgotPwd.start);
