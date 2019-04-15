$(document).ready(function() {

   drawMap('static/application/empty.json');

});


let oldField = "none";
   
// Replaces the "field" in the alert with the appropriate first missing field.
function replaceShownTag(name) {
   var tag = document.getElementById("showntag").innerHTML;
   var field = tag.replace(oldField, name);
   oldField = name;
   document.getElementById("showntag").innerHTML = field;
}


function drawMap(tweetgeo) {
   d3.select("#the_SVG_ID").remove();
   let width = 960, height = 500;
   let svg = d3.select("body")
      .append("svg")
      .attr("id","the_SVG_ID")
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
          .attr('class', 'tweets')
          .on("mouseover", function (d) {
                 d3.select("h2").text(d.properties.text);
                 d3.select(this).attr("class", "tweets hover");
             })
             .on("mouseout", function (d) {
                 d3.select("h2").text("");
                 d3.select(this).attr("class", "tweets");
             })
   }
   return false;
}


function updateMap() {
   let selectedOption1 = document.getElementById("select_tag_1").value;
   let selectedOption2 = document.getElementById("select_tag_2").value;
   
   
   if (selectedOption1 == "Select a hashtag") {
      // At this point, no hashtag has been selected in the first drop down
      return false;
   }
   else {
      
      let sendData = {'hashtag1': selectedOption1, 'hashtag2': selectedOption2 };
      
      $.getJSON("/findtweets", sendData, function(data, textStatus, jqXHR) {
         
         replaceShownTag(data.hashtag);
         
         drawMap(data.twitterdata[0]);
         
      });
      
      document.getElementById("select_tag_2").style.display = "block";
      selectedOption1 = selectedOption1;
         
      return false;
   }
}