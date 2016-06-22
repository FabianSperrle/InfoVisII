var barChart;
var xBar, yBar, xAxisBarChart, yAxisBarChart;

var marginBar = {top: 40, right: 20, bottom: 70, left: 80},
    widthBar = 1000 - marginBar.left - marginBar.right,
    heightBar = 300 - marginBar.top - marginBar.bottom;


var rb_buttons = ["solved", "running", "failed", "N/A"];
var rb_selection = 0;


function initBarChart(width) {

    if(width==undefined) width = 300;

    xBar = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    yBar = d3.scale.linear()
        .range([heightBar, 0]);

    xAxisBarChart = d3.svg.axis()
        .scale(xBar)
        .ticks(0)
        .orient("bottom");

    yAxisBarChart = d3.svg.axis()
        .scale(yBar)
        .orient("left");


    d3.select("#rb_div").remove();
    var form = d3.select("#detailPanel")
        .append("div")
        .attr("id","rb_div")
        .style("margin-left", "20px")
        .append("text")
        .style("font-size","12px")
        .text("Outcome-Type:")
        .append("form")
        .attr("id","rb_form");

    var labels = form.selectAll("label")
        .data(rb_buttons)
        .enter()
        .append("label")
        .style("padding", "5px")
        .text(function(d) {return d;})
        .insert("input")
        .attr("id","rb_input")
        .attr({
            type: "radio",
            class: "shape",
            name: "mode",
            value: function(d, i) {return i;}
        })
        .property("checked", function(d, i) {
            return i===rb_selection;
        });

    d3.selectAll("#rb_input").on('change', function(d){
        rb_selection = rb_buttons.indexOf(d);
        reloadDetailPanel();
    });



    d3.select("#barChart").remove();
    
    barChart = d3.select("#detailPanel")
        .append("svg")
        .attr("id", "barChart")
        .attr("width", width + marginBar.left + marginBar.right)
        .attr("height", heightBar + 100 + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("id", "barChartG")
        .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");

    var legendX = -40;
    var legendY = 200;
    d3.select("#barChartG")
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 50)
        .attr("fill", "gray")
        .style("opacity",0.3);

    d3.select("#barChartG")
        .append("text")
        .attr("fill", "black")
        .attr("x", legendX+5)
        .attr("y", legendY+40)
        .attr("dy", ".35em")
        .text(rb_buttons[rb_selection]);

    d3.select("#barChartG")
        .append("text")
        .attr("fill", "black")
        .attr("x", legendX+2)
        .attr("y", legendY+10)
        .attr("dy", ".35em")
        .text("#crimes");

    d3.select("#barChartG")
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY+30)
        .attr("width", 40)
        .attr("height", 20)
        .attr("fill", "black")
        .style("opacity",0.3);

    
}


function reloadDetailPanel(){

    if(data.filtered == []){
        resetDetailPanel();
        return;
    }

    initBarChart();


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            var dat = d3.select("#subbar_"+data.getCrimeVarName(d.key)).data()[0].values;

            var solved = 0, inprogress = 0, failed = 0, na = 0;
            for(index in Object.keys(dat)){
                switch(dat[index].key){
                    case "solved": solved=dat[index].values; break;
                    case "inprogress": inprogress=dat[index].values; break;
                    case "failed": failed=dat[index].values; break;
                    default: na=dat[index].values; break;
                }
            }

            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8);'><table>";
            htmlToolTip += " <tr><td><strong><span style='color:red'>"+d.key+"</span></strong></td></tr>";
            htmlToolTip += " <tr><td><span style='color:red'>total # of crimes</span></td></tr>";
            htmlToolTip += " <tr><td><strong>total crimes:</strong></td><td><span style='color:red'>"+d.values+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>total solved:</strong></td><td><span style='color:red'>"+solved+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>in progress:</strong></td><td><span style='color:red'>"+inprogress+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>case droped:</strong></td><td><span style='color:red'>"+failed+"</span></td></tr>";
            htmlToolTip += " </table></div>";

            return htmlToolTip;

        })

    var tip2 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            
            var dat = d3.select("#subbar_"+data.getCrimeVarName(d.key)).data()[0].values;
            var solved = 0, inprogress = 0, failed = 0, na = 0;
            for(index in Object.keys(dat)){
                switch(dat[index].key){
                    case "solved": solved=dat[index].values; break;
                    case "inprogress": inprogress=dat[index].values; break;
                    case "failed": failed=dat[index].values; break;
                    default: na=dat[index].values; break;
                }
            }

            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8);'><table>";
            htmlToolTip += " <tr><td><strong><span style='color:red'>"+d.key+"</span></strong></td></tr>";
            htmlToolTip += " <tr><td><span style='color:red'># of "+rb_buttons[rb_selection]+" investigations</span></td></tr>";
            htmlToolTip += " <tr><td><strong>total crimes:</strong></td><td><span style='color:red'>"+d3.select("#bar_"+data.getCrimeVarName(d.key)).data()[0].values+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>total solved:</strong></td><td><span style='color:red'>"+solved+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>in progress:</strong></td><td><span style='color:red'>"+inprogress+"</span></td></tr>";
            htmlToolTip += " <tr><td><strong>case droped:</strong></td><td><span style='color:red'>"+failed+"</span></td></tr>";
            htmlToolTip += " </table></div>";

            return htmlToolTip;

        })


    var xDomain = [];
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if(data.crimeTypes[data.getCrimeTypes()[i]].visibility == 1 || data.crimeTypes[data.getCrimeTypes()[0]].visibility == 1){
            //if(data.crimeTypes[data.getCrimeTypes()[i]].verboseName != "All Crimes")
                xDomain.push(data.crimeTypes[data.getCrimeTypes()[i]].verboseName);
        }
    };

    var groupedByCrimeType = d3.nest().key(function (d) {
            return d.crime_type;
        }).sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(data.filtered);

    if(data.crimeTypes["allCrimes"].visibility == 1){
        groupedByCrimeType.push({key: "All Crimes", values: d3.sum(Object.keys(groupedByCrimeType).map(function(v){return groupedByCrimeType[v].values;}))});
    }

    xBar.domain(xDomain);
    var ymax = d3.max(Object.keys(groupedByCrimeType).map(function(v){return groupedByCrimeType[v].values;})); //if(groupedByCrimeType[v].key != "All Crimes") 
    yBar.domain([0,ymax]);

    barChart.append("g")
        .attr("class", "y axis")
        .call(yAxisBarChart)
        .append("text")
        .attr("x", widthBar / 1.75)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Distribution - Crime Types");

    var xAx = barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightBar + ")")
        .call(xAxisBarChart);

    xAx.selectAll("text")
        .attr("id", function(d){
            return "label_" + d.replace(/ /g, "");
        })
        .attr("y", 0)
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("fill", "black")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
        // .on("mouseover", function(d){
        //    colorBarHighlight(d,"blue");
        //})
        //.on("mouseout", function(d){
        //    colorBarHighlight(d,"red");
        //});
    svg.call(tip);

    barChart.selectAll(".bar")
        .data(groupedByCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "bar_"+data.getCrimeVarName(d.key);
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return xBar(d.key);
        })
        .attr("width",  xBar.rangeBand())
        .attr("y", function (d) {
            return yBar(d.values);
        })
        .attr("height", function (d) {
            return heightBar - yBar(d.values);
        })
        .attr("fill", function (d) {
            return data.crimeTypes[data.getCrimeVarName(d.key)].color;
        })
        .style('opacity',0.6)
        .on('mouseover', function(d){
            tip.show(d);
            d3.select(this).style('opacity',1);
        })
        .on('mouseout', function(d){
            tip.hide(d);
            d3.select(this).style('opacity',0.6);
        })
        .on('click', function(d){
            tip.hide(d);
            loadSingleOutcomesChart(d.key);
        });


    var groupedByOutcomePerCrimeType = d3.nest()
        .key(function (d) {
            return d.crime_type;
        })
        .key(function (d) {
            if(data.outcomeTypes.solved.list.includes(d.last_outcome)){ 
                return "solved"; 
            } else if (data.outcomeTypes.na_inprogress.list.includes(d.last_outcome)){
                return "inprogress";
            } else if (data.outcomeTypes.failed.list.includes(d.last_outcome)){
                return "failed";
            } else{
                return "na";
            }
        })
        .sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(data.filtered);



    var AllCrimesGrouped = d3.nest()
        .key(function (d) {
            return d.crime_type;
        })
        .sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(groupedByOutcomePerCrimeType);


    if(data.crimeTypes["allCrimes"].visibility == 1){
        var solved = 0, inprogress = 0, failed = 0, na = 0;
        for(var i=0; i<groupedByOutcomePerCrimeType.length; i++){
        var obj = groupedByOutcomePerCrimeType[i];
            for(index in Object.keys(obj.values)){
                switch(obj.values[index].key){
                    case "solved": solved+=obj.values[index].values; break;
                    case "inprogress": inprogress+=obj.values[index].values; break;
                    case "failed": failed+=obj.values[index].values; break;
                    default: na+=obj.values[index].values; break;
                }
            }
        }
        groupedByOutcomePerCrimeType.push({key: "All Crimes", values: [{key: "solved", values: solved},{key: "inprogress", values: inprogress},{key: "failed", values: failed},{key: "na", values: na}]})
    }
 
    svg.call(tip2);

    barChart.selectAll(".subbar")
        .data(groupedByOutcomePerCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "subbar_"+data.getCrimeVarName(d.key);
        })
        .attr("class", "subbar")
        .attr("x", function (d) {
            return xBar(d.key);
        })
        .attr("width",  xBar.rangeBand())
        .attr("y", function (d) {
            var solved = 0, inprogress = 0, failed = 0, na = 0;
            for(index in Object.keys(d.values)){
                switch(d.values[index].key){
                    case "solved": solved=d.values[index].values; break;
                    case "inprogress": inprogress=d.values[index].values; break;
                    case "failed": failed=d.values[index].values; break;
                    default: na=d.values[index].values; break;
                }
            }
            if(rb_selection==0){
                return yBar(solved);
            } else if (rb_selection == 1){
                return yBar(inprogress);
            } else if(rb_selection == 2){
                return yBar(failed);
            } else {
                return yBar(na);
            }
        })
        .attr("height", function (d) {
            var solved = 0, inprogress = 0, failed = 0, na = 0;
            for(index in Object.keys(d.values)){
                switch(d.values[index].key){
                    case "solved": solved=d.values[index].values; break;
                    case "inprogress": inprogress=d.values[index].values; break;
                    case "failed": failed=d.values[index].values; break;
                    default: na=d.values[index].values; break;
                }
            }
            if(rb_selection==0){
                return heightBar - yBar(solved);
            } else if (rb_selection == 1){
                return heightBar - yBar(inprogress);
            } else if(rb_selection == 2){
                return heightBar - yBar(failed);
            } else {
                return heightBar - yBar(na);
            }
            
        })
        .attr("fill", function (d) {
            return "black";//data.crimeTypes[data.getCrimeVarName(d.key)].color;
        })                               
        .style('opacity',0.4)
        .on('mouseover', function(d){
            tip2.show(d);
            d3.select(this).style('opacity',1);
        })
        .on('mouseout', function(d){
            tip2.hide(d);
            d3.select(this).style('opacity',0.6);
        })
        .on('click', function(d){
            tip2.hide(d);
            loadSingleOutcomesChart(d.key);
        });
    
        //.on("mouseover", function (d) {
         //   colorBarHighlight(d[0] + "-" + d[1],"blue");
        //})
        //.on("mouseout", function (d) {
        //    colorBarHighlight(d[0] + "-" + d[1],"red");
        //});
}


function initSingleOutcomesChart(width) {

    if(width==undefined) width = 300;

    xBar = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    yBar = d3.scale.linear()
        .range([heightBar, 0]);

    xAxisBarChart = d3.svg.axis()
        .scale(xBar)
        .ticks(0)
        .orient("bottom");

    yAxisBarChart = d3.svg.axis()
        .scale(yBar)
        .orient("left");

    d3.select("#barChart").remove();
    d3.select("#rb_div").remove();
    d3.selectAll("#back_button").remove();
    
    d3.select("#detailPanel")
        .append("div")
        .style("margin-left","15px")
        .attr("id", "singleOutcomesChartMenu")
        .append("div")
        .style("text-align","center")
        .style("margin-left", "-140px")
        .append("h2")
        .append("text")
        .text(currentCrimeType);

    d3.select("#singleOutcomesChartMenu")
        .append("div")
        .append("button")
        .attr("type","button")
        .attr("class","btn-btn")
        .attr("id","back_button")
        .append("div")
        .attr("class","label")
        .text("BACK")
        .on("click", function(d){
            d3.selectAll("#singleOutcomesChartMenu").remove();
            reloadDetailPanel();
        });

    barChart = d3.select("#detailPanel")
        .append("svg")
        .attr("id", "barChart")
        .attr("width", width + marginBar.left + marginBar.right)
        .attr("height", heightBar + 150 + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("id", "barChartG")
        .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");
}

var test;
var currentCrimeType;
function loadSingleOutcomesChart(crimeType){
    if(crimeType == undefined){
        crimeType = currentCrimeType;
    } else {
        currentCrimeType = crimeType;
    }
    if(crimeType == undefined) return;
    
    initSingleOutcomesChart();

    var filterForCrimeType = data.filtered.filter(function(d) {
       if(crimeType=="All Crimes" || d.crime_type == crimeType)
       return d; 
    });

    var singleOutcomesOfOneCrimeType = d3.nest()
        .key(function (d) {
            return d.last_outcome;
        })
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(data.filtered)
        .sort(function(a, b){ return d3.descending(a.values, b.values); });

    
    var keys = singleOutcomesOfOneCrimeType.map(function(a) { if(a.key != "null") return a.key; });
    keys = keys.filter(function(d) { if(d!=undefined) return true; });

    singleOutcomesOfOneCrimeType = singleOutcomesOfOneCrimeType.filter(function(d) {
       if(d.key != 'null')
            return d; 
        });

    test = singleOutcomesOfOneCrimeType;
    
    xBar.domain(keys);
    var ymax = d3.max(Object.keys(singleOutcomesOfOneCrimeType).map(function(v){return singleOutcomesOfOneCrimeType[v].values;})); //if(groupedByCrimeType[v].key != "All Crimes") 
    yBar.domain([0,ymax]);

    barChart.append("g")
        .attr("class", "y axis")
        .call(yAxisBarChart)
        .append("text")
        .attr("x", widthBar / 1.75)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Distribution - Crime Types");

    var xAx = barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightBar + ")")
        .call(xAxisBarChart);

    xAx.selectAll("text")
        .attr("id", function(d){
            return "label_" + d.replace(/ /g, "");
        })
        .attr("y", 0)
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("fill", "black")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");



    barChart.selectAll(".bar")
        .data(singleOutcomesOfOneCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "bar_"+keys.indexOf(d.key); 
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return xBar(d.key);
        })
        .attr("width", xBar.rangeBand())
        .attr("y", function (d) {
            return yBar(d.values);
        })
        .attr("height", function (d) {
            return heightBar - yBar(d.values);
        })
        .attr("fill", function (d) {
            return "blue";//data.crimeTypes[data.getCrimeVarName(d.key)].color;
        })
        .style('opacity',0.6);
        /*.on('mouseover', function(d){
            tip.show(d);
            d3.select(this).style('opacity',1);
        })
        .on('mouseout', function(d){
            tip.hide(d);
            d3.select(this).style('opacity',0.6);
        })
        .on('click', function(d){
            tip.hide(d);
            loadSingleOutcomesChart(d.key);
        });*/


}



function refresh(){
    if(d3.select("#singleOutcomesChartMenu")[0][0] == null){
        reloadDetailPanel();
    } else {
        loadSingleOutcomesChart();
    }
}


data.on('loadAggregates', initBarChart);
data.on('filtered', refresh);
data.on('resetDetailPanel', initBarChart);
