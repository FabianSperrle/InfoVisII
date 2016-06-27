var barChart;
var xBar, yBar, xAxisBarChart, yAxisBarChart;

var marginBar = {top: 40, right: 20, bottom: 70, left: 80},
    widthBar = 1000 - marginBar.left - marginBar.right,
    heightBar = 320 - marginBar.top - marginBar.bottom;


var rb_buttons = ["Solved", "In Progress", "Unresolved", "N/A"];
var rb_selection = 0;


function initBarChart(width) {

    if(width==undefined) width = 480;

    xBar = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    yBar = d3.scale.linear()
        .range([heightBar-60, 0]);

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
    d3.select("#barChartG").remove();
    
    barChart = d3.select("#detailPanel")
        .append("svg")
        .attr("id", "barChart")
        .attr("width", width + marginBar.left + marginBar.right)
        .attr("height", heightBar-60 + 189 + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("id", "barChartG")
        .attr("transform", "translate(" + marginBar.left + "," + (marginBar.top-30) + ")");

    var legendX = -40;
    var legendY = 170;
    d3.select("#barChartG")
        .append("rect")
        .attr("x", legendX-20)
        .attr("y", legendY)
        .attr("width", 60)
        .attr("height", 50)
        .attr("fill", "gray")
        .style("opacity",0.3);

    d3.select("#barChartG")
        .append("text")
        .attr("fill", "black")
        .attr("x", legendX+5-20)
        .attr("y", legendY+40)
        .attr("dy", ".35em")
        .text(rb_buttons[rb_selection]);

    d3.select("#barChartG")
        .append("text")
        .attr("fill", "black")
        .attr("x", legendX+2-20)
        .attr("y", legendY+10)
        .attr("dy", ".35em")
        .text("#crimes");

    d3.select("#barChartG")
        .append("rect")
        .attr("x", legendX-20)
        .attr("y", legendY+30)
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "black")
        .style("opacity",0.3);

    
}

var groupedByOutcomePerCrimeType;
function reloadDetailPanel(){

    initBarChart();

    if(data.filtered == []){
        return;
    }

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

            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8);min-width:150px;'><table>";
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

            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8); min-width:150px;'><table>";
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
        .attr("x", widthBar / 2)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var xAx = barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (heightBar-60) + ")")
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
            return heightBar-60 - yBar(d.values);
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


    groupedByOutcomePerCrimeType = d3.nest()
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
                return heightBar-60 - yBar(solved);
            } else if (rb_selection == 1){
                return heightBar-60 - yBar(inprogress);
            } else if(rb_selection == 2){
                return heightBar-60 - yBar(failed);
            } else {
                return heightBar-60 - yBar(na);
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

    if(width==undefined) width = 450;

    yBar = d3.scale.ordinal()
        .rangeRoundBands([0, 300], .1);

    xBar = d3.scale.linear()
        .range([0,width]);

    xAxisBarChart = d3.svg.axis()
        .scale(xBar)
        .orient("bottom");

    yAxisBarChart = d3.svg.axis()
        .scale(yBar)
        .ticks(0)
        .orient("left");

    d3.select("#barChart").remove();
    d3.select("#rb_div").remove();
    d3.selectAll("#back_button").remove();
    d3.selectAll("#singleOutcomesChartMenu").remove();
    
    d3.select("#detailPanel")
        .append("div")
        .style("overflow","none")
        .style("margin-left","15px")
        .attr("id", "singleOutcomesChartMenu")
        .append("div")
        .attr("id", "singleOutcomesChartMenu2")
        .append("button")
        .attr("type","button")
        .attr("class","btn-btn")
        .attr("id","back_button")
        .on("click", function(d){
            d3.selectAll("#singleOutcomesChartMenu").remove();
            reloadDetailPanel();
        })
        .append("div")
        .attr("class","label")
        .text("BACK");

    d3.select("#singleOutcomesChartMenu2")
        .append("text")
        .style("margin-left", "10px")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(currentCrimeType);

    barChart = d3.select("#detailPanel")
        .append("svg")
        .attr("id", "barChart")
        .attr("width", width + marginBar.left + marginBar.right)
        .attr("height", heightBar + 140 + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("id", "barChartG")
        .attr("transform", "translate(" + (marginBar.left+200) + "," + (marginBar.top-30) + ")");


    var legendX = 470;
    var legendY = 250;
    d3.select("#barChart")
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "green")
        .style("opacity",0.8);

    d3.select("#barChart")
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY+20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "orange")
        .style("opacity",0.8);

    d3.select("#barChart")
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY+40)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "red")
        .style("opacity",0.8);

    d3.select("#barChart")
        .append("text")
        .attr("fill", "green")
        .attr("x", legendX+15)
        .attr("y", legendY+5)
        .attr("dy", ".35em")
        .text("Solved");

    d3.select("#barChart")
        .append("text")
        .attr("fill", "orange")
        .attr("x", legendX+15)
        .attr("y", legendY+25)
        .attr("dy", ".35em")
        .text("In Progress");

    d3.select("#barChart")
        .append("text")
        .attr("fill", "red")
        .attr("x", legendX+15)
        .attr("y", legendY+45)
        .attr("dy", ".35em")
        .text("Unresolved");
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
        .entries(filterForCrimeType)
        .sort(function(a, b){ return d3.descending(a.values, b.values); });

    
    var keys = singleOutcomesOfOneCrimeType.map(function(a) { if(a.key != "null") return a.key; });
    keys = keys.filter(function(d) { if(d!=undefined) return true; });

    singleOutcomesOfOneCrimeType = singleOutcomesOfOneCrimeType.filter(function(d) {
       if(d.key != 'null')
            return d; 
        });

    yBar.domain(keys);
    var ymax = d3.max(Object.keys(singleOutcomesOfOneCrimeType).map(function(v){return singleOutcomesOfOneCrimeType[v].values;})); //if(groupedByCrimeType[v].key != "All Crimes") 
    xBar.domain([0,ymax]);

    var yAx = barChart.append("g")
        .attr("class", "y axis")
        .call(yAxisBarChart)
        .attr("x", widthBar / 1.75)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var tip3 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

            var countOutcome;
            for(k in Object.keys(singleOutcomesOfOneCrimeType)){
                if(singleOutcomesOfOneCrimeType[k].key == d.key){
                    countOutcome = singleOutcomesOfOneCrimeType[k].values;
                    continue;
                }
            }

            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8); min-width:150px;'><table>";
            htmlToolTip += " <tr><td><strong><span style='color:red'>"+d.key+"</span></strong></td></tr>";
            htmlToolTip += " <tr><td><span style='color:red'># of crimes with that outcome</span></td></tr>";
            htmlToolTip += " </table>"
            htmlToolTip += " <p style='color:red; text-align: center; width: 100%; height: 10px;'>"+countOutcome+"</p></div>";

            return htmlToolTip;
        });

    svg.call(tip3)


    barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,300)")
        .attr("y", -20)
        .attr("x", 0)
        .call(xAxisBarChart);

    barChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,-10)")
        .attr("y", -10)
        .attr("x", 0)
        .call(xAxisBarChart);

    yAx.selectAll("text")
        .attr("class", function(d){
            if(data.outcomeTypes.solved.list.includes(d)){
                return "label_solved";
            } else if (data.outcomeTypes.na_inprogress.list.includes(d)){
                return "label_running";
            } else if (data.outcomeTypes.failed.list.includes(d)){
                return "label_failed";
            } else {
                return "purple";
            };
        })
        .attr("y", 0)
        .attr("x", -10)
        .attr("dy", ".35em")
        .attr("fill", function(d){
            if(data.outcomeTypes.solved.list.includes(d)){
                return "green";
            } else if (data.outcomeTypes.na_inprogress.list.includes(d)){
                return "orange";
            } else if (data.outcomeTypes.failed.list.includes(d)){
                return "red";
            } else {
                return "purple";
            }
        });


    

    barChart.selectAll(".bar")
        .data(singleOutcomesOfOneCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "bar_"+keys.indexOf(d.key); 
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            0;
        })
        .attr("width", function (d) {
            return xBar(d.values);
        })
        .attr("y", function (d) {
            return yBar(d.key);
        })
        .attr("height", yBar.rangeBand())
        .attr("fill", function (d) {
            return "blue";//data.crimeTypes[data.getCrimeVarName(d.key)].color;
        })
        .style('opacity',0.6)
        .on('mouseover', function(d){
            tip3.show(d);
            d3.select(this).style('opacity',1);
        })
        .on('mouseout', function(d){
            tip3.hide(d);
            d3.select(this).style('opacity',0.6);
        })
        .on('click', function(d){
           // tip3.hide(d);
        });


    groupedByOutcomePerCrimeType = d3.nest()
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


    //PIE CHART
    var aggregatedOutcomeTypes = groupedByOutcomePerCrimeType.filter(function(d) {
        if(d.key == crimeType)
            return d; 
        });

    if(aggregatedOutcomeTypes == []){return;}  
    aggregatedOutcomeTypes = aggregatedOutcomeTypes[0].values; //Object.keys(aggregatedOutcomeTypes).map(function(v){return [aggregatedOutcomeTypes[v].key, aggregatedOutcomeTypes[v].values];})
 
    //var aggregatedOutcomeTypesKeys = Object.keys(aggregatedOutcomeTypes).map(function(v){return aggregatedOutcomeTypes[v].key;});
    //var aggregatedOutcomeTypesValues = Object.keys(aggregatedOutcomeTypes).map(function(v){return aggregatedOutcomeTypes[v].values;});
    aggregatedOutcomeTypes = Object.keys(aggregatedOutcomeTypes).map(function(v){return [aggregatedOutcomeTypes[v].key, aggregatedOutcomeTypes[v].values];});
    var aggregatedOutcomeTypes = aggregatedOutcomeTypes.filter(function(d) {
        if(d[0] != "na")
            return d; 
        });

    test = aggregatedOutcomeTypes;
    
    var width = 100,
        height = 100,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d[1]; });

    var svg2 = d3.select("#barChart")
        .append("g")
        .attr("id", "piechart")
        .attr("transform", "translate(500,200)");

    var g = svg2.selectAll(".arc")
        .data(pie(aggregatedOutcomeTypes))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { 
            switch(d.data[0]){
                case "solved": return "green"; break;
                case "inprogress": return "orange"; break;
                case "failed": return "red"; break;
            }
            return "black"; 
        })
        .style("opacity",0.7)
        .on('mouseover', function(d){
            d3.select(this).style('opacity',1);
            
            if(d.data[0] != "solved") d3.selectAll(".label_solved").style("font-size","7");
            if(d.data[0] != "inprogress") d3.selectAll(".label_running").style("font-size","7");
            if(d.data[0] != "failed") d3.selectAll(".label_failed").style("font-size","7");
            d3.selectAll(".label_"+(d.data[0]=="inprogress"?"running":d.data[0])).style("font-size","12").style("font-weight","bold");

        })
        .on('mouseout', function(d){
            d3.select(this).style('opacity',0.7);
            d3.selectAll(".label_solved").style("font-size","10").style("font-weight","normal");
            d3.selectAll(".label_running").style("font-size","10").style("font-weight","normal");
            d3.selectAll(".label_failed").style("font-size","10").style("font-weight","normal");
            //d3.selectAll(".label_"+(d.data[0]=="inprogress"?"running":d.data[0])).style("font-size","10").style("font-weight","normal");
        });

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
