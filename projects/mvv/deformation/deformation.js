/**
 * @author Massimo De Marchi
 * @created 4/26/15.
 */

/* PROJECTION UTILITIES */

function equirectangularFisheye() {
    var distortion = 4,
        focus = [0, 0],
        π = Math.PI,
        m = d3.geo.projectionMutator(raw),
        p = m(distortion, focus);

    function raw(distortion, focus) {
        var fx = fisheye(distortion, focus[0], -π, +π),
            fy = fisheye(distortion, focus[1], -π / 2, +π / 2);
        return function(x, y) {
            return [fx(x), fy(y)];
        };
    }

    p.distortion = function(_) {
        return arguments.length
            ? m(distortion = +_, focus)
            : distortion;
    };

    p.focus = function(_) {
        return arguments.length
            ? m(distortion, focus = [_[0] * π / 180, _[1] * π / 180])
            : [focus[0] * 180 / π, focus[1] * 180 / π];
    };

    return p;
}

function fisheye(distortion, focus, min, max) {
    return function(x) {
        var offset = (x < focus ? focus - min : max - focus) || (max - min);
        return (x < focus ? -1 : +1) * offset * (distortion + 1) / (distortion + (offset / Math.abs(x - focus))) + focus;
    };
}


function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 -y2, 2));
}

var randomColor = (function(){
    var golden_ratio_conjugate = 0.618033988749895;
    var h = Math.random();

    var hslToRgb = function (h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
    };

    return function(){
        h += golden_ratio_conjugate;
        h %= 1;
        return hslToRgb(h, 0.5, 0.60);
    };
})();



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






/* VIS */
var svg = d3.select(".vis-block");

var size = {
    width: svg.node().clientWidth,
    height: svg.node().clientHeight
};


var bounds = {
    topLeft: {
        lat: 41.962784,
        lon: -87.843544
    },
    bottomRight: {
        lat: 41.810451,
        lon: -87.502624
    }
};

//var dx = bounds.bottomRight.lon - bounds.topLeft.lon,
//    dy = bounds.bottomRight.lat - bounds.topLeft.lat,
//    x = (bounds.topLeft.lon + bounds.bottomRight.lon) / 2,
//    y = (bounds.topLeft.lat + bounds.bottomRight.lat) / 2,
//    scale = .9 / Math.max(dx / size.width, dy / size.height),
//    translate = [size.width / 2 - scale * x, size.height / 2 - scale * y];

var center = {
    lat: 41.891774,
    lon: -87.620384
};

var geoCanvas = {
    center: {
        lat: 0,//41.891774,
        lon: 0//-87.620384
    },
    width: 360,//Math.abs(bounds.topLeft.lon - bounds.bottomRight.lon),
    height: 180//Math.abs(bounds.topLeft.lat - bounds.bottomRight.lat)
};


var focus = {
    x: 0,
    y: 0
};

var projection = equirectangularFisheye()
    .center([geoCanvas.center.lon, geoCanvas.center.lat])
    .scale(300)
    .translate([size.width / 2, size.height / 2])
    .precision(0);

var geoLandmarks = d3.range(1000).map(function(n) {
    return {
        lat: geoCanvas.center.lat + (Math.random() - 0.5) * (geoCanvas.height * (0.3)),
        lon: geoCanvas.center.lon + (Math.random() - 0.5) * (geoCanvas.width * (0.2)),
        color: randomColor(),
        letter: n
    };
});

var stopsNumber = 10;
var snakeRoute = d3.range(stopsNumber).map(function() {
    return {
        lat: geoCanvas.center.lat + (Math.random() - 0.5) * (geoCanvas.height * (0.1)),
        lon: geoCanvas.center.lon + (Math.random() - 0.5) * (geoCanvas.width * (0.1))
    };
});


var time = 0;
var duration = stopsNumber -1;
var dt = 0.005;
var precision = 10;

var routeLength = snakeRoute.reduce(function(previousValue, currentValue, index, array) {
    var dist = d3.geo.distance([previousValue.lon, previousValue.lat],[currentValue.lon, currentValue.lat]) * (180 / Math.PI );
    previousValue.dist = previousValue.dist != undefined ? previousValue.dist : 0;
    currentValue.dist = dist + previousValue.dist;
    return currentValue;
}).dist;


var currentPosition;
function update() {
    time = (time + dt) % duration;

    var currentDistance = routeLength * (time/duration);
    var lastStop = 0;
    while(lastStop +1 < snakeRoute.length && snakeRoute[lastStop +1].dist <= currentDistance) {
        lastStop++;
    }
    lastStop = lastStop >= 0 ? lastStop : 0;

    var delta = (currentDistance - snakeRoute[lastStop].dist) / (snakeRoute[lastStop +1].dist - snakeRoute[lastStop].dist);

    //currentPosition = [
    //    d3.interpolateNumber(snakeRoute[lastStop].lon, snakeRoute[lastStop +1].lon)(delta),
    //    d3.interpolateNumber(snakeRoute[lastStop].lat, snakeRoute[lastStop +1].lat)(delta)
    //];

    currentPosition =
        d3.geo.interpolate(
            [snakeRoute[lastStop].lon, snakeRoute[lastStop].lat],
            [snakeRoute[lastStop +1].lon, snakeRoute[lastStop +1].lat])(delta);



    var tmpProjection = projection(currentPosition);//[currentPosition.lon, currentPosition.lat]);
    focus.x = tmpProjection[0];
    focus.y = tmpProjection[1];


    projection
        .focus(currentPosition)
        //.center(projection.focus())
        .translate([size.width / 2, size.height / 2]);

}

function draw() {
    drawLandmarks();
    //drawSnakes();
    drawSnakeHead();
}

function drawSnakeHead() {
    var circle = svg.selectAll(".head").data([projection(currentPosition)]);

    circle
        .attr("cx", function(d) {return d[0]})
        .attr("cy", function(d) {return d[1]});

    circle.enter()
        .append("circle")
        .classed("head", true)
        .attr("cx", function(d) {return d[0]})
        .attr("cy", function(d) {return d[1]})
        .attr("r", 10)
        .style("fill", "rgba(46,204,113, 1)");

    circle.exit().remove();
}

var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("step");

function drawSnakes() {
    var tmpProjection;

    var snakeRoutePoints = snakeRoute.map(function(p) {
        tmpProjection = projection([p.lon, p.lat]);
        return {
            x: tmpProjection[0],
            y: tmpProjection[1]
        };
    });

    var trailPerc = time / duration;
    var pathSample = sample(lineFunction(snakeRoutePoints), precision);
    pathSample = pathSample.map(function(a) {
        a.t = a.t / trailPerc;

        return a;
    });

    var trailSegments = quad(pathSample);
    trailSegments = trailSegments.slice(0, Math.floor(trailSegments.length * trailPerc));

    var pSegments = svg.selectAll(".segment").data(trailSegments);

    pSegments
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

    pSegments.enter()
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

    pSegments.exit().remove();
}

function drawLandmarks() {
    var tmpProjection;
    var maxMagnifyingDistance = size.width / 4;
    var increaseUpperBound = 10;

    var sizeScale = d3.scale.linear()
        .domain([0, maxMagnifyingDistance])
        .range([1, 0]);

    var pointLandmarks = geoLandmarks.map(function(p) {
        tmpProjection = projection([p.lon, p.lat]);
        var magnify = sizeScale(euclideanDistance(tmpProjection[0], tmpProjection[1], focus.x, focus.y));
        magnify = magnify < 0 ? 0 : magnify;
        return {
            x: tmpProjection[0],
            y: tmpProjection[1],
            color: p.color,
            magnify: magnify,
            letter: p.letter
        };
    });

    var landmarks = svg.selectAll(".landmark").data(pointLandmarks);

    landmarks
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y})
        .style("fill", function(d) {return "#fff";})//d.color})
        .attr("r", function(d) {
            return 2 + d.magnify * increaseUpperBound;
        });

    landmarks.enter().append("circle")
        .classed("landmark", true)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y})
        .attr("r", function(d) {
            return 2 + d.magnify * increaseUpperBound;
        })
        .style("fill", function(d) {return d.color})
        .style("opacity", 0.8);

    landmarks.exit().remove();

    // Label
    var maxFontSize = 12;
    var labels = svg.selectAll(".label").data(pointLandmarks);

    labels
        .attr("x", function(d) {return d.x;})
        .attr("y", function(d) {return d.y;})
        .style("font-size", function(d) {
            return (d.magnify * maxFontSize) + "px";
        })
        .text(function(d) {return d.letter});

    labels.enter().append("text")
        .classed("label", true)
        .attr("x", function(d) {return d.x;})
        .attr("y", function(d) {return d.y;})
        .attr("dy", "0.4em")
        .attr("text-anchor", "middle")
        .style("fill", "rgb(0,0,0)")
        .style("font-size", function(d) {
            return (d.magnify * maxFontSize) + "px";
        })
        .text(function(d) {return d.letter});

    labels.exit().remove();
}

function moved() {
    var m = d3.mouse(this);

    focus.x = m[0];
    focus.y = m[1];

    // After changing the focus, ensure the focus is centered at the mouse.
    projection
        .focus([ geoCanvas.center.lon + (m[0] / size.width - .5) * geoCanvas.width, geoCanvas.center.lat +(.5 - m[1] / size.height) * geoCanvas.height])
        .center(projection.focus())
        .translate(m);

    d3.event.preventDefault();
}


svg.append("rect")
    .attr("width", size.width)
    .attr("height", size.height)
    .style("fill", "#111");
//
//svg
//    .on("ontouchmove" in window ? "touchmove" : "mousemove", moved);

d3.timer(function() {
    update();
    draw();
});