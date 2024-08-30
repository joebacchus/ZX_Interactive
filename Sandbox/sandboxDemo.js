// Wait for the Paper.js to be fully loaded
paper.install(window);

window.onload = function() {
    // Setup directly with JavaScript
    paper.setup('myCanvas');

    // paper.js code here 
    
    paper.view.draw();
};
