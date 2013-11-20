function initMapGen(nChunks)
{
	var canvas1 = document.getElementById('canvas-map-gen1');
	var canvas2 = document.getElementById('canvas-map-gen2');
	var canvas3 = document.getElementById('canvas-map-gen3');

	//var nChunks     = 64;
	var nChunksSqrt = Math.floor( Math.sqrt(nChunks) );
	var s = Math.pow(2, 6);
	
	// Setup noise generation
	var array = Array(nChunks);
	var scale = 0.0125;
	PerlinSimplex.setRng(Math);
	PerlinSimplex.noiseDetail(5, 0.55);

	// Generate world
	console.time("Generating world")
	for (var i = nChunks - 1; i >= 0; i--)
	{
		var x =           (i % nChunksSqrt) * s;
		var y = Math.floor(i / nChunksSqrt) * s;
		array[i] = simplexWorld( x, y, s, scale);
	}
	console.timeEnd("Generating world")

	// Generate LOD for world
	console.time("LOD generation")
	var bb = new BoundingBox( -s*nChunksSqrt/2 , -s*nChunksSqrt/2, s*nChunksSqrt, s*nChunksSqrt );
	var world = new QuadTree();
	world.buildTree( array, bb, s );
	console.timeEnd("LOD generation")

	// Drawing world
	console.time("Drawing world")
	world.draw( canvas1, 0 );
	world.draw( canvas2, 1 );
	world.draw( canvas3, 2 );
	console.timeEnd("Drawing world")
}

/* === World generation ==================================================== */

function simplexWorld (x, y, sideLength, scale)
{	
	var world = new Float64Array( sideLength*sideLength );
	
	for (var local_x = 0; local_x < sideLength; local_x++)
	{
		for (var local_y = 0; local_y < sideLength; local_y++)
		{
			var index = local_x + local_y*sideLength;
			world[index] = PerlinSimplex.noise( scale*(x+local_x), scale*(y+local_y) );
		}		
	}
	
	return world;

}

/* === General drawing functions =========================================== */

function draw( canvas, data, boundingBox, scale )
{
	var x = boundingBox.x; var y = boundingBox.y;
	var w = boundingBox.w; var h = boundingBox.h;
	x = Math.floor( x / scale );
	y = Math.floor( y / scale );
	w = Math.floor( w / scale );
	h = Math.floor( h / scale );

	// Colourise
	var maxVal = -100000000;
	var minVal = 100000000;
	for (var i = data.length - 1; i >= 0; i--) {
		if (data[i] > maxVal) maxVal = data[i];
		if (data[i] < minVal) minVal = data[i];
	};

	var byteArray = coloriseArray( w, h, 1, 0, data );

	// Put on canvas
	var ctx = canvas.getContext('2d');
	var imageData = ctx.getImageData(x, y, w, h);

	for(var i = 0; i < byteArray.length; i+=4){
	    imageData.data[i]   = byteArray[i];
	    imageData.data[i+1] = byteArray[i + 1];
	    imageData.data[i+2] = byteArray[i + 2];
	    imageData.data[i+3] = byteArray[i + 3];
	}

	ctx.strokeRect( x,y,w,h ); // Puts a border around map chunk
	ctx.putImageData(imageData, x, y);
}

/*
	Converts an array of scalar values to an greyscale image array.
	Dimensions w x h. The value specified in 'max' corresponds to white.
*/
function coloriseArray( w, h, max, min, data )
{
	var imgData = new Array(w*h*4);

	for (var i = w - 1; i >= 0; i--) {
		for (var j = h - 1; j >= 0; j--) {
			var index = i + w*j;

			var value  = ( data[index] - min ) / (max - min);
			var colour = colourisePoint( value );

			imgData[ 4*index + 0 ] = colour[0]*255;
			imgData[ 4*index + 1 ] = colour[1]*255;
			imgData[ 4*index + 2 ] = colour[2]*255;
			imgData[ 4*index + 3 ] = 255;
		}
	};

	return imgData;
}

/*
	Returns a color and an Array(3) clamped to [0, 1] if given a value.
*/
function colourisePoint( value )
{
	if (value < 0) { return [ 0, 0, 0]; };
	if (value > 1) { return [ 1, 0, 0]; };

	if (value < 0.25) { return [ 0             , 0             , value*2        ]; };
	if (value < 0.50) { return [ 0             , (value-0.25)*2, (0.5-value)*2  ]; };
	if (value < 0.75) { return [ (value-0.50)*2, (value-0.25)*2, (value-0.50)*2 ]; };
	if (value < 1.00) { return [ (value-0.50)*2, (value-0.50)*2, (value-0.50)*2 ]; };

	return [ 0, 0, 0 ];
}

/* === Object drawing functions ============================================ */

QuadTree.prototype.draw = function( canvas, level )
{
	var w = this.root.boundingBox.w;
	var h = this.root.boundingBox.h;

	var scale = Math.pow( 2, level );

	canvas.width  = Math.floor( w / scale );
	canvas.height = Math.floor( h / scale );

	this.root.draw( canvas, level );
}

Node.prototype.draw = function( canvas, level )
{
	if ( level < this.level )
	{
		for (var i = this.children.length - 1; i >= 0; i--) {
			this.children[i].draw( canvas, level );
		}

		return;
	}

	draw( canvas, this.data, this.boundingBox, Math.pow(2, level) );
}