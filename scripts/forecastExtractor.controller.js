var extract = function() {
    var monthScale = d3.time.months(new Date(2010, 11, 1), new Date(2016, 2, 1));
    monthScale = monthScale.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
    });
    console.log(monthScale);
    let fore = d3.nest().key(function (d) {
        return d.crime_type;
    }).key(function (d) {
        return d.lsoa_code;
    }).key(function (d) {
        return d.month.getFullYear() + "-" + ("0" + (d.month.getMonth() + 1)).slice(-2);
    }).sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(data.all);

    let result = {};
    for (let type in fore) {
        if (!fore.hasOwnProperty(type)) continue;
        let crimeType = fore[type].key;
        result[crimeType] = {};
        let codes = fore[type].values;
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i].key;
            let months = codes[i].values;
            let monthObject = {};
            for (let j = 0; j < months.length; j++) {
                let obj = months[j];
                monthObject[obj.key] = obj.values;
            }
            let monthSeries = [];
            for (let j = 0; j < monthScale.length; j++) {
                let v = monthObject[monthScale[j]];
                if (v == undefined) v = 0;
                monthSeries.push(v);
            }
            result[crimeType][code] = monthSeries;
        }
    }
    
    return result;
};