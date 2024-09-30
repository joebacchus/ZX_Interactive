// Wait for Paper.js to load and initialize
window.onload = function () {
    // Link Paper.js to the canvas
    paper.setup(document.getElementById('myCanvas'));

    // Destructure the Paper.js objects to avoid typing 'paper.' infront of every paper.js object
    const { view, Path, Color, PointText, Point, project} = paper;
    
    // Red Green Yellow Blue Black Grey White
    /*var colors={red: "#ff3657", green: "#8dff36", yellow: "#fce323", blue: "#2a46fa",
        redH: "#cc2b45", greenH: "#70cc2b", yellowH: "#ccb81d", blueH: "#2238c7",
        black: "#242424", blackHover: "#575757", whiteHover: "#f2f2f2",
        whiteAlt: "#f9f9f9", whiteAltS: "#D0D0D0", gridDot: "#000000"};
    */
    var colors={red: "#F09AA0", green: "#B6E88E", yellow: "#FAF884", blue: "#769ee3",gridDot: "#363636",
    redH: "#c87278", greenH: "#8fc066", yellowH: "#d2d05c", blueH: "#4e76bb",gridDotH: "#0e0e0e",
        black: "#242424", blackHover: "#575757", whiteHover: "#f2f2f2",
        whiteAlt: "#f0f0f0", whiteAltS: "#D0D0D0", gridDot: "#000000", delete_:'#cccccc'};
    var settings={clickFlavor:colors.whiteHover,pathFlavor:[0,0],gridSize:30,gridWidth:500,gridHeight:500,dragging:false,activeSpider:null,activeSpiderPhase:null,spiders:[],spider_phases:[],gridDots:[],highlightedDot:null,
        dotSizes:{original:1,enlarged:6},centerX:view.size.width/2,centerY:view.size.height/2,wireMode:false,wirePoints:[],activeWire:null,wires:[],deleteMode:false,currentGlow:null,highlightDistance:15,glowRadius:5};
    
    var Edge=new Path.Rectangle({point:[settings.centerX-310,settings.centerY-310],size:[600,600],strokeColor:colors.whiteAltS,strokeWidth:1,radius:16});
    Edge.sendToBack();
    var ToolBar=new Path.Rectangle({point:[settings.centerX-326,settings.centerY-46],size:[32,190],strokeColor:colors.whiteAltS,strokeWidth:1,fillColor:colors.whiteAlt,radius: 16});
    var toolDivider=new Path.Line({from: [settings.centerX-326,settings.centerY+109], to: [settings.centerX-296,settings.centerY+109],strokeColor:colors.whiteAltS,strokeWidth:2
    });
    var ZSpider=new Path.Circle({center:[settings.centerX-310,settings.centerY-30],radius:10,strokeColor:colors.black,strokeWidth:2,fillColor:colors.green});
    var XSpider=new Path.Circle({center:[settings.centerX-310,settings.centerY+0],radius:10,strokeColor:colors.black,strokeWidth:2,fillColor:colors.red});
    var HSpider=new Path.Rectangle({point:[settings.centerX-319,settings.centerY+20],size:[18,18],strokeColor:colors.black,strokeWidth:2,radius:2,fillColor:colors.yellow});

    var WireInit=new Path.Circle({center:[settings.centerX-310,settings.centerY+58],radius:10,strokeColor:colors.black,strokeWidth:2,fillColor:colors.whiteAlt});
    var HWireInit=new Path.Circle({center:[settings.centerX-310,settings.centerY+88],radius:10,strokeColor:colors.blue,strokeWidth:2,dashArray:[4,4],fillColor:colors.whiteAlt});
    
    var bincentre = [settings.centerX-310, settings.centerY+118];
    var topWidth = 19; var bottomWidth = 12; var binHeight = 18;
    var Bin = new Path({
        segments:[[bincentre[0] + topWidth / 2, bincentre[1]],                 // Top rights
            [bincentre[0] + bottomWidth / 2, bincentre[1] + binHeight],  // Bottom right
            [bincentre[0] - bottomWidth / 2, bincentre[1] + binHeight],
            [bincentre[0] - topWidth / 2, bincentre[1]]],              // Top left
        closed: false, strokeColor: 'black', fillColor: colors.delete_, strokeWidth: 2
    });
    var Binlid = new Path({
        segments:[ [bincentre[0] - topWidth/2, bincentre[1]],
            [bincentre[0] + topWidth/2, bincentre[1]],],
        strokeColor: 'black', strokeWidth: 2
    });
    
    var hovercircle=new Path.Circle({center:[0,0],radius:10,strokeColor:colors.black,strokeWidth:2,fillColor:colors.black,opacity:0.5});
    var phasebaractive = false;
    var PhaseBar = new Path.Circle({center:[0,0],radius:40,strokeColor:colors.whiteAltS,strokeWidth:1,fillColor:colors.whiteAlt});
    PhaseBar.visible = false;
    hovercircle.visible = false;

    var phase_values = ['0', 'π', '-π', '\u00BE', '3', '5', '6', '7'];
    var phase_locations = [new Point(10, -25), new Point(-10, -25), new Point(10, 25), new Point(-10, 25), new Point(25, -10), new Point(25, 10), new Point(-25, -10), new Point(-25, 10)];

    // Arrays to hold individual spider elements
    var select_spiders = [];
    var select_spiders_texts = [];

for (var k = 0; k < phase_values.length; k++) {
        
        var select_spider = new Path.Circle({
            center: [0,0],
            radius: 8,
            strokeColor: colors.black,
            strokeWidth: 2,
            fillColor: colors.whiteAlt
        });

        var select_spider_text = new PointText({
            point: [0,0],
            content: phase_values[k],
            fillColor: colors.black,
            fontFamily: 'Helvetica',
            fontSize: 12,
            justification: 'center'
        });

        select_spider.visible = false;
        select_spider_text.visible = false;

        select_spiders.push(select_spider);
        select_spiders_texts.push(select_spider_text);
    }

    var inregion = true;
    var lastClickTime = 0;
    createGrid();

    function createGrid(){
        settings.gridDots=[];
        for(var x=settings.centerX-settings.gridWidth/2;x<settings.centerX+settings.gridWidth/2;x+=settings.gridSize)
            for(var y=settings.centerY-settings.gridHeight/2;y<settings.centerY+settings.gridHeight/2;y+=settings.gridSize){
                var dot=new Path.Circle({center:[x+10,y+10],radius:settings.dotSizes.original,fillColor:colors.gridDot});
                dot.sendToBack()
                settings.gridDots.push(dot);
            }
    }

            function onResize(event){
        //settings.centerX=view.size.width/2;
        //settings.centerY=view.size.height/2;
        //createGrid();
        updateWires();
    }

    function isPointInGridBounds(point) {
var gridLeft = settings.centerX - settings.gridWidth / 2;
var gridRight = settings.centerX + settings.gridWidth / 2;
var gridTop = settings.centerY - settings.gridHeight / 2;
var gridBottom = settings.centerY + settings.gridHeight / 2;

return point.x >= gridLeft && point.x <= gridRight && point.y >= gridTop && point.y <= gridBottom;
}

function snapToGrid(point){
        return new Point(
            Math.round((point.x-settings.centerX)/settings.gridSize)*settings.gridSize+settings.centerX,
            Math.round((point.y-settings.centerY)/settings.gridSize)*settings.gridSize+settings.centerY
        );
    }

function snapToGridSmooth(point) {
var smoothing = 0.75
// Calculate the snapped position
var snappedX = Math.round((point.x - settings.centerX) / settings.gridSize) * settings.gridSize + settings.centerX;
var snappedY = Math.round((point.y - settings.centerY) / settings.gridSize) * settings.gridSize + settings.centerY;

// Interpolate between the current position and the snapped position
var smoothedX = point.x + (snappedX - point.x) * smoothing;
var smoothedY = point.y + (snappedY - point.y) * smoothing;

return new Point(smoothedX, smoothedY);
}


function phasebar(position) {

phasebaractive = true;
PhaseBar.position = position;
PhaseBar.visible = true;
PhaseBar.bringToFront();

for (var q = 0; q < phase_values.length; q++) {
    select_spiders[q].position = position.add(phase_locations[q]);
    select_spiders[q].fillColor = settings.activeSpider.fillColor;
    select_spiders[q].strokeColor = settings.activeSpider.fillColor;
    select_spiders[q].bringToFront();
    select_spiders_texts[q].position = position.add(phase_locations[q].add(new Point(0,0.5)));
    select_spiders_texts[q].bringToFront();
    select_spiders[q].visible = true;
    select_spiders_texts[q].visible = true;
}
}

function onClick(event){
        
        inregion = isPointInGridBounds(event.point);
for (var j = 0; j < phase_values.length; j++) {
    if (select_spiders[j].contains(event.point)) {
        settings.activeSpiderPhase.content = select_spiders_texts[j].content;
        if (settings.activeSpiderPhase.content === '0'){
            settings.activeSpiderPhase.visible = false;
        }else{
            settings.activeSpiderPhase.visible = true;
        }
        return;
    }
}

if (phasebaractive === true && !PhaseBar.contains(event.point)) {
    phasebaractive = false;
        for (var s = 0; s < phase_values.length; s++) {
            select_spiders[s].visible = false;
            select_spiders_texts[s].visible = false;
        }
    PhaseBar.visible = false;
}

if (ZSpider.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.green;
    highlightSelection();
    settings.wireMode = false; settings.deleteMode = false;
    return;
}
if (XSpider.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.red;
    highlightSelection();
    settings.wireMode = false; settings.deleteMode = false;
    return;
}
if (HSpider.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.yellow;
    highlightSelection();
    settings.wireMode = false; settings.deleteMode = false;
    return;
}
if (WireInit.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.gridDot;
    settings.wireMode = true; settings.deleteMode = false;
    highlightSelection();
    return;
}
if (HWireInit.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.blue;
    settings.wireMode = true; settings.deleteMode = false;
    highlightSelection();
    return;
}
if (Bin.contains(event.point)) {
    document.getElementById('myCanvas').style.cursor = 'crosshair';
    settings.clickFlavor = colors.delete_;
    highlightSelection(); // when bin is clicked does it change?
    settings.wireMode = false; settings.deleteMode = true;
    return;
}
if (inregion) {
    if (!settings.deleteMode) {
        if (settings.wireMode) {
            document.getElementById('myCanvas').style.cursor = 'crosshair';
            var snappedPoint = snapToGrid(event.point);
            if (!getSpiderAt(snappedPoint)) createBlackSpiderAt(snappedPoint);
            handleWireClick(event);
            return;
        }
        if (settings.dragging && settings.activeSpider) { // stop the spider dragging
            if (settings.clickFlavor !== colors.whiteHover){
            document.getElementById('myCanvas').style.cursor = 'crosshair';
            }
            settings.activeSpider.position = snapToGrid(event.point);
            settings.activeSpiderPhase.position = settings.activeSpider.position; // PHASE
            settings.dragging = false;
            var hovercircle = settings.activeSpider.hovercircle;
                    if (hovercircle) {
                        hovercircle.visible = false;
                    }
            settings.activeSpider.strokeWidth = 2;
            settings.activeSpider.strokeColor = colors.black;
            
            if (Date.now() - lastClickTime < 300) {
                phasebar(snapToGrid(event.point));
                settings.activeSpider.bringToFront();
                settings.activeSpiderPhase.bringToFront();
            
            }

            //settings.activeSpider = null;
            
            updateWires();
            return;
        }
        for (var i = 0; i < settings.spiders.length; i++) { // finding a spider to drag
            if (settings.spiders[i].contains(event.point)) {
                document.getElementById('myCanvas').style.cursor = 'default';
                settings.activeSpider = settings.spiders[i];
                settings.activeSpiderPhase = settings.spider_phases[i];
                settings.dragging = true;
                settings.activeSpider.strokeWidth = 3;
                settings.activeSpider.strokeColor = settings.activeSpider.fillColor;
                
                //document.getElementById('myCanvas').style.cursor = 'move';
                lastClickTime = Date.now();
            
                PhaseBar.visible = false;
                phasebaractive = false;
                
                for (var s = 0; s < phase_values.length; s++) {
                    select_spiders[s].visible = false;
                    select_spiders_texts[s].visible = false;
                }
            
                return;
                
            }
        }
        var newSpiderPosition = snapToGrid(event.point);
        if (!getSpiderAt(newSpiderPosition)&&settings.clickFlavor!==colors.whiteHover) {
            if (settings.clickFlavor!==colors.yellow){
            var newSpider = new Path.Circle({
                center: newSpiderPosition,
                radius: 10,
                strokeColor: colors.black,
                strokeWidth: 2,
                fillColor: settings.clickFlavor
            });
            
            var newSpiderText = new PointText({
                    point: newSpiderPosition.add(new Point(0,3.5)),
                    content: 0,
                    fillColor: colors.black,
                    fontFamily: 'Helvetica',
                    fontSize: 12,
                    justification: 'center'
                });
                newSpiderText.visible=false; newSpiderText.guide = true; // not detectable with hitTest
                newSpider.bringToFront();
                newSpiderText.bringToFront();
                settings.spiders.push(newSpider);
                settings.spider_phases.push(newSpiderText);
        }

        else{ // if hadamard init has been clicked
            var newSpider = new Path.Rectangle({
                point: newSpiderPosition.add(new Point(-8,-8)),
                size:[18,18],
                strokeColor: colors.black,
                strokeWidth: 2,
                radius: 2,
                fillColor: settings.clickFlavor
            });
            newSpider.bringToFront();
            settings.spiders.push(newSpider);
            settings.spider_phases.push(0);
        }
        setCursorEvents(newSpider);
    }
} else if (settings.deleteMode) { // deleting
    if (settings.currentGlow) { // for glow effect, delete glow when click
        settings.currentGlow.remove(); settings.currentGlow = null;
    }
    var hitResult = project.hitTest(event.point);
    if (hitResult) {
        var clickedItem = hitResult.item;
        //spiders
        var spiderIndex = settings.spiders.findIndex(function(spider) {
            return spider === clickedItem;
        });
        if (spiderIndex > -1) {
            // search for connections to this spider
            var legsArray = []; spiDelIndices = [];
            for (var i = 0; i < settings.wires.length; i++) {
                for (var j = 0; j < 2; j++) {
                    if (settings.wires[i].ends[j].position.x===settings.spiders[spiderIndex].position.x && settings.wires[i].ends[j].position.y===settings.spiders[spiderIndex].position.y) {
                        legsArray.push(settings.wires[i].path);
                    }
                }
            }
            for (var i=0; i < legsArray.length; i++) { // removing all legs
                var lone_bl_spi_idx = delAllofWire(legsArray[i]);
                spiDelIndices.push(lone_bl_spi_idx);
            }
            if (settings.spiders[spiderIndex].bounds.width!==6) spiDelIndices.push(spiderIndex) // add clicked coloured spider to delete list
            spiDelIndices = FlattenSort(spiDelIndices);
            for (var i = 0; i < spiDelIndices.length; i++) {
                settings.spiders[spiDelIndices[i]].remove();
                settings.spiders.splice(spiDelIndices[i], 1);
                if (settings.spider_phases[spiDelIndices[i]]!==0) {
                    settings.spider_phases[spiDelIndices[i]].remove();
                }
                settings.spider_phases.splice(spiDelIndices[i], 1);
            }
            //console.log(settings.spider_phases[spiderIndex], spiderIndex,settings.spiders);
            //settings.spiders[spiderIndex].remove(); // remove lone clicked spider or coloured joined spider
            //settings.spiders.splice(spiderIndex, 1);
            return;
        }
        //wires and any lone black nodes
        var lone_bl_spi_idx = delAllofWire(clickedItem);
        lone_bl_spi_idx = FlattenSort(lone_bl_spi_idx);
        for (var i = 0; i < lone_bl_spi_idx.length; i++) {
            settings.spiders[lone_bl_spi_idx[i]].remove();
            settings.spiders.splice(lone_bl_spi_idx[i], 1);
            settings.spider_phases.splice(lone_bl_spi_idx[i], 1);
        }
        console.log(settings.spiders,settings.spider_phases);
        return;
    }
}
}else{
    settings.clickFlavor = colors.whiteHover;
    document.getElementById('myCanvas').style.cursor = 'default';
    settings.wireMode = false; settings.deleteMode=false;
    highlightSelection();
    return;
}
}
    
function FlattenSort(nested_list) {
// Flatten array and sort in descending order
var flattenedIndices = nested_list.flat();
flattenedIndices.sort(function(a, b) {
    return b - a;
});
return flattenedIndices;
}
    
function delAllofWire(clickedItem){
idx_rem = []; // saving the indicies of any spider that is removed
var wireIndex = settings.wires.findIndex(function(wire) {
    return wire.path === clickedItem;
});
if (wireIndex > -1) {
    var endspi = settings.wires[wireIndex].ends;
    for (var i = 0; i < 2; i++) {
        var endspiConnected = 0;
        var spiderIndex = settings.spiders.findIndex(function(spider) {
            return spider === endspi[i];
        });

        for (var j = 0; j < settings.wires.length; j++) { // searching to find if end node is connected to any more strings
            for (var k = 0; k < 2; k++) {
                if (endspi[i]===settings.wires[j].ends[k]) {
                    endspiConnected += 1
                }
            }
        }
        if (endspi[i].bounds.width===6 && endspiConnected<2) {  // if end of cable has simple node and it is not connected to another cable
            idx_rem.push(spiderIndex);
            //settings.spiders[spiderIndex].remove();
            //settings.spiders.splice(spiderIndex, 1);
        }
    }
    settings.wires[wireIndex].path.remove();
    settings.wires.splice(wireIndex, 1);
    return idx_rem; // to be deleted later on
}
}

function createBlackSpiderAt(point){
var blackSpider=new Path.Circle({center:point,radius:3,strokeColor:colors.black,strokeWidth:2,fillColor:colors.black});
settings.spiders.push(blackSpider);
setCursorEvents(blackSpider);
settings.spider_phases.push(0);
blackSpider.bringToFront(); // Ensure the new spider is brought to the front
}


function handleWireClick(event){
var snappedPoint=snapToGrid(event.point);
settings.wirePoints.push(snappedPoint);
if(settings.wirePoints.length===2){
    if (settings.clickFlavor===colors.gridDot){
    var wire=new Path.Line({from:settings.wirePoints[0],to:settings.wirePoints[1],strokeColor:settings.clickFlavor,strokeWidth:2});
    }else{
    var wire=new Path.Line({from:settings.wirePoints[0],to:settings.wirePoints[1],strokeColor:settings.clickFlavor,strokeWidth:2,dashArray:[4,4]});
    }
    settings.wires.push({path:wire,ends:[getSpiderAt(settings.wirePoints[0]),getSpiderAt(settings.wirePoints[1])]});
    settings.wirePoints=[];
    if(settings.activeWire){
        settings.activeWire.remove();
        settings.activeWire=null;
    }
    wire.sendToBack();
}
}

function getSpiderAt(point){
for(var i=0;i<settings.spiders.length;i++)
    if(settings.spiders[i].bounds.contains(point)) return settings.spiders[i];
return null;
}

function updateWires(){
for(var i=0;i<settings.wires.length;i++){
    var wire=settings.wires[i];
    var spiderA=wire.ends[0];
    var spiderB=wire.ends[1];
    if(spiderA&&spiderB){
        wire.path.segments[0].point=spiderA.position;
        wire.path.segments[1].point=spiderB.position;
    }else{
        var startPoint=wire.path.segments[0].point;
        var endPoint=wire.path.segments[1].point;
        var nearestStart=findNearestSpiderOrBlackDot(startPoint);
        var nearestEnd=findNearestSpiderOrBlackDot(endPoint);
        if(nearestStart){
            wire.path.segments[0].point=nearestStart.position;
            wire.ends[0]=nearestStart;
        }
        if(nearestEnd){
            wire.path.segments[1].point=nearestEnd.position;
            wire.ends[1]=nearestEnd;
        }
    }
}
}

function findNearestSpiderOrBlackDot(point){
var nearest=null,minDist=Infinity;
settings.spiders.forEach(function(spider){
    var dist=point.getDistance(spider.position);
    if(dist<minDist){
        minDist=dist;
        nearest=spider;
    }
});
settings.spiders.forEach(function(dot){
    if(dot.fillColor===colors.black){
        var dist=point.getDistance(dot.position);
        if(dist<minDist){
            minDist=dist;
            nearest=dot;
        }
    }
});
return minDist<10?nearest:null;
}

function onMouseMove(event){

if(settings.dragging&&settings.activeSpider){
    var hovercircle = settings.activeSpider.hovercircle;
    if (hovercircle) {
        hovercircle.position = settings.activeSpider.position;
    }
    highlightNearestDot(event.point);
    settings.activeSpider.position=snapToGridSmooth(event.point);
    settings.activeSpiderPhase.position = settings.activeSpider.position;
    updateWires();
}
if (settings.deleteMode) {
    var hitResult = project.activeLayer.hitTest(event.point);
    if (hitResult) {
        // If the mouse is over an object, change the cursor to a hand (pointer)
        document.getElementById('myCanvas').style.cursor = 'pointer';
    } else {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
    }
            
    
    if (settings.currentGlow) {
        settings.currentGlow.remove(); settings.currentGlow = null; // Remove the previous glow from the canvas
    }
    if (hovercircle) {
        var hovercircle = element.hovercircle;
        hovercircle.visible = false;
    }
    for (var i = 0; i < settings.spiders.length; i++) { // spider proximity
        var distance = settings.spiders[i].position.getDistance(event.point);
        if (distance < settings.highlightDistance) {
            createGlow(settings.spiders[i]);
            return;
        }
    }
    for (var i = 0; i < settings.wires.length; i++) { // wire proximity
        var distance = settings.wires[i].path.getNearestPoint(event.point).getDistance(event.point);
        if (distance < settings.highlightDistance) {
            createGlow(settings.wires[i].path);
            return;
        }
    }
}else{
    highlightNearestDot(event.point);
    if(settings.wireMode&&settings.wirePoints.length===1){
        if(settings.activeWire) settings.activeWire.remove();
        settings.activeWire=new Path.Line({
            from:settings.wirePoints[0],
            to:snapToGrid(event.point),
            strokeColor:colors.black,
            strokeWidth:1,
            dashArray:[2,2]
        });
    }
}
}
// Function create a glowing effect around an object
function createGlow(item) {
var glowPath = item.clone(); // Clone the object to create the glow effect
glowPath.guide = true; // Make the clone non-interactive

// Create an outer glow by scaling the cloned object and applying effects
glowPath.scale(1.0); // Make the glow slightly larger than the object
glowPath.strokeColor = new Color(1, 0, 0, 0.5); // Red with 50% opacity
glowPath.strokeWidth = settings.glowRadius; // Make the stroke thick to simulate glow
glowPath.blendMode = 'screen'; // Use screen blend mode for glowing effect
glowPath.shadowColor = new Color(1, 0, 0, 0.9); // Set shadow color to red
glowPath.shadowBlur = settings.glowRadius; // Add a blur effect for a glow
glowPath.shadowOffset = new Point(0, 0); // Center the glow

settings.currentGlow = glowPath;
}

function highlightSelection(){
if(settings.clickFlavor===colors.green){
    ZSpider.fillColor=colors.greenH;
    ZSpider.strokeWidth=2;
}else{
    ZSpider.fillColor=colors.green;
    ZSpider.strokeWidth=2;
}
if(settings.clickFlavor===colors.red){
    XSpider.fillColor=colors.redH;
    XSpider.strokeWidth=2;
}else{
    XSpider.fillColor=colors.red;
    XSpider.strokeWidth=2;
}
if(settings.clickFlavor===colors.yellow){
    HSpider.fillColor=colors.yellowH;
    HSpider.strokeWidth=2;
}else{
    HSpider.fillColor=colors.yellow;
    HSpider.strokeWidth=2;
}
if(settings.clickFlavor===colors.gridDot){
    WireInit.strokeColor=colors.gridDotH;
    WireInit.strokeWidth=2;
}else{
    WireInit.strokeColor=colors.gridDot;
    WireInit.strokeWidth=2;
}
if(settings.clickFlavor===colors.blue){
    HWireInit.strokeColor=colors.blueH;
    HWireInit.strokeWidth=2;
}else{
    HWireInit.strokeColor=colors.blue;
    HWireInit.strokeWidth=2;
}
if (settings.clickFlavor===colors.delete_) {
    var newTopRight = [bincentre[0] + topWidth / 2 -3, bincentre[1] - 7]; // Lift by 20 pixels
    Binlid.segments[1].point = newTopRight;
}else {
    var newTopRight = [bincentre[0] + topWidth / 2, bincentre[1] ]; // Lift by 20 pixels
    Binlid.segments[1].point = newTopRight;
}
}

function highlightNearestDot(point){
        
var nearestDot = null, minDist = Infinity;
settings.gridDots.forEach(function(dot){
    var dist = point.getDistance(dot.position);
    if (dist < minDist && !getSpiderAt(dot.position)) {
        minDist = dist;
        nearestDot = dot;
    }
});
if (nearestDot && minDist < settings.gridSize / 2) {
    if (settings.highlightedDot) {
        settings.highlightedDot.scale(settings.dotSizes.original / settings.dotSizes.enlarged);
        settings.highlightedDot.fillColor = colors.gridDot;
    }
    nearestDot.scale(settings.dotSizes.enlarged / settings.dotSizes.original);
    nearestDot.fillColor = settings.clickFlavor;
    settings.highlightedDot = nearestDot;

} else if (settings.highlightedDot) {
    settings.highlightedDot.scale(settings.dotSizes.original / settings.dotSizes.enlarged);
    settings.highlightedDot.fillColor = colors.gridDot;
    settings.highlightedDot = null;
}
}

function setCursorEvents(element) {
// Create a single hovercircle and manage its state
if (!element.hovercircle) {
    var hovercircle = element.clone();
    hovercircle.visible = false; // Initially hidden
    hovercircle.strokeWidth = 8;
    hovercircle.strokeColor = '#bababa';
    hovercircle.sendToBack();
    element.hovercircle = hovercircle; // Store reference on element
}

// Mouse enter event
element.onMouseEnter = function(event) {
    var hovercircle = element.hovercircle;
    hovercircle.position = element.position;
    hovercircle.fillColor = '#bababa'; // Set to your desired color
    hovercircle.opacity = 1;
    hovercircle.visible = true;
    hovercircle.sendToBack();
    ToolBar.sendToBack();
    Edge.sendToBack();
};

// Mouse leave event
element.onMouseLeave = function(event) {
    var hovercircle = element.hovercircle;
    hovercircle.visible = false;
};
}


// Set up events for each spider
setCursorEvents(ZSpider);
setCursorEvents(XSpider);
setCursorEvents(HSpider);
setCursorEvents(WireInit);
setCursorEvents(HWireInit);




    view.on('mousedown',onClick);

    view.on('mousemove',onMouseMove);

    view.on('resize',onResize);
    highlightSelection();
    
    
    

    // Refresh the view
    paper.view.draw();
};
