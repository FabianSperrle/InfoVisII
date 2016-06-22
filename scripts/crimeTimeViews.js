function CrimeTime() {
    this.margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    this.width = 819;//960 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;
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
var xSliderLeft = 100;
var xSliderRight = 300;

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
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.years).tickSize(16, 0).tickFormat(d3.time.format("%Y"));
var yAxis = d3.svg.axis().scale(y).orient("left");
var svg1;

var createCrimeCategoryButtons = function () {
    // Generate list of checkboxes
    var divs = d3.select("#crimeCheckboxes").selectAll("input")
        .data(data.getCrimeTypes())
        .enter()
        .append('div');
    divs.append("input")
        .attr("type", "checkbox")
        .attr("id", function (d, i) {
            return "category_" + i;
        })
        .attr("onClick", function (d, i) {
            return "toggleCheckboxesOfCrimes(" + i + ")";
        });
    divs.append('label')
        .attr('for', function (d, i) {
            return 'category_' + i;
        })
        .style("color", function (d, i) {
            return data.getCrimeColor(d);
        })
        .style("cursor", "pointer")
        .text(function (d, i) {
            return data.getVerboseCrimeName(d);
        });

    // Make sure they're all unchecked
    d3.select('#crimeCheckboxes').selectAll('input').property('checked', false);
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
    highlightMatrixSelection();
    d3.select("#category_" + checkboxID).property("checked", data.crimeTypes[data.getCrimeTypes()[checkboxID]].visibility);

}

function getCrimeData(crimeType) {
    let verboseCrimeType = data.getVerboseCrimeName(crimeType);
    // Get a list of all month identifiers
    var months = d3.time.months(new Date(2010, 10, 15), new Date(2016, 1, 15));
    months = months.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-01";
    });

    let returndata = {};
    months.forEach(function (month) {
        returndata[month] = 0;
    });

    // Get the currently active LSOA codes
    let activeCodes = [];
    for (var key in data.lsoa_codes) {
        if (!data.lsoa_codes.hasOwnProperty(key)) continue;
        if (data.lsoa_codes[key] === true)
            activeCodes.push(key);
    }

    months.forEach(function (month) {
        activeCodes.forEach(function (code) {
            if (data.crimesAggGeo[code] == undefined) {
                throw new Error(code + " is undefined");
            }
            if (data.crimesAggGeo[code][month] != undefined) {
                if (data.crimesAggGeo[code][month][verboseCrimeType] != undefined) {
                    returndata[month] += parseInt(data.crimesAggGeo[code][month][verboseCrimeType]);
                }
            }
        })
    });
    let max = 0;
    let r = [];
    for (key in returndata) {
        if (returndata[key] > max) {
            max = returndata[key];
        }
        r.push({
            'date': key.substr(0, key.length -3),
            'value': returndata[key]
        })
    }
    return r;
}

var plotCrimePath = d3.svg.line()
    .x(function (d) {
        return x(dateFormat.parse(d.date));
    })
    .y(function (d) {
        return y(d.value);
    });

function plotTimeviewLines() {
    svg.selectAll("path").remove();
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        svg.append("path")
            .attr("id", data.getCrimeTypes()[i])
            .datum(getCrimeData(data.getCrimeTypes()[i]))
            .attr("class", "line")
            .attr("d", plotCrimePath)
            .attr("stroke-width", 10)
            .attr("stroke", data.getCrimeColor(data.getCrimeTypes()[i]))
            .on("mouseover", function () {
                var tooltip = d3.select("#tooltip");
                var mine = d3.select(this);
                tooltip.style("color", mine.attr("stroke"));
                tooltip.html(data.getVerboseCrimeName(mine.attr("id")));
                tooltip.style("visibility", "visible");
                highlightCrimeSelection(mine.attr("id"), true);
            })
            .on("mousemove", function () {
                tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                highlightCrimeSelection(d3.select(this).attr("id"), false);
                return d3.select("#tooltip").style("visibility", "hidden");
            });

        if (!data.crimeTypes[data.getCrimeTypes()[i]].visibility) {
            d3.select("#" + data.getCrimeTypes()[i]).attr("display", "none");
        }
    }
    resizeTimeLine();
}

function highlightCrimeSelection(id, status) {
    if (status) {
        d3.selectAll(".line").each(function () {
            var mine = d3.select(this);
            if (mine.attr("id") !== id) {
                mine.attr("stroke-opacity", 0.2);
            }
        })
    } else {
        d3.selectAll(".line").each(function () {
            var mine = d3.select(this);
            if (mine.attr("id" !== id)) {
                mine.attr("stroke-opacity", 1);
            }
        })
    }
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

var timelineView = function () {
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

    //add small ticks for months
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + crimeTime.height + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.months)
            .tickSize(10, 0)
            .tickFormat(d3.time.format("")));

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
    var dragSliderLine1 = null;
    var dragSliderLine2 = null;
    var slider1 = svg1.append("g");
    var slider2 = svg1.append("g");

    var sliderLine1 = slider1.append("line").attr("id", "slider1").attr("class", "left")
        .attr("x1", xSliderLeft)
        .attr("x2", xSliderLeft)
        .attr("y1", 20)
        .attr("y2", 300)
        .on("mousedown", function () {
            d3.event.preventDefault();
            dragSliderLine1 = slider1;
            document.body.focus();
            document.onselectstart = function () {
                return false;
            };
            return false;
        })
        .on("mouseup", function () {
            if (dragSliderLine1 !== null) {
                dragSliderLine1.style.cursor = "pointer";
                dragSliderLine1 = null;
                dragSliderLine2 = null;
            }
        });
    var sliderLine2 = slider2.append("line").attr("id", "slider2").attr("class", "right")
        .attr("x1", xSliderRight)
        .attr("x2", xSliderRight)
        .attr("y1", 20)
        .attr("y2", 300)
        .on("mousedown", function () {
            d3.event.preventDefault();
            dragSliderLine2 = slider2;
            document.body.focus();
            document.onselectstart = function () {
                return false;
            };
            return false;
        })
        .on("mouseup", function () {
            if (dragSliderLine2 !== null) {
                dragSliderLine2.style.cursor = "pointer";
                dragSliderLine2 = null;
                dragSliderLine1 = null;
            }
        });
    updateDateDropdowns();
    updateDateLimits();
    svg1.on("mousemove", function () {
        d3.event.preventDefault();
        if (dragSliderLine1 !== null) {
            var coordinateX = d3.mouse(this)[0];
            if (coordinateX >= 50) {
                if (sliderLine1.attr("class") == "left") {
                    if (coordinateX > sliderLine2.attr("x1")) {
                        xSliderLeft = xSliderRight - 1;
                        coordinateX = xSliderLeft;
                        dragSliderLine1 = null;
                    } else {
                        xSliderLeft = coordinateX;
                    }
                }
                sliderLine1.attr("x1", coordinateX).attr("x2", coordinateX);
                updateDateDropdowns();
                updateDateLimits();
            }
        } else if (dragSliderLine2 !== null) {
            var coordinateX = d3.mouse(this)[0];
            if (coordinateX >= 50) {
                if (sliderLine2.attr("class") == "right") {
                    if (coordinateX < sliderLine1.attr("x1")) {
                        xSliderRight = xSliderLeft + 1;
                        coordinateX = xSliderRight;
                        dragSliderLine2 = null;
                    } else {
                        xSliderRight = coordinateX;
                    }
                }
                sliderLine2.attr("x1", coordinateX).attr("x2", coordinateX);
                updateDateDropdowns();
                updateDateLimits();
            }
        }
    });

    svg1.on("mouseleave", function () {
        d3.event.preventDefault();
        dragSliderLine1 = null;
        dragSliderLine2 = null;
    });

    svg1.on("mousedown", function () {
        d3.event.preventDefault();
        var coordinateX = d3.mouse(this)[0];
        if (coordinateX >= 50) {
            if (Math.abs(coordinateX - xSliderLeft) < Math.abs(coordinateX - xSliderRight)) {
                xSliderLeft = coordinateX;
                d3.select(".left").attr("x1", coordinateX).attr("x2", coordinateX);
                if (dragSliderLine1 == null) {
                    dragSliderLine1 = d3.select(".left");
                    sliderLine1.attr("x1", coordinateX).attr("x2", coordinateX);
                }
            } else {
                xSliderRight = coordinateX;
                d3.select(".right").attr("x1", coordinateX).attr("x2", coordinateX);
                if (dragSliderLine2 == null) {
                    dragSliderLine2 = d3.select(".right");
                    sliderLine2.attr("x1", coordinateX).attr("x2", coordinateX);
                }
            }
        }
        updateDateLimits();
        updateDateDropdowns();
        document.body.focus();
        document.onselectstart = function () {
            return false;
        };
        return false;

    });

    svg1.on('mouseup', function () {
        data.dateChangeBoth(getDateOfSlider(1), getDateOfSlider(2));
    });

    function type(d) {
        d.date = formatDate.parse(d.date);
        d.close = +d.close;
        return d;
    }
};

function toggleCrimetimeview() {
    if (d3.select("#timelineView").node().style.display == 'none') {
        d3.select("#toggleCrimetimeview").node().innerHTML = "&uarr;";
        d3.select("#timelineView").node().style.display = 'block';
        d3.select("#content").node().style.height = "calc(100% - 315px)";
        map.invalidateSize();
    } else {
        d3.select("#toggleCrimetimeview").node().innerHTML = "&darr;";
        d3.select("#timelineView").node().style.display = 'none';
        d3.select("#content").node().style.height = "calc(100% - 110px)";
        map.invalidateSize();
    }
}

var crimeTimeMatrix;
var matrixView = function () {
    var margin = {
            top: 50,
            right: 0,
            bottom: 100,
            left: 30
        },
        width = 960 - margin.left - margin.right,
        height = 275 - margin.top - margin.bottom,
        gridSize = Math.floor(width / (NUM_MONTHS + 8)),

        crimeTimeMatrix = d3.select("#crimeTimeMatrix").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.time.scale().domain(([new Date(2010, 11, 1), new Date(2016, 1, 1)]))
        .range([101, 910]);
    var timeAxis =
        d3.svg.axis().scale(x)
            .orient("bottom")
            .ticks(d3.time.years)
            .tickSize(0, 0)
            .tickFormat(d3.time.format("%Y"));

    crimeTimeMatrix.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + "-35" + ")")
        .call(timeAxis)
        .selectAll(".tick text")
        .style("text-anchor", "start")
        .attr("x", 70)
        .attr("y", 6)


    var monthIndex = 0;
    for (var j = 0; j < years.length; j++) {
        crimeTimeMatrix.append("line")
            .attr("x1", 116 + 156 * j)
            .attr("y1", -50)
            .attr("x2", 116 + 156 * j)
            .attr("y2", 230)
            .attr("stroke", "gray")
            .attr("id", "yearslash" + j)
            .attr("stroke-width", 1);

        for (var k = 0; k < months.length; k++) {
            if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                for (var i = 0; i < data.getCrimeTypes().length; i++) {
                    if (monthIndex == 0) {
                        crimeTimeMatrix
                            .append('text')
                            .attr("x", -25)
                            .attr("y", gridSize * (i + 1) - 5)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("fill", data.getCrimeColor(data.getCrimeTypes()[i]))
                            .text(data.getVerboseCrimeName(data.getCrimeTypes()[i]))
                            .on("click", function (d, i) {
                                var id = data.getCrimeIndexByVerboseName(d3.select(this).text());
                                toggleCheckboxesOfCrimes(id);
                            })
                            .style("cursor", "pointer");

                    }
                    crimeTimeMatrix.append("rect")
                        .attr("id", "m" + monthIndex + "-" + i)
                        .attr("x", gridSize * (monthIndex + 8))
                        .attr("y", gridSize * i)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("month", k)
                        .attr("crimeID", i)
                        .attr("width", gridSize)
                        .attr("height", gridSize)
                        .attr("class", "field bordered")
                        .style("fill-opacity", function () {
                            var val = data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]];
                            return (val - countMin[i]) / (countMax[i] - countMin[i]);
                        })
                        .style("fill", data.getCrimeColor(data.getCrimeTypes()[i]))
                        .attr("numberOfCrimes", data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]])
                        .attr("totalCrimesOfMonth", data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[0]])
                        .on("mouseover", function (d, x) {
                            var mine = d3.select(this);
                            var tooltip = d3.select("#tooltip");
                            test = tooltip;
                            tooltip.style("color", mine.style("fill"));
                            //log(data.getCrimeColor(data.getCrimeTypes()[colorIndex]));
                            tooltip.html(data.getVerboseCrimeName(data.getCrimeTypes()[mine.attr("crimeID")]) + ": " + mine.attr("numberOfCrimes") + '<br>' + "Monthly Crimes: " + mine.attr("totalCrimesOfMonth"));
                            tooltip.style("visibility", "visible");
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
function crimeTimeViewRequirements() {
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

var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
var leftDate = ["left", "monthdropdownLeft", "yeardropdownLeft"];
var rightDate = ["right", "monthdropdownRight", "yeardropdownRight"];

function updateDate(selectedField) {
    console.log("updating date");
    var month, year, type;
    if (selectedField.getAttribute("class") === "leftDate") {
        month = monthtext.indexOf(document.getElementById(leftDate[1]).value);
        year = document.getElementById(leftDate[2]).value;
        xSliderLeft = timeScale(new Date(year, month, 15)) + 50;
        d3.select(".left").transition().duration(500).attr("x1", xSliderLeft).attr("x2", xSliderLeft);
        type = "from";
    } else if (selectedField.getAttribute("class") === "rightDate") {
        month = monthtext.indexOf(document.getElementById(rightDate[1]).value);
        year = document.getElementById(rightDate[2]).value;
        xSliderRight = timeScale(new Date(year, month, 15)) + 50;
        d3.select(".right").transition().duration(500).attr("x1", xSliderRight).attr("x2", xSliderRight);
        type = "to";
    }
    data.dateChange(month, year, type);
    updateDateLimits();
}

function updateDateLimits() {
    // Update Left Border
    var lowerDate = getDateOfSlider(1);
    var upperDate = getDateOfSlider(2);
    // first Check Year Border
    activateAllOptions(leftDate);
    activateAllOptions(rightDate);

    if (lowerDate.getFullYear() == "2010") {
        deactivateOptions(leftDate[1], 'undefined', 11);
    }
    if (lowerDate.getMonth() < 11) {
        deactivateOptions(leftDate[2], 'undefined', 1);
    }

    if (upperDate.getFullYear() == "2016") {
        deactivateOptions(rightDate[1], 2);
    }
    if (upperDate.getMonth() > 2) {
        deactivateOptions(rightDate[2], 7);
    }
    deactivateOptions(rightDate[2], 'undefined', findIndexOfOptionValue(leftDate[2], lowerDate.getFullYear().toString()));
    if (lowerDate.getMonth() > upperDate.getMonth()) {
        deactivateOptions(rightDate[2], 'undefined', findIndexOfOptionValue(leftDate[2], lowerDate.getFullYear().toString()) + 1);
    }
    if (lowerDate.getFullYear() == upperDate.getFullYear()) {
        deactivateOptions(rightDate[1], 'undefined', lowerDate.getMonth());
    }

    deactivateOptions(leftDate[2], findIndexOfOptionValue(rightDate[2], upperDate.getFullYear().toString()) + 2);
    if (upperDate.getMonth() < lowerDate.getMonth()) {
        deactivateOptions(leftDate[2], findIndexOfOptionValue(rightDate[2], upperDate.getFullYear().toString()) + 1);
    }
    if (lowerDate.getFullYear() == upperDate.getFullYear()) {
        deactivateOptions(leftDate[1], upperDate.getMonth() + 2);
    }
    highlightMatrixSelection();
}


function highlightMatrixSelection() {
    d3.selectAll("rect").style("stroke", "none");
    d3.selectAll("rect").style("stroke-opacity", "0.8");

    var monthIndexLeft = getMonthIndex(getDateOfSlider(1));
    var monthIndexRight = (getDateOfSlider(2).getFullYear() - 2011) * 12 + getDateOfSlider(2).getMonth() + 1;
    for (var j = monthIndexLeft; j < monthIndexRight + 1; j++) {
        for (var i = 0; i < data.getCrimeTypes().length; i++) {
            if (data.crimeTypes[data.getCrimeTypes()[i]].visibility) {
                if (parseFloat(d3.select("#m" + j + "-" + i).attr("numberOfCrimes")) > 0) {
                    d3.select("#m" + j + "-" + i).style("stroke", "black");
                }
            }
        }
    }
}
function getMonthIndex(date) {
    return (date.getFullYear() - 2011) * 12 + date.getMonth() + 1;
}


function deactivateOptions(element, lowerLimit, upperLimit) {
    var options = document.getElementById(element).getElementsByTagName("option");
    if (upperLimit >= options.length || typeof upperLimit === 'undefined') upperLimit = options.length;
    if (lowerLimit === 'undefined') lowerLimit = 1;
    for (var i = lowerLimit - 1; i < upperLimit; i++) {
        options[i].disabled = true;
    }
}

function activateAllOptions(elements) {
    for (var element = 1; element < elements.length; element++) {
        var options = document.getElementById(elements[element]).getElementsByTagName("option");
        for (var i = 0; i < options.length; i++) {
            options[i].disabled = false;
        }
    }
}

function findIndexOfOptionValue(element, value) {
    element = document.getElementById(element);
    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].value == value) {
            return i;
        }
    }
    return -1;
}

function createTimeDropdowns() {
    populatedropdown("monthdropdownLeft", "yeardropdownLeft");
    populatedropdown("monthdropdownRight", "yeardropdownRight");

    /***********************************************
     * Drop Down Date select script- by JavaScriptKit.com
     * This notice MUST stay intact for use
     * Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and more
     ***********************************************/

    function populatedropdown(monthfield, yearfield) {
        var monthfield = document.getElementById(monthfield);
        var yearfield = document.getElementById(yearfield);
        for (var m = 0; m < 12; m++)
            monthfield.options[m] = new Option(monthtext[m], monthtext[m])
        var thisyear = 2010;
        for (var y = 0; y < 7; y++) {
            yearfield.options[y] = new Option(thisyear, thisyear);
            thisyear += 1
        }
        updateDateDropdowns();
    }

    //var select = d3.select("#combinedTimeline").append("select").on("change",change),
    //    options = select.selectAll("option").data();
}


// Automatically Update of Date Dropdowns
function updateDateDropdowns() {
    var slider = [leftDate[0], rightDate[0]];
    var dateMonth = [leftDate[1], rightDate[1]];
    var dateYear = [leftDate[2], rightDate[2]];
    for (var i = 0; i < slider.length; i++) {
        var date = getDateOfSlider(slider[i]);
        var month = document.getElementById(dateMonth[i]);
        var year = document.getElementById(dateYear[i]);
        selectItemByValue(month, monthtext[date.getMonth()]);
        selectItemByValue(year, date.getFullYear());
    }
    function selectItemByValue(elmnt, value) {
        for (var i = 0; i < elmnt.options.length; i++) {
            if (elmnt.options[i].value == value)
                elmnt.selectedIndex = i;
        }
    }

    //updateDateLimits();
}

function getDateOfSlider(slider) {
    if (slider === 1 || slider === "left") {
        return timeScale.invert(xSliderLeft - 50);
    } else if (slider === 2 || slider === "right") {
        return timeScale.invert(xSliderRight - 50);
    } else {
        log("Slider not defined. Can't return date!");
    }
}

function log(text) {
    console.log(text);
}

data.on('loadAggregates', createTimeDropdowns);
data.on('loadAggregates', createCrimeCategoryButtons);
data.on('loadAggregates', crimeTimeViewRequirements);
data.on('loadAggregates', matrixView);
data.on('loadAggregates', timelineView);
data.on('filtered', plotTimeviewLines);

