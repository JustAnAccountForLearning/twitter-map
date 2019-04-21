$(document).ready(function() {

   drawMap(['static/application/empty.json', 'static/application/empty.json']);

});


// Replaces the "field" in the alert with the appropriate first missing field.
let oldField = "none";

function replaceShownTag(name) {
   var tag = document.getElementById("showntag").innerHTML;
   let content = '';
   if (name[0] != "Select a hashtag") {
      content += '<span class="greendot"></span>' + " " + name[0];
   }
   if (name.length > 1 && name[1] != "Select a hashtag") {
      content += ", " + '<span class="reddot"></span>' + " " + name[1];
   }
   var field = tag.replace(oldField, content);
   oldField = content;
   document.getElementById("showntag").innerHTML = field;
}


function drawMap(tweetgeo) {
   let viewwidth = $(window).width();
   let viewheight = $(window).height();

   let scaleFactor = 1000;

   let bodywidth = viewwidth;
   let bodyheight = viewwidth / 1.92;

   if (bodyheight > viewheight) {
      bodyheight = viewheight;
      bodywidth = viewheight * 1.92;
   }

   document.getElementsByName("body").height = bodyheight;
   document.getElementsByName("body").width = bodywidth;

   // TODO: Get the scale factor to ensure that the svg width,height of 960,500
   //       covers the viewport size without overflow.
   
   let width = 960, height = 500;
   let svg = d3.select("body")
      .append("svg")
      .attr("id","NEW_SVG_ID")
      .attr("width", width)
      .attr("height", height)
      .style("visibility", "hidden");
   let projection = d3.geoAlbers()
      .scale(scaleFactor)
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

   document.getElementById("NEW_SVG_ID").style.visibility = "visible";
   d3.select("#OLD_SVG_ID").remove();
   document.getElementById("NEW_SVG_ID").id = "OLD_SVG_ID";
   return false;
}


function showTooltip(d) {
   let tooltip = document.getElementById("tooltip");
   tooltip.style.display = "inline-block";
   tooltip.style.left = d3.event.pageX + 10 + 'px';
   tooltip.style.top = d3.event.pageY + 10 + 'px';
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
  
         drawMap(data.twitterdata);
         
         if (data.error) { showAlert(); }

      });
      
      // Disable the first selected value from the second dropdown.
      let secondDropdown = document.getElementById("select_tag_2");
      for (i = 0; i < secondDropdown.options.length; i++) {
         if (!secondDropdown[i].value.localeCompare(selectedOption1)) {
            secondDropdown.options[i].disabled = true;
         }
         else {
            secondDropdown.options[i].disabled = false;
         }
      }

      // Disable the second selected value from the first dropdown.
      let firstDropdown = document.getElementById("select_tag_1");
      for (i = 0; i < firstDropdown.options.length; i++) {
         if (!firstDropdown[i].value.localeCompare(selectedOption2)) {
            firstDropdown.options[i].disabled = true;
         }
         else {
            firstDropdown.options[i].disabled = false;
         }
      }
      secondDropdown.style.visibility = "visible";
      selectedOption1 = selectedOption1;
         
      return false;
   }
}

function showAlert() {
   let alert = document.getElementById("alert");
   
   $("#alert").show("slow");
   
   setTimeout( function() {
       $("#alert").hide("slow");
     }, 5000);
}