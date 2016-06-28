
function setToolTip(elementID, content, textColor) {
    var tooltip = d3.select("#tooltip");
    var mine = d3.select("#" + elementID);
    mine.on("mouseout", function () {
        return tooltip.style("visibility", "hidden");
    });
    mine.on("mousemove", function () {
        tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    });

    mine.on("mouseover", function () {
        tooltip.style("color", textColor);
        tooltip.html(content);
        tooltip.style("visibility", "visible");
    });
}

function initializeCrimeInformationFields(){
    // All Crimes Information
    let index = 0;
    let color = data.crimeTypes[Object.keys(data.crimeTypes)[index]].color;
    let text = "In this category all crime types are aggregated/summed up together to get an overall summary.";
    setToolTip("category_"+index, text, color);
    setToolTip("label_category_"+index, text, color);
}