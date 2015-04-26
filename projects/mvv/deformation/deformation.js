/**
 * @author Massimo De Marchi
 * @created 4/26/15.
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
