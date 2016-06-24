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

var countMax = {},
    countMin = {},
    countTotal = {};
// Tooltip of Cluster Points
var tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("font-size", "14px")
    .style("font-style", "Sans-serif")
    .style("z-index", "10")
    .style("background-color", "rgba(255,255,255,0.9)")
    .style("visibility", "hidden")
    .style("padding", "2px");
var crimeTime = new CrimeTime();
var xSliderLeft = 100;
var xSliderRight = 300;
var currentInterpolationType = "basis";

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
    // toggleAll button
    var form = d3.select("#crimeCheckboxes")
        .append("input")
        .attr("type", "button")
        .attr("name", "toggle")
        .attr("value", "Toggle All")
        .attr("id", "toggleallbutton")
        .attr("onclick", "toggleAllCrimes()");
    // Generate list of checkboxes
    var divs = d3.select("#crimeCheckboxes").append("div").selectAll("input")
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

    // create Listeners on Solved Buttons:
    d3.select("#only_text")
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text("Only Crime Status")
        .on("click", function (d, i) {
            updateSolvedTypeLines("only_crime_status");
            d3.select("#only_solved").property("checked", !d3.select("#only_solved").property("checked"));
        })
        .style("cursor", "pointer");

    d3.select("#failed_text")
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text("Unresolved")
        .on("click", function (d, i) {
            updateSolvedTypeLines("failed");
            d3.select("#failed").property("checked", !d3.select("#failed").property("checked"));
        })
        .style("cursor", "pointer");

    d3.select("#inprogress_text")
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text("In Progress")
        .on("click", function (d, i) {
            updateSolvedTypeLines("inprogress");
            d3.select("#inprogress").property("checked", !d3.select("#inprogress").property("checked"));
        })
        .style("cursor", "pointer");

    d3.select("#solved_text")
        .append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text("Solved")
        .on("click", function (d, i) {
            updateSolvedTypeLines("solved");
            d3.select("#solved").property("checked", !d3.select("#solved").property("checked"));
        })
        .style("cursor", "pointer");



    // Make sure they're all unchecked
    d3.select('#crimeCheckboxes').selectAll('input').property('checked', false);
    // And select the default ones from the boolean array
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        d3.select("#category_" + i).property("checked", data.crimeTypes[data.getCrimeTypes()[i]].visibility);
    }
};

    var SOLVED_TYPES = ["solved", "inprogress", "failed"];
    var SOLVED_TYPES_VISIBILITY = [0, 0, 0];
    var ONLY_CRIME_STATUS = 0;
    function updateSolvedTypeLines(solvedType, toggle) {
        if (typeof toggle == "undefined") toggle = true;
        var crimeList = data.getCrimeTypes();
        if (solvedType == "only_crime_status" || solvedType == "undefined") {
            if(toggle) ONLY_CRIME_STATUS = (ONLY_CRIME_STATUS + 1) % 2;
            if (ONLY_CRIME_STATUS) {
                for (var i in crimeList) {
                    d3.select("#" + crimeList[i]).attr("display", "none");
                }
            } else {
                for (var i in crimeList) {
                    var id = "#" + crimeList[i];
                    if (data.crimeTypes[crimeList[i]].visibility) {
                        d3.select(id).attr("display", "block");
                    } else {
                        d3.select(id).attr("display", "none");
                    }
                }
            }
            resizeTimeLine();
            return;
        }
        if (typeof solvedType == "undefined") {
            solvedType = SOLVED_TYPES;
        } else {
            solvedType = [solvedType];
        }
        for (var j in solvedType) {
            var currentSolvedType = solvedType[j];
            if(toggle) SOLVED_TYPES_VISIBILITY[SOLVED_TYPES.indexOf(currentSolvedType)] = (SOLVED_TYPES_VISIBILITY[SOLVED_TYPES.indexOf(currentSolvedType)] + 1) % 2;
            if (SOLVED_TYPES_VISIBILITY[SOLVED_TYPES.indexOf(currentSolvedType)]) {
                for (var i in crimeList) {
                    var id = "#" + crimeList[i] + "_" + currentSolvedType;
                    if (data.crimeTypes[crimeList[i]].visibility) {
                        d3.select(id).attr("display", "block");
                    } else {
                        d3.select(id).attr("display", "none");
                    }
                }
            } else {
                for (var i in crimeList) {
                    var id = "#" + crimeList[i] + "_" + currentSolvedType;
                    if (data.crimeTypes[crimeList[i]].visibility) {
                        d3.select(id).attr("display", "none");
                    }
                }
            }
        }
        resizeTimeLine();
    }

function toggleAllCrimes(){
    var s = 0;
    for(var i=0; i < data.getCrimeTypes().length; i++){
        s+=data.crimeTypes[data.getCrimeTypes()[i]].visibility;
    }
    var bo = 1;
    if(s>0){
        bo = 0;
    }
    if(bo==0){
        data.emit('resetDetailPanel');
    };
    for(var i=0; i < data.getCrimeTypes().length; i++){
            d3.select("#category_" + i).property("checked", 0+!!bo);
            data.crimeTypes[data.getCrimeTypes()[i]].visibility = bo;
            var line = d3.select('#' + data.getCrimeTypes()[i]);
            if (bo==1) {
                line.attr("display", "block");
            } else {
                line.attr("display", "none");
            }
    }    

    resizeTimeLine(data.crimeAggregates);
    highlightMatrixSelection();
   data.emit('activateAllCrimes', bo);

}

function toggleCheckboxesOfCrimes(checkboxID) {
    // Trigger 'toggle' event of the DataController

    //
    data.emit('toggle', data.getCrimeTypes()[checkboxID]);
    //data.crimeTypes[data.getCrimeTypes()[checkboxID]].visibility = !data.crimeTypes[data.getCrimeTypes()[checkboxID]].visibility;

    toggleTimeviewLines(checkboxID);
    resizeTimeLine();
    highlightMatrixSelection();
    d3.select("#category_" + checkboxID).property("checked", data.crimeTypes[data.getCrimeTypes()[checkboxID]].visibility);
}

function getCrimeData(crimeType) {
    var verboseCrimeType = data.getVerboseCrimeName(crimeType);
    // Get a list of all month identifiers
    var months = d3.time.months(new Date(2010, 10, 15), new Date(2016, 1, 15));
    months = months.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-01";
    });

    var returndata = {};
    months.forEach(function (month) {
        returndata[month] = 0;
    });

    // Get the currently active LSOA codes
    var activeCodes = [];
    for (var key in data.lsoa_codes) {
        if (!data.lsoa_codes.hasOwnProperty(key)) continue;
        if (data.lsoa_codes[key] === true)
            activeCodes.push(key);
    }
    
    var types = [verboseCrimeType];
    if (crimeType == "allCrimes") {
        types = data.getVerboseCrimeName();
    }

    months.forEach(function (month) {
        activeCodes.forEach(function (code) {
            if (data.crimesAggGeo[code] == undefined) {
                throw new Error(code + " is undefined");
            }
            if (data.crimesAggGeo[code][month] != undefined) {
                types.forEach(function (verboseCrimeType) {
                    if (data.crimesAggGeo[code][month][verboseCrimeType] != undefined) {
                        returndata[month] += parseInt(data.crimesAggGeo[code][month][verboseCrimeType]);
                    }
                });
            }
        })
    });
    var max = 0;
    var r = [];
    for (key in returndata) {
        if (returndata[key] > max) {
            max = returndata[key];
        }
        r.push({
            'date': key.substr(0, key.length -3),
            'value': returndata[key]
        })
    }
    countMax[crimeType] = max;
    return r;
}

function plotTimeviewLines() {
    var plotCrimePath = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.date));
        })
        .y(function (d) {
            return y(d.value);
        })
        .interpolate(currentInterpolationType);

    svg.selectAll("path").remove();
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        svg.append("path")
            .attr("id", data.getCrimeTypes()[i])
            .attr("crime_type", data.getCrimeTypes()[i])
            .datum(getCrimeData(data.getCrimeTypes()[i], data.crimeAggregates))
            .attr("class", "line")
            .attr("d", plotCrimePath)
            .attr("stroke-width", "1.5px")
            .attr("stroke", data.getCrimeColor(data.getCrimeTypes()[i]))
            .on("mouseover", function () {
                var tooltip = d3.select("#tooltip");
                var mine = d3.select(this);

                var xcoo = d3.mouse(this)[0];
                var date = x.invert(xcoo);

                var dateStr;
                if (date.getMonth() < 9) {
                    dateStr = "0" + (date.getMonth() + 1) + '/' + date.getFullYear();
                } else {
                    dateStr = (date.getMonth() + 1) + '/' + date.getFullYear()
                }
                var numberOfCrimes = data.crimeAggregates[years[date.getFullYear() - 2010]][months[date.getMonth()]][mine.attr("id")];

                tooltip.style("color", mine.attr("stroke"));
                tooltip.html(data.getVerboseCrimeName(mine.attr("crime_type")) + "<br>" + dateStr + " - #: " + numberOfCrimes);
                tooltip.style("visibility", "visible");
                highlightCrimeSelection(mine.attr("crime_type"), true, d3.select(this).attr("id"));
            })
            .on("mousemove", function () {
                tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                highlightCrimeSelection(d3.select(this).attr("crime_type"), false);
                return d3.select("#tooltip").style("visibility", "hidden");
            });

        if (!data.crimeTypes[data.getCrimeTypes()[i]].visibility) {
            d3.select("#" + data.getCrimeTypes()[i]).attr("display", "none");
        }
    }
    plotSolvedRatesOnTimeLine();
    resizeTimeLine();
}

function plotSolvedRatesOnTimeLine() {
    var plotSolve_FAILED_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.failed);
        })
        .interpolate(currentInterpolationType);
    var plotSolve_INPROGRRESS_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.na_inprogress);
        })
        .interpolate(currentInterpolationType);
    var plotSolve_SOLVED_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.solved);
        })
        .interpolate(currentInterpolationType);

    function plotSolvedCategoryLinesByCrime(crimeType) {
        var verboseCrimeName = data.getVerboseCrimeName(crimeType);
        var category_values_crime = data.crimesSolvedByCategoryNtype[verboseCrimeName];
        if (category_values_crime == undefined) return false;

        function plotSolvedLineByCategory(crimeType, catogoryPlotFunc, category_values, category) {
            d3.select("#"+crimeType + "_" + category).remove();
            var PATH = svg.append("path")
                .attr("id", crimeType + "_" + category)
                .attr("crime_type", crimeType)
                .datum(category_values)
                .attr("class", "line")
                .attr("d", catogoryPlotFunc)
                .attr("stroke-width", "1.5px")
                .attr("stroke", data.getCrimeColor(crimeType))
                .attr("stroke-dasharray", function () {
                    if (category == "failed") {
                        return ("10,3")
                    } else if (category == "solved") {
                        return ("2, 2")
                    } else if (category == "inprogress") {
                        return ("5, 5")
                    }
                });
            PATH.on("mouseover", function () {
                var tooltip = d3.select("#tooltip");
                var mine = d3.select(this);
                var xcoo = d3.mouse(this)[0];
                var date = x.invert(xcoo);
                var mo = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2);
                var dateStr = ("0" + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
                var numberOfCrimes = "TODOOO";
                var solvedType = "";
                for (var i in category_values) {
                    if (category_values[i].month == mo) {
                        if (category == "failed") {
                            numberOfCrimes = category_values[i].outcomes.failed;
                            solvedType = "Unresolved";
                        } else if (category == "solved") {
                            numberOfCrimes = category_values[i].outcomes.solved;
                            solvedType = "Solved";
                        } else if (category == "inprogress") {
                            numberOfCrimes = category_values[i].outcomes.na_inprogress;
                            solvedType = "In Progress";
                        }
                        break;
                    }
                }
                tooltip.style("color", mine.attr("stroke"));
                tooltip.html(data.getVerboseCrimeName(crimeType) + " - " + solvedType + "<br>" + dateStr + " - #: " + numberOfCrimes);
                tooltip.style("visibility", "visible");
                highlightCrimeSelection(mine.attr("crime_type"), true, mine.attr("id"));
            })
                .on("mousemove", function () {
                    tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    highlightCrimeSelection(d3.select(this).attr("crime_type"), false);
                    return d3.select("#tooltip").style("visibility", "hidden");
                });
            PATH.attr("stroke-opacity", 1);
        }

        plotSolvedLineByCategory(crimeType, plotSolve_FAILED_Path, category_values_crime, "failed");
        plotSolvedLineByCategory(crimeType, plotSolve_INPROGRRESS_Path, category_values_crime, "inprogress");
        plotSolvedLineByCategory(crimeType, plotSolve_SOLVED_Path, category_values_crime, "solved");
        return true;
    }

    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if (plotSolvedCategoryLinesByCrime(data.getCrimeTypes()[i])) {
            if (data.crimeTypes[data.getCrimeTypes()[i]].visibility == 0) {
                d3.select("#" + data.getCrimeTypes()[i] + "_failed").attr("display", "none");
                d3.select("#" + data.getCrimeTypes()[i] + "_inprogress").attr("display", "none");
                d3.select("#" + data.getCrimeTypes()[i] + "_solved").attr("display", "none");
            } else {
                if(SOLVED_TYPES_VISIBILITY[0] == 0){
                    d3.select("#" + data.getCrimeTypes()[i] + "_solved").attr("display", "none");
                }
                if(SOLVED_TYPES_VISIBILITY[1] == 0){
                    d3.select("#" + data.getCrimeTypes()[i] + "_inprogress").attr("display", "none");
                }
                if(SOLVED_TYPES_VISIBILITY[2] == 0){
                    d3.select("#" + data.getCrimeTypes()[i] + "_failed").attr("display", "none");
                }

            }
        }
    }
    updateSolvedTypeLines('undefined', false);
    //resizeTimeLine();
}

function highlightCrimeSelection(name, status, id) {
    if (status) {
        d3.selectAll(".line").each(function () {
            var mine = d3.select(this);
            if (mine.attr("crime_type") !== name) {
                mine.attr("stroke-opacity", 0.2);
                mine.attr("stroke-width", "0.5px");
                //mine.transition().duration(500).style("stroke-opacity", 0.2);
                //mine.transition().duration(500).style("stroke-opacity", 0.2);
                //mine.transition().duration(500).style("stroke-width", "0.5px");
            } else {
                mine.attr("stroke-opacity", 0.8);
                mine.attr("stroke-width", "1.8px");
            }
            if (mine.attr("id") == id) {
                mine.attr("stroke-opacity", 1);
                mine.attr("stroke-width", "2.5px");
                //mine.transition().duration(500).style("stroke-opacity", 1);
                //mine.transition().duration(500).style("stroke-width", "2.5px");
            }
        })
    } else {
        d3.selectAll(".line").each(function () {
            var mine = d3.select(this);
            mine.attr("stroke-opacity", 1);
            mine.attr("stroke-width", "1.5px");
            //mine.transition().duration(500).style("stroke-opacity", 1);
            //mine.transition().duration(500).style("stroke-width", "1.5px");
            if (mine.attr("crime_type" !== name)) {
                mine.attr("stroke-opacity", 1);
                //mine.transition().duration(500).style("stroke-opacity", 1);
            }
        })
    }
}

function toggleTimeviewLines(crimeLineID) {
    var line = d3.select('#' + data.getCrimeTypes()[crimeLineID]);
    var failedLine = d3.select('#' + data.getCrimeTypes()[crimeLineID] + "_failed");
    var inProgressLine = d3.select('#' + data.getCrimeTypes()[crimeLineID] + "_inprogress");
    var solvedLine = d3.select('#' + data.getCrimeTypes()[crimeLineID] + "_solved");

    if (data.crimeTypes[data.getCrimeTypes()[crimeLineID]].visibility) {
        if (ONLY_CRIME_STATUS == 0) {
            line.attr("display", "block");
        } else {
            line.attr("display", "none");
        }
        if (d3.select("#" + SOLVED_TYPES[0]).property("checked")) {
            solvedLine.attr("display", "block");
        }
        if (d3.select("#" + SOLVED_TYPES[1]).property("checked")) {
            inProgressLine.attr("display", "block");
        }
        if (d3.select("#" + SOLVED_TYPES[2]).property("checked")) {
            failedLine.attr("display", "block");
        }
    } else {
        line.attr("display", "none");
        solvedLine.attr("display", "none");
        inProgressLine.attr("display", "none");
        failedLine.attr("display", "none");
    }
}

function resizeTimeLine(transition) {
    if (typeof transition === 'undefined') transition = true;
    var plotCrimePath = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.date));
        })
        .y(function (d) {
            return y(d.value);
        })
        .interpolate(currentInterpolationType);
    var plotSolve_FAILED_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.failed);
        })
        .interpolate(currentInterpolationType);
    var plotSolve_INPROGRRESS_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.na_inprogress);
        })
        .interpolate(currentInterpolationType);
    var plotSolve_SOLVED_Path = d3.svg.line()
        .x(function (d) {
            return x(dateFormat.parse(d.month));
        })
        .y(function (d) {
            return y(d.outcomes.solved);
        })
        .interpolate(currentInterpolationType);

    var maxValue = 0;
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if (data.crimeTypes[data.getCrimeTypes()[i]].visibility && ONLY_CRIME_STATUS == 0) {
            var key = data.getCrimeTypes(i);
            if (countMax[key] > maxValue)
                maxValue = countMax[key];
        } else {
            // loop through all solved types and corresponding crimes -- only if activated!
            var crimeTypes = data.getCrimeTypes();
            for (var l in crimeTypes) {
                if (data.crimeTypes[crimeTypes[l]].visibility) {
                    // check all solved types for max line!
                    for (var j in SOLVED_TYPES) {
                        var solvedType = SOLVED_TYPES[j];
                        if (solvedType == "inprogress") solvedType = "na_" + solvedType;
                        if (SOLVED_TYPES_VISIBILITY[SOLVED_TYPES.indexOf(SOLVED_TYPES[j])]) {
                            var obj_list = data.crimesSolvedByCategoryNtype[data.getVerboseCrimeName(crimeTypes[l])];
                            for (var k in obj_list) {
                                if (obj_list[k].outcomes[solvedType] > maxValue) {
                                    maxValue = obj_list[k].outcomes[solvedType];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    y.domain([0, maxValue + 0.2 * maxValue]);
    for (i = 0; i < data.getCrimeTypes().length; i++) {
        var duration = transition ? 750 : 0;
        var solvedLinesOfCrime = data.crimesSolvedByCategoryNtype[data.getVerboseCrimeName(data.getCrimeTypes()[i])];
        if (solvedLinesOfCrime != undefined) {
            d3.select("#" + data.getCrimeTypes()[i] + "_failed").transition().duration(duration).attr("d", plotSolve_FAILED_Path(solvedLinesOfCrime));
            d3.select("#" + data.getCrimeTypes()[i] + "_inprogress").transition().duration(duration).attr("d", plotSolve_INPROGRRESS_Path(solvedLinesOfCrime));
            d3.select("#" + data.getCrimeTypes()[i] + "_solved").transition().duration(duration).attr("d", plotSolve_SOLVED_Path(solvedLinesOfCrime));
        }
        d3.select("#" + data.getCrimeTypes()[i]).transition().duration(duration).attr("d", plotCrimePath(getCrimeData(data.getCrimeTypes()[i], data.crimeAggregates)));

    }
    svg.select(".y.axis") // change the y axis
        .transition().duration(transition ? 750 : 0)
        .call(yAxis);
}

var timelineView = function () {
    svg1 = d3.select("#timelineView").append("svg:svg")
        .attr("width", crimeTime.width + crimeTime.margin.left + crimeTime.margin.right) //
        .attr("height", crimeTime.height + crimeTime.margin.top + crimeTime.margin.bottom);
    svg = svg1.append("g")
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")");
    var overlayRect = svg1.append("g")
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")");

    x.domain(timeRange);
    y.domain([0, 500]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + crimeTime.height + ")")
        .call(xAxis);

    overlayRect.append("rect")
        .attr("id", "left_overlay_rect")
        .attr("width", 0)
        .attr("height", 151)
        .attr("opacity",0.8)
        .attr("fill", "white");
    overlayRect.append("rect")
        .attr("id", "right_overlay_rect")
        .attr("width", 0)
        .attr("height", 151)
        .attr("opacity",0.8)
        .attr("fill", "white");

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

    // ADD SLIDER to TIMELINE
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
        d3.select("#interpolation").node().style.display = 'block';
        d3.select("#solvedCrimeCheckboxes").node().style.display = 'block';
        d3.select("#content").node().style.height = "calc(100% - 315px)";
        map.invalidateSize();
    } else {
        d3.select("#toggleCrimetimeview").node().innerHTML = "&darr;";
        d3.select("#timelineView").node().style.display = 'none';
        d3.select("#interpolation").node().style.display = 'none';
        d3.select("#solvedCrimeCheckboxes").node().style.display = 'none';
        d3.select("#content").node().style.height = "calc(100% - 110px)";
        map.invalidateSize();
    }
}

var crimeTimeMatrix;
var matrixView = function () {
    d3.select("#crime_matrix").remove();
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
            .attr("id", "crime_matrix")
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
        .attr("y", 6);

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
                            var key = data.getCrimeTypes(i);
                            var val = data.crimeAggregates[years[j]][months[k]][key];
                            // Normalization function:
                            if(matrixNormalization == "global"){ // GLOBAL NORMALIZATION
                                if(i == 0) return (val - countMin[i]) / (countMax[i] - countMin[i]);
                                return (val - globalMin) / (globalMax - globalMin);
                            } else {  // LOCAL NORMALIZATION
                                return (val - countMin[key]) / (countMax[key] - countMin[key]);
                            }
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
    crimeTimeMatrix.append("line")
        .attr("id","left_slider_matrix")
        .attr("x1", xSliderLeft)
        .attr("x2", xSliderLeft)
        .attr("y1", 20)
        .attr("y2", 300)
        .attr("stroke-dasharray", function () {
                return ("8, 3")
        });
    crimeTimeMatrix.append("line")
        .attr("id","right_slider_matrix")
        .attr("x1", xSliderRight)
        .attr("x2", xSliderRight)
        .attr("y1", 20)
        .attr("y2", 300)
        .attr("stroke-dasharray", function () {
            return ("8, 3")
        });
};

function updateMatrixSliders(){
        d3.select("#left_slider_matrix")
            .attr("x1", xSliderLeft+53)
            .attr("x2", xSliderLeft+53)
            .attr("y1", -100)
            .attr("y2", 300);
        d3.select("#right_slider_matrix")
            .attr("x1", xSliderRight+53)
            .attr("x2", xSliderRight+53)
            .attr("y1", -100)
            .attr("y2", 300);
}


var test;

var globalMin, globalMax, globalCountTotal;

function crimeTimeViewRequirements() {
    // Define Max and Min Values
    countMax = {};
    countTotal = {};
    countMin = {};
    for (var j = 0; j < years.length; j++) {
        for (var k = 0; k < months.length; k++) {
            for (var i = 0; i < data.getCrimeTypes().length; i++) {
                if (!(typeof data.crimeAggregates[years[j]] === 'undefined' || typeof data.crimeAggregates[years[j]][months[k]] === 'undefined')) {
                    var val = data.crimeAggregates[years[j]][months[k]][data.getCrimeTypes()[i]];
                    var key = data.getCrimeTypes(i);
                    if (typeof val !== "undefined") {
                        if (countMax[key] == undefined || countMax[key] < val) countMax[key] = val;
                        if (countMin[key] == undefined || countMin[key] > val) countMin[key] = val;
                    }
                    if (countTotal[key] == undefined) countTotal[key] = 0;
                    countTotal[key] += val;
                }
            }
        }
    }
    // USED FOR GLOBAL NORMALIZATION
    globalMax = 0;
    globalMin = Number.MAX_VALUE;
    globalCountTotal = 0;
    for (var i  in countMax) {
        //if (i == 0) continue; // DO NOT USE ALL CRIMES FOR GLOBAL NORMALIZATION!!!
        if (countMax[i] > globalMax) {
            globalMax = countMax[i];
        }
        if (countMin[i] < globalMin) {
            globalMin = countMin[i];
        }
        globalCountTotal += countTotal[i];
    }
}
var matrixNormalization = "local";
function toggleMatrixNormalization(){
    if(matrixNormalization == "local"){
        matrixNormalization = "global";
        d3.select("#toggleMatrixNormalization").node().innerHTML = "Show Local Normalization";
    } else {
        matrixNormalization = "local";
        d3.select("#toggleMatrixNormalization").node().innerHTML = "Show Global Normalization";
    }
    matrixView();
    highlightMatrixSelection();
}

var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
var leftDate = ["left", "monthdropdownLeft", "yeardropdownLeft"];
var rightDate = ["right", "monthdropdownRight", "yeardropdownRight"];

function updateDate(selectedField) {
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

    // UPDATE SLIDER POSITIONS FOR MATRIX
    updateMatrixSliders();
    // UPDATE OPACITY RECT FOR HIGHLIGHT SELECTED TIME SPAN
    d3.select("#left_overlay_rect").attr("width",x(lowerDate));
    d3.select("#right_overlay_rect")
        .attr("x",x(upperDate))
        .attr("width",870-x(upperDate));
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

function changeChartInterpolation(type) {
    currentInterpolationType = type;
    resizeTimeLine(false);
}

function log(text) {
    console.log(text);
}

data.on('loadAggregates', createTimeDropdowns);
data.on('loadAggregates', createCrimeCategoryButtons);
data.on('loadAggregates', crimeTimeViewRequirements);
data.on('loadAggregates', matrixView);
data.on('loadAggregatedCrimesByGeo', timelineView);
data.on('filtered',plotTimeviewLines);