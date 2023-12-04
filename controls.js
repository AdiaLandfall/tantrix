$( document ).ready(function(){
    drawControlHexTiles();
    controlGrid.on( "click", function(event){selectType( $(event.target) );});
});


/*
yrrybb, brrbyy, rbbryy
byrbry rbyryb yrbybr
rrbbyy  rryybb
rbyrby  rybryb
*/

const CONTROL_TYPES = [
    "yrrybb", "brrbyy", "rbbryy",
    "", "", "", 
    "byrbry", "rbyryb", "yrbybr",
    "", "", "", 
    "rbyrby", "rybryb", "", 
    "", "", "", 
    "rrbbyy", "rryybb", "", 
];


function drawControlHexTiles(){
    let typeIndex = 0;
    for( let i=0; i<7; ++i ){
        drawOneControlHex( CONTROL_TYPES[typeIndex++], 0, i,  0 );
        drawOneControlHex( CONTROL_TYPES[typeIndex++], 0, i,  1 );
        drawOneControlHex( CONTROL_TYPES[typeIndex++], 1, i,  0 );
    }

    drawClearHex( 1, 8, 0 );

    drawRotateHex( "clock", 0, 8, 0 );
    drawRotateHex( "anti", 0, 8, 1 );
}    

const controlGrid = $(".control-grid");
function drawOneControlHex( type,x,y,shift){
    // allow for gaps where hexes/tiles would be
    if( !type ) return;
    const rawGroup = document.createElementNS(
        'http://www.w3.org/2000/svg', 'g');
    const groupEle = $(rawGroup);
    const coords = getControlCartxn(x,y,shift);
    const oneHex = getControlHexPoints(coords.x, coords.y);
    const rawEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'polygon');
    const hexEle = $(rawEle);
    hexEle.attr( "points", oneHex );
    hexEle.addClass( "tile" );
    hexEle.attr( "data-type", type );
    groupEle.append( hexEle );
    const paths = drawControlTile( type, x,y,shift );
    controlGrid.append( groupEle );
    paths.forEach( onePath=> controlGrid.append( onePath ) );
}

function drawClearHex(x,y,c){
    const rawGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const groupEle = $(rawGroup);
    const coords = getControlCartxn(x,y,c);
    const oneHex = getControlHexPoints(coords.x, coords.y);
    const rawEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'polygon');
    const hexEle = $(rawEle);
    hexEle.attr( "points", oneHex );
    hexEle.addClass( "tile" );
    hexEle.attr( "data-type", "clear" );
    groupEle.append( hexEle );
    const rotGroup = getClearPaths( coords );
    controlGrid.append( groupEle );
    controlGrid.append( rotGroup );
}


const CLEAR_PATH = "M -4 -4 H 4 M -3 -4 V 5 H 3 V -4 M -1 -3 V 4 M 1 -3 V 4";
function getClearPaths(coords){
    const groupEle = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'g'));
    const coordsString = s( coords.x, coords.y );
    groupEle.attr( "transform", `translate(${coordsString})  scale(5,5)` );
    const pathEle = $( document.createElementNS( 'http://www.w3.org/2000/svg', 'path'));
    pathEle.attr("d", CLEAR_PATH);
    pathEle.addClass( "clear" );
    groupEle.append( pathEle );
    return groupEle;
}



function drawRotateHex(type,x,y,shift){
    // allow for gaps where hexes/tiles would be
    if( !type ) return;
    const rawGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const groupEle = $(rawGroup);
    const coords = getControlCartxn(x,y,shift);
    const oneHex = getControlHexPoints(coords.x, coords.y);
    const rawEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'polygon');
    const hexEle = $(rawEle);
    hexEle.attr( "points", oneHex );
    hexEle.addClass( "tile" );
    hexEle.attr( "data-type", type );
    groupEle.append( hexEle );
    const rotGroup = getRotPaths( type, x,y,shift );
    controlGrid.append( groupEle );
    controlGrid.append( rotGroup );
}



function selectType(target){
    const selectedHex = $(".grid .selected");
    if( ! selectedHex.length ) return;
    const clickedType = target.attr( "data-type" );
    if( ! clickedType ) return;
    if( clickedType=="clock" ) doRot( selectedHex, 1 );
    else if( clickedType=="anti" ) doRot( selectedHex, -1 );
    else if( clickedType=="clear" ) doClear( selectedHex );
    else selectedHex.attr( "data-type", clickedType );
    redrawPaths();
}

function doClear(selectedHex){
    selectedHex.attr( "data-type", "" );
    selectedHex.attr( "data-rot", 0 );
}

function doRot( selectedHex, dir ){
    const rawRotVal = +(selectedHex.attr("data-rot")) || 0;
    selectedHex.attr( "data-rot", getNewRot(rawRotVal,dir) );
}

function getNewRot( curr, dir ){
    const newRotVal = curr + dir;
    if( newRotVal >= 6 ) return newRotVal-6;
    if( newRotVal < 0 ) return newRotVal+6;
    return newRotVal;
}


function drawControlTile( tileType, row, col, c ){
    if( !tileType ) return;
    if( !tileType.trim() ) return;

    const coords = getControlCartxn(row, col, c);
    const midpoints = getCtrlHexMidPoints( coords.x, coords.y );
    const redPoints = [], bluePoints = [], yellowPoints = [];

    for( let i=0; i<6; ++i ){
        const oneChar = tileType.charAt(i).toLowerCase();
        if( oneChar=="r" ) redPoints.push(i);
        else if( oneChar=="b") bluePoints.push(i);
        else yellowPoints.push(i);
    }

    return [
        drawCtrlPath( coords, midpoints[redPoints[0]], midpoints[redPoints[1]], "red" ),
        drawCtrlPath( coords, midpoints[bluePoints[0]], midpoints[bluePoints[1]], "blue" ),
        drawCtrlPath( coords, midpoints[yellowPoints[0]], midpoints[yellowPoints[1]], "yellow" ),
    ]
}




const CLOCK_PATH = "M 0 -5 Q 5 -5 5 0 M 4 -1 L 5 0 L 6 -1";
const ANTI_PATH = "M -5 0 Q -5 5 0 5 M -1 4 L 0 5 L -1 6";
function getRotPaths( tileType, row, col, c ){
    if( !tileType ) return;
    if( !tileType.trim() ) return;
    const coords = getControlCartxn(row, col, c);
    // M 50 10 Q 90 10 90 50 M 100 40 L 90 50 L 80 40
    const pathData = tileType=="clock"?CLOCK_PATH : ANTI_PATH;
    const groupEle = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'g'));
    const coordsString = s( coords.x, coords.y );
    groupEle.attr( "transform", `translate(${coordsString})  scale(5,5)` );
    const pathEle = $( document.createElementNS( 'http://www.w3.org/2000/svg', 'path'));
    pathEle.attr("d", pathData);
    pathEle.addClass( "rot clock" );
    groupEle.append( pathEle );
    return groupEle;
}




function drawCtrlPath( c, a, b, clazz ){
    const rawEle = document.createElementNS( 'http://www.w3.org/2000/svg', 'path');
    const pathEle = $(rawEle);
    // M -8.6603 5 Q 0 0 0 -10
    const pathData = `M ${a.x} ${a.y} Q ${c.x} ${c.y}  ${b.x} ${b.y} `;
    pathEle.attr("d", pathData);
    pathEle.addClass( "path "+clazz );
    return pathEle;
}



function getCtrlHexMidPoints( x, y ){
    const INNER_RAD = CTRL_RAD*0.75;
    const radx = INNER_RAD * 0.866;
    const rady = INNER_RAD/2;
    return[ 
        obj( x, y-INNER_RAD ),
        obj( x+radx, y-rady ),
        obj( x+radx, y+rady ),
        obj( x, y+INNER_RAD ),
        obj( x-radx, y+rady ),
        obj( x-radx, y-rady ),
    ];
}



const CTRL_RAD = 50;
const HEX_MAGIC = 0.866;
//              multiplied: 43.3
function getControlHexPoints( x, y ){
    const radx = CTRL_RAD/2;
    const rady = CTRL_RAD * HEX_MAGIC;
    return s(x+CTRL_RAD, y )
        +s( x+radx, y+rady )
        +s( x-radx, y+rady )
        +s( x-CTRL_RAD, y )
        +s( x-radx, y-rady )
        +s( x+radx, y-rady );
}

const shiftLeft = 50;
const shiftDown = 50;
const OFFSET_X = CTRL_RAD*3;
const OFFSET_Y = CTRL_RAD * HEX_MAGIC*1.5;
function getControlCartxn(col, row, shift){
    return {
        x: col*OFFSET_X+shiftLeft +(shift*OFFSET_X/2),
        y: row*OFFSET_Y+shiftDown +(shift*OFFSET_Y*.8),
    };
}