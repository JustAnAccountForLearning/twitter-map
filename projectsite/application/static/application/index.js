$(document).ready(function() {

   drawMap(['static/application/empty.json', 'static/application/empty.json']);
   
   if ( document.getElementById("error") ) { 
      showAlert("Failed to connect to database. Options may be limited."); 
   }

   $("#select_tag_1").change(function() {
      // Disable the first selected value from the second dropdown.
      let secondDropdown = document.getElementById("select_tag_2");
      let selectedOption1 = document.getElementById("select_tag_1").value;
      
      secondDropdown.disabled = false;

      for (i = 0; i < secondDropdown.options.length; i++) {
         if (!secondDropdown[i].value.localeCompare(selectedOption1)) {
            secondDropdown.options[i].disabled = true;
         }
         else {
            secondDropdown.options[i].disabled = false;
         }
      }
   });
   
   
   $("#select_tag_2").change(function() {
      // Disable the second selected value from the first dropdown.
      let firstDropdown = document.getElementById("select_tag_1");
      let selectedOption2 = document.getElementById("select_tag_2").value;
      for (i = 0; i < firstDropdown.options.length; i++) {
         if (!firstDropdown[i].value.localeCompare(selectedOption2)) {
            firstDropdown.options[i].disabled = true;
         }
         else {
            firstDropdown.options[i].disabled = false;
         }
      }
   });

});


// Replaces the "field" in the alert with the appropriate first missing field.
let oldField = "None Selected";

function replaceShownTag(name) {
   var tag = document.getElementById("showntag").innerHTML;
   let content = '';
   if (name[0] != "Select a hashtag") {
      content += '<span class="greendot"></span>' + " " + name[0];
      if (name[1] != "Select a hashtag") {
         content += ", ";
      }
   }
   if (name.length > 1 && name[1] != "Select a hashtag") {
      content += '<span class="reddot"></span>' + " " + name[1];
   }
   var field = tag.replace(oldField, content);
   oldField = content;
   document.getElementById("showntag").innerHTML = field;
}


function drawMap(tweetgeo) {
   
   // Scale the map figure to best fit the empty space
   let [height, width, scaleFactor] = getScaleFactor();
   
   let svg = d3.select("figure")
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
      
   d3.select("#OLD_SVG_ID").transition().remove().duration(300);
   setTimeout(function() {
      document.getElementById("NEW_SVG_ID").style.visibility = "visible";
      document.getElementById("NEW_SVG_ID").id = "OLD_SVG_ID";
   }, 299);
   
   

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

function getScaleFactor() {
   
   let formHeight = $("heading").height() + $("#showntag").height();
   let viewWidth = $("body").width() * (2/3);
   let viewHeight = $("body").height() - formHeight;

   let scaleFactor = 1000;
   
   // Scale to fit based on width of figure
   let figureWidth = viewWidth;
   let figureHeight = viewWidth / 1.92;

   // If the height is too big, rescale to fit
   if (figureHeight > viewHeight) {
      figureHeight = viewHeight;
      figureWidth = viewHeight * 1.92;
   }
   
   scaleFactor = figureWidth / 960 * 1100;
   
   let values = [figureHeight, figureWidth, scaleFactor];
   
   return values;
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
   let typedOption = document.getElementById("text_input").value;
   
   
   if (selectedOption1 == "Select a hashtag" && selectedOption2 == "Select a hashtag" && !typedOption) {
      // At this point, no hashtag has been selected in the first drop down
      return false;
   }
   else {
      let sendData = {};
      if (typedOption) {
         // Shows only the typed option. Fills the second with an empty map.
         sendData = {'hashtag1': typedOption, 'hashtag2': "Select a hashtag"};
      }
      else {
         sendData = {'hashtag1': selectedOption1, 'hashtag2': selectedOption2 };
      }
      
      $.getJSON("/findtweets", sendData, function(data, textStatus, jqXHR) {
         if (data.error) {
            showAlert(data.error);
         }
         replaceShownTag(data.hashtag);
         drawMap(data.twitterdata);
         // How do we get this to work for multiple arrays when two hashtags are selected??
         makeHistograms(data.sentiment[0]);
      });
      
      selectedOption1 = selectedOption1;

      return false;
   }
}


function showAlert(error) {
   console.log(error);
   // Replace the error message with the 'error' argument
   let alert = document.getElementById("alert");
   var field = alert.innerHTML.replace("", error);
   alert.innerHTML = field;

   // Show the error message for a 4 seconds and then hide it
   $("#alert").show("slow");
   
   setTimeout( function() {
      $("#alert").hide("slow");
      field = alert.innerHTML.replace(error, "");
      alert.innerHTML = field;
     }, 4000);
   }

function makeHistograms(data) {
   // retrieve sentiment data directly from database grab
   var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
   
   // var values = getData
      // X axis: scale and draw:
      var x = d3.scaleLinear()
          .domain([-1, 1])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
          .range([0, 200]);
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
    
      // set the parameters for the histogram
      var histogram = d3.histogram()
          .value(function(d) { return d.price; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          .thresholds(x.ticks(70)); // then the numbers of bins
    
      // And apply this function to data to get the bins
      var bins = histogram(data)
    
      // Y axis: scale and draw:
      var y = d3.scaleLinear()
          .range([height, 0]);
          y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
      svg.append("g")
          .call(d3.axisLeft(y));
    
      // append the bar rectangles to the svg element
      svg.selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
    
    };



