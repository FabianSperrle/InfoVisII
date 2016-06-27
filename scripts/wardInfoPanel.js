var wardCrimesBarChart;
var xWard, yWard, xAWard, yAWard;

var ch_norm_labels = ["global","selection"];
var choropleth_normalization_status = 0;


var marginWard = {top: 40, right: 20, bottom: 70, left: 80},
    widthWard = 1000 - marginWard.left - marginWard.right,
    heightWard = 260 - marginWard.top - marginWard.bottom;

var lsoaCodes;
var lsoaNames;
var totalCrimesPerWard = [];

function updateSumOfCrimesgWardDetailPanel(ward, values){
    if(totalCrimesPerWard.length < 25) return;
    totalCrimesPerWard[lsoaCodes.indexOf(ward)].values = values;
}

function initAllWardsCrimesBarChart() {

    d3.select("#choropleth_normalization").remove();
    var choropleth_normalization = d3.select("#map_controls")
        .append("div")
        .attr("id","choropleth_normalization")
        .style("float","right")
        .style("width","250px")
        .style("height","20px")
        .style("margin-top", "-20px");
    

    var form = d3.select("#choropleth_normalization")
        .append("form")
        .attr("id","ch_norm_form");

    var labels = form.selectAll("label")
        .data(ch_norm_labels)
        .enter()
        .append("label")
        .style("float", "right")
        .style("font-size","10px")
        .style("margin-left","5px")
        .text(function(d) {return d;})
        .insert("input")
        .attr("id","ch_norm_input")
        .attr({
            type: "radio",
            class: "shape",
            name: "mode",
            value: function(d, i) {return i;}
        })
        .property("checked", function(d, i) {
            return i===choropleth_normalization_status;
        });

    choropleth_normalization.append("text")
        .style("font-size","10px")
        .text("choropleth normalization:");

    d3.selectAll("#ch_norm_input").on('change', function(d){
        choropleth_normalization_status = ch_norm_labels.indexOf(d);
        updateChloroplethLayer();
        redrawCurrentLayer();
    });








    d3.select("#wardHoverPanel").style("visibility","visible").style("display","block");

    if(data.filtered.length==0){
        d3.select("#wardHoverPanel").style("visibility","hidden").style("display","none");
        return;
    }

    if(lsoaCodes == undefined){
        lsoaCodes = [];
        lsoaNames = [];
        for(var i=0; i<25; i++){
            var formx = d3.select("#E05009288")[0][0].form[i].labels[0];
            lsoaNames.push(formx.innerHTML);
            var code = formx.htmlFor;
            lsoaCodes.push(code);

            totalCrimesPerWard.push({ward: code , values: "0"});
        }
    }

    xWard = d3.scale.ordinal()
        .rangeRoundBands([0, 480], .1);

    yWard = d3.scale.linear()
        .range([heightWard, 0]);

    xAWard = d3.svg.axis()
        .scale(xWard)
        .ticks(0)
        .orient("bottom");

    yAWard = d3.svg.axis()
        .scale(yWard)
        .orient("left");

    d3.selectAll("#wardHoverDiv").remove();
    var title = d3.select("#wardHover")
        .append("div")
        .attr("id","wardHoverDiv")
        .append("text")
        .style("font-size","12px")
        .text("Distribution of Total Nr. of Crimes over Districts");

    wardCrimesBarChart = d3.select("#wardHoverDiv")
        .append("svg")
        .attr("id", "wardCrimesBarChart")
        .attr("width", 480 + marginWard.left + marginWard.right)
        .attr("height", heightWard + 100 + marginWard.top + marginWard.bottom)
        .append("g")
        .attr("id", "wardCrimesBarChartSub")
        .attr("transform", "translate(" + marginWard.left + "," + (marginWard.top-30) + ")");
    

    var xDomain = [];
    var xDomainCodes = [];
    for (var k in Object.keys(data.lsoa_codes)) {
        var ward = Object.keys(data.lsoa_codes)[k];
        if(data.lsoa_codes[ward]){
            xDomain.push(lsoaNames[lsoaCodes.indexOf(ward)]);
            xDomainCodes.push(ward);
        }
    };

    var filteredTotalCrimesPerWard = totalCrimesPerWard.filter(function(d) {
        if(xDomainCodes.indexOf(d.ward)>-1)
            return d; 
    })
    .sort(function(a, b){ return d3.ascending(a.values, b.values); });


    var xDomainSorted =[];
    for (var i = filteredTotalCrimesPerWard.length - 1; i >= 0; i--) {
        xDomainSorted.push(lsoaNames[lsoaCodes.indexOf(filteredTotalCrimesPerWard[Object.keys(filteredTotalCrimesPerWard)[i]].ward)]);
    };
        
    
    xWard.domain(xDomainSorted);

    var ymax = d3.max(Object.keys(totalCrimesPerWard).map(function(v){if(xDomain.indexOf(lsoaNames[v])>-1){return totalCrimesPerWard[v].values;}})); //if(groupedByCrimeType[v].key != "All Crimes") 
    yWard.domain([0,ymax]);

    wardCrimesBarChart.append("g")
        .attr("class", "y axis")
        .call(yAWard)
        .attr("x", widthWard / 2)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var xAx = wardCrimesBarChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightWard + ")")
        .call(xAWard);

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


    var tip4 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            var htmlToolTip  = "<div style='border: 1px solid gray; background-color:#fff; background-color: rgba(255,255,255,0.8);min-width:150px;'><table>";
            htmlToolTip += " <tr><td><strong><span style='color:red'>"+lsoaNames[lsoaCodes.indexOf(d.ward)]+"</span></strong></td></tr>";
            htmlToolTip += " <tr><td><span style='color:red'># of crimes in "+lsoaNames[lsoaCodes.indexOf(d.ward)]+"</span></td></tr>";
            htmlToolTip += " </table>"
            htmlToolTip += " <p style='color:red; text-align: center; width: 100%; height: 10px;'>"+d.values+"</p></div>";
            return htmlToolTip;
        });

    svg.call(tip4)



    wardCrimesBarChart.selectAll(".bar")
        .data(filteredTotalCrimesPerWard)
        .enter().append("rect")
        .attr("id", function (d) {
            return "bar_"+d.ward;
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return xWard(xDomain[xDomain.indexOf(lsoaNames[lsoaCodes.indexOf(d.ward)])]);
        })
        .attr("width",  xWard.rangeBand())
        .attr("y", function (d) {
            return yWard(d.values);
        })
        .attr("height", function (d) {
            return heightWard - yWard(d.values);
        })
        .attr("fill", "orange")
        .style('opacity',0.6)
        .on('mouseover', function(d){
            tip4.show(d);
            d3.select(this).style('opacity',1);
            highlightWardOnMap(d);
        })
        .on('mouseout', function(d){
            tip4.hide(d);
            d3.select(this).style('opacity',0.6);
            resetWardHighlightOnMap(d);
        })
        .on('click', function(d){
           // tip3.hide(d);
        });
}

function highlightWardOnMap(d){
    d3.select(".choropleth_ward_"+d.ward).attr("stroke-width",5);
    d3.select(".choropleth_ward_"+d.ward).attr("fill-opacity",0.5);
}
function resetWardHighlightOnMap(d){
    d3.select(".choropleth_ward_"+d.ward).attr("stroke-width",2);
    d3.select(".choropleth_ward_"+d.ward).attr("fill-opacity",0.7);
}

var ttt;
function initSingleWardCrimesBarChart (district) {

    xWard = d3.scale.ordinal()
        .rangeRoundBands([0, 480], .1);

    yWard = d3.scale.linear()
        .range([heightWard, 0]);

    xAWard = d3.svg.axis()
        .scale(xWard)
        .ticks(0)
        .orient("bottom");

    yAWard = d3.svg.axis()
        .scale(yWard)
        .orient("left");

    d3.selectAll("#wardHoverDiv").remove();
    var title = d3.select("#wardHover")
        .append("div")
        .attr("id","wardHoverDiv")
        .append("text")
        .style("font-size","12px")
        .text("Crimes in "+district.properties.WD13NM);

    wardCrimesBarChart = d3.select("#wardHoverDiv")
        .append("svg")
        .attr("id", "wardCrimesBarChart")
        .attr("width", 480 + marginWard.left + marginWard.right)
        .attr("height", heightWard + 100 + marginWard.top + marginWard.bottom)
        .append("g")
        .attr("id", "wardCrimesBarChartSub")
        .attr("transform", "translate(" + marginWard.left + "," + (marginWard.top-30) + ")");
    


    var xDomain = [];
    var actualXDomain = [];
    for (var i = 0; i < data.getCrimeTypes().length; i++) {
        if(data.crimeTypes[data.getCrimeTypes()[i]].visibility == 1 || data.crimeTypes[data.getCrimeTypes()[0]].visibility == 1){
            //if(data.crimeTypes[data.getCrimeTypes()[i]].verboseName != "All Crimes")
                xDomain.push(data.crimeTypes[data.getCrimeTypes()[i]].verboseName);
                if(data.crimeTypes[data.getCrimeTypes()[i]].visibility == 1){
                    actualXDomain.push(data.crimeTypes[data.getCrimeTypes()[i]].verboseName);
                }
        }
    };
    
    var numberCrimesPerType = [];
    for (var i = xDomain.length - 1; i >= 0; i--) {
        numberCrimesPerType.push(0);
    };

    var districtContainer = data.crimesAggGeo[district.id];
    var months = d3.time.months(data.dates.from, data.dates.to);
    months = months.map(function (d) {
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-01";
    });


    for (var i = 0; i < months.length; i++) {
        var a = districtContainer[months[i]];
        if (a == undefined) {
            continue;
        }
        for (var j = 0; j < xDomain.length; j++) {
            var count = a[xDomain[j]];
            if (count != undefined) {
                numberCrimesPerType[j] += +count;
            }
        }
    }

    var groupedByCrimeType = [];
    for (var i=0; i<numberCrimesPerType.length; i++) {
        if(actualXDomain.indexOf(xDomain[i])>-1)
            groupedByCrimeType.push({key: xDomain[i] , values: numberCrimesPerType[i]});
    };
    
    
    if(data.crimeTypes["allCrimes"].visibility == 1){
        var sum = d3.sum(numberCrimesPerType);
        groupedByCrimeType.push({key: "All Crimes", values: sum});
        yWard.domain([0,sum]);
    } else {
        yWard.domain([0,d3.max(numberCrimesPerType)]);
    }

    groupedByCrimeType = d3.nest()
        .entries(groupedByCrimeType)
        .sort(function(a, b){ return d3.ascending(a.values, b.values); });

   
    var xDomainSorted =[];
    for (var i = groupedByCrimeType.length - 1; i >= 0; i--) {
        if(actualXDomain.indexOf(groupedByCrimeType[i].key)>-1)
            xDomainSorted.push(groupedByCrimeType[i].key);
    };
    xWard.domain(xDomainSorted);

    wardCrimesBarChart.append("g")
        .attr("class", "y axis")
        .call(yAWard)
        .attr("x", widthBar / 2)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    var xAx = wardCrimesBarChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightWard + ")")
        .call(xAWard);

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

    abcdef = groupedByCrimeType;
    var sumValues = 0;
    for(var i = 0; i< groupedByCrimeType.length; i++){
        sumValues += groupedByCrimeType[i].values;
    }

    if(sumValues==0){
        d3.select("#nodataselected").remove();
        wardCrimesBarChart.append("text").attr("transform", "translate(100,50)").text("None of the selected crimes was registed in this ward!");
        return;
    }

    wardCrimesBarChart.selectAll(".bar")
        .data(groupedByCrimeType)
        .enter().append("rect")
        .attr("id", function (d) {
            return "barWard_"+data.getCrimeVarName(d.key);
        })
        .attr("class", "bar")
        .attr("x", function (d) {
            return xWard(d.key);
        })
        .attr("width",  xWard.rangeBand())
        .attr("y", function (d) {
            return yWard(d.values);
        })
        .attr("height", function (d) {
            return heightWard - yWard(d.values);
        })
        .attr("fill", function (d) {
            return data.crimeTypes[data.getCrimeVarName(d.key)].color;
        })
        .style('opacity',0.6);
}

