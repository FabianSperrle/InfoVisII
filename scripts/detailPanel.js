var barChart;
var xBar, yBar, xAxisBarChart, yAxisBarChart;

var marginBar = {top: 40, right: 20, bottom: 70, left: 80},
    widthBar = 1000 - marginBar.left - marginBar.right,
    heightBar = 300 - marginBar.top - marginBar.bottom;

function initBarChart(width) {

    if(width==undefined) width = 300;

    xBar = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    yBar = d3.scale.linear()
        .range([heightBar, 0]);

    xAxisBarChart = d3.svg.axis()
        .scale(xBar)
        .ticks(0)
        .orient("bottom");

    yAxisBarChart = d3.svg.axis()
        .scale(yBar)
        .orient("left");

    d3.select("#barChart").remove();
    barChart = d3.select("#detailPanel").append("svg")
        .attr("id", "barChart")
        .attr("width", width + marginBar.left + marginBar.right)
        .attr("height", heightBar + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");
}
var gg;

function reloadDetailPanel(){//flight, color){
    initBarChart();

    var xDomain = [];
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if(data.crimeTypes[data.getCrimeTypes()[i]].visibility == 1 || data.crimeTypes[data.getCrimeTypes()[0]].visibility == 1){
            //if(data.crimeTypes[data.getCrimeTypes()[i]].verboseName != "All Crimes")
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

    if(data.crimeTypes["allCrimes"].visibility == 1){
        groupedByCrimeType.push({key: "All Crimes", values: d3.sum(Object.keys(groupedByCrimeType).map(function(v){return groupedByCrimeType[v].values;}))});
    }
    gg = groupedByCrimeType;

    xBar.domain(xDomain);
    var ymax = d3.max(Object.keys(groupedByCrimeType).map(function(v){return groupedByCrimeType[v].values;})); //if(groupedByCrimeType[v].key != "All Crimes") 
    yBar.domain([0,ymax]);

    barChart.append("g")
        .attr("class", "y axis")
        .call(yAxisBarChart)
        .append("text")
        .attr("x", widthBar / 1.75)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Distribution - Crime Types");

    var xAx = barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightBar + ")")
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
            return "bar_";
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return xBar(d.key);
        })
        .attr("width",  xBar.rangeBand())
        .attr("y", function (d) {
            return yBar(d.values);
        })
        .attr("height", function (d) {
            return heightBar - yBar(d.values);
        })
        .attr("fill", function (d) {
            return data.crimeTypes[data.getCrimeVarName(d.key)].color;
        });
    
        //.on("mouseover", function (d) {
         //   colorBarHighlight(d[0] + "-" + d[1],"blue");
        //})
        //.on("mouseout", function (d) {
        //    colorBarHighlight(d[0] + "-" + d[1],"red");
        //});
}

data.on('loadAggregates', initBarChart);
data.on('filtered', reloadDetailPanel);
data.on('resetDetailPanel', initBarChart);
