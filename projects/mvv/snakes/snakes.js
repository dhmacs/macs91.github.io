/**
 * @author Massimo De Marchi
 * @created 4/19/15.
 */

var svg = d3.select(".vis-block");

//console.log(svg.node().clientWidth);

var size = {
    width: svg.node().clientWidth,
    height: svg.node().clientHeight
};

svg.append("rect")
    .attr("width", size.width)
    .attr("height", size.height)
    .style("fill", "#111");


var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");


var stopsNumber = 20;
var snakesNumber = 1;
var snakes = [];
var colors = ["#e74c3c", "#2ecc71", "#f1c40f"];

for(var i = 0; i < snakesNumber; i++) {
    var stops = [];
    for(var j = 0; j < stopsNumber; j++) {
        stops.push({
            x: Math.random() * size.width,
            y: Math.random() * size.height,
            t: 0
        });
    }

    snakes.push({
        color: colors[i],
        stops: stops
    });
}

var time = 0;
var duration = stopsNumber;
function update() {

    time = (time +1) % duration;
}

function draw() {
    var trails = svg.selectAll(".trail").data(snakes);

    trails.enter()
        .append("path")
        .style("stroke", function(d) {
            return d.color;
        })
        .style("fill", "none")
        .attr("d", function(d) {
           return lineFunction(d.stops);
        });
}

draw();
