// Set up SVG images
var svg_1 = "#FIRST_SVG";
var svg_2 = "#SECOND_SVG";
var iterator = 1;

$(document).ready(function() {

   drawMap(['static/application/empty.json', 'static/application/empty.json'], svg_1, svg_2);

});

   

// Replaces the "field" in the alert with the appropriate first missing field.
let oldField = "none";

function replaceShownTag(name) {
   var tag = document.getElementById("showntag").innerHTML;
   var field = tag.replace(oldField, name);
   oldField = name;
   document.getElementById("showntag").innerHTML = field;
}


function drawMap(tweetgeo, shown_svg, hidden_svg) {

   d3.select(shown_svg).remove();
   let width = 960, height = 500;
   let svg = d3.select("body")
      .append("svg")
      .attr("id",hidden_svg)
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
      .defer(d3.json, tweetgeo[0])
      .defer(d3.json, tweetgeo[1])
      .await(makeMyMap); // Run 'makeMyMap' when JSONs are loaded
   
   function makeMyMap(error,states,firstTweets,secondTweets) {
      svg.append('path')
          .datum(topojson.feature(states, states.objects.usStates))
          .attr('d', path)
          .attr('class', 'states');
      svg.selectAll('.greentweets')
         .data(firstTweets.features)
         .enter()
         .append('path')
         .attr('d',path)
         .attr('class', 'greentweets')
         .on("mouseover", function(d) {
            showTooltip(d);
            d3.select(this).attr("class", "greentweets hover");
         })
         .on("mouseout", function () {
         d3.select("tooltip").text("");
         d3.select(this).attr("class", "greentweets");
         let tooltip = document.getElementById("tooltip");
         tooltip.style.display = "none";
         })
      svg.selectAll('.redtweets')
         .data(secondTweets.features)
         .enter()
         .append('path')
         .attr('d',path)
         .attr('class', 'redtweets')
         .on("mouseover", function(d) {
            showTooltip(d);
            d3.select(this).attr("class", "redtweets hover");
         })
         .on("mouseout", function () {
         d3.select("tooltip").text("");
         d3.select(this).attr("class", "redtweets");
         let tooltip = document.getElementById("tooltip");
         tooltip.style.display = "none";
         })
   }
   return false;
}

function showTooltip(d) {
   let tooltip = document.getElementById("tooltip");
   tooltip.style.display = "inline-block";
   tooltip.style.left = d3.event.pageX + 10 + 'px';
   tooltip.style.top = d3.event.pageY + 10 + 'px';
   console.log(d.properties);
   tooltip.innerHTML = d.properties.text;
}


function updateMap() {
   let selectedOption1 = document.getElementById("select_tag_1").value;
   let selectedOption2 = document.getElementById("select_tag_2").value;
   
   
   if (selectedOption1 == "Select a hashtag" && selectedOption2 == "Select a hashtag") {
      // At this point, no hashtag has been selected in the first drop down
      return false;
   }
   else {
      
      let sendData = {'hashtag1': selectedOption1, 'hashtag2': selectedOption2 };
      
      $.getJSON("/findtweets", sendData, function(data, textStatus, jqXHR) {
         
         replaceShownTag(data.hashtag);
         if (iterator % 2) {
            drawMap(data.twitterdata, svg_2, svg_1);
         } else {
            drawMap(data.twitterdata, svg_1, svg_2);
         }
         iterator++;
      });
      
      document.getElementById("select_tag_2").style.visibility = "visible";
      selectedOption1 = selectedOption1;
         
      return false;
   }
}