game.engines.thinkMover_1_1 = {
	name: 'thinkMover_1_1',
	displayName: 'thinkMover 1.1',
	getMove: function(curnode) {

		var startTime = (new Date()).getTime();
		//	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
		var basicValue = [0, -1, -3, -3, -5, -9, 0, 1, 3, 3, 5, 9, 0];
		var maxply = 3;
		var nodecount = 0;

		function makePositionString(position) {
			var positionString = '';
			position.forEach(function(sq) {
				positionString += game.pieces.numbers[sq];
			});
			return positionString;
		}
		function evaluatePosition(position, color) {
			var eval = 0;
			position.forEach(function(sq, index) {
				if(!sq) return true;
				var rank, col, thisVal;
				rank = index >> 3;
				col = index - (rank << 3);
				if(sq === BLACK_PAWN) {
					thisVal = -1 + rank * -0.1;
				} else if(sq === WHITE_PAWN) {
					thisVal = 1 + (7 - rank) * 0.1;
				} else if(sq === BLACK_KNIGHT) {
				 	if(col === 0 || col === 7 || rank === 0 || rank === 7) {
						thisVal = -2.5;
					} else {
						thisVal = -3;
					}
				} else if(sq === WHITE_KNIGHT) {
				 	if(col === 0 || col === 7 || rank === 0 || rank === 7) {
						thisVal = 2.5;
					} else {
						thisVal = 3;
					}
				} else {
					thisVal = basicValue[sq];
				}
				eval += thisVal;
			});
			return eval;
		}
		function searchNode( curnode, ply, qsq ) {
			nodecount += 1;
			var bestMove = [];
			var bestEval = 0;
			var ml = game.moveGen( curnode );
			var mobility = 0;			
			if(ml.length) {
				ml.forEach(function(themove, index) {
					var isStaticCapture = false, thisEval;
					if(themove[1] === qsq ) {
						isStaticCapture = true;
					} else if(qsq) {
						return true;
					}
					var thisnode = fastCloneNode(curnode);
					thisnode = doMove(thisnode, themove);
					if(ply) {
						thisEval = searchNode(thisnode, ply - 1, false);
					} else if(isStaticCapture) {
						thisEval = searchNode(thisnode, ply, themove[1]);
					} else {
						thisEval = evaluatePosition(thisnode.position);
					}
					if(thisEval === false) {
						thisEval = evaluatePosition(thisnode.position);
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
				if(!bestMove.length) {
					return false;
				}
			} else {
				if(ply === maxply) {
					// game should never get here. This is if it is passed a node where the game is over.
					return null;
				} else if(curnode.move) {
					if(kingInCheck(curnode, true)) {
						// this is black checkmate, black wins
						return -9999;
					} else {
						// draw
						return 0;
					}
				} else {
					if(kingInCheck(curnode, false)) {
						// this is white checkmate, white wins
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
			if(bestMove.length === 1) {
				return ml[bestMove[0]];
			} else {
			    return ml[bestMove[~~(Math.random() * bestMove.length)]];
			}
		}
//		console.log('best:', ml[bestMove], bestEval, curnode);
		var returnMove = searchNode(curnode, maxply, false);
		var timeTaken = ((new Date()).getTime() - startTime);
		var output = '';
		output += '<span class="engine-name">' + this.name + '</span> ';
		output += 'nodes: <span>' + nodecount + '</span>, ';
		output += 'time: <span>' + timeTaken + 'ms</span>, ';
		output += 'nodes/second: <span>' + ~~(nodecount / (timeTaken / 1000)) + '</span>';
		return { move: returnMove, output: output };
	}
};

