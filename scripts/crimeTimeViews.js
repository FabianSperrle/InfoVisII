function CrimeTime() {
    this.margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    this.width = 819;//960 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
}

// Tooltip of Cluster Points
var tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("font-size", "20px")
    .style("z-index", "10")
    .style("background-color", "rgba(255,255,255,0.9)")
    .style("visibility", "hidden")
    .style("padding", "2px");
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
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        d3.select("#category_" + i).property("checked", data.crimeTypes[data.getCrimeTypes()[i]].visibility);
    }
};

function toggleCheckboxesOfCrimes(checkboxID) {
    // Trigger 'toggle' event of the DataController
    data.emit('toggle', data.getCrimeTypes()[checkboxID]);
    toggleTimeviewLines(checkboxID);
    resizeTimeLine(data.crimeAggregates);
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

function plotTimeviewLines() {
    //var datas  = {};
    //for (var i = 0; i < crimeTime.crimeTypes.length; i++) {
    //    datas[crimeTime.crimeTypes[i]] = getCrimeData(crimeTime.crimeTypes[i], data);
    //}
    //console.log(JSON.stringify(datas));
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        svg.append("path")
            .attr("id", data.getCrimeTypes()[i])
            .datum(getCrimeData(data.getCrimeTypes()[i], data.crimeAggregates))
            .attr("class", "line")
            .attr("d", plotCrimePath)
            .attr("stroke-width", 10)
            .attr("stroke", data.getCrimeColor(data.getCrimeTypes()[i]));
        if (!data.crimeTypes[data.getCrimeTypes()[i]].visibility) {
            d3.select("#" + data.getCrimeTypes()[i]).attr("display", "none");
        }
    }
    resizeTimeLine(data.crimeAggregates);
}

function toggleTimeviewLines(crimeLineID) {
    var line = d3.select('#' + data.getCrimeTypes()[crimeLineID]);
    if (data.crimeTypes[data.getCrimeTypes()[crimeLineID]].visibility) {
        line.attr("display", "block");
    } else {
        line.attr("display", "none");
    }
}

function resizeTimeLine() {
    var maxValue = 0;
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if (data.crimeTypes[data.getCrimeTypes()[i]].visibility) {
            if (countMax[i] > maxValue)
                maxValue = countMax[i];
        }
    }
    y.domain([0, maxValue + 0.2 * maxValue]);
    for (i = 0; i < data.getCrimeTypes().length; i++) {
        d3.select("#" + data.getCrimeTypes()[i]).transition().duration(750).attr("d", plotCrimePath(getCrimeData(data.getCrimeTypes()[i], data.crimeAggregates)));
    }
    svg.select(".y.axis") // change the y axis
        .transition().duration(750)
        .call(yAxis);
}

var timelineView = function() {
    svg1 = d3.select("#timelineView").append("svg:svg")
        .attr("width", crimeTime.width + crimeTime.margin.left + crimeTime.margin.right) //
        .attr("height", crimeTime.height + crimeTime.margin.top + crimeTime.margin.bottom);
    svg = svg1.append("g")
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")");

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

    plotTimeviewLines();

    // SLIDER
    var _dragSliderLine = null;;
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

    svg1.on("mouseleave", function(){
        d3.event.preventDefault();
        _dragSliderLine = null;
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

    function type(d) {
        d.date = formatDate.parse(d.date);
        d.close = +d.close;
        return d;
    }
};


var crimeTimeMatrix;
var matrixView = function() {
    var margin = {
            top: 50,
            right: 0,
            bottom: 100,
            left: 30
        },
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / (NUM_MONTHS+8)),

    crimeTimeMatrix = d3.select("#crimeTimeMatrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var monthIndex = 0;
    for (var j = 0; j < years.length; j++) {
        for (var k = 0; k < months.length; k++) {
            if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                for (var i = 0; i < data.getCrimeTypes().length; i++) {
                    if(monthIndex==0){
                        crimeTimeMatrix
                            .append('text')
                            .attr("x", -25)
                            .attr("y", gridSize * (i+1) - 5)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("fill",data.getCrimeColor(data.getCrimeTypes()[i]))
                            .text(data.getVerboseCrimeName(data.getCrimeTypes()[i]));
                    }
                    crimeTimeMatrix.append("rect")
                        .attr("id", monthIndex + "-" + i)
                        .attr("x", gridSize * (monthIndex+8))
                        .attr("y", gridSize * i)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("width", gridSize)
                        .attr("height", gridSize)
                        .attr("class", "field bordered")
                        .style("fill-opacity", function() {
                            var val = data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]];
                            return (val - countMin[i]) / (countMax[i] - countMin[i]);
                        })
                        .style("fill", data.getCrimeColor(data.getCrimeTypes()[i]))
                        .attr("numberOfCrimes",data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]])
                        .attr("crimeID",i)
                        .attr("totalCrimesOfMonth", data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[0]])
                        .on("mouseover", function (d, x) {
                            var mine = d3.select(this);
                            var tooltip = d3.select("#tooltip");
                            test = tooltip;
                            tooltip.style("color", mine.style("fill"));
                            //log(data.getCrimeColor(data.getCrimeTypes()[colorIndex]));
                            tooltip.html(data.getVerboseCrimeName(data.getCrimeTypes()[mine.attr("crimeID")]) + ": " +mine.attr("numberOfCrimes") + '<br>' + "Monthly Crimes: " + mine.attr("totalCrimesOfMonth"));
                            tooltip.style("visibility","visible");
                            //if (!d3.select('#tooltip').node().checked) return;
                            //tooltip.html("# Crimes: " + data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]]);
                            return;
                        })
                        .on("mousemove", function () {
                            tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                        })
                        .on("mouseout", function () {
                            return d3.select("#tooltip").style("visibility", "hidden");
                        });
                }
                monthIndex++;
            }
        }
    }
};

var test;

var countMax, countMin, countTotal;
function crimeTimeViewRequirements(){
    // Define Max and Min Values
    countMax = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    countTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    countMin = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    for (var j = 0; j < years.length; j++) {
        for (var k = 0; k < months.length; k++) {
            for (var i = 0; i < data.getCrimeTypes().length; i++) {
                if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                    var val = data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]];
                    if (typeof val !== "undefined") {
                        if (countMax[i] < val) countMax[i] = val;
                        if (countMin[i] > val) countMin[i] = val;
                    }
                    countTotal[i] += val;
                }
            }
        }
    }
}

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
data.on('loadAggregates', crimeTimeViewRequirements);
data.on('loadAggregates', timelineView);
data.on('loadAggregates', matrixView);
