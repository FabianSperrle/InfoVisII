function DataController() {
	telegraph(this);
	this.all = {};
	this.crimes = {};
	this.crimesByType = {};
	this.filtered = {};
	this.crimeAggregates = {};
    this.geo = {};
    this.crimesAggGeo = {};

	this.crimeTypes = {
		allCrimes: {
			visibility: 1,
			verboseName: 'All Crimes',
			color: 'red',
		},
		violence_and_sex: {
			visibility: 0,
			verboseName: 'Violence and sexual offences',
			color: 'aqua',
		},
		other_theft: {
			visibility: 1,
			verboseName: 'Other theft',
			color: 'blue',
		},
		burglary: {
			visibility: 0,
			verboseName: 'Burglary',
			color: 'fuchsia',
		},
		violent_crime: {
			visibility: 0,
			verboseName: 'Violent crime',
			color: 'gray',
		},
		bicycle_theft: {
			visibility: 0,
			verboseName: 'Bicycle theft',
			color: 'green',
		},
		anti_social_behaviour: {
			visibility: 0,
			verboseName: 'Anti-social behaviour',
			color: 'lime',
		},
		other_crime: {
			visibility: 0,
			verboseName: 'Other crime',
			color: 'maroon',
		},
		shoplifting: {
			visibility: 0,
			verboseName: 'Shoplifting',
			color: 'darkorange',
		},
		drugs: {
			visibility: 0,
			verboseName: 'Drugs',
			color: 'olive',
		},
		criminal_damage_and_arson: {
			visibility: 0,
			verboseName: 'Criminal damage and arson',
			color: 'silver',
		},
		vehicle_crime: {
			visibility: 0,
			verboseName: 'Vehicle crime',
			color: 'darkolivegreen',
		},
		theft_from_the_person: {
			visibility: 0,
			verboseName: 'Theft from the person',
			color: 'blueviolet',
		},
		public_disorder_weapons: {
			visibility: 0,
			verboseName: 'Public disorder and weapons',
			color: 'burlywood',
		},
		public_order: {
			visibility: 0,
			verboseName: 'Public order',
			color: 'darkcyan',
		},
		robbery: {
			visibility: 0,
			verboseName: 'Robbery',
			color: 'chocolate',
		},
		possesion_of_weapons: {
			visibility: 0,
			verboseName: 'Possession of weapons',
			color: 'darkgoldenrod',
		},
	};
	this.visibleVerboseCrimeTypes = ["Other theft"];
}

/**
 * Initializes the filters by setting everything to visible.
 * @return {[type]}
 */
DataController.prototype.initializeFilters = function() {
	this.crimes = crossfilter(this.all);
	this.crimesByType = this.crimes.dimension(function(d) {
		return d.crimetype;
	});
	this.filtered = this.crimesByType.filterAll().top(Infinity);
	this.visibleVerboseCrimeTypes = ["Violence and sexual offences", "Other theft", "Burglary", "Violent crime", "Bicycle theft", "Anti-social behaviour", "Other crime", "Shoplifting", "Drugs", "Criminal damage and arson", "Vehicle  crime", "Theft from the person", "Public disorder and weapons", "Public order", "Robbery", "Possession of weapons"];

	data.emit('filtered');
};

/**
 * Changes the visibility of a given crime type. 
 * @param  {string} The crime type to change
 * @return {[type]}
 */
DataController.prototype.toggleVisibilityFlag = function(type) {
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

DataController.prototype.toggleFilter = function(type) {
	this.toggleVisibilityFlag(type);

	// Apply all filters
	this.filtered = this.crimesByType.filter(function(d) {
		if (data.visibleVerboseCrimeTypes.indexOf(d) >= 0)
			return true;
		return false;
	}).top(Infinity);

	data.emit('filtered');
};

DataController.prototype.mapFilterKeyword = function(key) {
	return this.CrimeTypes[key].verboseName;
};

DataController.prototype.getCrimeTypes = function() {
	var names = [];
	for (var key in this.crimeTypes)  {
		names.push(key);
	}

	return names;
}

DataController.prototype.getVerboseCrimeName = function(crime) {
	return this.crimeTypes[crime].verboseName;
}

DataController.prototype.getCrimeColor = function(crime) {
	return this.crimeTypes[crime].color;
}

var data = new DataController();


d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisIIPreProcessing/master/DataComplete/crimes.json", function(error, json) {
	if (error) throw error;

	data.all = json;
	data.filtered = json;
	data.emit('loadAll');
});

d3.json("https://raw.githubusercontent.com/FabianSperrle/InfoVisIIPreProcessing/master/crimeAggregates.json", function(error, json) {
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