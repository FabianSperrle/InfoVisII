var barChart;
var x, y, xAxisBarChart, yAxisBarChart;

var margin = {top: 40, right: 20, bottom: 70, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

function initBarChart(width) {

    if(width==undefined) width = 300;

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxisBarChart = d3.svg.axis()
        .scale(x)
        .ticks(0)
        .orient("bottom");

    yAxisBarChart = d3.svg.axis()
        .scale(y)
        .orient("left");

    d3.select("#barChart").remove();
    barChart = d3.select("#detailPanel").append("svg")
        .attr("id", "barChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}


function reloadDetailPanel(){//flight, color){
    initBarChart();

    var xDomain = [];
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if(data.crimeTypes[data.getCrimeTypes()[i]].visibility == 1 || data.crimeTypes[data.getCrimeTypes()[0]].visibility == 1){
            if(data.crimeTypes[data.getCrimeTypes()[i]].verboseName != "All Crimes")
                xDomain.push(data.crimeTypes[data.getCrimeTypes()[i]].verboseName);
        }
    };

    var groupedByCrimeType = d3.nest().key(function (d) {
            return d.crime_type;
        }).sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(this.filtered);
    

    x.domain(xDomain);
    var ymax = d3.max(Object.keys(groupedByCrimeType).map(function(v){return groupedByCrimeType[v].values;}));
    y.domain([0,ymax]);

    barChart.append("g")
        .attr("class", "y axis")
        .call(yAxisBarChart)
        .append("text")
        .attr("x", width / 1.75)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Distribution - Crime Types");

    var xAx = barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisBarChart);

    xAx.selectAll("text")
        .attr("id", function(d){
            return "label_" + d.replace(/ /g, "");
        })
        .attr("y", 0)
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("fill", "black")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
        // .on("mouseover", function(d){
        //    colorBarHighlight(d,"blue");
        //})
        //.on("mouseout", function(d){
        //    colorBarHighlight(d,"red");
        //});

    barChart.selectAll(".bar")
        .data(groupedByCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "bar_"+d.key;
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.key);
        })
        .attr("width",  x.rangeBand())
        .attr("y", function (d) {
            return y(d.values); //d[6]
        })
        .attr("height", function (d) {
            return height - y(d.values);
        })
        .attr("fill", "black");
    
        //.on("mouseover", function (d) {
         //   colorBarHighlight(d[0] + "-" + d[1],"blue");
        //})
        //.on("mouseout", function (d) {
        //    colorBarHighlight(d[0] + "-" + d[1],"red");
        //});
}

data.on('loadAggregates', initBarChart);
data.on('filtered', reloadDetailPanel);