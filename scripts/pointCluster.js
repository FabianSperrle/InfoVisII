//var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
var tiles = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
//var tiles = L.tileLayer('https://api.apbox.com/styles/v1/fabiansperrle/cio2xydhi003dbzm14yr5xu17/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFiaWFuc3BlcnJsZSIsImEiOiJjaW51NXBlOXowMG13dzltMndzdHI4b3gwIn0.-KwI70EkNL2Ni6YWkXfKsQ', {
		maxZoom: 20,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ, Tiles from Mapbox'
	});
var latlng = L.latLng(51.513819, -0.098361);
var map = L.map('map', { center: this.latlng, zoom: 13, layers: [this.tiles] });

var layers = {
    clusters: {
        layer: undefined,
        invalid: true
    },
    points: {
        layer: undefined,
        invalid: true
    },
    heat: {
        layer: undefined,
        invalid: true
    },
    choropleth: {
        layer: undefined,
        invalid: true
    }
};
maxPoints = 5000;

var visibleLayer = layers.clusters;
var visibleLayerName = 'clusters';

function setVisibleLayer(name) {
    if (visibleLayer !== undefined)
        map.removeLayer(visibleLayer);
    
    if (layers[name].invalid == true) {
        updateLayer(name);
    }
    
    visibleLayer = layers[name];
    visibleLayerName = name;
    map.addLayer(visibleLayer);
    
    if (data.filtered.length > maxPoints && name == "points") {
        map.panTo(latlng);
    }
}

function updateCurrentLayer() {
    updateLayer(visibleLayerName);
}

function updateLayer(name) {
    switch (name) {
        case 'clusters':
            updateClusterLayer();
            break;
        case 'points':
            updatePointsLayer();
            break;
        case 'heat':
            updateHeatLayer();
            break;
        case 'choropleth':
            updateChloroplethLayer();
            break;
    }
    layers[name].invalid = false;
}

function redrawCurrentLayer() {
    setVisibleLayer(visibleLayerName);
}

var updateClusterLayer = function() {
    layers.clusters = L.markerClusterGroup({
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
    
	layers.clusters.addLayers(markerList);

    // Set clusters as default if nothing else is selected
    if (visibleLayer === undefined) {
        visibleLayer = layers.clusters;
        map.addLayer(visibleLayer);
        document.getElementById('cluster_map').checked = true;
    }
};

var updatePointsLayer = function () {
    var markerList = [];

    if (data.filtered.length <= maxPoints) {
        for (var i = 0; i < data.filtered.length; i++) {
            var a = data.filtered[i];
            var title = a.crimetype;

            var lat = a.latitude;
            var lng = a.longitude;

            if (lat == "" || lng == "" || lat == "Latitude" || lng == "Longitude") {
                continue;
            }

            var divIcon = L.divIcon({
                className: 'pin ' + title.replace(/ /g,''),
                iconSize: [20, 20]
            });

            var marker = L.marker(L.latLng(a.latitude, a.longitude), {
                title: title,
                icon: divIcon,
                rotationAngle: -45,
            });
            marker.bindPopup(title);
            markerList.push(marker);
        }
    } else {
        // too many points!
        var divIcon = L.divIcon({
            className: 'warning',
            iconSize: [400, 400]
        });
        var marker = L.marker(latlng, {
            icon: divIcon,
        });
        markerList.push(marker);
    }
    
    layers.points = L.layerGroup(markerList);
}

var updateHeatLayer = function () {
    var latlngList = [];
    for (var i = 0; i < data.filtered.length; i++) {
        var a = data.filtered[i];
        var title = a.crimetype;

        var lat = a.latitude;
        var lng = a.longitude;

        if (lat == "" || lng == "" || lat == "Latitude" || lng == "Longitude") {
            continue;
        }

        latlngList.push(L.latLng(a.latitude, a.longitude));
    }

    layers.heat = L.heatLayer(latlngList, {
        max: 0.1,
        blur: 40,
        radius: 40
    });
}
var updateChloroplethLayer = function () {
    layers.choropleth = layers.clusters;
}

function invalidateLayers() {
    Object.keys(layers).forEach(function (name) {
        layers[name].invalid = true;
    })
}

data.once('filtered', updateClusterLayer);

data.on('filtered', invalidateLayers);
data.on('filtered', updateCurrentLayer);
data.on('filtered', redrawCurrentLayer);

