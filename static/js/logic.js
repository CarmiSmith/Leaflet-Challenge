var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"  + "<p>" + "Depth: " + feature.geometry['coordinates'][2] + "</p>" + "<p>" + "Mag : " + feature.properties.mag + "</p>");
  },
  pointToLayer: function (feature, latlng) {
    return new L.circle(latlng,

      {
        radius: radiusSize(feature.properties.mag),
        fillColor: circleColor(feature.geometry['coordinates'][2]),
        fillOpacity: .75,
        color: "white",
      })
  }
  });
   function radiusSize(magnitude) {
     return magnitude * 50000;
   }
    function circleColor(d) {
      if (d > 20) {
       return  "red"
      }
      else if (d > 15) {
        return "orange"
      }
      else if (d > 10) {
        return "blue"
      }
      else if (d > 5) {
        return "yellow"
      }
      else {
        return "green"
      }
    }

  createMap(earthquakes);
}

function createMap(earthquakes) {


  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", { 
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var darkscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultLine = new L.LayerGroup();
  
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Darkscale Map": darkscalemap,
    "Satellite Map": satellitemap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "FaultLines": faultLine
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorsmap, earthquakes, faultLine]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Query to retrieve the faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
  
  // Create the faultlines and add them to the faultline layer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "blue", weight: 2}
      }
    }).addTo(faultLine)
  })

  // color function to be used when creating the legend
     function getColor(d) {
       return d > 20  ? 'red' :
              d > 15  ? 'orange' :
              d > 10  ? 'blue' :
              d > 5   ? 'yellow' :
                        'green';
     }

// Add legend to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend');
      grades = [0, 5, 10, 15, 20];
      
      colors = ["green", "yellow", "blue", "orange", "red"]; 
          
        for (var i = 0; i < colors.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(colors[i]) + '"></i> ' +
                colors[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
       
      return div;
  };
  
  legend.addTo(myMap);
}
