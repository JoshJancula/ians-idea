$(document).ready(function() {
    
    $.get("api/user_data", {}, function(data) {}).done(function(data) {
        console.log("data1: " + JSON.stringify(data))
        let id = data.id;
        console.log("id: " + id);
        $.get("api/users/" + id, function(data) {
            let posts = data.Posts;
            renderReviews(posts);
        })
    
    });
    
    
    
    
    // make cards for revies
    function renderReviews(data) {
        if (data.length != 0) {
            data.forEach(function(result) {
                // convert formatted date to something legible
                var formattedDate = data.createdAt
                formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
                var div = $("<div>").append(
                    "<div class='card'>" + "<div class='card-content'>" +
                    "<div class='row'><div class='col l6 m6 s12'>" +
                    "<h5>Rating: " + result.rating + " Stars</h5>" +
                    "<p> Air Quality:  " + result.airQuality + "</p>" +
                    "<p> Review: " + result.comment + "</p>" +
                    "<p> Reviewed by: " + result.username + "</p>" +
                    "<p> Reviewed on: " + formattedDate + "</p>" +
                    "</div><div class='col l6 m6 s12'>" +
                    "<img class='bathroomImage' id='searchImage' src=" + result.image + ">" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
                );
                $("#cardArea").append(div);
                //End for loop
            });
        }
        else {
            // tell them theres no reviews yet
            var div = $("<div>").append(
                    "<div class='card'>" + "<div class='card-content'>" +
                    "<div class='row'><div class='col l12 m12 s12'>" +
                    "<h5>You have not written any reviews.</h5>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
                );
                $("#cardArea").append(div);
         
        }
    }
    
})