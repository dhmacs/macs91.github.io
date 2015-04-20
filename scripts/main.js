/**
 * @author Massimo De Marchi
 * @created 4/19/15.
 */
var svg = d3.select("#background");

var size = {
    width: window.innerWidth,
    height: window.innerHeight
};

svg
    .attr("width", size.width)
    .attr("height", size.height);

var n = 100;

var particlesData = [];
var colors = ["#f1c40f", "#e67e22", "#e74c3c", "#2ecc71", "#3498db"];
var speedScale = d3.scale.linear()
    .domain([-1, 1])
    .range([-10, 10]);
var changeRate = 0.02;

for(var i = 0; i < n; i++) {
    particlesData.push({
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        vx: speedScale(Math.random() * 2 -1),
        vy: speedScale(Math.random() *2 -1),
        color: colors[Math.round(Math.random() * (colors.length -1))]
    });
}

function update() {
    for(var i = 0; i < particlesData.length; i++) {
        particlesData[i].x += particlesData[i].vx;
        particlesData[i].y += particlesData[i].vy;

        if(particlesData[i].x >= size.width) {
            particlesData[i].vx = -1;
        } else if(particlesData[i].x <= 0) {
            particlesData[i].vx = 1;
        } else {
            particlesData[i].vx =
                particlesData[i].vx * (1 - changeRate) +
                speedScale(Math.random() *2 -1) * changeRate;
        }

        if(particlesData[i].y >= size.height) {
            particlesData[i].vy = -1;
        } else if(particlesData[i].y <= 0) {
            particlesData[i].vy = 1;
        } else {
            particlesData[i].vy =
                particlesData[i].vy * (1 - changeRate) +
                speedScale(Math.random() *2 -1) * changeRate;
        }
    }
}

function draw() {
    var particles = svg.selectAll(".particle").data(particlesData);

    // Update
    particles
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y});

    // Enter
    particles.enter().append("circle")
        .classed("particle", true)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y})
        .attr("r", 2)
        .style("fill", function(d) {return d.color})
        .style("opacity", 0.2);
}

d3.timer(function() {
    update();
    draw();
});

window.onresize = function() {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    svg
        .attr("width", size.width)
        .attr("height", size.height);
};





























