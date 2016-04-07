game.engines.thinkMover_1_0 = {
	name: 'thinkMover_1_0',
	displayName: 'thinkMover 1.0',
	getMove: function(curnode) {
		var startTime = (new Date()).getTime();
		//	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
		var basicValue = [0, -1, -3, -3, -5, -9, 0, 1, 3, 3, 5, 9, 0];
		var maxply = 2;
		var nodecount = 0;

		function makePositionString(position) {
			var positionString = '';
			position.forEach(function(sq) {
				positionString += game.pieces.numbers[sq];
			});
			return positionString;
		}
		function evaluatePosition(position) {
			var eval = 0;
			position.forEach(function(sq) {
				eval += basicValue[sq];
			});
			return eval;
		}
		function searchNode( curnode, ply ) {
			nodecount += 1;
			var bestMove = [];
			var bestEval = 0;
			var ml = game.moveGen( curnode );
			if(ml.length) {
				ml.forEach(function(themove, index) {
					var isCapture = false, thisEval, thisnode = $.extend(true, {}, curnode);
					if(curnode.position[themove[1]] ) {
						isCapture = true;
					}
					thisnode = doMove(thisnode, themove);
					if(ply) {
						thisEval = searchNode(thisnode, ply - 1);
					} else {
						if(ply !== maxply || !isCapture) {
							thisEval = ~~evaluatePosition(thisnode.position);
						} else {
							thisEval = searchNode(thisnode, ply);
						}
					}
					if(!bestMove.length) {
						bestMove = [index];
						bestEval = thisEval;
					} else if(
						(thisnode.move === false && thisEval > bestEval) ||
						(thisnode.move === true && thisEval < bestEval)
					) {
						bestEval = thisEval;
						bestMove = [index];
					} else if(bestEval === thisEval || !bestMove.length) {
						bestMove.push(index);
					}
		//			console.log(themove, evaluatePosition(thisnode.position));
				});
			} else {
				if(ply === maxply) {
					// game should never get here. This is if it is passed a node where the game is over.
					return null;
				} else if(curnode.move) {
					if(kingInCheck(curnode, true)) {
						// this is black checkmate
						return -9999;
					} else {
						// draw
						return 0;
					}
				} else {
					if(kingInCheck(curnode, false)) {
						// this is white checkmate
						return 9999;
					} else {
						// draw
						return 0;
					}
				}
			}
			if(ply !== maxply) {
				return bestEval;
			}
			bestMove = ml[bestMove[~~(Math.random() * bestMove.length)]];
			return bestMove;
		}
//		console.log('best:', ml[bestMove], bestEval, curnode);
		var returnMove = searchNode(curnode, maxply);
		var timeTaken = ((new Date()).getTime() - startTime);
		var output = '';
		output += '<span class="engine-name">' + this.name + '</span> ';
		output += 'nodes: <span>' + nodecount + '</span>, ';
		output += 'time: <span>' + timeTaken + 'ms</span>, ';
		output += 'nodes/second: <span>' + ~~(nodecount / (timeTaken / 1000)) + '</span>';
		return { move: returnMove, output: output };
	}
};