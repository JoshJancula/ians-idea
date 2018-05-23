$(document).ready(function() {
    
$('#postModal').modal({
    ready: function(modal, trigger) {
        // gets the reciever email and hides it in #toEmail
        modal.find('#postTo').text(trigger.data('id'));
    }

});


var config = {
    apiKey: "AIzaSyBTiizpyWeqHfXdFDQsd6IoMdNWYvkceS8",
    authDomain: "amee-store.firebaseapp.com",
    databaseURL: "https://amee-store.firebaseio.com",
    projectId: "amee-store",
    storageBucket: "amee-store.appspot.com",
    messagingSenderId: "457253723299"
};
firebase.initializeApp(config);

var userAddress;
var myLatLng;
var fileType;
var fileName;
var file;
var downloadUrl;
var acceptable = false;
var validFileExtensions = ["image/jpg", "image/jpeg", "image/png", ""];
var input = document.getElementById("image");
var reader = new FileReader;

// when the file input changes...
input.onchange = () => {
    reader.abort();
    reader.readAsDataURL(input.files[0]);
    file = input.files[0];
    fileType = file["type"];
    fileName = file.name
    checkType(fileType);
}

// function gets the user location 
function getLocation() {
    function showPosition(position) {
        console.log("getting location")
        var startLat = position.coords.latitude;
        var startLng = position.coords.longitude;
        myLatLng = { lat: startLat, lng: startLng }
        userAddress = JSON.stringify(myLatLng)
        //Once the user's address is saved in the userAddress variable, call the initMap function to load the map
        console.log(myLatLng)
    };
    //if geolocation is supported, the getCurrentPosition will be called
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        lattitude.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// creates a new bathroom location
function addBathroom() {
    
    // get the location
    getLocation();
    setTimeout(function() {
    let sex = $("#sex").val();
    let department = $("#department").val().trim();
    let table = $("#hasChangingTable").val();
    let establishment = $("#establishment").val().trim();
    // new bathroom data
    let newBathroom = {
        location: userAddress,
        sex: sex,
        department: department,
        table: table,
        establishment: establishment,
    }; // new bathroom to submit
    submitBathroom(newBathroom);
    }, 1000)
}
// button handles submitting the new bathroom
$("#submitBathroom").on('click', addBathroom);
    
// function submits the new post as long as you're logged in
function addNewPost() {
    let id;
    let username;
    let bathroomId = $("#postTo").text();
    console.log("bathroomId to be posted: " + bathroomId)
    let rating = $("#rating").val().trim();
    let comment = $("#comment").val().trim();
    let airQuality = $("#airQuality").val();
    let image = $("#image").val();
    
    $.get("api/user_data", {}, function(data) {}).done(function(data) {
        id = data.id;
        username = data.username;
        event.preventDefault();
        //  new post to hand to the database
            let newPost = {
                rating: rating,
                comment: comment,
                airQuality: airQuality,
                username: username,
                image: image,
                bathUserId: id,
                BathroomId: bathroomId
            };
        if (!id || id === "undefined") {
            // $("#loginModal").show();
            console.log('you are not logged in')
        }
        // Don't submit unless the form is complete
        else if (!rating) {
            alert("Please add a rating.")
            return;
        } // if file type is not supported
        else if (fileName != undefined && acceptable == false) {
            alert("FILE TYPE NOT SUPPORTED")
            return;
        } // if there is no file just submit message
        else if (fileName == undefined && acceptable == false) {
            submitPost(newPost)
            // clear fields
            $("#rating").val("");
            $("#comment").val("");
            $("#image").val("");
        }// if there is a file
        else {
            uploadToFirebase(file, fileName, newPost);
            // clear fields
            $("#rating").val("");
            $("#comment").val("");
            $("#image").val("");
        }
    });
}
// button handles submitting the new Post
$("#submitPost").on('click', addNewPost);


// submits the post
function submitPost(post, downloadUrl) {
    $.post("/api/posts", post, function() {
        console.log("post successful")
    });
}

// submits the post
function submitBathroom(bathroom) {
    $.post("/api/bathrooms", bathroom, function() {
        console.log("bathroom successfully created")
    });
}

// function to handle errors
function handleErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
}

// checks the type of file user input
function checkType(fileType) {
    for (let i = 0; i < validFileExtensions.length; i++) {
        if (fileType === validFileExtensions[i]) {
            acceptable = true
        }
    }
}


// function submits image to firebase
function uploadToFirebase(file, fileName, newPost) { // submit image
    var storageRef = firebase.storage().ref('/customerPhotos/' + fileName);
    var uploadTask = storageRef.put(file) // gets link to image
    uploadTask.on('state_changed', function(snapshot) {}, function(error) {}, function() {
        downloadUrl = uploadTask.snapshot.downloadURL;
        // sends the image url with the emails
        submitPost(newPost, downloadUrl);
    })
}

});
