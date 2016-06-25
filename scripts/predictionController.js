let showPredictions = false;

let isNumber = function(obj) { return !isNaN(parseFloat(obj)) };

let plotPredictions = function () {
    if (showPredictions === false) return;

    var monthScale = d3.time.months(new Date(2016, 1, 1), new Date(2017, 2, 1));
    monthScale = monthScale.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
    });

    var dateFormat = d3.time.format("%Y-%m");

    var plotCrimePrediction = d3.svg.line()
        .x(function (d, i) {
            return x(dateFormat.parse(monthScale[i]));
        })
        .y(function (d) {
            return y(d);
        })
        .interpolate('linear');

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
            .attr("stroke", data.getCrimeColor(data.getCrimeTypes()[i]));
    }
};

let addContainer = function () {
    d3.select('#timeline')
        .append('g')
        .attr("transform", "translate(" + crimeTime.margin.left + "," + crimeTime.margin.top + ")")
        .attr('id', 'predictions_');
};

let removePredictions = function() {
    d3.select('#predictions_').selectAll('path').remove();
};

let togglePredictions = function() {
    showPredictions = !showPredictions;
    if (!showPredictions) removePredictions();
    plotPredictions();
};

data.once('filtered', addContainer);
data.on('predictions', plotPredictions);
data.on('filtered', plotPredictions);
