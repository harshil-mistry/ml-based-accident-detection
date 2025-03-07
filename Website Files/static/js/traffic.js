        // Set your Mapbox access token here
        mapboxgl.accessToken = 'pk.eyJ1IjoicHVzaHRpdXd1IiwiYSI6ImNtNXBkbjNsNTAwMW0ycG9lYWprZWdnNHQifQ.N3zCDGKkcQBKEaMkfbFqOg';

        // Function to get the live location
        function getLiveLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;

                    // Ensure latitude, longitude are numbers
                    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                        console.error("Invalid coordinates received");
                        return;
                    }

                    // Initialize the map centered on the live location
                    var map = new mapboxgl.Map({
                        container: 'map',
                        style: 'mapbox://styles/mapbox/streets-v11', // You can change the style if needed
                        center: [longitude, latitude], // Center the map on live location
                        zoom: 14
                    });

                    // Add a marker for the live location
                    var marker = new mapboxgl.Marker()
                        .setLngLat([longitude, latitude])
                        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3><p>Latitude: ' + latitude + '<br>Longitude: ' + longitude + '</p>'))
                        .addTo(map);

                    // Add the traffic layer
                    map.on('load', function () {
                        map.addSource('traffic', {
                            type: 'vector',
                            url: 'mapbox://mapbox.mapbox-traffic-v1'
                        });

                        map.addLayer({
                            id: 'traffic-layer',
                            type: 'line',
                            source: 'traffic',
                            'source-layer': 'traffic',
                            paint: {
                                'line-color': [
                                    'match',
                                    ['get', 'congestion'], // Access the congestion level
                                    'low', 'green',         // Green for light traffic
                                    'moderate', 'yellow',   // Yellow for moderate traffic
                                    'heavy', 'red',         // Red for heavy traffic
                                    'severe', 'red',        // Red for severe traffic
                                    'gray'    // Default color if no congestion data
                                ],
                                'line-width': 2
                            }
                        });

                    });

                    // Add a custom control for the traffic legend
                    var TrafficLegend = function () { };

                    TrafficLegend.prototype.onAdd = function (map) {
                        var div = document.createElement('div');
                        div.className = 'legend';
                        div.innerHTML = '<b>Traffic Legend</b><br>';
                        div.innerHTML += '<div><span style="background-color: green;"></span> Fast</div>';
                        div.innerHTML += '<div><span style="background-color: yellow;"></span> Moderate</div>';
                        div.innerHTML += '<div><span style="background-color: red;"></span> Slow</div>';
                        return div;
                    };

                    TrafficLegend.prototype.onRemove = function () {
                        // This function is required but not used in this case
                    };

                    var legend = new TrafficLegend();
                    map.addControl(legend, 'top-right');

                }, function (error) {
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        // Call the function to get the live location
        getLiveLocation();