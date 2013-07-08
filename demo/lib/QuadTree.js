function BoundingBox ( x, y, w, h )
{
	// Base properties
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	// Derived properties
	this.hx = x+w;
	this.hy = y+h;
	this.centre = {x: x + w/2, y: y + h/2};
}

/* QuadTree definitions **************************************************** */
function QuadTree (  )
{
	this.root = null;
}


QuadTree.prototype.getDataForPoint = function( x, y, level )
{
	if ( this.root == null ) return null;

	var point = {x: x, y: y};
	if ( this.root.contains(point) ) return this.root.getDataForPoint( point, level );

	return null;
}

QuadTree.prototype.insert = function( data, boundingBox )
{
	if (this.root == null) { this.root = new Node( boundingBox, 0 ); }
	return this.root.insert( data, boundingBox );
}

QuadTree.prototype.buildTree = function( array, boundingBox, s )
{
	// TODO: Add check to verify that the side is a power of two ( in addition nElements )
	var arraySide = Math.floor( Math.sqrt(array.length) );
	var nElements = array.length;

	if ( arraySide*arraySide != nElements )
	{
		console.log( "Array not of proper dimensions. Number of elements should be power of two" );
		return false;
	}

	// Creates the bottom layer
	var nodes = Array(nElements);
	for (var i = nElements - 1; i >= 0; i--) {
		var x = (i % arraySide) * s;
		var y = Math.floor(i / arraySide) * s;
		var bb = new BoundingBox( x, y, s, s );
		nodes[i] = new Node( bb, 0 );
		nodes[i].data = array[i];
	}

	// Build the rest of the tree
	var nLevels = Math.log( arraySide ) / Math.LN2;
	var currentArraySide = arraySide;
	var prevArraySide    = 0;
	var nextNodes = [];
	for (var iLevel = 1; iLevel <= nLevels; iLevel++) {
		prevArraySide = currentArraySide;
		currentArraySide = Math.floor(currentArraySide / 2);

		// For each square in the above layer
		nextNodes = Array(currentArraySide*currentArraySide);
		for (var i = currentArraySide*currentArraySide - 1; i >= 0; i--) {

			// Create the node
			var x = i % currentArraySide;
			var y = Math.floor(i / currentArraySide);
			var nodeList = [ [0,0], [1,0], [0,1], [1,1] ];

			var cbb = nodes[2*x + 2*y*prevArraySide].boundingBox;
			var bb = new BoundingBox( cbb.x, cbb.y, cbb.w*2, cbb.h*2 );
			var node = new Node( bb, iLevel );

			// Make connetions to children
			for (var iChildNode = 0; iChildNode < nodeList.length; iChildNode++) {
				var dx = nodeList[iChildNode][0];
				var dy = nodeList[iChildNode][1];
				var child = nodes[ (2*x+dx) + (2*y+dy)*prevArraySide ];

				node.children[iChildNode] = child;
			};

			// Create the layers of harmony
			downsampledLayer = new Float64Array( s * s );
			for (var iChildNode = 0; iChildNode < node.children.length; iChildNode++) {

				var childData = node.children[iChildNode].data;
				for (var iChildSquare = 0; iChildSquare < Math.floor( childData.length / 4 ); iChildSquare++) {
					
					var child_s  = Math.floor( s / 2 );
					var child_x  =           ( iChildSquare % child_s );
					var child_y  = Math.floor( iChildSquare / child_s );
					var parent_x = child_x +           ( iChildNode % 2 ) * child_s;
					var parent_y = child_y + Math.floor( iChildNode / 2 ) * child_s;

					var avg = 0;
					avg += childData[ (2*child_x+0) + (2*child_y+0)*s ];
					avg += childData[ (2*child_x+1) + (2*child_y+0)*s ];
					avg += childData[ (2*child_x+0) + (2*child_y+1)*s ];
					avg += childData[ (2*child_x+1) + (2*child_y+1)*s ];
					avg /= 4;

					downsampledLayer[ parent_x + parent_y*s ] = avg;
				}
			}
			node.data = downsampledLayer;

			// Prepare for next iteration
			nextNodes[i] = node;
		}

		nodes = nextNodes;
	}

	this.root = nodes[0];
}

/* Node definitions ******************************************************** */
function Node ( boundingBox, level ) {
	
	// Data part
	this.data = null;
	this.boundingBox = boundingBox;

	// Organisation
	this.children = [];
	this.level = level;
}

Node.prototype.getDataForPoint = function( point, level )
{
	// If we are not deep enough yet
	if ( level < this.level )
	{
		for (var i = 0; i < this.children.length; i++) {
			if ( this.children[i].contains( point ) ) return this.children[i].getDataForPoint( point, level );
		}
	}

	// When we reach the target level
	var scale = Math.pow( 2, level );
	var x = Math.floor( (point.x - this.boundingBox.x) / scale );
	var y = Math.floor( (point.y - this.boundingBox.y) / scale );

	var s = Math.floor( Math.sqrt(this.data.length) );
	return this.data[ x + y*s ];

}

Node.prototype.contains = function( point )
{
	var bx = ( point.x >= this.boundingBox.x ) && ( point.x < this.boundingBox.hx );
	var by = ( point.y >= this.boundingBox.y ) && ( point.y < this.boundingBox.hy );

	return bx && by;
}

Node.prototype.insert = function( data, boundingBox )
{

	if ( !this.contains( boundingBox.centre ) ) return false;

	if ( this.data == null )
	{
		this.data = data;
		this.boundingBox = boundingBox;

		x  = this.boundingBox.x ; y  = this.boundingBox.y ;
		hx = this.boundingBox.hx; hy = this.boundingBox.hy;
		cx = this.boundingBox.centre.x;
		cy = this.boundingBox.centre.y;
		w = Math.floor( this.boundingBox.w/2 );
		h = Math.floor( this.boundingBox.h/2 );
		this.children[0] = new Node( new BoundingBox( x , y , w, h ), this.level + 1 );
		this.children[1] = new Node( new BoundingBox( cx, y , w, h ), this.level + 1 );
		this.children[2] = new Node( new BoundingBox( x , cy, w, h ), this.level + 1 );
		this.children[3] = new Node( new BoundingBox( cx, cy, w, h ), this.level + 1 );

		return true;
	}
	
	for (var i = this.children.length - 1; i >= 0; i--) {
		var succsss = this.children[i].insert( data, boundingBox );
		if ( succsss == true ) return true;
	};
	
}
