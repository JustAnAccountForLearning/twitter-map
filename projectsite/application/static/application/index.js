$(document).ready(function() {
   // Find the canvas for map_canvas and find context.
   let canvas = document.getElementById("map_canvas");
   let ctx = canvas.getContext("2d");
   
   // Find form and submit button
   let form = document.getElementById("form");
   
   // Fit canvas to window
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   
   // Fill it with a black square for now so we know where is is.
   // Filling it from 10-90% height and width
   ctx.fillStyle = "#000000";
   ctx.fillRect(canvas.width*.1, canvas.height*.05, canvas.width*.8, canvas.height*.8);
   
   // Upon form submission.
   form.onsubmit = function() {
      // TODO: Validate that a new hashtag has been selected.
      // TODO: Send AJAX request with the given hashtag.
   };
});
