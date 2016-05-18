//var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
var tiles = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
//var tiles = L.tileLayer('https://api.apbox.com/styles/v1/fabiansperrle/cio2xydhi003dbzm14yr5xu17/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFiaWFuc3BlcnJsZSIsImEiOiJjaW51NXBlOXowMG13dzltMndzdHI4b3gwIn0.-KwI70EkNL2Ni6YWkXfKsQ', {
		maxZoom: 20,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ, Tiles from Mapbox'
	});
var latlng = L.latLng(51.513819, -0.098361);
var map = L.map('map', { center: latlng, zoom: 13, layers: [tiles] });

var markers = L.markerClusterGroup({ 
	chunkedLoading: true, 
	maxClusterRadius: 80
});

function updateClusters() {
	map.removeLayer(markers);

	markers = L.markerClusterGroup({ 
		chunkedLoading: true, 
		maxClusterRadius: 80
	});
	var markerList = [];

	for (var i = 0; i < data.filtered.length; i++) {
		var a = data.filtered[i];
		var title = a.crimetype;

		var lat = a.latitude;
		var lng = a.longitude;

		if (lat == "" || lng == "" || lat == "Latitude" || lng == "Longitude") {
			continue;
		}

		var marker = L.marker(L.latLng(a.latitude, a.longitude), { title: title });
		marker.bindPopup(title);
		markerList.push(marker);
	}

	markers.addLayers(markerList);
	map.addLayer(markers);
}

data.on('filtered', updateClusters);