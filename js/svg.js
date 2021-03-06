
var width = 960,
    height = 600,
    centered;

var projection = 
  d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

// Path generator
var path = d3.geo.path()
  .projection(null);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

queue()
  .defer(d3.json, "us.json")
  .defer(d3.json, "ok_counties.json")
  .defer(d3.json, "quakes.json")
  .await(ready);

function ready(error, us, oklahoma, quakes)  {
  if (error) return console.error(error);

  // g.append("path")
  //     .datum(topojson.feature(us, us.objects.nation))
  //     .attr("class", "land")
  //     .attr("d", path);

  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);
      
  // g.append("g")
  //   .attr("id", "counties")
  //   .selectAll("path")
  //     .data(topojson.feature(us, oklahoma.objects.counties).features)
  //   .enter().append("path")
  //     .attr("d", path);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);

  g.append("g")
      .attr("id", "quakes")
    .selectAll("circle")
      .data(quakes.features)
    .enter()
      .append("circle")
        .attr("r", function(d) { return 5; })
        .attr("transform", function(d) {
          return "translate("+ projection(d.geometry.coordinates) + ")"
        });

}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4.5;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.selectAll("circle")
    .transition()
    .duration(750)      
      .attr("r", function(d) { return 5/k; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 0.5 / k + "px");
}

