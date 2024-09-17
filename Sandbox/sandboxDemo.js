// Wait for the Paper.js to be fully loaded
paper.install(window);

window.onload = function() {
    // Setup directly with JavaScript
    paper.setup('myCanvas');

    // paper.js code here 
    
    paper.view.draw();
};

 var colors={red: "#ff3657", green: "#8dff36", yellow: "#fce323", blue: "#2a46fa",
            redH: "#cc2b45", greenH: "#70cc2b", yellowH: "#ccb81d", blueH: "#2238c7",
            black: "#242424", blackHover: "#575757", whiteHover: "#f2f2f2",
            whiteAlt: "#f9f9f9", gridDot: "#000000"};
        var settings={clickFlavor:colors.whiteHover,pathFlavor:[0,0],gridSize:20,gridWidth:500,gridHeight:500,dragging:false,activeSpider:null,spiders:[],gridDots:[],highlightedDot:null,
            dotSizes:{original:1,enlarged:6},centerX:view.size.width/2,centerY:view.size.height/2,wireMode:false,wirePoints:[],activeWire:null,wires:[]};

        var ToolBar=new Path.Rectangle({point:[settings.centerX-306,settings.centerY-46],size:[32,150],strokeColor:colors.black,strokeWidth:1,fillColor:colors.whiteAlt,radius: 16});
        var ZSpider=new Path.Circle({center:[settings.centerX-290,settings.centerY-30],radius:8,strokeColor:colors.black,strokeWidth:2,fillColor:colors.green});
        var XSpider=new Path.Circle({center:[settings.centerX-290,settings.centerY+0],radius:8,strokeColor:colors.black,strokeWidth:2,fillColor:colors.red});
        var HSpider=new Path.Rectangle({point:[settings.centerX-298,settings.centerY+22],size:[16,16],strokeColor:colors.black,strokeWidth:2,radius:2,fillColor:colors.yellow});
        var WireInit=new Path.Circle({center:[settings.centerX-290,settings.centerY+58],radius:8,strokeColor:colors.black,strokeWidth:2,fillColor:colors.whiteAlt});
        var HWireInit=new Path.Circle({center:[settings.centerX-290,settings.centerY+88],radius:8,strokeColor:colors.blue,strokeWidth:2,dashArray:[4,4],fillColor:colors.whiteAlt});
        
        var PhaseBar = new Path.Circle({center:[0,0],radius:40,strokeColor:colors.black,strokeWidth:1,fillColor:colors.whiteAlt});
        PhaseBar.visible = false;
        
        
        var phase_values = ['1', '2', '3', '4', '5', '6', '7', '8'];
        var phase_locations = [[10, -25], [-10, -25], [10, 25], [-10, 25], [25, -10], [25, 10], [-25, -10], [-25 , 10]];

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
                fontFamily: 'Times',
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
            settings.centerX=view.size.width/2;
            settings.centerY=view.size.height/2;
            createGrid();
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
    PhaseBar.position = position;
    PhaseBar.visible = true;
    //PhaseBar.bringToFront();

    for (var q = 0; q < phase_values.length; q++) {
        select_spiders[q].position = position + phase_locations[q];
        //select_spiders[q].bringToFront();
        select_spiders_texts[q].position = position + phase_locations[q];
        //select_spiders_texts[q].bringToFront();
        select_spiders[q].visible = true;
        select_spiders_texts[q].visible = true;
    }
}

        function onClick(event){
            inregion = isPointInGridBounds(event.point);

            for (var i = 0; i < phase_values.length; i++) {
                if (select_spiders[i].contains(event.point)) {
                    settings.activeSpider.strokeColor = colors.blue;
                    return
                }
            }
    if (ZSpider.contains(event.point)) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        settings.clickFlavor = colors.green;
        highlightSelection();
        settings.wireMode = false;
        return;
    }
    if (XSpider.contains(event.point)) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        settings.clickFlavor = colors.red;
        highlightSelection();
        settings.wireMode = false;
        return;
    }
    if (HSpider.contains(event.point)) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        settings.clickFlavor = colors.yellow;
        highlightSelection();
        settings.wireMode = false;
        return;
    }
    if (WireInit.contains(event.point)) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        settings.clickFlavor = colors.gridDot;
        settings.wireMode = true;
        highlightSelection();
        return;
    }
    if (HWireInit.contains(event.point)) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        settings.clickFlavor = colors.blue;
        settings.wireMode = true;
        highlightSelection();
        return;
    }
    if (inregion) {
    if (settings.wireMode) {
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        handleWireClick(event);
        var snappedPoint = snapToGrid(event.point);
        if (!getSpiderAt(snappedPoint)) createBlackSpiderAt(snappedPoint);
        return;
    } 
    if (settings.dragging && settings.activeSpider) {
        if (settings.clickFlavor !== colors.whiteHover){
        document.getElementById('myCanvas').style.cursor = 'crosshair';
        }
        settings.activeSpider.position = snapToGrid(event.point);
        settings.dragging = false;
        settings.activeSpider.strokeWidth = 2;
        settings.activeSpider.strokeColor = colors.black;
        settings.activeSpider = null;
        
        if (Date.now() - lastClickTime < 300) {
            phasebar(snapToGrid(event.point));
            settings.activeSpider.bringToFront();
            
            }
        
        updateWires();
        return;
    }
    for (var i = 0; i < settings.spiders.length; i++) {
        if (settings.spiders[i].contains(event.point)) {
            document.getElementById('myCanvas').style.cursor = 'default';
            settings.activeSpider = settings.spiders[i];
            settings.dragging = true;
            settings.activeSpider.strokeWidth = 3;
            settings.activeSpider.strokeColor = settings.activeSpider.fillColor;
            lastClickTime = Date.now();
        
            PhaseBar.visible = false;
            
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
            radius: 8,
            strokeColor: colors.black,
            strokeWidth: 2,
            fillColor: settings.clickFlavor
        });
    }
    else{
        var newSpider = new Path.Rectangle({
            point: newSpiderPosition-[8,8],
            size:[16,16],
            strokeColor: colors.black,
            strokeWidth: 2,
            radius: 2,
            fillColor: settings.clickFlavor
        });
    }
        settings.spiders.push(newSpider);
        newSpider.bringToFront(); // Ensure the new spider is brought to the front
    }
    }else{
        settings.clickFlavor = colors.whiteHover;
        document.getElementById('myCanvas').style.cursor = 'default';
        settings.wireMode = false;
        highlightSelection();
        return;
    }

}

function createBlackSpiderAt(point){
    var blackSpider=new Path.Circle({center:point,radius:3,strokeColor:colors.black,strokeWidth:2,fillColor:colors.black});
    settings.spiders.push(blackSpider);
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

        function createBlackSpiderAt(point){
            var blackSpider=new Path.Circle({center:point,radius:3,strokeColor:colors.black,strokeWidth:2,fillColor:colors.black});
            settings.spiders.push(blackSpider);
            blackSpider.bringToFront();
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
                highlightNearestDot(event.point);
                settings.activeSpider.position=snapToGridSmooth(event.point);
                updateWires();
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

        function highlightSelection(){
            if(settings.clickFlavor===colors.green){
                ZSpider.strokeColor=colors.greenH;
                ZSpider.strokeWidth=3;
            }else{
                ZSpider.strokeColor=colors.black;
                ZSpider.strokeWidth=2;
            }
            if(settings.clickFlavor===colors.red){
                XSpider.strokeColor=colors.redH;
                XSpider.strokeWidth=3;
            }else{
                XSpider.strokeColor=colors.black;
                XSpider.strokeWidth=2;
            }
            if(settings.clickFlavor===colors.yellow){
                HSpider.strokeColor=colors.yellowH;
                HSpider.strokeWidth=3;
            }else{
                HSpider.strokeColor=colors.black;
                HSpider.strokeWidth=2;
            }
            if(settings.clickFlavor===colors.gridDot){
                WireInit.strokeColor=colors.blackHover;
                WireInit.strokeWidth=3;
            }else{
                WireInit.strokeColor=colors.black;
                WireInit.strokeWidth=2;
            }
            if(settings.clickFlavor===colors.blue){
                HWireInit.strokeColor=colors.blueH;
                HWireInit.strokeWidth=3;
            }else{
                HWireInit.strokeColor=colors.blue;
                HWireInit.strokeWidth=2;
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
        view.on('mousedown',onClick);


        view.on('mousemove',onMouseMove);
        view.on('resize',onResize);
        highlightSelection();
