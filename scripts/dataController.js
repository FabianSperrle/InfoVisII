function DataController() {
    telegraph(this);
    this.all = {};
    this.crimes = {};
    this.crimesByType = {};
    this.crimesByDate = {};
    this.filtered = {};
    this.crimeAggregates = {};
    this.groupedByType = {};
    this.geo = {};
    this.crimesAggGeo = {};

    this.dates = {
        from: new Date(2011, 4, 15),
        to: new Date(2012, 6, 15)
    };

    this.crimeTypes = {
        allCrimes: {
            visibility: 1,
            verboseName: 'All Crimes',
            color: 'red'
        },
        burglary: {
            visibility: 0,
            verboseName: 'Burglary',
            color: 'fuchsia'
        },
        anti_social_behaviour: {
            visibility: 0,
            verboseName: 'Anti-social behaviour',
            color: 'lime'
        },
        vehicle_crime: {
            visibility: 0,
            verboseName: 'Vehicle crime',
            color: 'darkolivegreen'
        },
        robbery: {
            visibility: 0,
            verboseName: 'Robbery',
            color: 'chocolate'
        },
        other_crime: {
            visibility: 0,
            verboseName: 'Other crime',
            color: 'maroon'
        },
        shoplifting: {
            visibility: 0,
            verboseName: 'Shoplifting',
            color: 'darkorange'
        },
        drugs: {
            visibility: 0,
            verboseName: 'Drugs',
            color: 'olive'
        },
        criminal_damage_and_arson: {
            visibility: 0,
            verboseName: 'Criminal damage and arson',
            color: 'silver'
        },
        other_theft: {
            visibility: 1,
            verboseName: 'Other theft',
            color: 'blue'
        },
        bicycle_theft: {
            visibility: 0,
            verboseName: 'Bicycle theft',
            color: 'green'
        },
        theft_from_the_person: {
            visibility: 0,
            verboseName: 'Theft from the person',
            color: 'blueviolet'
        },
        public_disorder_weapons: {
            visibility: 0,
            verboseName: 'Public disorder and weapons',
            color: 'burlywood'
        },
        possesion_of_weapons: {
            visibility: 0,
            verboseName: 'Possession of weapons',
            color: 'darkgoldenrod'
        },
        public_order: {
            visibility: 0,
            verboseName: 'Public order',
            color: 'darkcyan'
        },
        violent_crime: {
            visibility: 0,
            verboseName: 'Violent crime',
            color: 'gray'
        },
        violence_and_sex: {
            visibility: 0,
            verboseName: 'Violence and sexual offences',
            color: 'aqua'
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
            list:["Suspect charged as part of another case", "Local resolution", "Offender given a caution", "Offender otherwise dealt with", "Offender fined", "Offender given community sentence", "Offender given conditional discharge", "Offender deprived of property", "Offender given penalty notice", "Offender sent to prison", "Offender given absolute discharge", "Offender given a drugs possession warning", "Defendant found not guilty", "Offender ordered to pay compensation", "Offender given suspended prison sentence"]
        },
        failed: {
            visibility: 0,
            list:["Court case unable to proceed", "Formal action is not in the public interest", "Unable to prosecute suspect", "Investigation complete; no suspect identified"]
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
    this.filterDate();
    this.filtered = this.crimesByType.filterAll().top(Infinity);
    this.visibleVerboseCrimeTypes = ["Violence and sexual offences", "Other theft", "Burglary", "Violent crime", "Bicycle theft", "Anti-social behaviour", "Other crime", "Shoplifting", "Drugs", "Criminal damage and arson", "Vehicle  crime", "Theft from the person", "Public disorder and weapons", "Public order", "Robbery", "Possession of weapons"];

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

DataController.prototype.toggleFilter = function (type) {
    this.toggleVisibilityFlag(type);

    // Apply all filters
    this.filtered = this.crimesByType.filter(function (d) {
        if (data.crimeTypes.allCrimes.visibility == true) {
            return true;
        }
        return data.visibleVerboseCrimeTypes.indexOf(d) >= 0;
    }).top(Infinity);
    data.emit('filtered');
};

DataController.prototype.mapFilterKeyword = function (key) {
    return this.crimeTypes[key].verboseName;
};

DataController.prototype.getCrimeTypes = function () {
    var names = [];
    for (var key in this.crimeTypes) {
        names.push(key);
    }

    return names;
};

DataController.prototype.getVerboseCrimeName = function (crime) {
    return this.crimeTypes[crime].verboseName;
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


var data = new DataController();


d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/master/data/crimes_with_correct_geoloc.json", function (error, json) {
    if (error) throw error;

    json.forEach(function (d, i) {
        d.month = new Date(d.month.substring(0, 4), d.month.substring(5, 7) - 1, 15);
    });

    data.all = json;
    data.filtered = json;
    data.emit('loadAll');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisIIPreProcessing/master/crimeAggregates.json", function (error, json) {
    if (error) throw error;

    data.crimeAggregates = json;
    data.emit('loadAggregates');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo.json", function(error, json) {//"https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo_oa_ex.json"
    if(error) throw error;
    data.geo = json;
    data.emit('loadGeo');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/crimes_geoloc_agg_ex.json", function(error, json) {//"https://raw.githubusercontent.com/FabianSperrle/InfoVisII/choropleth/geodata/geo_oa_ex.json"
    if(error) throw error;
    data.crimesAggGeo = json;
    data.emit('loadAggregatedCrimesByGeo');
});

data.on('loadAll', data.initializeFilters);
data.on('toggle', data.toggleFilter);
data.on('activateAllCrimes', data.toggleFilterAll);
data.on('dateChange', data.dateChange);
data.on('filtered', data.groupByType);

