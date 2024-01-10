let map = L.map('map', {center: [40.7, -94.5], zoom: 5});

// Add a basemap layer (you can use any other basemap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a legend
let legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depthColors = ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
    let labels = ['0-10 km', '10-30 km', '30-50 km', '50-70 km', '70-90 km', '90+ km'];

    div.innerHTML = '<h4>Depth Legend</h4>';

    for (let i = 0; i < depthColors.length; i++) {
        div.innerHTML += '<i style="background:' + depthColors[i] + '"></i> ' + labels[i] + '<br>';
    }

    return div;
};
legend.addTo(map);
// Function to calculate the radius based on magnitude
function getRadius(magnitude) {
    // Handle special case for magnitude zero
    if (magnitude === 0) {
        return 1; // Set a minimum radius for magnitude 0 earthquakes
    }
    
    // Calculate radius using Leaflet's built-in getRadius method (in meters)
    return Math.pow(2, magnitude) ;
}

// Use D3 to load earthquake data from the URL
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(data => {
        L.geoJSON(data.features, {
            pointToLayer: function (feature, latlng) {
                // Calculate the radius based on magnitude
                let radius =getRadius(feature.properties.mag)

                // Calculate the color based on depth
                let depth = feature.geometry.coordinates[2];
                let depthColors = ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
                let getColor = (depth) => {
                    if (depth < 10) return depthColors[0];
                    else if (depth < 30) return depthColors[1];
                    else if (depth < 50) return depthColors[2];
                    else if (depth < 70) return depthColors[3];
                    else if (depth < 90) return depthColors[4];
                    else return depthColors[5];
                };
                return L.circleMarker(latlng, {
                    radius: radius,
                    fillColor: getColor(depth),
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                // Add a popup with earthquake information
                layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + " km<br>Location: " + feature.properties.place);
            }
        }).addTo(map);
    });
