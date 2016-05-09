


var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var testData;
var dateFormat = d3.time.format("%Y-%m");
var formatDate = d3.time.format("%B %Y");
var timeScale = d3.time.scale()
    .range([0,width])
    .domain([new Date(2010,12,1), new Date(2016,2,1)]);

var svg1;

var crimes = {
    "aggregatedCrimesByMonth" : [
        {"date":"2011-02", "allCrimes" : "300", "theft" : "20", "robbery": "70"},
        {"date":"2011-03", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2011-04", "allCrimes" : "200", "theft" : "50", "robbery": "70"},
        {"date":"2012-02", "allCrimes" : "300", "theft" : "20", "robbery": "70"},
        {"date":"2012-03", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2012-04", "allCrimes" : "200", "theft" : "50", "robbery": "70"},
        {"date":"2012-06", "allCrimes" : "300", "theft" : "20", "robbery": "30"},
        {"date":"2013-03", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2013-04", "allCrimes" : "200", "theft" : "50", "robbery": "70"},
        {"date":"2013-06", "allCrimes" : "300", "theft" : "20", "robbery": "70"},
        {"date":"2014-03", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2014-04", "allCrimes" : "200", "theft" : "50", "robbery": "70"},
        {"date":"2014-07", "allCrimes" : "300", "theft" : "20", "robbery": "120"},
        {"date":"2014-08", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2015-04", "allCrimes" : "200", "theft" : "50", "robbery": "70"},
        {"date":"2015-06", "allCrimes" : "300", "theft" : "20", "robbery": "70"},
        {"date":"2015-08", "allCrimes" : "400", "theft" : "40", "robbery": "70"},
        {"date":"2015-09", "allCrimes" : "200", "theft" : "50", "robbery": "70"}
    ],
    "crimesTotal" : [
        {"type" : "allCrimes","sum" : "2000", "min" : "200", "max": "500"},
        {"type" : "theft","sum":"800", "min" : "20", "max": "50"},
        {"type" : "robbery","sum" : "1200", "min" : "20", "max": "120"}]
};

var crimeTimeMatrix;
function matrixView() {
    var margin = {top: 50, right: 0, bottom: 100, left: 30},
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 63),
        legendElementWidth = gridSize * 2,
        buckets = 9,
        colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]

        years = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

    crimeTimeMatrix = d3.select("#crimeTimeMatrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //


    var index = [];
    // build the index
    for (var x in crimes.crimesTotal) {
        index.push(x);
    }

    for(var j = 0; j < crimes.crimesTotal.length; j++){
        for(var i = 0; i < crimes.aggregatedCrimesByMonth.length; i++){
            crimeTimeMatrix.append("rect")
                .attr("x", gridSize * i)
                .attr("y", gridSize * j)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", gridSize)
                .attr("height", gridSize)
                .attr("class", "field bordered")
                .style("opacity", function(){
                    var value = crimes.aggregatedCrimesByMonth[i][crimes.crimesTotal[j].type];
                    var min = crimes.crimesTotal[j].min;
                    var max = crimes.crimesTotal[j].max;
                    var avg = (value - min)/(max-min);
                    return avg;
                    log(avg);
                    //console.log(
                      //  crimes.aggregatedCrimesByMonth[i][crimes.crimesTotal[j].type]);
                })
                .style("fill", "red");
        }
    }

}


function timelineView(){

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var allCrimes = d3.svg.line()
        .x(function(d) { return x(dateFormat.parse(d.date)); })
        .y(function(d) { return y(d.allCrimes); });

    var theft = d3.svg.line()
        .x(function(d) { return x(dateFormat.parse(d.date)); })
        .y(function(d) { return y(d.theft); });

    var robbery = d3.svg.line()
        .x(function(d) { return x(dateFormat.parse(d.date)); })
        .y(function(d) { return y(d.robbery); });

    svg1 = d3.select("#timelineView").append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
     var svg = svg1.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/Timeline/scripts/data.json", function(error, data) {
        //if (error) throw error;
        data = crimes;
        x.domain([new Date(2010,12,1), new Date(2016,2,1)]);
        y.domain([0,500]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of Crimes");

        svg.append("path")
            .attr("id", "allCrimes")
            .datum(data.aggregatedCrimesByMonth)
            .attr("class", "line")
            .attr("d", allCrimes)
            .attr("stroke-width",10)
            .attr("stroke","red");

        svg.append("path")
            .attr("id", "theft")
            .datum(data.aggregatedCrimesByMonth)
            .attr("class", "line")
            .attr("d", theft)
            .attr("stroke","green");

        svg.append("path")
            .attr("id", "robbery")
            .datum(data.aggregatedCrimesByMonth)
            .attr("class", "line")
            .attr("d", robbery)
            .attr("stroke","blue");

        // SLIDER
        var _dragSliderLine;
        var slider =  svg1.append("g");

        var sliderLine = slider.append("line").attr("id","slider")
            .attr("x1", 100)
            .attr("x2", 100)
            .attr("y1", 20)
            .attr("y2", 300)
            .on("mousedown",function (){
               d3.event.preventDefault();
                _dragSliderLine = slider;
                document.body.focus();
                document.onselectstart = function (){
                    return false;
                };
                return false;
            })
            .on("mouseup",function(){
                if(_dragSliderLine != null){
                    _dragSliderLine.style.cursor = "pointer";
                    _dragSliderLine = null;
                }
            });
        printDate();
        svg1.on("mousemove", function(){
            d3.event.preventDefault();
            if( _dragSliderLine != null ){
                var coordinateX = d3.mouse(this)[0];
                if(coordinateX>=50){
                    sliderLine.attr("x1", coordinateX).attr("x2", coordinateX);
                    var x = d3.time.scale()
                        .range([0,width])
                        .domain([new Date(2010,12,1), new Date(2016,2,1)]);
                    currentDate = x.invert(coordinateX);
                    printDate();
                }
            }
        });

        svg1.on("mousedown", function(){
            d3.event.preventDefault();
            var coordinateX = d3.mouse(this)[0];
            if(coordinateX>=50){
                sliderLine.attr("x1", coordinateX).attr("x2", coordinateX);
                
            }
            _dragSliderLine = slider;
            document.body.focus();
            document.onselectstart = function (){
                return false;
            };
            return false;

        });

        //d3.select("#timelineView").call(d3.slider().scale(d3.time.scale().domain([new Date(2010,12,1), new Date(2016,2,1)])).axis(d3.svg.axis()));
    });

    function type(d) {
        d.date = formatDate.parse(d.date);
        d.close = +d.close;
        return d;
    }
}

function printDate(){
    var date = getDate();
    d3.select("#sliderDate").node().innerHTML = date[0] + " " + date[1];
}

function getDate(){
    var formatDate1 = d3.time.format("%B");
    var formatDate2 = d3.time.format("%Y");
    var date = [];
    date.push(formatDate1(timeScale.invert(d3.select("#slider").attr("x1")-50)));
    date.push(formatDate2(timeScale.invert(d3.select("#slider").attr("x1")-50)));
    return date;
}


function log(text){
    console.log(text);
}