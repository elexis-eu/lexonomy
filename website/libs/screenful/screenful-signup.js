Screenful.Signup={
  start: function(){
    Screenful.createEnvelope(true);
    $("#envelope").html("<form id='middlebox'></form>");
    $("#middlebox").append("<div class='message'>"+Screenful.Loc.signupEmail+"</div>");
    $("#middlebox").append("<div class='url'><a href='mailto:"+Screenful.Signup.email+"'>"+Screenful.Signup.email+"</a></div>");
  },
};
$(window).ready(Screenful.Signup.start);
