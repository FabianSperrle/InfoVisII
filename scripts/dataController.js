function DataController() {
	telegraph(this);
	this.all = {};
	this.crimes = {};
	this.crimesByType = {};
	this.filtered = {};
	this.crimeAggregates = {};

	this.crimeTypes = {
		allCrimes: {
			visibility: 1,
			verboseName: ''
		},
		violence_and_sex: {
			visibility: 0,
			verboseName: 'Violence and sexual offences'
		},
		other_theft: {
			visibility: 1,
			verboseName: 'Other theft'
		},
		burglary: {
			visibility: 0,
			verboseName: 'Burglary'
		},
		violent_crime: {
			visibility: 0,
			verboseName: 'Violent crime'
		},
		bicycle_theft: {
			visibility: 0,
			verboseName: 'Bicycle theft'
		},
		anti_social_behaviour: {
			visibility: 0,
			verboseName: 'Anti-social behaviour'
		},
		other_crime: {
			visibility: 0,
			verboseName: 'Other crime'
		},
		shoplifting: {
			visibility: 0,
			verboseName: 'Shoplifting'
		},
		drugs: {
			visibility: 0,
			verboseName: 'Drugs'
		},
		criminal_damage_and_arson: {
			visibility: 0,
			verboseName: 'Criminal damage and arson'
		},
		vehicle_crime: {
			visibility: 0,
			verboseName: 'Vehicle crime'
		},
		theft_from_the_person: {
			visibility: 0,
			verboseName: 'Theft from the person'
		},
		public_disorder_weapons: {
			visibility: 0,
			verboseName: 'Public disorder and weapons'
		},
		public_order: {
			visibility: 0,
			verboseName: 'Public order'
		},
		robbery: {
			visibility: 0,
			verboseName: 'Robbery'
		},
		possesion_of_weapons: {
			visibility: 0,
			verboseName: 'Possession of weapons'
		},
	};
	this.visibleVerboseCrimeTypes = ["Other theft"];
}

DataController.prototype.initializeFilters = function() {
	this.crimes = crossfilter(this.all);
	this.crimesByType = this.crimes.dimension(function(d) {
		return d.crimetype;
	});
	this.filtered = this.crimesByType.filterAll().top(Infinity);
	this.visibleVerboseCrimeTypes = ["Violence and sexual offences", "Other theft", "Burglary", "Violent crime", "Bicycle theft", "Anti-social behaviour", "Other crime", "Shoplifting", "Drugs", "Criminal damage and arson", "Vehicle  crime", "Theft from the person", "Public disorder and weapons", "Public order", "Robbery", "Possession of weapons"]

	data.emit('filtered');
};

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

data.on('loadAll', data.initializeFilters);
data.on('toggle', data.toggleFilter);