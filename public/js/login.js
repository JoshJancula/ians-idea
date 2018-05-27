$(document).ready(function() {

  var emailInput = $("#userEmail");
  var passwordInput = $("#userPassword");

  // When the form is submitted, we validate there's an email and password entered
  $("#loginTheUser").on("click", function() {
    event.preventDefault();
    var userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim()
    };
    if (!userData.email || !userData.password) {
      return;
    }
    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the main page
  function loginUser(email, password) {
    console.log("email and Password: " + email + " " + password)
    $.post("/api/login", {
      email: email,
      password: password
    }).done(function(data) {
      window.location.href = '/main';
      // If there's an error, log the error
    }).catch(function(err) {
      console.log(err);
    });
  }

  // when the user forgets password
  $("#getPassword").on("click", function() {
    event.preventDefault();

    // get the users email
    var email = $("#forgot").val().trim(); // these are possible new passwords
    var passwords = ["newPass", "hello", "dont4get", "word", "keepThis", "tryAgain", "kitten", "dolphin", "hollaBackSquirrel", "penguin", "alpha", "beta", "zeta", "test1234", "nadaMas", "qwerty", "hereYouGo", "cocoPuff", "dophPoodle", ];
    // get a random password for them
    var passwordValue = passwords[Math.floor(Math.random() * passwords.length)]
    var newPassword = passwordValue

    console.log("new password is: " + passwordValue)
    $.ajax({
      method: "PUT",
      url: "/api/users/email/" + email,
      data: {
        email: email,
        password: newPassword
      }
      // now send them their password
    }).done(function() {
      console.log("sending new password: email= " + email + " password= " + passwordValue);
      // send the message
      $.get("/send", {
          to: email,
          subject: "Your New Password",
          html: "<p>" + "Your password new is: " + passwordValue + "</p>"
        },
        function(data) {
          if (data !== "sent") {
            console.log("Great Success!");
          }
        });
      // close the modal 
      $('#forgotPassword').modal('close');
      // clear text box
      $("#forgot").val("")

    })

  })

});
