let showPredictions = false;
let allowShow = true;

let isNumber = function (obj) {
    return !isNaN(parseFloat(obj))
};

var dateFormat = d3.time.format("%Y-%m");


let plotPredictions = function () {
    if (showPredictions === false) return;
    if (allowShow === false) {
        alert('Predictions are only shown when "Only Status" is not selected');
        d3.select("#show_predictions").property("checked", false);
        return;
    }

    var monthScale = d3.time.months(new Date(2016, 1, 1), new Date(2017, 2, 1));
    monthScale = monthScale.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
    });

    var plotCrimePrediction = d3.svg.line()
        .x(function (d, i) {
            return x(dateFormat.parse(monthScale[i]));
        })
        .y(function (d) {
            return y(d);
        })
        .interpolate(currentInterpolationType);

    var getData = function (i) {
        var crimes;
        if (isNumber(i))
            crimes = [data.getVerboseCrimeName(data.getCrimeTypes(i))];
        else
            crimes = [data.getVerboseCrimeName(i)];
        let total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (crimes[0] == "All Crimes") crimes = data.getVerboseCrimeName();
        crimes.forEach(function (crime) {
            for (let j = 0; j < 13; j++) {
                if (j == 0) {
                    if (total[0] == 0) {
                        var old;
                        if (isNumber(i))
                            old = getCrimeData(data.getCrimeTypes(i));
                        else
                            old = getCrimeData(i);
                        total[0] = old[old.length - 1].value;
                    }
                    continue;
                }
                for (let key in data.lsoa_codes) {
                    if (data.lsoa_codes[key] === true) {
                        try {
                            total[j] += data.predictions[crime][key][j - 1];
                        } catch (e) {
                            // not all crimes happen in all wards in every month
                            // it's fine... just continue
                        }
                    }
                }
            }
        });

        return total;
    };

    removePredictions();
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if (data.crimeTypes[data.getCrimeTypes(i)].visibility !== 1) continue;
        d3.select('#predictions_')
            .append("path")
            .style("stroke-dasharray", ("7, 3, 3, 3, 7"))
            .attr('id', 'predictions_')
            .attr("id", "p" + data.getCrimeTypes(i))
            .attr("crime_type", data.getCrimeTypes(i))
            .datum(getData(i))
            .attr("class", "line")
            .attr("d", plotCrimePrediction)
            .attr("stroke-width", "1.5px")
            .attr("stroke", data.getCrimeColor(data.getCrimeTypes(i)))
            .on("mouseover", function (d, i) {
                var tooltip = d3.select("#tooltip");
                var mine = d3.select(this);

                var xcoo = d3.mouse(this)[0];
                var date = x.invert(xcoo);
                
                var currentCrimeNumbers = d;
                let index = 13 - d3.time.month.range(date, new Date(2017, 2, 1)).length
                var numberOfCrimes = d[index];

                tooltip.style("color", mine.attr("stroke"));
                tooltip.html(data.getVerboseCrimeName(mine.attr("crime_type")) + "<br>" +  dateFormat(date) + " - #: " + numberOfCrimes);
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
    }
};

let addContainer = function () {
    d3.select('#timeline')
        .append('g')
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")")
        .attr('id', 'predictions_');
};

let removePredictions = function () {
    d3.select("#show_predictions").property("checked", showPredictions & allowShow);
    d3.select('#predictions_').selectAll('path').remove();
};

let toggleAllowShow = function (newStatus) {
    allowShow = newStatus;
    if (!allowShow) {
        removePredictions();
    } else {
        if (showPredictions) {
            plotPredictions();
        }
    }
};

let togglePredictions = function () {
    showPredictions = !showPredictions;
    if (!showPredictions) removePredictions();
    plotPredictions();
};

data.once('filtered', addContainer);
data.on('predictions', plotPredictions);
data.on('filtered', plotPredictions);
