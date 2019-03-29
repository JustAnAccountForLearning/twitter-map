$(document).ready(function() {

   drawMap('static/application/trump_geoJson.json');
});


function updateMap() {
   let selected = document.getElementById("select_tag").value;
   
   console.log(selected);
   
   let sendData = {'hashtag': selected };
   
   $.getJSON("/findtweets", sendData, function(data, textStatus, jqXHR) {
      // The data that gets returned should be a json object.
      // Hopefully with all the tweet geo locations
      
      console.log(data);
   });
   
   svg.selectAll("*").remove();
   drawMap('static/application/trump_geoJson.json');
   return false;
}

function drawMap(tweetgeo) {
   let width = 960,
      height = 500;
   let svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
   let g = svg.append("g");
   let projection = d3.geoAlbers()
      .scale(1000)
      .translate([width / 2, height / 2]);
   let path = d3.geoPath()
      .projection(projection);
   d3.queue()
      .defer(d3.json, 'static/application/states.json') // Load US States
      .defer(d3.json, tweetgeo) // Load tweet lat/long data --> CHANGE IN REAL <---
      .await(makeMyMap); // Run 'makeMyMap' when JSONs are loaded

   function makeMyMap(error,states,tweets) {
      svg.append('path')
          .datum(topojson.feature(states, states.objects.usStates))
          .attr('d', path)
          .attr('class', 'states');
      svg.selectAll('.tweets')
          .data(tweets.features)
          .enter()
          .append('path')
          .attr('d',path)
          .attr('class', 'tweets');
   }
   return false;
}

