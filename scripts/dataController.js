function DataController() {
    telegraph(this);
    this.all = {};
    this.crimes = {};
    this.crimesByType = {};
    this.crimesByDate = {};
    this.crimesByLocation = {};
    this.filtered = {};
    this.crimeAggregates = {};
    this.crimeAggregatesNew = {};
    this.groupedByType = {};
    this.geo = {};
    this.crimesAggGeo = {};
    this.crimesSolvedByCategoryNtype = {};
    this.predictions = {};

    this.dates = {
        from: new Date(2011, 4, 15),
        to: new Date(2012, 6, 15)
    };

    this.lsoa_codes = {
        E05009293: true,
        E05009312: true,
        E05009289: true,
        E05009296: true,
        E05009310: true,
        E05009292: true,
        E05009305: true,
        E05009298: true,
        E05009294: true,
        E05009297: true,
        E05009290: true,
        E05009304: true,
        E05009311: true,
        E05009300: true,
        E05009291: true,
        E05009302: true,
        E05009301: true,
        E05009306: true,
        E05009295: true,
        E05009299: true,
        E05009288: true,
        E05009303: true,
        E05009307: true,
        E05009308: true,
        E05009309: true
    };

    this.crimeTypes = {
        allCrimes: {
            visibility: 1,
            verboseName: 'All Crimes',
            color: 'red' // 'rgb(255,0,0)'
        },
        burglary: {
            visibility: 0,
            verboseName: 'Burglary',
            color: 'rgb(76,76,130)'//'fuchsia'
        },
        anti_social_behaviour: {
            visibility: 0,
            verboseName: 'Anti-social behaviour',
            color: 'rgb(0,128,0)'//'lime'
        },
        vehicle_crime: {
            visibility: 0,
            verboseName: 'Vehicle crime',
            color: 'rgb(146,146,16)'//'darkolivegreen'
        },
        robbery: {
            visibility: 0,
            verboseName: 'Robbery',
            color: 'rgb(48,114,243)'//'chocolate'
        },
        other_crime: {
            visibility: 0,
            verboseName: 'Other crime',
            color: 'rgb(180,100,50)'//'maroon'
        },
        shoplifting: {
            visibility: 0,
            verboseName: 'Shoplifting',
            color: 'rgb(0,0,0)'//'darkorange'
        },
        drugs: {
            visibility: 0,
            verboseName: 'Drugs',
            color: 'rgb(23,54,115)'//'olive'
        },
        criminal_damage_and_arson: {
            visibility: 0,
            verboseName: 'Criminal damage and arson',
            color: 'rgb(146,16,16)'//'silver'
        },
        other_theft: {
            visibility: 1,
            verboseName: 'Other theft',
            color: 'blue'//'blue'
        },
        bicycle_theft: {
            visibility: 0,
            verboseName: 'Bicycle theft',
            color: 'rgb(0,85,85)'//'green'
        },
        theft_from_the_person: {
            visibility: 0,
            verboseName: 'Theft from the person',
            color: 'rgb(85,0,85)'//'blueviolet'
        },
        public_disorder_weapons: {
            visibility: 0,
            verboseName: 'Public disorder and weapons',
            color: 'rgb(222,125,85)'//'burlywood'
        },
        public_order: {
            visibility: 0,
            verboseName: 'Public order',
            color: 'rgb(85,85,0)'//'darkcyan'
        },
        possesion_of_weapons: {
            visibility: 0,
            verboseName: 'Possession of weapons',
            color: 'rgb(51,0,170)'//'darkgoldenrod'
        },
        violent_crime: {
            visibility: 0,
            verboseName: 'Violent crime',
            color: 'rgb(255,153,0)'//'gray'
        },
        violence_and_sex: {
            visibility: 0,
            verboseName: 'Violence and sexual offences',
            color: 'rgb(0,127,180)' // no color on web page
        }
    };
    this.visibleVerboseCrimeTypes = ["Other theft"];

    this.outcomeTypes = {
        na_inprogress: {
            visibility: 0,
            list: ["Under investigation", "Awaiting court outcome", "Defendant sent to Crown Court", "Court result unavailable"]
        },
        solved: {
            visibility: 1,
            list: ["Suspect charged as part of another case", "Local resolution", "Offender given a caution", "Offender otherwise dealt with", "Offender fined", "Offender given community sentence", "Offender given conditional discharge", "Offender deprived of property", "Offender given penalty notice", "Offender sent to prison", "Offender given absolute discharge", "Offender given a drugs possession warning", "Defendant found not guilty", "Offender ordered to pay compensation", "Offender given suspended prison sentence", "Formal action is not in the public interest"]
        },
        failed: {
            visibility: 0,
            list: ["Court case unable to proceed", "Unable to prosecute suspect", "Investigation complete; no suspect identified"]
        }
    };
}

/**
 * Initializes the filters by setting everything to visible.
 * @return {[type]}
 */
DataController.prototype.initializeFilters = function () {
    this.crimes = crossfilter(this.all);
    this.crimesByType = this.crimes.dimension(function (d) {
        return d.crime_type;
    });
    this.crimesByDate = this.crimes.dimension(function (d) {
        return d.month;
    });
    this.crimesByLocation = this.crimes.dimension(function (d) {
        return d.lsoa_code;
    });
    this.filterDate();
        this.filtered = this.crimesByType.filterAll().top(Infinity);
    this.visibleVerboseCrimeTypes = ["All Crimes", "Violence and sexual offences", "Other theft", "Burglary", "Violent crime", "Bicycle theft", "Anti-social behaviour", "Other crime", "Shoplifting", "Drugs", "Criminal damage and arson", "Vehicle  crime", "Theft from the person", "Public disorder and weapons", "Public order", "Robbery", "Possession of weapons"];

    data.emit('filtered');
};

/**
 * Changes the visibility of a given crime type.
 * @param  {string} type The crime type to change
 * @return {[type]}
 */
DataController.prototype.toggleVisibilityFlag = function (type) {

    var old = this.crimeTypes[type].visibility;
    this.crimeTypes[type].visibility = (old + 1) % 2;
    
    var current = this.crimeTypes[type].visibility;

    // Handle special case
    if (type == "allCrimes") {
        this.visibleVerboseCrimeTypes = [];
        if (current > old) {
            // Set everything to visible
            for (var key in this.crimeTypes) {
                this.visibleVerboseCrimeTypes.push(this.crimeTypes[key].verboseName);
            }
        } else {
            for (var key in this.crimeTypes) {
                if (this.crimeTypes[key].visibility == 1) {
                    this.visibleVerboseCrimeTypes.push(this.crimeTypes[key].verboseName);
                }
            }
        }
        return;
    }

    // Type was invisible, is visible now
    // Add verbose name to the visible list
    if (current > old) {
        this.visibleVerboseCrimeTypes.push(this.crimeTypes[type].verboseName);
    } else {
        // Find the correct index
        var index = this.visibleVerboseCrimeTypes.indexOf(this.crimeTypes[type].verboseName);
        // And remove it from the array
        this.visibleVerboseCrimeTypes.splice(index, 1);
    }
};

DataController.prototype.switchAllVisibilityFlags = function (switchOn) {
   this.visibleVerboseCrimeTypes = [];
    for (var key in this.crimeTypes) {
        this.crimeTypes[key].visibility = switchOn;
        if(switchOn){
            this.visibleVerboseCrimeTypes.push(this.crimeTypes[key].verboseName);
        } 
    }
};

DataController.prototype.dateChangeBoth = function (from, to) {
    this.dates.from = from;
    this.dates.to = to;
    this.filterDate();
};
DataController.prototype.dateChange = function (month, year, type) {
    this.dates[type] = new Date(year, month - 1, 15);
    this.filterDate();
};

DataController.prototype.filterDate = function () {
    this.filtered = this.crimesByDate.filter(function (d) {
        return (d >= data.dates.from && d <= data.dates.to);
    }).top(Infinity);
    data.emit('filtered');
};

DataController.prototype.toggleFilterAll = function (switchOn) {
    this.switchAllVisibilityFlags(switchOn);
    if(switchOn){
        this.filtered = this.crimesByType.filter(function (d) {
            if (data.visibleVerboseCrimeTypes.indexOf(d) >= 0)
                return true;
            return false;
        }).top(Infinity);
    }else {
        this.filtered = [];
    }

    data.emit('filtered');
};

DataController.prototype.filterLSOA = function () {
    var self = this;
    this.filtered = this.crimesByLocation.filter(function (d) {
        return self.lsoa_codes[d];
    }).top(Infinity);
    data.emit('filtered');
};

DataController.prototype.toggleLSOA = function (code) {
    this.lsoa_codes[code] = this.lsoa_codes[code] ? false : true;
    this.filterLSOA();
};

DataController.prototype.toggleAllLSOA = function () {
    var status = false;
    for (var key in this.lsoa_codes) {
        if (this.lsoa_codes.hasOwnProperty(key)) {
            status = status | this.lsoa_codes[key];
        }
    }
    status = !status;

    for (var key in this.lsoa_codes) {
        if (this.lsoa_codes.hasOwnProperty(key)) {
            this.lsoa_codes[key] = status;
        }
    }

    this.filterLSOA();
    return status;
};

DataController.prototype.toggleFilter = function (type) {
    this.toggleVisibilityFlag(type);

    // Apply all filters
    this.filtered = this.crimesByType.filter(function (d) {
        if (data.visibleVerboseCrimeTypes.indexOf(d) >= 0 || data.visibleVerboseCrimeTypes.indexOf("All Crimes") >= 0) {
            return true;
        }
        return data.visibleVerboseCrimeTypes.indexOf(d) >= 0;
    }).top(Infinity);
    data.emit('filtered');
};

DataController.prototype.mapFilterKeyword = function (key) {
    return this.crimeTypes[key].verboseName;
};

DataController.prototype.getCrimeTypes = function (i) {
    var names = [];
    for (var key in this.crimeTypes) {
        names.push(key);
    }
    
    if (i != undefined)
        return names[i];

    return names;
};

DataController.prototype.getVerboseCrimeName = function (crime) {
    if (crime != undefined) {
        return this.crimeTypes[crime].verboseName;
    }

    var names = [];
    for (var key in this.crimeTypes) {
        names.push(this.crimeTypes[key].verboseName);
    }
    return names;
};

DataController.prototype.getCrimeColor = function (crime) {
    return this.crimeTypes[crime].color;
};

DataController.prototype.getCrimeVarName = function (crimeVerboseName) {
    for (var key in this.crimeTypes) {
        if (this.crimeTypes[key].verboseName == crimeVerboseName) {
            return key.toString();
        }
    }
    return null;
};
DataController.prototype.getCrimeIndexByVerboseName = function (crimeVerboseName) {
    var index = 0;
    for (var key in this.crimeTypes) {
        if (this.crimeTypes[key].verboseName == crimeVerboseName) {
            return index;
        }
        index++;
    }
    return null;
};

DataController.prototype.groupByType = function () {
    this.groupedByType = d3.nest().key(function (d) {
        return d.crime_type;
    }).key(function (d) {
        return d.month.getFullYear() + "-" + ("0" + (d.month.getMonth() + 1)).slice(-2);
    }).sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(this.filtered);
};

DataController.prototype.prepareSolvedCrimesForTimeline = function (){
    function getCategoryByOutcomeType(outcomeType, data){
        var outcomeCategories = Object.keys(data.outcomeTypes);
        for(var cat in outcomeCategories){
            if(data.outcomeTypes[outcomeCategories[cat]].list.indexOf(outcomeType) >= 0){
                return outcomeCategories[cat];
            }
        }
    }
    this.crimesSolvedByCategoryNtype = [];
    for (var key_ in this.solvedCrimesAgg){
        var crimeOutcome = this.solvedCrimesAgg[key_];
        var aggOutcomes = {};
        for(var category in Object.keys(this.outcomeTypes)){
            aggOutcomes[Object.keys(this.outcomeTypes)[category]] = 0;
        }
        var outcomeEntity = {
            "crime_type" : crimeOutcome.crime_type,
            "month" : crimeOutcome.month,
            "outcomes": aggOutcomes
        };

        var outcomeKeys = Object.keys(crimeOutcome.outcomes);
        for (var key in outcomeKeys){
            var number = parseFloat(crimeOutcome.outcomes[outcomeKeys[key]]);
            var category = getCategoryByOutcomeType(outcomeKeys[key], this);
            outcomeEntity["outcomes"][category] += number;
        }
        this.crimesSolvedByCategoryNtype.push(outcomeEntity);
    }
    // Prepare Object for line plotting
    var tempSolvedByCatNType = {};
    for(var i in this.crimesSolvedByCategoryNtype){
        var ent = this.crimesSolvedByCategoryNtype[i];
        var crimeType = ent.crime_type;
        if(tempSolvedByCatNType[crimeType] === undefined){
            tempSolvedByCatNType[crimeType] = [];
        }
        tempSolvedByCatNType[crimeType].push({
            "month" : ent.month,
            "outcomes" : ent.outcomes
        })
    }
    this.crimesSolvedByCategoryNtype = tempSolvedByCatNType;
};

var data = new DataController();

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisIIPreProcessing/master/crimeAggregates.json", function (error, json) {
    if (error) throw error;

    data.crimeAggregates = json;
    setTimeout(function(){
        data.emit('loadAggregates');
    }, 1000);
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/crimes_geoloc_agg_ex.json", function(error, json) {//"https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo_oa_ex.json"
    if(error) throw error;
    data.crimesAggGeo = json;
    setTimeout(function(){
        data.emit('loadAggregatedCrimesByGeo');
    }, 1000);
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/master/data/outcomes_aggby_month-crimetype.json", function(error, json) {
    if(error) throw error;
    data.solvedCrimesAgg = json;
    data.emit('loadSolvedCrimes');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/master/data/crimes_with_correct_geoloc.json", function (error, json) {
    if (error) throw error;
    json.forEach(function (d, i) {
        d.month = new Date(d.month.substring(0, 4), d.month.substring(5, 7) - 1, 15);
    });

    data.all = json;
    data.filtered = json;
    //console.log(json);
    //data.emit('loadAll');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo.json", function(error, json) {//"https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo_oa_ex.json"
    if(error) throw error;
    data.geo = json;
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/geoBasedForecast/data/predictions.json", function(err, json) {
    if (err) throw err;
    data.predictions = json;
    
    setTimeout(function() {
        data.emit('predictions');
    }, 3000);
});

data.on('loadSolvedCrimes', data.prepareSolvedCrimesForTimeline);
data.on('loadAll', data.initializeFilters);
data.on('toggle', data.toggleFilter);
data.on('activateAllCrimes', data.toggleFilterAll);
data.on('dateChange', data.dateChange);
data.on('filtered', data.groupByType);

setTimeout(function(){
    data.emit('loadAll');
},2000);
