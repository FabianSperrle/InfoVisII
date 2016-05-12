function CrimeTime() {
    this.margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
    this.crimeTypes = [
        "allCrimes",
        "violence_and_sex",
        "other_theft",
        "burglary",
        "violent_crime",
        "bicycle_theft",
        "anti_social_behaviour",
        "other_crime",
        "shoplifting",
        "drugs",
        "criminal_damage_and_arson",
        "vehicle_crime",
        "theft_from_the_person",
        "public_disorder_weapons",
        "public_order",
        "robbery",
        "possesion_of_weapons"
    ];

    this.activeCrimesCheckBoxes = [true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
}

var crimeTime = new CrimeTime();

var dateFormat = d3.time.format("%Y-%m");
var formatDate = d3.time.format("%B %Y");
var timeRange = [new Date(2010, 11, 1), new Date(2016, 2, 1)];
var timeScale = d3.time.scale()
    .range([0, crimeTime.width])
    .domain(timeRange);

var svg;

var years = ["y2010", "y2011", "y2012", "y2013", "y2014", "y2015", "y2016"];
var months = ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12"];
var NUM_MONTHS = 63;
var CLUSTERINGCOLORS = ['red', 'aqua', 'blue', 'fuchsia', 'gray', 'green', 'lime',
    'maroon', 'darkorange', 'olive', 'silver', 'darkolivegreen', 'blueviolet',
    'burlywood', 'darkcyan', 'chocolate', 'darkgoldenrod',
    'darkmagenta', 'darkkhaki', 'darkgreen'
];


var x = d3.time.scale().range([0, crimeTime.width]);
var y = d3.scale.linear().range([crimeTime.height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");
var svg1;

var createCrimeCategoryButtons = function() {
    // Generate list of checkboxes
    d3.select("#crimeCheckboxes").selectAll("input")
        .data(data.getCrimeTypes())
        .enter()
        .append('label')
        .attr('for', function(d, i) {
            return 'a' + i;
        })
        .style("color", function(d, i) {
            return data.getCrimeColor(d);
        })
        .text(function(d, i) {
            return data.getVerboseCrimeName(d);
        })
        .append("input")
        .attr("type", "checkbox")
        .attr("id", function(d, i) {
            return "category_" + i;
        })
        .attr("onClick", function(d, i) {
            return "toggleCheckboxesOfCrimes(" + i + ")";
        })
        .attr("for", function(d, i) {
            return "a" + i;
        });

    // Make sure they're all unchecked
    d3.selectAll('input').property('checked', false);
    // And select the default ones from the boolean array
    for (var i = 0; i < crimeTime.activeCrimesCheckBoxes.length; i++) {
        d3.select("#category_" + i).property("checked", crimeTime.activeCrimesCheckBoxes[i]);
    }
};

function toggleCheckboxesOfCrimes(checkboxID) {
    crimeTime.activeCrimesCheckBoxes[checkboxID] = d3.select("#category_" + checkboxID).property("checked");
    toggleTimeviewLines(checkboxID);
    resizeTimeLine(crimes);
    // Trigger 'toggle' event of the DataController
    data.emit('toggle', crimeTime.crimeTypes[checkboxID]);
}

function getCrimeData(crimeType, data) {
    var returndata = [];
    for (var i = 0; i <= years.length - 1; i++) {
        for (var j = 0; j <= months.length - 1; j++) {
            if (typeof data[years[i]] === 'undefined' || typeof data[years[i]][months[j]] === 'undefined') {
                continue;
            } else {
                var date = years[i].slice(1, 5) + "-" + months[j].slice(1, 3);
                var obj = {
                    "date": date,
                    "value": data[years[i]][months[j]][crimeType]
                };
                returndata.push(obj);
            }

        }
    }
    return returndata;
}

var plotCrimePath = d3.svg.line()
    .x(function(d) {
        return x(dateFormat.parse(d.date));
    })
    .y(function(d) {
        return y(d.value);
    });

function plotTimeviewLines(data) {
    var datas  = {};
    for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
        datas[crimeTime.crimeTypes[i]] = getCrimeData(crimeTime.crimeTypes[i], data);
    }
    console.log(JSON.stringify(datas));
    for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
        svg.append("path")
            .attr("id", crimeTime.crimeTypes[i])
            .datum(getCrimeData(crimeTime.crimeTypes[i], data))
            .attr("class", "line")
            .attr("d", plotCrimePath)
            .attr("stroke-width", 10)
            .attr("stroke", CLUSTERINGCOLORS[i]);
        if (!crimeTime.activeCrimesCheckBoxes[i]) {
            d3.select("#" + crimeTime.crimeTypes[i]).attr("display", "none");
        }
    }
    resizeTimeLine(data);
}

function toggleTimeviewLines(crimeLineID) {
    var line = d3.select('#' + crimeTime.crimeTypes[crimeLineID]);
    if (crimeTime.activeCrimesCheckBoxes[crimeLineID]) {
        line.attr("display", "block");
    } else {
        line.attr("display", "none");
    }
}

function resizeTimeLine(data) {
    var maxValue = 0;
    for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
        if (crimeTime.activeCrimesCheckBoxes[i]) {
            if (countMax[i] > maxValue)
                maxValue = countMax[i];
        }
    }
    y.domain([0, maxValue + 0.2 * maxValue]);
    for (i = 0; i < crimeTime.crimeTypes.length; i++) {
        d3.select("#" + crimeTime.crimeTypes[i]).transition().duration(750).attr("d", plotCrimePath(getCrimeData(crimeTime.crimeTypes[i], data)));
    }
    svg.select(".y.axis") // change the y axis
        .transition().duration(750)
        .call(yAxis);
}

var timelineView = function() {
    svg1 = d3.select("#timelineView").append("svg:svg")
        .attr("width", crimeTime.width + crimeTime.margin.left + crimeTime.margin.right)
        .attr("height", crimeTime.height + crimeTime.margin.top + crimeTime.margin.bottom);
    svg = svg1.append("g")
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")");

    d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisIIPreProcessing/master/crimeAggregates.json", function(error, data) {
        //if (error) throw error;
        //data = crimes;
        crimes = data;
        years = ["y2010", "y2011", "y2012", "y2013", "y2014", "y2015", "y2016"];
        months = ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12"];

        x.domain(timeRange);
        y.domain([0, 500]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + crimeTime.height + ")")
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

        plotTimeviewLines(data);

        // SLIDER
        var _dragSliderLine;
        var slider = svg1.append("g");

        var sliderLine = slider.append("line").attr("id", "slider")
            .attr("x1", 100)
            .attr("x2", 100)
            .attr("y1", 20)
            .attr("y2", 300)
            .on("mousedown", function() {
                d3.event.preventDefault();
                _dragSliderLine = slider;
                document.body.focus();
                document.onselectstart = function() {
                    return false;
                };
                return false;
            })
            .on("mouseup", function() {
                if (_dragSliderLine !== null) {
                    _dragSliderLine.style.cursor = "pointer";
                    _dragSliderLine = null;
                }
            });
        printDate();
        svg1.on("mousemove", function() {
            d3.event.preventDefault();
            if (_dragSliderLine !== null) {
                var coordinateX = d3.mouse(this)[0];
                if (coordinateX >= 50) {
                    sliderLine.attr("x1", coordinateX).attr("x2", coordinateX);
                    var x = d3.time.scale()
                        .range([0, crimeTime.width])
                        .domain([new Date(2010, 12, 1), new Date(2016, 2, 1)]);
                    currentDate = x.invert(coordinateX);
                    printDate();
                }
            }
        });

        svg1.on("mousedown", function() {
            d3.event.preventDefault();
            var coordinateX = d3.mouse(this)[0];
            if (coordinateX >= 50) {
                sliderLine.attr("x1", coordinateX).attr("x2", coordinateX);

            }
            _dragSliderLine = slider;
            document.body.focus();
            document.onselectstart = function() {
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
};


var crimeTimeMatrix;
var countMax;
var countMin;
var matrixView = function() {
    var margin = {
            top: 50,
            right: 0,
            bottom: 100,
            left: 30
        },
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / NUM_MONTHS),
        legendElementWidth = gridSize * 2,
        buckets = 9,
        colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]; // alternatively colorbrewer.YlGnBu[9]

    crimeTimeMatrix = d3.select("#crimeTimeMatrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //

    countMax = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    countMin = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    for (var j = 0; j < years.length; j++) {
        for (var k = 0; k < months.length; k++) {
            for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
                //log(years[j] + " - " + months[k] + " " + crimeTypes[i]);
                if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                    var val = data.crimeAggregates[years[j]][months[k]][crimeTime.crimeTypes[i]];
                    if (typeof val !== "undefined") {
                        if (countMax[i] < val) countMax[i] = val;
                        if (countMin[i] > val) countMin[i] = val;
                    }
                }
            }
        }
    }

    var monthIndex = 0;
    for (var j = 0; j < years.length; j++) {
        for (var k = 0; k < months.length; k++) {
            if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
                    crimeTimeMatrix.append("rect")
                        .attr("x", gridSize * monthIndex)
                        .attr("y", gridSize * i)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("width", gridSize)
                        .attr("height", gridSize)
                        .attr("class", "field bordered")
                        .style("opacity", function() {
                            var val = data.crimeAggregates[years[j]][months[k]][crimeTime.crimeTypes[i]];
                            return (val - countMin[i]) / (countMax[i] - countMin[i]);
                        })
                        .style("fill", CLUSTERINGCOLORS[i]);
                }
                monthIndex++;
            }
        }
    }
};


function printDate() {
    var date = getDate();
    d3.select("#sliderDate").node().innerHTML = date[0] + " " + date[1];
}

function getDate() {
    var formatDate1 = d3.time.format("%B");
    var formatDate2 = d3.time.format("%Y");
    var date = [];
    date.push(formatDate1(timeScale.invert(d3.select("#slider").attr("x1") - 50)));
    date.push(formatDate2(timeScale.invert(d3.select("#slider").attr("x1") - 50)));
    return date;
}


function log(text) {
    console.log(text);
}

data.on('loadAggregates', createCrimeCategoryButtons);
data.on('loadAggregates', timelineView);
data.on('loadAggregates', matrixView);