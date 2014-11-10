var svg = document.querySelector('svg');

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'watercolor'
      })
    }),
    new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'terrain-labels'
      })
    })
    // ,
    // new ol.layer.Image({
    //   source: new ol.source.ImageCanvas({
    //     canvasFunction: canvasFunction,
    //     projection: 'EPSG:3857'
    //   })
    // })
  ],
  view: new ol.View({
    center: ol.proj.transform([-97.715, 35.4675], 'EPSG:4326', 'EPSG:3857'),
    zoom: 12
  }),
  overlays: [
    new ol.Overlay({
      element: svg
    })
  ]
});
  
// map.getView().setCenter(ol.proj.transform([35.4822, 97.5350], 'EPSG:4326', 'EPSG:3857'));

var width = 1478,
    height = 600,
    centered;

var projection = 
  d3.geo.mercator();
    // .scale(1280);

// Path generator
var path = d3.geo.path()
  .projection(projection);

var svgMap = d3.select(svg)
    .attr("width", width)
    .attr("height", height);

// svgMap.append("rect")
//     .attr("class", "background")
//     .attr("width", width)
//     .attr("height", height)
//     .on("click", clicked);

var g = svgMap.append("g");

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
      .attr("d", path);
      // .on("click", clicked);
      
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