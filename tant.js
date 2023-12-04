$( document ).ready(function(){
    grid = $(".grid");
    grid.on( "click", function(event){travel( $(event.target) );});
    drawHexes();
    const centralTile = $( "#"+CENTRAL );
    centralTile.addClass("central");
    const randomType =  TILE_TYPES[Math.floor((Math.random()*TILE_TYPES.length))];
    const randomRot = Math.floor((Math.random()*6));
    centralTile.attr( "data-type", randomType );
    centralTile.attr( "data-rot", randomRot );
    redrawPaths();
});


function travel(target){
    if( target.hasClass("central") ) return;
    $(".grid .tile").removeClass( "selected" );
    target.addClass( "selected" );
    return;

    $(".tile").removeClass( "lit alert" );
    target.addClass( "lit" );
    const targetId = target.attr("id");
    if( !targetId ) return;
    const targetData = tilemap[targetId];
    const nearbyIds = getNearbyIds(targetData);

    nearbyIds.forEach( oneNearby=>{
        const nearbyEle = $("#"+oneNearby.id);
        if( nearbyEle.length == 0 ) return;
        nearbyEle.addClass("alert");
        // const nearbyText = $("#rel"+oneNearby.id);
        // if( nearbyText.length == 0 ) return;
        // nearbyText.text( oneNearby.rel );
    });
}



function getNearbyIds(targetData){
    const same = 0, flip = 1;
    if( targetData.c ){return [
        // target is x,y,1
        // example: 2,2,1
        // nearby, clockwise, starting at 12oclock
        getNearbyData(targetData, 0, -1, same),
        getNearbyData(targetData, 1, 0, flip),
        getNearbyData(targetData, 1, +1, flip),
        getNearbyData(targetData, 0, +1, same),
        getNearbyData(targetData, 0, +1, flip),
        getNearbyData(targetData, 0, 0, flip),
    ];}

    return [
        // target is x,y,0
        // example: 2,2,0
        // nearby, clockwise, starting at 12oclock
        getNearbyData(targetData, 0, -1, same),
        getNearbyData(targetData, 0, -1, flip),
        getNearbyData(targetData, 0, 0, flip),
        getNearbyData(targetData, 0, +1, same),
        getNearbyData(targetData, -1, 0, flip),
        getNearbyData(targetData, -1, -1, flip),
    ];
}


function getNearbyData( targetData, dx, dy, dc ){
    const x = targetData.x +dx;
    const y = targetData.y +dy;
    const c = targetData.c ^ dc;
    return {
        x: x, y: y, c: c, id: getTileId(x,y,c),
        dx: dx, dy: dy, dc: dc,
        rel: getRelText(dx,dy,dc),
    };
}

function getRelText(dx, dy, dc){
    return text = getSymbolForDelta(dx)
        +", "  +getSymbolForDelta(dy)
        +", "  +getSymbolForFlip(dc);
}

function getSymbolForDelta(d){
    if(d>0) return "+1";
    if(d<0) return "-1";
    return " 0";
}
function getSymbolForFlip(d){
    if(!d) return "=";
    return "∂";
}


let grid;
function drawHexes(){
    for( let i=0; i<6; ++i ){
        drawHexRow( i,0 );
        drawHexRow( i,1 );
    }
}


function drawHexRow(row, shift){
    for( let i=0; i<7; ++i ) drawOneHex( i, row, shift );
}

const tilemap = {};
function drawOneHex(x,y,shift){
    const coords = getCartxn(x,y,shift);
    const oneHex = getHexPoints(coords.x, coords.y);
    const rawEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'polygon');
    const hexEle = $(rawEle);
    hexEle.attr( "points", oneHex );
    hexEle.addClass( "tile" );
    if( shift ) hexEle.addClass("c");
    const tileId = getTileId( x,y,shift );
    hexEle.attr("id", tileId);
    const tileData = {
        id: tileId,
        x: x, y: y, c: shift,
        e: hexEle
    };
    tilemap[ tileId ] = tileData;
    grid.append( hexEle );
    // drawCoords(coords, x, y, shift);
}



function drawPath( c, a, b, clazz ){
    const rawEle = document.createElementNS(
            'http://www.w3.org/2000/svg', 'path');
    const pathEle = $(rawEle);
    // M -8.6603 5 Q 0 0 0 -10
    const pathData = `M ${a.x} ${a.y} Q ${c.x} ${c.y}  ${b.x} ${b.y} `;
    pathEle.attr("d", pathData);
    pathEle.addClass( "path "+clazz );
    grid.append( pathEle );
}


function drawCoords(coords, x, y, c){
    const rawEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'text');
    const textEle = $(rawEle);
    textEle.text( x +","+y+","+c );
    textEle.attr("x",coords.x-30);
    textEle.attr("y",coords.y+10);
    textEle.addClass( "coord-label" );
    grid.append( textEle );    

    const rawRelEle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'text');
    const relEle = $(rawRelEle);
    relEle.text( "0,0,0" );
    relEle.attr("x",coords.x-25);
    relEle.attr("y",coords.y+30);
    relEle.addClass( "rel-label" );
    relEle.attr("id", "rel"+getTileId(x,y,c) );
    grid.append( relEle );
}



function getHexPoints( x, y ){
    const radius = 56;
    const radx = radius/2;
    const rady = radius * 0.866;
    return s(x+radius, y )
        +s( x+radx, y+rady )
        +s( x-radx, y+rady )
        +s( x-radius, y )
        +s( x-radx, y-rady )
        +s( x+radx, y-rady );
}


function getHexMidPoints( x, y ){
    const radius = 56;
    const radx = radius * 0.866;
    const rady = radius/2;
    return[ 
        obj( x, y-radius ),
        obj( x+radx, y-rady ),
        obj( x+radx, y+rady ),
        obj( x, y+radius ),
        obj( x-radx, y+rady ),
        obj( x-radx, y-rady ),
    ];
}






function getCartxn(col, row, shift){
    return {
        x: col*180+60 +(shift*90),
        y: row*100+60 +(shift*50),
    };
}




function getTileId( x,y,c ){
    return "x"+x   +"y"+y   +"c"+c;
}
function s(x,y){
    return x  +","  +y  +" ";
}

function obj(x,y){
    return {"x":x, "y": y,};
}




function getIDunnohelp(x,y,c){
    const same = c, flip = !c*1;
    if( c ){return [
        // target is x,y,1
        // example: 2,2,1


        // TRAVEL UP OR DOWN

        // TWELVE OCLOCK
        // 2,1  ,1
        getTileId(x, y-1, same),
        // 2,1  ,0
        getTileId(x, y-1, same),

        // SIX OCLOCK
        // 2,3  ,1
        getTileId(x, y+1, same),
        // 2,3  ,0
        getTileId(x, y+1, same),




        // TRAVEL TOWARD OR AWAY FROM ORIGIN
        // 0,0,0 is top left
        
        // FOUR OCLOCK
        // 3,3  ,0
        getTileId(x+1, y+1, flip),
        // 2,2  ,1
        getTileId(x, y, flip),

        // TEN OCLOCK
        // 2,2  ,0
        getTileId(x, y, flip),
        // 1,1  ,1
        getTileId(x-1, y-1, flip),


        // "TRAVERSE" PERPENDICULAR TO ORIGIN

        // TWO OCLOCK
        // 3,2  ,0
        getTileId(x+1, y, flip),
        // 2,1  ,1
        getTileId(x, y-1, flip),

        // EIGHT OCLOCK
        // 2,3  ,0
        getTileId(x, y+1, flip),
        // 1,2  ,1
        getTileId(x-1, y, flip),

    ];}

    return [
        // target is x,y,0
        // example: 2,2,0
        // nearby, clockwise, starting at 12oclock
    ];
}