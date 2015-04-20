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

var stopsNumber = 50;
var snakesNumber = 3;
var snakes = [];


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
        color: "#fff",
        stops: stops
    });
}

var time = 0;
var duration = n;
function update() {

    time = (time +1) % duration;
}

function draw() {
    var trails = svg.selectAll(".trail").data(snakes);

    trails.enter()
        .append("path")
        .attr("d", function(d) {
           return lineFunction(d.stops)
        });
}

