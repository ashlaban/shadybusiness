function Pathfinder ( lodData )
{
	this.lodData = lodData;
}

function Path ( pos, parent, level )
{
	if (level === undefined) level = 0;
	this.pos    = pos;
	this.level  = level;
	this.cost   = 0;
	this.heur   = 0;
	this.parent = parent;
}

Pathfinder.prototype.tracePath = function( start, end )
{
	var initialPath = new Path( start, null );
	var distPerLevel = 50;
	//var queue = new PriorityQueue( {low: true} );
	var queue = new Heap( Pathfinder.prototype.cmp );
	queue.push( initialPath );

	var iIteration = 0;
	while ( iIteration < 60000 )
	{
		var currentPath = queue.pop();
		var currentBasePosition = currentPath.pos;

		for (var i = 0; i < 10 ; i++)
		{
			if ( i == 4 ) { continue; }

			// Generate the current square to check
			var level = Math.floor( manhattan( start, currentBasePosition ) / distPerLevel );
			var x = i % 3 - 1;
			var y = Math.floor( i / 3 ) - 1;
			var currentPosition = {x: 0, y: 0};
			currentPosition.x = currentBasePosition.x + x*(level+1);
			currentPosition.y = currentBasePosition.y + y*(level+1);

			// Check if the current square is in the open set
			// Swap for, check if is in closed set (hashmap of visited points)
			if ( queue.contains( currentPosition ) ) continue;

			// Construct new path
			var nextPath  = new Path( currentPosition, currentPath, level );
			var cost      = currentPath.cost + this.costFunction( currentPath.pos, currentPosition, level );
			var heuristic = this.heuristicFunction( currentPosition, end );
			nextPath.cost = cost;
			nextPath.heur = cost + heuristic;

			// If done return!
			if ( manhattan(currentPosition, end) <= level ) return nextPath;
			queue.push( nextPath );

			nextPath.drawEndPoint( document.getElementById('canvas-pathfinder'), 0.5 );
			//console.log( "Cost: " + cost );
		};

		iIteration++;
	};
	var test = 0;
}

function manhattan( a, b )
{
	return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )
}

Pathfinder.prototype.cmp = function( a, b )
{
	if ( a.heur > b.heur ) return  1;
	if ( a.heur < b.heur ) return -1;
	return 0;
}

Pathfinder.prototype.costFunction = function( previousPosition, currentPosition, level )
{
	var previousData = this.lodData.getDataForPoint( previousPosition.x, previousPosition.y, level );
	var currentData  = this.lodData.getDataForPoint( currentPosition.x, currentPosition.y, level  );
	var heightDiff = currentData - previousData;

	var dist = manhattan( previousPosition, currentPosition );

	return dist + 10 * Math.abs( heightDiff*(level+1) );
}

Pathfinder.prototype.heuristicFunction = function( currentPosition, finalPosition )
{
	var dist = manhattan( currentPosition, finalPosition )
	return dist;
}