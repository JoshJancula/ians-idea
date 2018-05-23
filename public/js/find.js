$(document).ready(function() {
  
  var startLat;
  var startLng;

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
  
  /** Converts numeric degrees to radians */
  if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }
  }
  
  function getLocation() {
    function showPosition(position) {
      console.log("getting location")

      startLat = position.coords.latitude;
      startLng = position.coords.longitude;
      console.log(startLat)
      console.log(startLng)
    };
    //if geolocation is supported, the getCurrentPosition will be called
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
      lattitude.innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  //Call getLocation 
  getLocation();
  
  
   //Click handler for search submit button to search bathroom
  $("#searchBathroom").on("click", function(event) {
    event.preventDefault();

    $.get('/api/bathrooms', function(data) {
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
      renderCards(newData);
    });
  });
  
  // make cards from search
  function renderCards(data) {
    if (data.length !== 0) {
     
      data.forEach(function(result) {

        var div = $("<div>").append(
        
          "<div class='card'>" + "<div class='card-content'>" +
          "<h5>Establishment: " + result.establishment + "</h5>" +
          "<p> Floor/ Department:  " + result.department + "</p>" +
          "<p> Gender: " + result.sex + "</p>" +
          "<p> Changing Table: " + result.table + "</p>" +
          "<p> Distance: " + result.distance + "</p>" +
          "<button data-target='postModal' class='btn modal-trigger contact'  data-id='" + result.id + "'>Write Review</button>" +
          "</div>" +
          "</div>" +
          "</div>" 
        );
        console.log("bathroomId being created: " + result.id)
        $("#cardArea").append(div);
        
        //End for loop


      })

    }
  }
  
});


