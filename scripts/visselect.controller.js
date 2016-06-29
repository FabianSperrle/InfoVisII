/*var sel = document.getElementById('vis_select');
sel.onchange = function () {
    console.log("Selected value is " + sel.value);
    for (var i = content.length - 1; i > 0; i--) {
        content[i].style.display = 'none';
        content[i].style.visibility = 'hidden';
    }
    content[sel.value].style.display = 'block';
    content[sel.value].style.visibility = 'visible';
    map.invalidateSize();
};*/

var content = document.getElementById('content_left').children;
var selects = document.getElementById('vis_select_div').children;
let selectVis = function(item) {
    let newTab = document.getElementById(item);
    let newVis = newTab.getAttribute('data-id');
    for (var i = content.length - 1; i > 0; i--) {
        content[i].style.display = 'none';
        content[i].style.visibility = 'hidden';
        selects[i].style.backgroundColor = 'transparent';
    }
    content[newVis].style.display = 'block';
    content[newVis].style.visibility = 'visible';
    newTab.style.backgroundColor = '#c8c8c8';
    map.invalidateSize();
};
