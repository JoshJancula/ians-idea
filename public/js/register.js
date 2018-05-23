 $(document).ready(function() {


  // Adding an event listener for when the form is submitted
  $("#registerUser").on('click', handleFormSubmit);

  // A function for handling what happens when the form to create a new user
  function handleFormSubmit(event) {

    var email = $("#registerEmail").val().trim();
    var password = $("#registerPassword").val().trim();
    var username = $("#username").val();
   
    event.preventDefault();
    // Don't submit unless the form is complete
    if (!password || !email) {
      return;
    }
    // Constructing a newMessage
    var newUser = {
      email: email,
      password: password,
      username: username,
    }; // submit the new user 
    submitToApi(newUser);

    // empty out the input fields
    $("#registerEmail").val("")
    $("#registerPassword").val("")
    $("#username").val("");
  }

 
  function submitToApi(user) {
  $.ajax({
            method: "POST",
            url: "/api/users/",
            data: user
  })
  }

 
  // function to handle errors
  function handleErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }

  // login button up in nav
  $("#loginNav").on("click", function(event) {
    event.preventDefault();
    // go to the profile
    window.location.href = '/login';
  });


});
