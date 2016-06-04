var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//var tiles = L.tileLayer('https://api.apbox.com/styles/v1/fabiansperrle/cio2xydhi003dbzm14yr5xu17/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFiaWFuc3BlcnJsZSIsImEiOiJjaW51NXBlOXowMG13dzltMndzdHI4b3gwIn0.-KwI70EkNL2Ni6YWkXfKsQ', {
		maxZoom: 20,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ, Tiles from Mapbox'
	})
var latlng = L.latLng(51.513819, -0.098361);
var map = L.map('choropleth', { center: latlng, zoom: 13, layers: [tiles] });


function getColor(d) {
 d=1000* Math.random(100);
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(1),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

data.on('loadWards', function() {
    L.geoJson(data.wards, {style: style}).addTo(map);
})

data.on('filtered', function() {
    
})