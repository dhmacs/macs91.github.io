/**
 * @author Massimo De Marchi
 * @created 5/6/15.
 */
var svg = d3.select(".vis-block");

var size = {
    width: svg.node().clientWidth,
    height: svg.node().clientHeight
};

svg.append("rect")
    .attr("width", size.width)
    .attr("height", size.height)
    .style("fill", "#111");


var nodes = d3.range(600).map(function() {
    return {
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        size: 5,
        color: "#bdc3c7"
    };
});

var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    //.friction(0.1)
    .charge(-30)
    .gravity(0.1)
    .size([size.width, size.height]);

//nodes[0].x = size.width / 2;
//nodes[0].y = size.height / 2;
//nodes[0].color = "#2ecc71";
nodes[0].x = size.width / 2;
nodes[0].y = size.height / 2;
nodes[0].size = 10;
nodes[0].color = "#2ecc71";//"#e74c3c";

nodes[1].x = size.width / 2;
nodes[1].y = size.height / 2;
nodes[1].size = 10;
nodes[1].color = "#e74c3c";

var delta = 0.4;
nodes[0].steps = 0;
nodes[1].steps = 0;
function update() {
    for(var i = 0; i < 2; i++) {
        if(nodes[i].steps <= 0) {
            nodes[i].vx = Math.random() * 2 -1;
            nodes[i].vy = Math.random() * 2 -1;
            nodes[i].steps = Math.random() * 100 + 10;
        }
        if(nodes[i].x >= (size.width -30) || nodes[i].x <= 30) {
            nodes[i].vx = -nodes[i].vx
        }
        if(nodes[i].y >= (size.height - 30) || nodes[i].y <= 30) {
            nodes[i].vy = -nodes[i].vy;
        }
        nodes[i].x += nodes[i].vx * delta;
        nodes[i].y += nodes[i].vy * delta;

        nodes[i].steps--;
    }

    force.start();
}

function draw() {
    var vehicle = svg.selectAll(".vehicle").data(nodes);

    vehicle
        .attr("cx", function(d) {return d.x;})
        .attr("cy", function(d) {return d.y;});

    vehicle.enter()
        .append("circle")
        .classed("vehicle", true)
        .attr("cx", function(d) {return d.x;})
        .attr("cy", function(d) {return d.y;})
        .attr("r", function(d) {return d.size;})
        .style("fill", function(d) {return d.color;});

    vehicle.exit().remove();
}

force.start();

d3.timer(function() {
    update();
    draw();
});