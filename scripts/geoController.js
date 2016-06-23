// toggleAll button
d3.select("#lsoa_boxes")
    .insert('input', ':first-child')
    .attr("type", "button")
    .attr("name", "toggle")
    .attr("value", "Toggle All")
    .attr("id", "toggleallLSOA")
    .attr("onclick", "toggleAllLSOARegions()");

function toggleAllLSOARegions () {
    let res = data.toggleAllLSOA();
    if (!res)
        data.emit('resetDetailPanel');
    d3.select('#lsoa_boxes').selectAll('input').property('checked', res);
}