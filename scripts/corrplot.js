
var Order = Corrplot.Order,
    orders = {},
    Shape = Corrplot.Shape,
    shapes = {
        'square': function (d, width) {
            return Shape.Square(width);
        },
        'scaled-square': function (d, width) {
            return Shape.Square(width * Math.abs(d.z));
        },
        'circle': function (d, width) {
            return Shape.Circle(width / 2);
        },
        'scaled-circle': function (d, width) {
            return Shape.Circle(width * Math.abs(d.z) / 2);
        },
        'ellipse': function (d, width) {
            return Shape.Ellipse(d.z, width);
        }
    };

/*
 *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
 */
function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;

    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        //console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        //console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;

    return answer;
}

function calculateCorrelationMatrix() {
    if(data.filtered.length == 0){
        return;
    }

    var groupData = data.groupedByType;
    if (groupData == []) {
        return;
    }
    groupData.forEach(function(d) {
        var v = d.values.map(function(e) {return e.values});
        d.values = v;
    });
    
    var results = new Array(groupData.length);
    for (var i = 0; i < groupData.length; i++) {
        results[i] = new Array(groupData.length);
    }
    
    for (var i = 0; i < groupData.length; i++) {
        for (var j = 0; j <= i; j++) {
            if (i == j) {
                results[i][j] = 1;
                continue;
            }
            var r = getPearsonCorrelation(groupData[i].values, groupData[j].values);
            results[i][j] = r;
            results[j][i] = r;
        }
    }

    var nodes = groupData.map(function (d) {
        return {'name': d.key}
    });
    
    load(results, nodes);
}

var vis = d3.select('#corrplot').append('svg');
/* Initialize tooltip */
tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
    return d.z;
});
vis.call(tip);
/* Invoke the tip in the context of your visualization */
var corrplot = vis
    .chart('corrplot')
    .duration(1000)
    .mouseover(tip.show)
    .mouseout(tip.hide);

d3.select("#order").on("change", function () {
    corrplot.order(orders[this.value]);
});

d3.select("#shape").on("change", function () {
    corrplot.shape(shapes[this.value]);
});

function load(matrix, nodes) {
    // Precompute the orders.
    orders = {
        original: Order.Original(nodes),
        name: Order.Alphabetical(nodes, function (d) {
            return d.name;
        }),
        aoe: Order.AOE(matrix),
        fpc: Order.FPC(matrix)
    };

    corrplot.drawAndSave({'nodes': nodes, 'matrix': matrix})
        .order(orders[d3.select('#order').node().value])
        .shape(shapes[d3.select('#shape').node().value]);
}

data.on('filtered', calculateCorrelationMatrix);
