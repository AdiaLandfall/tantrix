$( document ).ready(function(){
    // calcPermutations();
});


const CENTRAL = "x3y2c1";

function redrawPaths(){
    $(".grid path" ).remove();
    $(".grid .tile").each(function(){  redrawOneTile( $(this) );  });
    calculatePathing();
}


function calculatePathing(){
    // cleanup previous pathing
    $(".grid .tile").removeClass("alert");

    const centralTile = $("#"+CENTRAL);
    // for now, only explore red paths
    // what two directions do the red paths lead?

    const pathTileSet = new Set();
    pathTileSet.add( CENTRAL );
    let currTileId = CENTRAL;
    for( let i=0; i<50; ++i ){
        let nextTileId = null;
        // get the nearby red-connected tiles
        const redDirs = getRedDirs(currTileId);
        redDirs.forEach( oneDir =>{
            // candidate
            const oneNewTileId = getTileIdInDir( currTileId, oneDir );
            // if candidate does not "lead back" to "reverse direction", pass
            if( ! redLeadsTo(oneNewTileId, oneDir) ) return;
            // if candidate is already part of the path, pass
            if( pathTileSet.has( oneNewTileId ) ) return;
            nextTileId = oneNewTileId;
        });
        // might be all out of places to go
        if( ! nextTileId ) break;
        // otherwise, persist finish state of tick, ready for next tick
        pathTileSet.add(nextTileId);
        $("#"+nextTileId).addClass( "alert" );
        currTileId = nextTileId;
    }

    console.log( pathTileSet );


    currTileId = CENTRAL;
    for( let i=0; i<50; ++i ){
        let nextTileId = null;
        // get the nearby red-connected tiles
        const redDirs = getRedDirs(currTileId);
        redDirs.forEach( oneDir =>{
            // candidate
            const oneNewTileId = getTileIdInDir( currTileId, oneDir );
            // if candidate does not "lead back" to "reverse direction", pass
            if( ! redLeadsTo(oneNewTileId, oneDir) ) return;
            // if candidate is already part of the path, pass
            if( pathTileSet.has( oneNewTileId ) ) return;
            nextTileId = oneNewTileId;
        });
        // might be all out of places to go
        if( ! nextTileId ) break;
        // otherwise, persist finish state of tick, ready for next tick
        pathTileSet.add(nextTileId);
        $("#"+nextTileId).addClass( "alert" );
        currTileId = nextTileId;
    }

    console.log( pathTileSet );
}


function redLeadsTo( id, dir ){
    const hex = $("#"+id);
    if( ! hex.length ) return false;
    const type = hex.attr("data-type");
    if( !type ) return false;
    // technically, looking for "reverse" of direction
    const reversedDir = reverseDir(dir);
    const redDirs = getRedDirs(id);
    return redDirs.includes( reversedDir );
}

function reverseDir( dir ){
    const newDir = dir+3;
    if( newDir <= 5 ) return newDir;
    return newDir-6;
}


// "x3y2c1", "x4y3c0", "x3y3c1" 


const COORD_MATH = [
    [ 0,  -1,   0],
    [ 0,  -1,   1],
    [ 0,   0,   1],
    [ 0,  +1,   0],
    [ -1,   0,   1],
    [ -1,  -1,   1],
];

const COORD_MATH_C = [
    [  0,  -1,   0],
    [ +1,   0,   1],
    [ +1,  +1,   1],
    [  0,  +1,   0],
    [  0,  +1,   1],
    [  0,   0,   1],
];





function getCoordVector( dir, c ){
    if( !c ) return COORD_MATH[dir];
    return COORD_MATH_C[dir];
}



function getTileIdInDir(id,dir){
    const coords = getGridCoords( id );
    const vector = getCoordVector(dir, coords.c );
    const newX = coords.x + vector[0];
    const newY = coords.y + vector[1];
    const newC = coords.c ^ vector[2];
    const newId =  `x${newX}y${newY}c${newC}`;
    return newId;
}


function getRedDirs( id ){
    const focusedTile = $("#"+id);
    // hex might not exist
    if( ! focusedTile.length ) return [];
    const type = focusedTile.attr("data-type");
    // hex might not have a placed tile
    if( ! type ) return [];
    const rot = focusedTile.attr("data-rot") || 0;
    const rotated = rotateType( type, rot );
    const redDirs = [];
    for( let i=0; i<6; ++i )  if( rotated.charAt(i) == "r" ) redDirs.push(i);
    return redDirs;
}





function redrawOneTile(targetElement){
    const type = targetElement.attr("data-type");
    if( !type ) return;
    const id = targetElement.attr("id");
    if( !id ) return;
    const coords = getGridCoords(id);
    const rot = +(targetElement.attr("data-rot")) || 0;
    drawTile( type, rot, coords.x, coords.y, coords.c );
}

function getGridCoords(id){
    if( !id ) return null;
    // x3y1c1
    const row = +id.charAt(1);
    const col = +id.charAt(3);
    const c = +id.charAt(5);
    return { "x": row, "y": col, "c": c,  };
}


function drawTile( tileType, rot, row, col, c ){
    if( !tileType ) return;
    if( !tileType.trim() ) return;
    const typeRotated = rotateType( tileType, rot );
    const coords = getCartxn(row, col, c);
    const midpoints = getHexMidPoints( coords.x, coords.y );
    const redPoints = [], bluePoints = [], yellowPoints = [];
    for( let i=0; i<6; ++i ){
        const oneChar = typeRotated.charAt(i).toLowerCase();
        if( oneChar=="r" ) redPoints.push(i);
        else if( oneChar=="b") bluePoints.push(i);
        else yellowPoints.push(i);
    }

    drawPath( coords, midpoints[redPoints[0]], midpoints[redPoints[1]], "red" );
    drawPath( coords, midpoints[bluePoints[0]], midpoints[bluePoints[1]], "blue" );
    drawPath( coords, midpoints[yellowPoints[0]], midpoints[yellowPoints[1]], "yellow" );
}


function rotateType(tileType, rot){
    if( !rot ) return tileType;
    let type = tileType;
    for( let i=0; i<rot; ++i ){
        type = type.charAt(5) +type.slice(0,-1);
    }
    return type;
}


const TILE_TYPES = [
    "rrbbyy", "yrrybb", "byrbry", "rbyrby",
    "rryybb", "brrbyy", "rbyryb", "rybryb",
     "rbbryy", "yrbybr", 
// , "yryrbb", "bybyrr",
// , "ryrybb", "ybybrr",
// , "brbryy", "rbrbyy",
];





function calcPermutations(){
    const allOptions = [ "r", "r", "b", "b", "y", "y", ];
    const mixesRaw = getMixFor( allOptions );
    console.log( mixesRaw );
    const mixSet = new Set( mixesRaw );
    const mixArr = Array.from( mixSet );
    console.log( mixArr );
    const trimmedArr = trimRots( mixArr );
    console.log( trimmedArr );
    //const keyedArr = keyRots( trimmedArr );
    //console.log( keyedArr );
}

function getMixFor( options ){
    if( options == null ) return [];
    if( options.length == 0 ) return [];
    if( options.length == 1 ) return options;
    const mixes = [];
    for( let i=0; i<options.length; ++i ){
        const chosenFirst = options[i];
        const without = getArrayWithout(options, i);
        // get all combinations for what is left
        const submixes = getMixFor( without );
        // add one new mix for each, with our chosen in front
        submixes.forEach( oneSubmix =>{
            const oneNewMix = [chosenFirst, ...oneSubmix ];
            mixes.push( oneNewMix.join("") );
        });
    }
    return mixes;
}


function keyRots(rawArr){
    return rawArr.map(x=>{
        return x.replace( "r", "R" )
            .replace("b","B")
            .replace("y","Y");
    });
}


function trimRots(rawArr){
    const trimmed = [];
    rawArr.forEach( x=>{
        const allRots = getAllRotations( x );
        let allow = true;
        for( let i=0; i<allRots.length; ++i )
            if( trimmed.includes(allRots[i]) ){
                allow = false; break; }
        if( allow ) trimmed.push( x );
    });
    return trimmed;
}


function getAllRotations(x){
    const rots = [];
    let oneRot = x;
    for( let i=0; i<x.length; ++i ){
        const lastChar = oneRot.slice(-1);
        const theRest = oneRot.slice(0, length-1);
        oneRot = lastChar+theRest;
        rots.push( oneRot );
    }
    return rots;
}




function getArrayWithout( options, index ){
    const newArr = options.slice();
    newArr.splice(index, 1);
    return newArr;
}