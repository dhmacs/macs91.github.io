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
    .interpolate("step");

var stopsNumber = 10;
var snakesNumber = 1;
var snakes;
var colors = ["#e74c3c", "#2ecc71", "#f1c40f"];


function generateLandmarks() {
    return d3.range(400).map(function() {
        return [Math.random() * size.width, Math.random() * size.height];
    });
}

function generateNewSnakes() {
    snakes = [];
    for(var i = 0; i < snakesNumber; i++) {
        var stops = d3.range(stopsNumber).map(function() {
            return {x: Math.random() * size.width, y: Math.random() * size.height};
        });

        snakes.push({
            color: colors[i],
            stops: stops
        });
    }

    return snakes;
}

var time = 0;
var duration = stopsNumber;
var dt = 0.01;
var headX, headY;

// Initial data
generateNewSnakes();
var landmarks = generateLandmarks();

function update() {
    if(time + dt > duration) {
        landmarks = generateLandmarks();
        generateNewSnakes();
    }

    time = (time + dt) % duration;
    var headPoint = getSnakeHead(lineFunction(snakes[0].stops), 10, time/duration);
    headX = headPoint.x;
    headY = headPoint.y;
    markNearby(landmarks, headPoint.x, headPoint.y, 80);
}

function draw() {
    drawLandmarks();
    drawSnakes();
    drawSnakeHead();
}

function drawLandmarks() {
    var circles = svg.selectAll(".landmark").data(landmarks);

    circles
        .attr("cx", function(d) {return d[0]})
        .attr("cy", function(d) {return d[1]})
        .attr("r",function(d) {
            return 2 + d.distance * 5;
        })
        .style("opacity", function(d) {
            var opacity = d.distance + 0.05;
            opacity = opacity > 1 ? 1 : opacity;
            return opacity;
        });

    circles.enter()
        .append("circle")
        .classed("landmark", true)
        .attr("cx", function(d) {return d[0]})
        .attr("cy", function(d) {return d[1]})
        .attr("r",function(d) {
            return 2 + d.distance * 3;
        })
        .style("fill", "#fff")
        .style("opacity", function(d) {
            var opacity = d.distance + 0.05;
            opacity = opacity > 1 ? 1 : opacity;
            return opacity;
        });

    circles.exit().remove();
}

function drawSnakes() {
    var gTrails = svg.selectAll(".trail").data(snakes);

    gTrails.enter()
        .append("g")
        .classed("trail", true);

    var trailSegments = gTrails.selectAll(".segment").data(function(d) {
        var trailPerc = time / duration;
        var pathSample = sample(lineFunction(d.stops), 10);
        pathSample = pathSample.map(function(a) {
            a.t = a.t / trailPerc;

            return a;
        });

        var trailSegments = quad(pathSample);
        trailSegments = trailSegments.slice(0, Math.floor(trailSegments.length * trailPerc));
        return trailSegments;
    });

    trailSegments
        .style("stroke", function(d) {
            return "rgba(46,204,113,"+ d.t + ")";
        })
        .style("fill", function(d) {
            return "rgba(46,204,113,"+ d.t + ")";
        })
        .style("stroke-width", "0.1")
        .style("opacity", function(d) {
            return d.t;
        })
        .attr("d", function(d) {
            return lineJoin(d[0], d[1], d[2], d[3], 32);
        });

    trailSegments.enter()
        .append("path")
        .classed("segment", true)
        .style("stroke", function(d) {
            return "rgba(46,204,113,"+ d.t + ")";
        })
        .style("fill", function(d) {
            return "rgba(46,204,113,"+ d.t + ")";
        })
        .style("stroke-width", "0.1")
        .style("opacity", function(d) {
            return d.t;
        })
        .attr("d", function(d) {
            return lineJoin(d[0], d[1], d[2], d[3], 32);
        });

    trailSegments.exit().remove();
}

function drawSnakeHead() {
    var snakeHead = svg.selectAll(".head").data([{x: headX, y: headY}]);

    snakeHead
        .attr("cx", function(d) {return d.x;})
        .attr("cy", function(d) {return d.y;});

    snakeHead.enter()
        .append("circle")
        .classed("head", true)
        .attr("cx", function(d) {return d.x;})
        .attr("cy", function(d) {return d.y;})
        .attr("r", 10)
        .style("fill", "#2ecc71");
}



/* LANDMARKS SELECTION UTILITIES */

function markNearby(points, x, y, maxDistance) {
    var scale = d3.scale.linear()
        .domain([0, maxDistance])
        .range([1, 0]);
    points.forEach(function(p) {
        var distance = euclidDistance(p[0], p[1], x, y);
        p.distance = distance < maxDistance ? scale(distance) : 0;
    });

    return points;
}


// calculate euclidean distance of two points with coordinates: a(ax, ay) and b(bx, by)
function euclidDistance(ax, ay, bx, by){
    return Math.sqrt(Math.pow(ax-bx, 2) + Math.pow(ay-by, 2));
}




/* SNAKES UTILITIES */

function getSnakeHead(d, precision, percentage) {
    var path = document.createElementNS(d3.ns.prefix.svg, "path");
    path.setAttribute("d", d);

    var headLength = path.getTotalLength() * percentage;

    return path.getPointAtLength(headLength);
}

// Sample the SVG path string "d" uniformly with the specified precision.
function sample(d, precision) {
    var path = document.createElementNS(d3.ns.prefix.svg, "path");
    path.setAttribute("d", d);

    var n = path.getTotalLength(), t = [0], i = 0, dt = precision;
    while ((i += dt) < n) t.push(i);
    t.push(n);

    return t.map(function(t) {
        var p = path.getPointAtLength(t), a = [p.x, p.y];
        a.t = t / n;
        return a;
    });
}

// Compute quads of adjacent points [p0, p1, p2, p3].
function quad(points) {
    return d3.range(points.length - 1).map(function(i) {
        var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
        a.t = (points[i].t + points[i + 1].t) / 2;
        return a;
    });
}

// Compute stroke outline for segment p12.
function lineJoin(p0, p1, p2, p3, width) {
    var u12 = perp(p1, p2),
        r = 3,//width / 2,
        a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
        b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
        c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
        d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

    if (p0) { // clip ad and dc using average of u01 and u12
        var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
        a = lineIntersect(p1, e, a, b);
        d = lineIntersect(p1, e, d, c);
    }

    if (p3) { // clip ab and dc using average of u12 and u23
        var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
        b = lineIntersect(p2, e, a, b);
        c = lineIntersect(p2, e, d, c);
    }

    return "M" + a + "L" + b + " " + c + " " + d + "Z";
}

// Compute intersection of two infinite lines ab and cd.
function lineIntersect(a, b, c, d) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
        y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
        ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [x1 + ua * x21, y1 + ua * y21];
}

// Compute unit vector perpendicular to p01.
function perp(p0, p1) {
    var u01x = p0[1] - p1[1], u01y = p1[0] - p0[0],
        u01d = Math.sqrt(u01x * u01x + u01y * u01y);
    return [u01x / u01d, u01y / u01d];
}

d3.timer(function() {
    update();
    draw();
});
