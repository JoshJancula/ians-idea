$(document).ready(function() {
    $("#searchBathroom").hide();
    $("#dividerRow").hide();
    $('#postModal').modal({
        ready: function(modal, trigger) {
            // gets the post that this belongs to 
            modal.find('#postTo').text(trigger.data('id'));
        }
    });

    var config = {
        apiKey: "AIzaSyDfdlz5KnJ_YTspgA0zoOYXh9MueUejrJY",
        authDomain: "where-2-poo.firebaseapp.com",
        databaseURL: "https://where-2-poo.firebaseio.com",
        projectId: "where-2-poo",
        storageBucket: "where-2-poo.appspot.com",
        messagingSenderId: "622144128093"
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
    var startLat;
    var startLng;
    var map;

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
            startLat = position.coords.latitude;
            startLng = position.coords.longitude;
            myLatLng = { lat: startLat, lng: startLng }
            userAddress = JSON.stringify(myLatLng)
            //Once the user's address is saved in the userAddress variable, call the initMap function to load the map
            console.log(myLatLng)
            $("#searchBathroom").show();
        };
        //if geolocation is supported, the getCurrentPosition will be called
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
        else {
            lattitude.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    // get the location
    getLocation();

    /** Converts numeric degrees to radians */
    if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        }
    }

    // creates a new bathroom location
    function addBathroom() {
        let closeEnough = $('#areYouClose').val()
         $.get("api/user_data", {}, function(data) {}).done(function(data) {
             var id = data.id;
         if (!id || id === "undefined") {
            $("#loginModal").modal('open');
            console.log('you are not logged in')
        }
        else {
        if (closeEnough === "Yes") {
            var alreadyExists = false;
            // check the location against other locations
            $.get('/api/bathrooms', function(data) {
                let currentType = $("#sex").val();
                for (let i = 0; i < data.length; i++) {
                    let resultLatLng = JSON.parse(data[i].location)
                    let resultLat = resultLatLng.lat
                    let resultLng = resultLatLng.lng
                    let d = distance(startLng, startLat, resultLng, resultLat)
                    let restroomType = data[i].sex;
                    // if we are in the same location and theres already an existing bathroom for that gender
                    if (d < (0.02 * 1.60934) && restroomType === currentType) {
                        let obj = data[i]
                        let miles = (d * 0.621371).toFixed(2)
                        obj["distance"] = miles
                        alreadyExists = true;
                    }
                }
            }).done(function() {
                // it doesn't exist submit it
                if (alreadyExists == false) {
                    let sex = $("#sex").val();
                    let department = $("#department").val().trim();
                    let dividers = $("#dividers").val();
                    let table = $("#hasChangingTable").val();
                    let establishment = $("#establishment").val().trim();
                    // new bathroom data
                    let newBathroom = {
                        location: userAddress,
                        sex: sex,
                        dividers: dividers,
                        department: department,
                        table: table,
                        establishment: establishment,
                        createdBy: id
                    }; // new bathroom to submit
                    submitBathroom(newBathroom);
                    $("#bathRoomModal").modal('close');
                }
                else { // tell them it already exists
                    alert("there is already a thread for this facility");
                }
            })
        }
        else {
            alert("Please only create restrooms inside the restroom or within 20-30 feet of the facility to help insure map accuracy.")
        }
        }
         });
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
                $("#loginModal").modal('open');
                console.log('you are not logged in')
            }
            // Don't submit unless theres a rating at least
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
                $("#postTo").val("");
                $("#postModal").modal('close');
            } // if there is a file
            else {
                let newPost = {
                    rating: rating,
                    comment: comment,
                    airQuality: airQuality,
                    username: username,
                    image: image,
                    bathUserId: id,
                    BathroomId: bathroomId
                };
                uploadToFirebase(file, fileName, newPost);
                // clear fields
                $("#rating").val("");
                $("#comment").val("");
                $("#image").val("");
                $("#postTo").val("");
                $("#postModal").modal('close');
            }
        });
    }
    // button handles submitting the new Post
    $("#submitPost").on('click', addNewPost);

    //Click handler for search submit button to search bathroom
    $("#searchBathroom").on("click", function(event) {
        event.preventDefault();

        $("#cardArea").empty();
        let params;
        // if searching for mens rooms
        if ($('#check1').prop("checked")) {
            console.log("you selected mens rooms")
            params = {
                sex: ["Men", "Family/ Unisex"]
            }
        } // if searching womens
        if ($('#check2').prop("checked")) {
            params = {
                sex: ["Women", "Family/ Unisex"]
            }
        } // if searching all
        if ($('#check3').prop("checked")) {
            params = {
                sex: ["Women", "Family/ Unisex", "Men"]
            }
        }

        $.get('/api/bathrooms/search', params, function(data) {
            let newData = []
            for (let i = 0; i < data.length; i++) {
                let resultLatLng = JSON.parse(data[i].location)
                let resultLat = resultLatLng.lat
                let resultLng = resultLatLng.lng

                let d = distance(startLng, startLat, resultLng, resultLat)
                console.log("distance from click user")
                console.log(d)
                if (d < (5 * 1.60934)) {
                    let obj = data[i]
                    let miles = (d * 0.621371).toFixed(2)
                    obj["distance"] = miles
                    newData.push(obj)
                }
            }
            console.log("data retruned from searchBathroom: " + newData);
            renderLocations(newData);
            $("#check1").prop("checked", false);
            $("#check2").prop("checked", false);
            $("#check3").prop("checked", false);
        });
    });

    // when you click on the view reviews button
    $(document).on("click", '.viewReviews', function(event) {
        let id = $(this).attr('data-id');
        console.log("clicked on .viewReviews, id= " + id)
        getReviews(id);
    });

    function getReviews(id) {
        $.get("api/bathrooms/" + id, function(data) {
            let posts = data.Posts;
            $("#reviewsHere").empty();
            console.log("posts to be passed: " + JSON.stringify(posts))
            renderReviews(posts);
        });
    }


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

    function distance(startLng, startLat, lon2, lat2, cb) {
        var R = 6371; // Radius of the earth in km
        var dLat = (lat2 - startLat).toRad(); // Javascript functions in radians
        var dLon = (lon2 - startLng).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(startLat.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        console.log("Distance to user:")
        console.log(d)
        return d;
    }


    // function submits image to firebase
    function uploadToFirebase(file, fileName, newPost) { // submit image
        var storageRef = firebase.storage().ref('/bathroomPhotos/' + fileName);
        var uploadTask = storageRef.put(file) // gets link to image
        uploadTask.on('state_changed', function(snapshot) {}, function(error) {}, function() {
            console.log("downloadUrl: " + uploadTask.snapshot.downloadURL)
            downloadUrl = uploadTask.snapshot.downloadURL;
            let postWithImage = {
                rating: newPost.rating,
                comment: newPost.comment,
                airQuality: newPost.airQuality,
                username: newPost.username,
                image: downloadUrl,
                bathUserId: newPost.bathUserId,
                BathroomId: newPost.BathroomId
            }
            submitPost(postWithImage);
        })
    }


    // make cards for locations rendered
    function renderLocations(data) {
        // empty features array
        features = [];
        if (data.length != 0) {
            data.forEach(function(result) {
                let resultLatLng = JSON.parse(result.location)
                let resultLat = resultLatLng.lat
                let resultLng = resultLatLng.lng
                let labelText;
                let icon;
                if (result.sex === "Men") {
                    labelText = result.establishment + "(M)";
                    icon = "men";
                }
                if (result.sex === "Women") {
                    labelText = result.establishment + "(W)";
                    icon = "women";
                }
                if (result.sex === "Family/ Unisex") {
                    labelText = result.establishment + "(U)";
                    icon = "unisex";
                }

                let newFeature = { // get this location for map
                    position: new google.maps.LatLng(resultLat, resultLng),
                    label: labelText,
                    type: icon
                } // add to list of locations
                features.push(newFeature);
                let image;
                let ratingTotal = 0; // get the ratings from the posts
                let posts = result.Posts;
                let averageRating;
                // if there are posts to pull from...
                if (posts.length != 0) {
                    // get last post
                    let lastPost = posts.length - 1;
                    // image is most recent uploaded photo of that facility
                    image = posts[lastPost].image;
                    for (let i = 0; i < posts.length; i++) {
                        let ratingVal = parseInt(posts[i].rating);
                        ratingTotal += ratingVal;
                    } // get the average from the ratings 
                    averageRating = Math.round(ratingTotal / posts.length);
                }
                else { // if there aren't any...
                    image = "./images/noImage.png"
                    averageRating = "There are currently no reviews or ratings for this restroom."
                }
                if (result.sex != "Men") { // if its not the mens room
                    var div = $("<div>").append( // display this
                        "<div class='card locationCard'>" + "<div class='card-content'>" +
                        "<div class='row'><div class='col l6 m7 s12'>" +
                        "<h5>Establishment: " + result.establishment + "</h5>" +
                        "<p> Average Rating: " + averageRating + "</p>" +
                        "<p> Floor/ Department:  " + result.department + "</p>" +
                        "<p> Gender: " + result.sex + "</p>" +
                        "<p> Changing Table: " + result.table + "</p>" +
                        "<p> Distance: " + result.distance + "</p>" +
                        "<button data-target='postModal' class='btn modal-trigger createReview'  data-id='" + result.id + "'>Write Review</button>" +
                        "<button data-target='reviewsModal' class='btn modal-trigger viewReviews'  data-id='" + result.id + "'>View Reviews</button>" +
                        "</div>" +
                        "<div class='col l6 m5 s12'>" + "<img class='searchImage' id='searchImage' src=" + image + " />" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>"
                    );
                    $("#cardArea").append(div);
                    //End for loop
                }
                else { // if it is a mens room
                    var div = $("<div>").append( // display this
                        "<div class='card locationCard'>" + "<div class='card-content'>" +
                        "<div class='row'><div class='col l6 m7 s12'>" +
                        "<h5>Establishment: " + result.establishment + "</h5>" +
                        "<p> Average Rating: " + averageRating + " Stars</p>" +
                        "<p> Floor/ Department:  " + result.department + "</p>" +
                        "<p> Gender: " + result.sex + "</p>" +
                        "<p> Urinal Dividers: " + result.dividers + "</p>" +
                        "<p> Changing Table: " + result.table + "</p>" +
                        "<p> Distance: " + result.distance + "</p>" +
                        "<button data-target='postModal' class='btn modal-trigger createReview'  data-id='" + result.id + "'>Write Review</button>" +
                        "<button data-target='reviewsModal' class='btn modal-trigger viewReviews'  data-id='" + result.id + "'>View Reviews</button>" +
                        "</div>" +
                        "<div class='col l6 m5 s12'>" + "<img class='searchImage' id='searchImage' src=" + image + " />" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>"
                    );
                    $("#cardArea").append(div);
                    //End for loop
                }
            });

        } // initialize the map
        initMap()
    }

    // make cards for revies
    function renderReviews(data) {
        $("#reviewText").hide();
        if (data.length != 0) {
            data.forEach(function(result) {
                // convert formatted date to something legible
                console.log("created at: " + result.createdAt)
                var formattedDate = new Date(result.createdAt);
                formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
                console.log("formatted date: " + formattedDate)
                let image = result.image;
                if (result.image === "" || result.image === undefined) {
                    image = "./images/noImage.png";
                }

                var div = $("<div>").append(
                    "<div class='card'>" + "<div class='card-content'>" +
                    "<div class='row'><div class='col l6 m5 s12'>" +
                    "<h5>Rating: " + result.rating + " Stars</h5>" +
                    "<p> Air Quality:  " + result.airQuality + "</p>" +
                    "<p> Review: " + result.comment + "</p>" +
                    "<p> Reviewed by: " + result.username + "</p>" +
                    "<p> Reviewed on: " + formattedDate + "</p>" +
                    "</div><div class='col l6 m7 s12'>" +
                    "<img class='bathroomImage' id='searchImage' src=" + image + ">" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
                );
                $("#reviewsHere").append(div);
                //End for loop

            });
        }
        else {
            // tell them theres no reviews yet
            $("#reviewText").show();
            $("#reviewText").text("There are currently no reviews for this restroom yet")
        }
    }


    // all the info for the map
    var features = [];

    function initMap() {

        console.log("features: " + JSON.stringify(features))
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: new google.maps.LatLng(startLat, startLng),
            mapTypeId: 'roadmap'
        });
        const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

        const icons = {
            info: {
                icon: iconBase + 'info-i_maps.png'
            },
            unisex: {
                icon: "map-icon-toilet"
            },
            women: {
                icon: "map-icon-female"
            },
            men: {
                icon: "map-icon-male"
            }
        };
        
        // Create markers.
        features.forEach(function(feature) {
            console.log("feature in forEach: " + JSON.stringify(feature))
            let marker = new google.maps.Marker({
                position: feature.position,
                label: feature.label,
                icon: {
                    path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
                    fillColor: "red",
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                },
                map_icon_label: "<span class='map-icon " + icons[feature.type].icon + " '></span>",
                map: map
            });
        });
    }




});
