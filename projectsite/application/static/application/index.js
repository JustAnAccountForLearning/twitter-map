$(document).ready(function() {

   // Draw the initial blank map with no data at all.
   drawMap(['static/application/empty.json', 'static/application/empty.json']);
   
   // Size the <img> tags holding the sentiment graphs.
   $("#image_1").width($("body").width() * 1/6);
   $("#image_1").height($("body").width() * 1/6);

   $("#image_2").width($("body").width() * 1/6);
   $("#image_2").height($("body").width() * 1/6);

   // Alert error if the server is unable to connect to the database upon page load.
   if ( $("#error").val() == "True" ) { 
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

function replaceShownTag(name,mean1,mean2) {
   let tag = document.getElementById("showntag").innerHTML;
   let label1 = document.getElementById("image_label_1");
   let label2 = document.getElementById("image_label_2");
   label1.innerHTML = "Tag 1";
   label2.innerHTML = "Tag 2";
   let content = '';
   if (name[0] != "Select a hashtag") {
      label1.innerHTML = name[0] + " mean = " + mean1 ;
      content += '<span class="greendot"></span>' + " " + name[0];
      if (name[1] != "Select a hashtag") {
         content += ", ";
      }
   }
   if (name.length > 1 && name[1] != "Select a hashtag") {
      label2.innerHTML = name[1]  + " mean = " + mean2 ;
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
   
   // Enable a smooth transition between redrawn images.
   d3.select("#OLD_SVG_ID").transition().remove().duration(300);
   setTimeout(function() {
      document.getElementById("NEW_SVG_ID").style.visibility = "visible";
      document.getElementById("NEW_SVG_ID").id = "OLD_SVG_ID";
   }, 299);
   
   
   // Draw the actual map.
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
   let viewHeight = $("body").height() - formHeight - 45;

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


function updateMap(buttonPressed) {
   let selectedOption1 = document.getElementById("select_tag_1").value;
   let selectedOption2 = document.getElementById("select_tag_2").value;
   
   if (selectedOption1 == "Select a hashtag" && selectedOption2 == "Select a hashtag") {
      // At this point, no hashtag has been selected in the first drop down
      return false;
   }
   else {
      let sendData = {};
      if (buttonPressed == "selected") {
         sendData = {'hashtag1': selectedOption1, 'hashtag2': selectedOption2};
      }
      else {
         return false;
      }
      $.getJSON("/findtweets", sendData, function(data, textStatus, jqXHR) {
         
         // Show the appropriate error message if there was a problem retrieving data
         if (data.error) {
            showAlert(data.error);
         }

         // Adjust the GUI to display the retrieved data

         replaceShownTag(data.hashtag);
         drawMap(data.twitterdata);

         // Show sentiment histograms if they exist.
    console.log(data.sentiment);
         let mean1 = Math.floor(d3.mean(data.sentiment[0])*10000)/10000;
         let mean2 = Math.floor(d3.mean(data.sentiment[1])*10000)/10000;
         console.log(mean1)
         console.log(mean2)

         if (data.sentiment[0]) {
            makeHistograms(data.sentiment[0], "#image_1", "NEW_GRAPH_1");
            replaceShownTag(data.hashtag,mean1,mean2);

         }
         if (data.sentiment[1]) {
            makeHistograms(data.sentiment[1], "#image_2", "NEW_GRAPH_2");
            replaceShownTag(data.hashtag,mean1,mean2);

         }
	 
     });
      
      selectedOption1 = selectedOption1;

      return false;
   }
}


function showAlert(error) {
   // Replace the error message with the 'error' argument
   let alert = document.getElementById("alert");
   var field = alert.innerHTML.replace("", error);
   alert.innerHTML = field;

   // Disable buttons while error message is shown.
   $("button").prop('disabled', true);
   setTimeout( function() {
      $("button").prop('disabled',false);
   }, 3000);

   // Show the error message for a 4 seconds and then hide it
   $("#alert").show("slow");
   
   setTimeout( function() {
      $("#alert").hide("slow");
      field = alert.innerHTML.replace(error, "");
      alert.innerHTML = field;
     }, 3000);
}

function makeHistograms(data, image, id) {
   // retrieve sentiment data directly from database grab

   if (image == "#image_1"){
      var color = "#008000";
   } else {
      var color = "#ff0000";
   }

   d3.select("#"+id).remove();
   let margin = {top: 10, right: 30, bottom: 30, left: 30},
   width = ($("body").width() * 1/6) - margin.left - margin.right,
   height = ($("body").width() * 1/6) - margin.top - margin.bottom;

   // append the svg object to the body of the page
   let svg = d3.select(image)
   .append("svg")
      .attr("id", id)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
   .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   // var values = getData
   // X axis: scale and draw:
   let x = d3.scaleLinear()
      .domain([-1, 1])     
      .range([0, width]);
   
   var labels = ["Negative","Neutral","Positive"];

   var xAxis = d3.axisBottom(x)
      .scale(x)
      .tickValues([-1,0,1])
      .tickFormat(function(d,i){return labels[i];});

   svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

   //Draw mean on histogram

   svg.append("g").selectAll("line")
   .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
    .data([{ y1: 0, y2: 100, x1:d3.mean(data) , x2: d3.mean(data) }])
    .enter().append("line")
    .attr("class", "specification-line")
    .attr("y1", function (d) { return d.y1; })
    .attr("y2", function (d) { return d.y2; })
    .attr("x1", function (d) { return d.x1; })
    .attr("x2", function (d) { return d.x2; });

    // print mean of distribution
   var mean = d3.mean(data);


   // set the parameters for the histogram
   let histogram = d3.histogram()
      .value(function(d) { return d; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(10)) // then the numbers of bins
   // And apply this function to data to get the bins
   let bins = histogram(data)

   // Y axis: scale and draw:
   let y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, 100]); //d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
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
         .style("fill", color)

    };
