var map;
var markerData;
var searchResults = [];


function clearData() {
	//clear markers on the map
    map.eachLayer(function(layer) {
        if (layer.getLatLng) {
            map.removeLayer(layer); 
        }
    });
	//clear routes on the map
	 map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer); 
        }
    });
  }

function search() {
    searchResults = [];

    // Get the hospital name
    var hospitalName = $('#hospitalName').val();

    // Invoke the PHP
    $.getJSON("./php/fetchHospitalData.php", { hospitalName: hospitalName }, function(data) {
        // Clear the results
        $('#results').empty();
		//push the elements of results to searchResults
        for (var i = 0; i < data.length; i++) {
            searchResults.push({
                name: data[i].name, 
                lat: data[i].latitude, 
                lon: data[i].longitude
            }); 
        }

        // Check if data is retrieved successfully
        if (data.length > 0) {
            // Show the hospital names
            data.forEach(function(hospital) {
                $('#results').append('<p>' + hospital.name+ '.' + 'Coordinate is '+ hospital.latitude+ ',' + hospital.longitude+'</p>');
				//add hopsital to Map
                plotIcons();
            });
        } else {
            $('#results').append('<p>No hospital data found.</p>');
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error fetching hospital data: ", textStatus, errorThrown);
    });//report erro if program gone wrong
}

		function plotIcons()	{
			
			clearData();
			
			var myIcon = L.icon({
				iconUrl : './img/hospital.png',
				iconSize:[23,23]
			});	
			for (var i = 0; i< searchResults.length; i++)	{ 
				var Results = new L.LatLng(searchResults[i].lat,searchResults[i].lon);
				var marker = new L.Marker(Results,{icon:myIcon}).addTo(map).bindPopup(searchResults[i].name);
			}
		}


function showmap()	{
	// Create the map object and set the centre point and zoom level 
    map = L.map('mapcontainer');
    map.setView([51,-2],7);

    // Load tiles from open street map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map); // Add the basetiles to the map object
	
	// L.control.locate().addTo(map)
}

function fetchData() {
    console.log("start fetchData function");
    
    // Define array to hold results returned from server
    var markerData = [];
    console.log("prepare to start $.getJSON")
    // AJAX request to server; accepts a URL to which the request is sent 
    // and a callback function to execute if the request is successful. 
    $.getJSON("./php/fetchData.php", null, function(results) {
        console.log("start $.getJSON");
        // Populate markerData with results
        for (var i = 0; i < results.length; i++) {
            markerData.push({
                name: results[i].name,
                lat: results[i].lat, 
                lon: results[i].lon
            }); 
        };
        console.log("finish load php");
        plotTweets(markerData);
         
    });

    
    function plotTweets(markerData) {
        var myIcon = L.icon({
            iconUrl: './img/hospital.png',
            iconSize: [23, 23]
        });    
        for (var i = 0; i < markerData.length; i++) {
            console.log("start plot markers"); 
            var markerLocation = new L.LatLng(markerData[i].lat, markerData[i].lon);
            var marker = new L.Marker(markerLocation, {icon: myIcon}).addTo(map).bindPopup(markerData[i].name);
        }
    }
}




function route() {
    // Clear map
    clearData();

    // Get the values from the form
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        document.getElementById('latitude').value = `${latitude}`;
        document.getElementById('longitude').value = `${longitude}`;

        // Handle data when request received
        $.getJSON("./php/nearhospital.php", {longitude: longitude, latitude: latitude}, function(results) {
            var nearhospital = [];
            for (var i = 0; i < results.length; i++) {
                nearhospital.push({
                    name: results[i].name, 
                    lat: results[i].lat, 
                    lon: results[i].lon,
                });
            }

            // Route
            if (nearhospital.length > 0) {
                L.Routing.control({
                    waypoints: [
                        L.latLng(latitude, longitude),
                        L.latLng(nearhospital[0].lat, nearhospital[0].lon)
                    ]
                }).addTo(map);
            } else {
                alert("No nearby hospitals found.");
            }
        });
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }
}



	