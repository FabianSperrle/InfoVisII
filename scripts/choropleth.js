var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//var tiles = L.tileLayer('https://api.apbox.com/styles/v1/fabiansperrle/cio2xydhi003dbzm14yr5xu17/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFiaWFuc3BlcnJsZSIsImEiOiJjaW51NXBlOXowMG13dzltMndzdHI4b3gwIn0.-KwI70EkNL2Ni6YWkXfKsQ', {
		maxZoom: 20,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ, Tiles from Mapbox'
	})
var latlng = L.latLng(51.513819, -0.098361);
var map = L.map('choropleth', { center: latlng, zoom: 13, layers: [tiles] });


function getColor(d) {

    var district = d;
    var districtContainer = data.crimesAggGeo[d];

    var datefrom = new Date("2012-10-01");
    var dateto = new Date("2013-12-01");

    var months = [];
    var nrmonth = monthDiff(datefrom, dateto);
    for (var c = 0; c <= nrmonth+1; c++) {
        months.push(new Date(datefrom.setMonth(datefrom.getMonth()+1)));
        months[c] = months[c].getFullYear()+"-"+((months[c].getMonth())+1)+"-01";
    }
      
    var activecrimes = [];
    var allcrimetypes = Object.keys(data.crimeTypes);
    for (var i = 0; i < allcrimetypes.length; i++) {
      if(data.crimeTypes[allcrimetypes[i]].visibility == 1 || allcrimetypes[i]=="allCrimes"){
        if(allcrimetypes[i] == "allCrimes") continue;
          activecrimes.push(data.crimeTypes[allcrimetypes[i]].verboseName);
      }
    };

    var weight = 0;
    for (var i = 0; i < months.length; i++) {
      for (var j = 0; j < activecrimes.length; j++) {
            var a = districtContainer[months[j]]
            if(a != undefined)
              var count = a[activecrimes[i]];
            if(count != undefined)
              weight+= +districtContainer[months[j]][activecrimes[i]];
      };
    };
    weight = weight/nrmonth;
    //console.log(weight +" "+ nrmonth);


    return weight > 2 ? '#800026' :
           weight > 1  ? '#BD0026' :
           weight > 0.75  ? '#E31A1C' :
           weight > 0.5  ? '#FC4E2A' :
           weight > 0.3   ? '#FD8D3C' :
           weight > 0.2   ? '#FEB24C' :
           weight > 0.1   ? '#FED976' :
                            '#FFEDA0';




      function monthDiff(d1, d2) {
          var months;
          months = (d2.getFullYear() - d1.getFullYear()) * 12;
          months -= d1.getMonth() + 1;
          months += d2.getMonth();
          return months <= 0 ? 1 : months+1;
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

data.on('loadGeo', function() {
    
})

data.on('loadAggregatedCrimesByGeo', function() {
    L.geoJson(data.geo, {style: style}).addTo(map);
})

data.on('filtered', function() {
    
})