function DataController() {
	telegraph(this);
	this.all = {};
	this.filtered = {};
	this.crimeAggregates = {};
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

