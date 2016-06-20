//var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
var tiles = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
//var tiles = L.tileLayer('https://api.apbox.com/styles/v1/fabiansperrle/cio2xydhi003dbzm14yr5xu17/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFiaWFuc3BlcnJsZSIsImEiOiJjaW51NXBlOXowMG13dzltMndzdHI4b3gwIn0.-KwI70EkNL2Ni6YWkXfKsQ', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ, Tiles from Mapbox'
});
var latlng = L.latLng(51.513819, -0.098361);
var map = L.map('map', {center: this.latlng, zoom: 15, layers: [this.tiles]});

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
maxPoints = 1000;

var visibleLayer = layers.clusters;
var visibleLayerName = 'clusters';

function setVisibleLayer(name) {
    if (visibleLayer !== undefined)
        map.removeLayer(visibleLayer);
    removeTooManyPointsWarning();

    if (layers[name].invalid == true) {
        updateLayer(name);
    }

    visibleLayer = layers[name];
    visibleLayerName = name;
    map.addLayer(visibleLayer);

    if (data.filtered.length > maxPoints && name == "points") {
        tooManyPoints();
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

var updateClusterLayer = function () {
    layers.clusters = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 80
    });

    var markerList = [];
    for (var i = 0; i < data.filtered.length; i++) {
        var a = data.filtered[i];
        var title = a.crime_type;

        var lat = a.latitude;
        var lng = a.longitude;

        if (lat == "" || lng == "" || lat == "Latitude" || lng == "Longitude") {
            continue;
        }

        var marker = L.marker(L.latLng(a.latitude, a.longitude), {title: title});
        marker.options.month = a.month;
        marker.bindPopup(title);

        marker.on("mouseover", function (a) {
            createTimelineHighlight(a.target.options.month, a.target.options.title, 1, 1);
        }).on("mouseout", function () {
            d3.selectAll(".highlightDots").remove();
        });

        markerList.push(marker);
    }

    layers.clusters.addLayers(markerList);

    function createTimelineHighlight(date, verboseCrimeTypeTitle, number, opacity) {
        if (typeof number === 'undefined') number = 1;
        if (typeof opacity === 'undefined') opacity = 0.5;
        // find CrimeTypeLine to highlight :: only activated lines!!
        // IF not activated take "allCrimes" line for Highlighting!
        var crimeIndex = data.getCrimeIndexByVerboseName(verboseCrimeTypeTitle);
        var crimeType = data.getCrimeTypes()[crimeIndex];
        if (data.crimeTypes[crimeType].visibility === 0) {
            crimeType = "allCrimes";
            if (!data.crimeTypes[crimeType].visibility) {
                alert("Error happened");
                return;
            }
        }
        var year = date.getFullYear();
        var mon = date.getMonth() + 1;
        // Take First of month for Correct Highlighting! TODO change to middle if possible!
        var newDate = new Date(year, mon - 1, 1);
        if (mon < 10) mon = "0" + mon;
        var y_value = data.crimeAggregates["y" + year]["m" + mon][crimeType];
        //log(crimeType + "_" + y_value);
        svg.append("circle")
            .attr("class", "highlightDots")
            .attr("r", 3 + Math.sqrt(number) * 2)
            .attr("cx", x(newDate))
            .attr("cy", y(y_value))
            .attr("stroke-width", 10)
            .style("fill-opacity", opacity)
            .attr("fill", data.getCrimeColor(crimeType));
    }

    layers.clusters.on('clustermouseover', function (a) {
        var children = a.layer.getAllChildMarkers();
        var bins = {};
        for (var i = 0; i < children.length; i++) {
            var date = children[i].options.month;
            var crimeType = children[i].options.title;
            var crimeIndex = data.getCrimeIndexByVerboseName(crimeType);
            var crimeTypeVis = data.getCrimeTypes()[crimeIndex];
            if (data.crimeTypes[crimeTypeVis].visibility === 0) {
                crimeTypeVis = "allCrimes";
                if (!data.crimeTypes[crimeTypeVis].visibility) {
                    alert("Error happened");
                    return;
                }
                crimeType = "All Crimes";
            }
            if (typeof bins[date] === 'undefined') {
                bins[date] = {};
                bins[date][crimeType] = 1;
            } else if (typeof bins[date][crimeType] === 'undefined') {
                bins[date][crimeType] = 1;
            } else {
                bins[date][crimeType]++;
            }
        }

        var firstKeys = Object.keys(bins);
        for (var i = 0; i < firstKeys.length; i++) {
            var secondKeys = Object.keys(bins[firstKeys[i]]);
            for (var j = 0; j < secondKeys.length; j++) {
                var numberOfCrimes = bins[firstKeys[i]][secondKeys[j]];
                createTimelineHighlight(new Date(firstKeys[i]), secondKeys[j], numberOfCrimes);
            }
        }
    });

    layers.clusters.on('clustermouseout', function (a) {
        d3.selectAll(".highlightDots").remove();
    });


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
            var title = a.crime_type;

            var lat = a.latitude;
            var lng = a.longitude;

            if (lat == "" || lng == "" || lat == "Latitude" || lng == "Longitude") {
                continue;
            }

            var divIcon = L.divIcon({
                className: 'pin ' + title.replace(/ /g, ''),
                iconSize: [20, 20]
            });

            var marker = L.marker(L.latLng(a.latitude, a.longitude), {
                title: title,
                icon: divIcon,
                rotationAngle: -45
            });
            marker.options.month = a.month;
            marker.bindPopup(title);
            markerList.push(marker);

            marker.on("mouseover",function(a){
                createTimelineHighlight(a.target.options.month, a.target.options.title,1,1);
            }).on("mouseout", function(){
                d3.selectAll(".highlightDots").remove();
            });
        }
    }

    layers.points = L.layerGroup(markerList);
};

function createTimelineHighlight(date, verboseCrimeTypeTitle, number, opacity){
    if (typeof number  === 'undefined') number = 1;
    if (typeof opacity === 'undefined') opacity = 0.5;
    // find CrimeTypeLine to highlight :: only activated lines!!
    // IF not activated take "allCrimes" line for Highlighting!
    var crimeIndex = data.getCrimeIndexByVerboseName(verboseCrimeTypeTitle);
    var crimeType =  data.getCrimeTypes()[crimeIndex];
    if (data.crimeTypes[crimeType].visibility === 0){
        crimeType =  "allCrimes";
        if(!data.crimeTypes[crimeType].visibility){
            log("Error happened: " + crimeType +  " not existing!");
            return;
        }
    }
    var year = date.getFullYear();
    var mon = date.getMonth()+1;
    // Take First of month for Correct Highlighting! TODO change to middle if possible!
    var newDate = new Date(year, mon-1, 1);
    if(mon < 10) mon = "0"+mon;
    var y_value = data.crimeAggregates["y"+year]["m"+mon][crimeType];
    //log(crimeType + "_" + y_value);
    svg.append("circle")
        .attr("class", "highlightDots")
        .attr("r",3+Math.sqrt(number)*2)
        .attr("cx", x(newDate))
        .attr("cy", y(y_value))
        .attr("stroke-width", 10)
        .style("fill-opacity",opacity)
        .attr("fill", data.getCrimeColor(crimeType));
}

var updateHeatLayer = function () {
    var latlngList = [];
    for (var i = 0; i < data.filtered.length; i++) {
        var a = data.filtered[i];
        var title = a.crime_type;

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
};

var updateChloroplethLayer = function () {
    function getColor(d) {
        var district = d;
        var districtContainer = data.crimesAggGeo[d];

        var datefrom = data.dates.from;
        var dateto = data.dates.to;

        /*var months = [];
        var nrmonth = monthDiff(datefrom, dateto);
        console.log("nrmonth = " + nrmonth);
        for (var c = 0; c <= nrmonth + 1; c++) {
            months.push(new Date(datefrom.setMonth(datefrom.getMonth() + 1)));
            months[c] = months[c].getFullYear() + "-" + ((months[c].getMonth()) + 1) + "-01";
        }*/ 
        var months = d3.time.months(data.dates.from, data.dates.to);
        months = months.map(function (d) {
            return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-01";
        });
        var nrmonth = months.length;

        var activecrimes = [];
        var allcrimetypes = Object.keys(data.crimeTypes);
        for (var i = 0; i < allcrimetypes.length; i++) {
            if (data.crimeTypes[allcrimetypes[i]].visibility == 1 || data.crimeTypes["allCrimes"].visibility == 1) {
                if (allcrimetypes[i] == "allCrimes") continue;
                activecrimes.push(data.crimeTypes[allcrimetypes[i]].verboseName);
            }
        }

        var weight = 0;
        for (var i = 0; i < months.length; i++) {
            var a = districtContainer[months[i]];
            if (a == undefined) {
                continue;
            }
            for (var j = 0; j < activecrimes.length; j++) {
                var count = a[activecrimes[j]];
                if (count != undefined) {
                    weight += +count;
                }
            }
        }
        weight = weight / data.filtered.length * 25;
        //console.log(weight +" "+ nrmonth);

        return weight > 2 ? '#800026' :
            weight > 1 ? '#BD0026' :
                weight > 0.75 ? '#E31A1C' :
                    weight > 0.5 ? '#FC4E2A' :
                        weight > 0.3 ? '#FD8D3C' :
                            weight > 0.2 ? '#FEB24C' :
                                weight > 0.1 ? '#FED976' :
                                    '#FFEDA0';


        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 1 : months + 1;
        }
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.id),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    layers.choropleth = L.geoJson(data.geo, {style: style});
};

function invalidateLayers() {
    Object.keys(layers).forEach(function (name) {
        layers[name].invalid = true;
    })
}

function emptyDataList() {
    if (data.filtered.length == 0) {
        d3.selectAll('#no_elements')
            .style('visibility', 'visible')
            .style('opacity', '1');
    } else {
        d3.selectAll('#no_elements').style('opacity', '0');
        setTimeout(
            function () {
                d3.selectAll('#no_elements').style('visibility', 'hidden');
            }, 500
        );
    }
}

function tooManyPoints() {
    d3.selectAll('#too_many')
        .style('visibility', 'visible')
        .style('opacity', '1');
}

function removeTooManyPointsWarning() {
    d3.selectAll('#too_many').style('opacity', '0')
        .style('visibility', 'hidden');
}
data.once('filtered', updateClusterLayer);
data.on('filtered', invalidateLayers);
data.on('filtered', emptyDataList);
data.on('filtered', updateCurrentLayer);
data.on('filtered', redrawCurrentLayer);

