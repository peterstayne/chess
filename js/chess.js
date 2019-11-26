'use strict';

window.console = window.console ? window.console : { log: function() { } };

var $win = $(window);
var $doc = $(document);
var $board = $('#board');
var $bc = $('#board-container');
var $movelist = $('#movelist');

var game = {};

// ref chart for position array:
// 0  1  2  3  4  5  6  7
// 8  9  10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31
// 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47
// 48 49 50 51 52 53 54 55
// 56 57 58 59 60 61 62 63

game.algebraicSquares = {
	ranks: ['h','g','f','e','d','c','b','a'],   // backwards because top rank is rank 0 internally
	symbols: {},
	numbers: []
};
game.playerSettings = ['Player', 'thinkMover_1_5'];
game.gamemoves = [];
game.gameOn = true;
game.coords = [];
game.coords0 = [];
game.sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		game.algebraicSquares.symbols[game.algebraicSquares.ranks[r-1]+(8-i)] = game.sq;
		game.algebraicSquares.numbers[game.sq] = game.algebraicSquares.ranks[r-1]+(8-i);
		game.coords[game.sq] = [9-r, i+1];
		game.coords0[game.sq] = [8-r, i];
		game.sq++;
	}
}

game.ucpieces = {
	p: '&#9823;',
	n: '&#9822;',
	b: '&#9821;',
	r: '&#9820;',
	q: '&#9819;',
	k: '&#9818;',
	P: '&#9817;',
	N: '&#9816;',
	B: '&#9815;',
	R: '&#9814;',
	Q: '&#9813;',
	K: '&#9812;'
};

var BLACK_PAWN = 1,
	BLACK_KNIGHT = 2,
	BLACK_BISHOP = 3,
	BLACK_ROOK = 4,
	BLACK_QUEEN = 5,
	BLACK_KING = 6,

	WHITE_PAWN = 7,
	WHITE_KNIGHT = 8,
	WHITE_BISHOP = 9,
	WHITE_ROOK = 10,
	WHITE_QUEEN = 11,
	WHITE_KING = 12;

var BLACK_PAWN_A = 'p',
	BLACK_KNIGHT_A = 'n',
	BLACK_BISHOP_A = 'b',
	BLACK_ROOK_A = 'r',
	BLACK_QUEEN_A = 'q',
	BLACK_KING_A = 'k',

	WHITE_PAWN_A = 'P',
	WHITE_KNIGHT_A = 'N',
	WHITE_BISHOP_A = 'B',
	WHITE_ROOK_A = 'R',
	WHITE_QUEEN_A = 'Q',
	WHITE_KING_A = 'K';


game.engines = {
	Player: {
		name: 'Player',
		displayName: 'Player',
		getMove: function() { return null; }
	}
};

game.players = [
	'Player',
	'randomMover'
];

game.pieces = {
	symbols: {
		p: 1,
		n: 2,
		b: 3,
		r: 4,
		q: 5,
		k: 6,
		P: 7,
		N: 8,
		B: 9,
		R: 10,
		Q: 11,
		K: 12
	}, 
	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K'],
	hashNumbers: ['e', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K'],
	WorB: [0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]
};
game.node = function() {
	this.position = [];
	this.castle = {
		k: false,
		q: false,
		K: false,
		Q: false
	};
	this.drawClock = 0;
	this.moveNumber = 1;
	this.enpassantSquare = '-';
	this.score = 0;
	this.move = true;    // true = white, false = black
};

function clone(obj) {
   var target = {};
   for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
     target[i] = obj[i];
    }
   }
   return target;
}

function fastCloneNode(thenode) {
	var newnode =  {
		castle: {
			K: thenode.castle.K,
			Q: thenode.castle.Q,
			k: thenode.castle.k,
			q: thenode.castle.q
		},
		drawClock: thenode.drawClock,
		enpassantSquare: thenode.enpassantSquare,
		move: thenode.move,
		moveNumber: thenode.moveNumber,
		score: thenode.score,
		position: new Array(64)
	};
	for(var i = 0; i < 64; i ++) {
		newnode.position[i] = thenode.position[i];
	}
	return newnode;
}

// moveGen: pass a node, get an array of moves back
// parsefen: pass fen string, get node.
// outputfen: pass node, get fen back.
// squareInCheck: pass node, square and color, get boolean if that color is attacking that square
// kingInCheck: pass node and color, and will tell if the other player is attacking color's king
// domove: pass node and a move 

function isWorE(tP) {
	return (tP === 0 || tP > 6);
}
function isB(tP) {
	return (tP && tP < 7);
}

game.moveGen = function(thisnode) {

	// function that returns a list of legal moves
	// for a given board position (node)

	var tS;
	var color = thisnode.move;
	var tP = thisnode.position;
	var movelist = [];
	var curX = 0;
	var curY = 1;
	var moveToFunc;
	var cS, cY, cX, stop;

 	var ENEMY_PAWN, ENEMY_KNIGHT, ENEMY_BISHOP, ENEMY_ROOK, ENEMY_QUEEN, ENEMY_KING;

 	if(color) {
 		ENEMY_PAWN = BLACK_PAWN;
 		ENEMY_KNIGHT = BLACK_KNIGHT;
 		ENEMY_BISHOP = BLACK_BISHOP;
 		ENEMY_ROOK = BLACK_ROOK;
 		ENEMY_QUEEN = BLACK_QUEEN;
 		ENEMY_KING = BLACK_KING;
 		moveToFunc = function(sq) {
 			return (tP[sq] < 7);
 		};
 	} else {
 		ENEMY_PAWN = WHITE_PAWN;
 		ENEMY_KNIGHT = WHITE_KNIGHT;
 		ENEMY_BISHOP = WHITE_BISHOP;
 		ENEMY_ROOK = WHITE_ROOK;
 		ENEMY_QUEEN = WHITE_QUEEN;
 		ENEMY_KING = WHITE_KING;
 		moveToFunc = function(sq) {
 			return (tP[sq] === 0 || tP[sq] > 6);
 		};
 	}

 	for(var i = 0; i < 64; i++) {

		// curX and curY store rank/col information to avoid *'s and /'s

		curX++;
		if(curX === 9) { curY++; curX = 1; }

		// tS === 'this' square (numerical value of piece, see pieces.numbers for reference)
		// tP === 'this' position (array 0-63 of piece #'s)

		tS = tP[i];
		if(tS === 0 || (color && tS < 7) || (!color && tS > 6)) continue;
//		if(color) {

			// white

		switch(tS) {
		case WHITE_PAWN: // white pawn
			// 1 square forward
			if(curY > 2 && tP[i-8] === 0) movelist.push([i, i-8]);
			// en passant
			if(curY === 4) {
				if(curX > 1 && i-9 === thisnode.enpassantSquare) {
					movelist.push([i, i-9, 'ep-capture', i-1]);
				}
				if(curX < 8 && i-7 === thisnode.enpassantSquare) {
					movelist.push([i, i-7, 'ep-capture', i+1]);
				}
			} else 
			// promote via moving
			if(curY === 2 && tP[i-8] === 0) {
				movelist.push([i, i-8, 'promote', WHITE_KNIGHT]);
				movelist.push([i, i-8, 'promote', WHITE_BISHOP]);
				movelist.push([i, i-8, 'promote', WHITE_ROOK]);
				movelist.push([i, i-8, 'promote', WHITE_QUEEN]);
			} else 
			// 2 square opening move
			if(curY === 7 && tP[i-16] === 0 && tP[i-8] === 0) {
				movelist.push([i, i-16, 'ep-enable', i-8]);
			}
			// captures
			if(curX !== 8 && tP[i-7] > 0 && tP[i-7] < 7) {
				if(curY !== 2) {
					movelist.push([i, i-7]);
				} else {
					// promote via capture
					movelist.push([i, i-7, 'promote', WHITE_KNIGHT]);
					movelist.push([i, i-7, 'promote', WHITE_BISHOP]);
					movelist.push([i, i-7, 'promote', WHITE_ROOK]);
					movelist.push([i, i-7, 'promote', WHITE_QUEEN]);
				}
			}
			if(curX !== 1 && tP[i-9] > 0 && tP[i-9] < 7) {
				if(curY !== 2) {
					movelist.push([i, i-9]);
				} else {
					movelist.push([i, i-9, 'promote', WHITE_KNIGHT]);
					movelist.push([i, i-9, 'promote', WHITE_BISHOP]);
					movelist.push([i, i-9, 'promote', WHITE_ROOK]);
					movelist.push([i, i-9, 'promote', WHITE_QUEEN]);
				}
			}
			break;
		case BLACK_PAWN:  // black pawn
			if(curY < 7 && tP[i+8] === 0) movelist.push([i, i+8]);
			if(curY === 5) {
				if(curX !== 1 && i+9 === thisnode.enpassantSquare) {
					movelist.push([i, i+9, 'ep-capture', i+1]);
				}
				if(curX !== 8 && i+7 === thisnode.enpassantSquare) {
					movelist.push([i, i+7, 'ep-capture', i-1]);
				}
			} else
			if(curY === 7 && tP[i+8] === 0) {
				movelist.push([i, i+8, 'promote', BLACK_KNIGHT]);
				movelist.push([i, i+8, 'promote', BLACK_BISHOP]);
				movelist.push([i, i+8, 'promote', BLACK_ROOK]);
				movelist.push([i, i+8, 'promote', BLACK_QUEEN]);
			} else
			if(curY === 2 && tP[i+16] === 0 && tP[i+8] === 0) movelist.push([i, i+16, 'ep-enable', i+8]);
			if(curX > 1 && tP[i+7] > 6) {
				if(curY !== 7) {
					movelist.push([i, i+7]);
				} else {
					movelist.push([i, i+7, 'promote', BLACK_KNIGHT]);
					movelist.push([i, i+7, 'promote', BLACK_BISHOP]);
					movelist.push([i, i+7, 'promote', BLACK_ROOK]);
					movelist.push([i, i+7, 'promote', BLACK_QUEEN]);
				}
			}
			if(curX < 8 && tP[i+9] > 6) {
				if(curY !== 7) {
					movelist.push([i, i+9]);
				} else {
					movelist.push([i, i+9, 'promote', BLACK_KNIGHT]);
					movelist.push([i, i+9, 'promote', BLACK_BISHOP]);
					movelist.push([i, i+9, 'promote', BLACK_ROOK]);
					movelist.push([i, i+9, 'promote', BLACK_QUEEN]);
				}
			}
			break;

		case WHITE_KNIGHT:
		case BLACK_KNIGHT:
			if(curY > 1) {
				if(curY > 2) {
					if(curX > 1 && moveToFunc(i-17)) movelist.push([i, i-17]);
					if(curX < 8 && moveToFunc(i-15)) movelist.push([i, i-15]);
				}
				if(curX < 7 && moveToFunc(i-6)) movelist.push([i, i-6]);
				if(curX > 2 && moveToFunc(i-10)) movelist.push([i, i-10]);
			}
			if(curY < 8) {
				if(curY < 7) {
					if(curX > 1 && moveToFunc(i+15)) movelist.push([i, i+15]);
					if(curX < 8 && moveToFunc(i+17)) movelist.push([i, i+17]);
				}
				if(curX < 7 && moveToFunc(i+10)) movelist.push([i, i+10]);
				if(curX > 2 && moveToFunc(i+6)) movelist.push([i, i+6]);
			}
			break;

		case WHITE_BISHOP:
		case BLACK_BISHOP:

			cS = i; cX = curX-1; cY = curY-1; stop = false;
			while(cX > 0 && cY > 0 && !stop) {
				cS -= 9; cX -=1; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; cY = curY-1; stop = false;
			while(cX < 9 && cY > 0 && !stop) {
				cS -= 7; cX +=1; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX-1; cY = curY+1; stop = false;
			while(cX > 0 && cY < 9 && !stop) {
				cS += 7; cX -=1; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; cY = curY+1; stop = false;
			while(cX < 9 && cY < 9 && !stop) {
				cS += 9; cX +=1; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			break;

		case WHITE_ROOK:
		case BLACK_ROOK:
			cS = i; cX = curX-1; stop = false;
			while(cX && !stop) {
				cS -= 1; cX -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; stop = false;
			while(cX < 9 && !stop) {
				cS += 1; cX +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cY = curY-1; stop = false;
			while(cY && !stop) {
				cS -= 8; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cY = curY+1; stop = false;
			while(cY < 9 && !stop) {
				cS += 8; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			break;

		case WHITE_QUEEN:
		case BLACK_QUEEN:
			cS = i; cX = curX-1; cY = curY-1; stop = false;
			while(cX > 0 && cY > 0 && !stop) {
				cS -= 9; cX -=1; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; cY = curY-1; stop = false;
			while(cX < 9 && cY > 0 && !stop) {
				cS -= 7; cX +=1; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX-1; cY = curY+1; stop = false;
			while(cX > 0 && cY < 9 && !stop) {
				cS += 7; cX -=1; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; cY = curY+1; stop = false;
			while(cX < 9 && cY < 9 && !stop) {
				cS += 9; cX +=1; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX-1; stop = false;
			while(cX && !stop) {
				cS -= 1; cX -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cX = curX+1; stop = false;
			while(cX < 9 && !stop) {
				cS += 1; cX +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cY = curY-1; stop = false;
			while(cY && !stop) {
				cS -= 8; cY -=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			cS = i; cY = curY+1; stop = false;
			while(cY < 9 && !stop) {
				cS += 8; cY +=1;
				if(moveToFunc(cS)) movelist.push([i, cS]);
				if(tP[cS] !== 0) stop = true;
			}
			break;

		case WHITE_KING: // white king
			if(thisnode.castle.K && 
				tP[61] === 0 && 
				tP[62] === 0 && 
				!squareInCheck(thisnode, 60, true) && 
				!squareInCheck(thisnode, 61, true) && 
				!squareInCheck(thisnode, 62, true)
			) {
				movelist.push([i, i+2, 'castle', WHITE_KING_A]);
			}
			if(thisnode.castle.Q && 
				tP[57] === 0 && 
				tP[58] === 0 && 
				tP[59] === 0 && 
				!squareInCheck(thisnode, 58, true) && 
				!squareInCheck(thisnode, 59, true) && 
				!squareInCheck(thisnode, 60, true)
			) {
				movelist.push([i, i-2, 'castle', WHITE_QUEEN_A]);
			}
			if(curX > 1) {
				if(tP[i-1] < 7) movelist.push([i, i-1]);
				if(curY > 1 && tP[i-9] < 7) movelist.push([i, i-9]);
				if(curY < 8 && tP[i+7] < 7) movelist.push([i, i+7]);
			}
			if(curY < 8 && tP[i+8] < 7) movelist.push([i, i+8]);
			if(curY > 1 && tP[i-8] < 7) movelist.push([i, i-8]);
			if(curX < 8) {
				if(tP[i+1] < 7) movelist.push([i, i+1]);
				if(curY > 1 && tP[i-7] < 7) movelist.push([i, i-7]);
				if(curY < 8 && tP[i+9] < 7) movelist.push([i, i+9]);
			}
			break;

		case BLACK_KING: // black king
			if(thisnode.castle.k && 
				tP[5] === 0 && 
				tP[6] === 0 && 
				!squareInCheck(thisnode, 4, false) && 
				!squareInCheck(thisnode, 5, false) && 
				!squareInCheck(thisnode, 6, false)
			) {
				movelist.push([i, i+2, 'castle', BLACK_KING_A]);
			}
			if(thisnode.castle.q && 
				tP[1] === 0 && 
				tP[2] === 0 && 
				tP[3] === 0 && 
				!squareInCheck(thisnode, 2, false) && 
				!squareInCheck(thisnode, 3, false) && 
				!squareInCheck(thisnode, 4, false)
			) {
				movelist.push([i, i-2, 'castle', BLACK_QUEEN_A]);
			}
			if(curX > 1) {
				if(tP[i-1] === 0 || tP[i-1] > 6) movelist.push([i, i-1]);
				if(curY > 1 && (tP[i-9] === 0 || tP[i-9] > 6)) movelist.push([i, i-9]);
				if(curY < 8 && (tP[i+7] === 0 || tP[i+7] > 6)) movelist.push([i, i+7]);
			}
			if(curY > 1 && (tP[i-8] === 0 || tP[i-8] > 6)) movelist.push([i, i-8]);
			if(curY < 8 && (tP[i+8] === 0 || tP[i+8] > 6)) movelist.push([i, i+8]);
			if(curX < 8) {
				if(tP[i+1] === 0 || tP[i+1] > 6) movelist.push([i, i+1]);
				if(curY > 1 && (tP[i-7] === 0 || tP[i-7] > 6)) movelist.push([i, i-7]);
				if(curY < 8 && (tP[i+9] === 0 || tP[i+9] > 6)) movelist.push([i, i+9]);
			}
		}


	}
	var tempnode;
	var ml = movelist.length;
	while(ml--) {
		tempnode = fastCloneNode(thisnode);
		if(kingInCheck(doMove(tempnode, movelist[ml]), color)) movelist.splice(ml,1);
	}
	return movelist;
};

var parsefen = function(fen) {
	var returnNode = new game.node();
	var fenparts = fen.split(' ');
	var positions = fenparts[0].split('/');
	var row = 0;
	var col = 0;
	var mark = 0;
	var this_position, this_position_code;

	positions.forEach(function(position) {
		col = 0;
		for(var p = 0; p < position.length; p++) {
			mark = ((row * 8) + col);
			this_position = position[p];
			this_position_code = this_position.charCodeAt();
			if(this_position_code > 47 && this_position_code < 58) {
				for(var r = 0; r < +(this_position); r++) {
					returnNode.position[mark + r] = 0;
				}
				col += (+this_position);
			} else {
				returnNode.position[mark] = game.pieces.symbols[this_position];
				col++;
			}
		}
		row++;
	});
	returnNode.move = (fenparts[1].toLowerCase() === 'w');
	var castlemark = fenparts[2].length;
	while(castlemark--) {
		if(fenparts[2][castlemark] in { 'k':'', 'K':'', 'q':'', 'Q':'' }) {
			returnNode.castle[fenparts[2][castlemark]] = true;
		}
	}
	if(fenparts[3] !== '-' && typeof game.algebraicSquares.symbols[fenparts[3]] !== 'undefined') {
		returnNode.enpassantSquare = game.algebraicSquares.symbols[fenparts[3]];
	} else {
		returnNode.enpassantSquare = -1;
	}
	if(fenparts[4] === +fenparts[4]) returnNode.drawClock = +fenparts[4];
	if(fenparts[5] === +fenparts[5]) returnNode.moveNumber = +fenparts[5];

	return returnNode;
};

var outputfen = function(curnode) {
	var sq = -1;
	var empty;
	var fen = '';
	for(var y = 0; y < 8; y++) {
		empty = 0;
		for(var x = 0; x < 8; x++) {
			sq++;
			if(curnode.position[sq] && empty) {
				fen += empty;
				empty = 0;
			}
			if(curnode.position[sq]) {
				fen += game.pieces.numbers[curnode.position[sq]];
			} else {
				empty++;
			}
		}
		if(empty) fen += empty;
		if(y < 7) fen += '/';
	}
	fen += (curnode.move) ? ' w' : ' b';
	var castlestr = '';
	for(var i in curnode.castle) {
		if(curnode.castle[i]) {
			castlestr += i;
		}
	}
	if(castlestr !== '') {
		fen += ' ' + castlestr;
	} else {
		fen += ' -';
	}
	if(curnode.enpassantSquare > -1) {
		fen += ' ' + game.algebraicSquares.numbers[curnode.enpassantSquare];
	} else {
		fen += ' -';
	}
	fen += ' ' + curnode.drawClock + ' ' + curnode.moveNumber;
	return fen;
};

var makePositionString = function(thisnode) {
	var positionString = 'p';

	for (var i = 0; i < 64; i += 1) {
		positionString += game.pieces.hashNumbers[thisnode.position[i]];
	}
	positionString += (thisnode.move ? 'w' : 'b');
	positionString += (thisnode.castle.K ? '1' : '0');
	positionString += (thisnode.castle.Q ? '1' : '0');
	positionString += (thisnode.castle.k ? '1' : '0');
	positionString += (thisnode.castle.q ? '1' : '0');
	return positionString;
}

var squareInCheck = function(curnode, square, color) {
	// made this square-agnostic instead of king-specific since I need to check for things like
	// a king can't castle through check, so need to check the spaces between. Will also probably
	// use this in position evaluation to analyze pressures in arbitrary spots on the board.

	// See the kingInCheck() function below this one that calls this specifically for kings.
	var curX = game.coords[square][0];
	var curY = game.coords[square][1];
 	var isCheck = false;
 	var ENEMY_PAWN, ENEMY_KNIGHT, ENEMY_BISHOP, ENEMY_ROOK, ENEMY_QUEEN, ENEMY_KING;
 	var cS, cX, cY, stop;

 	if(color) {
 		ENEMY_PAWN = BLACK_PAWN;
 		ENEMY_KNIGHT = BLACK_KNIGHT;
 		ENEMY_BISHOP = BLACK_BISHOP;
 		ENEMY_ROOK = BLACK_ROOK;
 		ENEMY_QUEEN = BLACK_QUEEN;
 		ENEMY_KING = BLACK_KING;
 	} else {
 		ENEMY_PAWN = WHITE_PAWN;
 		ENEMY_KNIGHT = WHITE_KNIGHT;
 		ENEMY_BISHOP = WHITE_BISHOP;
 		ENEMY_ROOK = WHITE_ROOK;
 		ENEMY_QUEEN = WHITE_QUEEN;
 		ENEMY_KING = WHITE_KING;
 	}

	// check if a black knight can reach this square
	if(curX < 7 && curY > 1 && curnode.position[square - 6] === ENEMY_KNIGHT) return true;
	if(curX < 7 && curY < 8 && curnode.position[square + 10] === ENEMY_KNIGHT) return true;
	if(curX < 8 && curY > 2 && curnode.position[square - 15] === ENEMY_KNIGHT) return true;
	if(curX < 8 && curY < 7 && curnode.position[square + 17] === ENEMY_KNIGHT) return true;

	if(curX > 2 && curY > 1 && curnode.position[square - 10] === ENEMY_KNIGHT) return true;
	if(curX > 2 && curY < 8 && curnode.position[square + 6] === ENEMY_KNIGHT) return true;
	if(curX > 1 && curY > 2 && curnode.position[square - 17] === ENEMY_KNIGHT) return true;
	if(curX > 1 && curY < 7 && curnode.position[square + 15] === ENEMY_KNIGHT) return true;

		// check left
	cS = square; cX = curX; cY = curY; stop = false;
	while(--cX && !stop) {
		cS--;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_ROOK || 
			(
				cX === curX - 1 && 
				curnode.position[cS] === ENEMY_KING
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check right
	cS = square; cX = curX; cY = curY; stop = false;
	while(++cX && cX < 9 && !stop) {
		cS++;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_ROOK || 
			(
				cX === curX + 1 && 
				curnode.position[cS] === ENEMY_KING
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check up
	cS = square; cX = curX; cY = curY; stop = false;
	while(--cY && !stop) {
		cS-=8;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_ROOK || 
			(
				cY === curY - 1 && 
				curnode.position[cS] === ENEMY_KING
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check down
	cS = square; cX = curX; cY = curY; stop = false;
	while(++cY && cY < 9 && !stop) {
		cS+=8;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_ROOK || 
			(
				cY === curY + 1 && 
				curnode.position[cS] === ENEMY_KING
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check up/left
	cS = square; cX = curX; cY = curY; stop = false;
	while(--cX && --cY && !stop) {
		cS-=9;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_BISHOP || 
			(
				cX === curX - 1 && 
				cY === curY - 1 && 
				(
					curnode.position[cS] === ENEMY_KING || 
					(color && curnode.position[cS] === ENEMY_PAWN)
				)
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check down/left
	cS = square; cX = curX; cY = curY; stop = false;
	while(--cX && ++cY && cY < 9 && !stop) {
		cS+=7;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_BISHOP || 
			(
				cX === curX - 1 && 
				cY === curY + 1 && 
				(
					curnode.position[cS] === ENEMY_KING ||
					(!color && curnode.position[cS] === ENEMY_PAWN)
				)
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check up/right
	cS = square; cX = curX; cY = curY; stop = false;
	while(++cX && cX < 9 && --cY && !stop) {
		cS-=7;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_BISHOP || 
			(
				cX === curX + 1 && 
				cY === curY - 1 && 
				(
					curnode.position[cS] === ENEMY_KING || 
					(color && curnode.position[cS] === ENEMY_PAWN)
				)
			)
		) return true;
		if(+curnode.position[cS]) stop = true;
	}

	// check down/right
	cS = square; cX = curX; cY = curY; stop = false;
	while(++cX && cX < 9 && ++cY && cY < 9 && !stop) {
		cS+=9;
		if(curnode.position[cS] === ENEMY_QUEEN || 
			curnode.position[cS] === ENEMY_BISHOP || 
			(
				cX === curX + 1 && 
				cY === curY + 1 && 
				(
					curnode.position[cS] === ENEMY_KING ||
					(!color && curnode.position[cS] === ENEMY_PAWN)
				)
			)
		)	return true;
		if(+curnode.position[cS]) stop = true;
	}

	return false;
};

var kingInCheck = function(curnode, color) {
	var sq = 64;
	while(sq--) {
		if(!color && curnode.position[sq] === BLACK_KING) {
			return squareInCheck(curnode, sq, color);
		}
		if(color && curnode.position[sq] === WHITE_KING) {
			return squareInCheck(curnode, sq, color);
		}
	}
	return false;
};

var doMove = function(curnode, themove) {
	// take in a node and a move and return a new node with the move having been played.

	// sample 'themove's
	// [55,47]
	// [55,39,'ep-enable',47]
	// [4,6,'castle','K']

	// update drawClock (50 moves without pawn move or capture = draw)
	if(curnode.position[themove[0]] === 1 || curnode.position[themove[0]] === 7 || curnode.position[themove[1]]) {
		curnode.drawClock = 0;
	} else {
		curnode.drawClock++;
	}
	if(curnode.position[themove[0]] === 6) {
		curnode.castle.k = false;
		curnode.castle.q = false;
	}
	if(curnode.position[themove[0]] === 12) {
		curnode.castle.K = false;
		curnode.castle.Q = false;
	}
	if(themove[0] === 0 && curnode.position[themove[0]] === 4) {
		curnode.castle.q = false;
	}
	if(themove[0] === 7 && curnode.position[themove[0]] === 4) {
		curnode.castle.k = false;
	}
	if(themove[0] === 56 && curnode.position[themove[0]] === 10) {
		curnode.castle.Q = false;
	}
	if(themove[0] === 63 && curnode.position[themove[0]] === 10) {
		curnode.castle.K = false;
	}

	// actually move the piece
	curnode.position[themove[1]] = curnode.position[themove[0]];
	curnode.position[themove[0]] = 0;

	curnode.enpassantSquare = -1;
	if(themove.length > 2) {
		switch(themove[2]) {
		case 'promote':
			curnode.position[themove[1]] = +themove[3];
			break;
		case 'ep-enable':
			curnode.enpassantSquare = themove[3];
			break;
		case 'ep-capture':
			curnode.position[themove[3]] = 0;
			break;
		case 'castle':
			switch(themove[3]) {
			case BLACK_KING_A:
				curnode.position[5] = curnode.position[7];
				curnode.position[7] = 0;
				break;
			case BLACK_QUEEN_A:
				curnode.position[3] = curnode.position[0];
				curnode.position[0] = 0;
				break;
			case WHITE_KING_A:
				curnode.position[61] = curnode.position[63];
				curnode.position[63] = 0;
				break;
			case WHITE_QUEEN_A:
				curnode.position[59] = curnode.position[56];
				curnode.position[56] = 0;
				break;
			}
		}
	}
	if(!curnode.move) curnode.moveNumber++;
	curnode.move = !curnode.move;
	return curnode;
};

game.postOutput = function(output, color) {
	if(color) {
		$('.white-side .engine-output-text').prepend('<p>' + output + '</p>');
	} else {
		$('.black-side .engine-output-text').prepend('<p>' + output + '</p>');
	}
}

game.receiveMove = function(response) {
	var curnode = $board.data('node');
	var themove = response.move;
	if(response.output) {
		game.postOutput(response.output, curnode.move);
	}

	if(curnode.position[themove[0]] === WHITE_KING && Math.abs(themove[1] - themove[0]) === 2 && themove.length < 3) {
		if(themove[0] === 60 && themove[1] === 62) {
			themove[2] = 'castle';
			themove[3] = 'K';
		}
		if(themove[0] === 60 && themove[1] === 58) {
			themove[2] = 'castle';
			themove[3] = 'Q';
		}
	}
	if(curnode.position[themove[0]] === BLACK_KING && Math.abs(themove[1] - themove[0]) === 2 && themove.length < 3) {
		if(themove[0] === 4 && themove[1] === 6) {
			themove[2] = 'castle';
			themove[3] = 'k';
		}
		if(themove[0] === 4 && themove[1] === 2) {
			themove[2] = 'castle';
			themove[3] = 'q';
		}
	}

	doMoveUI(themove);
	setTimeout(function() { game.pushMove(curnode, themove); }, 300);
}

game.requestMove = function() { 
	if(!game.gameOn) return false;
	var curnode = $board.data('node');
	var curengine = game.engines[ game.playerSettings[ curnode.move ? 0 : 1 ] ];
	if(curengine.type && curengine.type === 'async') {
		game.engines[ game.playerSettings[ curnode.move ? 0 : 1 ] ].requestMove(curnode);
	} else if(curengine.name !== 'Player' && typeof curengine.getMove === 'function') {
		game.receiveMove(game.engines[ game.playerSettings[ curnode.move ? 0 : 1 ] ].getMove(curnode));
	}
};

game.highlightTurn = function() {
	if(!game.gameOn) return false;
	var curnode = $board.data('node');
	if(curnode.move) {
		$('.white-side').addClass('active');
		$('.black-side').removeClass('active');
	} else {
		$('.black-side').addClass('active');
		$('.white-side').removeClass('active');
	}	
	var curengine = game.engines[ game.playerSettings[ curnode.move ? 0 : 1 ] ];
	if(curengine.name !== 'Player') {
		$('#board-container').removeClass('isPlayerMove');
		$('.movablePiece').removeClass('movablePiece');
	} else {
		$('#board-container').addClass('isPlayerMove');
		$('.movablePiece').removeClass('movablePiece');
		var ml = game.moveGen(curnode);
		var pml = [];
		$('.piece').data('toSQs', []);
		for(var il = ml.length, i = 0; i < il; i++) {
			$('#piece-' + ml[i][0]).addClass('movablePiece');
		}
	}
}

game.pushMove = function(curnode, move) {
	if(typeof game.gamemoves[curnode.moveNumber] === 'undefined') game.gamemoves[curnode.moveNumber] = [];
	var curmove = (curnode.move) ? 0 : 1;
	var movestr = (!move) ? '...' : getMoveString(curnode, move);
	var tempnode = fastCloneNode(curnode);
	tempnode = doMove(tempnode, move);
	game.gamemoves[curnode.moveNumber][curmove] = {
		fen: outputfen(tempnode),
		movestring: movestr
	};
	$('#fen').val(outputfen(curnode));
	if(!curmove && typeof game.gamemoves[curnode.moveNumber][1] !== 'undefined') game.gamemoves[curnode.moveNumber].splice(1,1);
	game.gamemoves.splice(curnode.moveNumber + 1, game.gamemoves.length - curnode.moveNumber);

	if(!!move) curnode = doMove(curnode, move);
	$board.data('node', curnode);
	updateBoard();
	game.highlightTurn();

	if(game.gameOn && ((curnode.move && game.playerSettings[0] !== 'Player') || (!curnode.move && game.playerSettings[1] !== 'Player'))) {
		setTimeout(game.requestMove, 0);
	}
};

game.resetGame = function() {
	var resetFen;
	game.gameOn = true;
	if(arguments.length) {
		resetFen = arguments[0];
	} else {
		resetFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';	
	}
	$('.square').text(' ');
	game.gamemoves = [];
	var curnode = parsefen(resetFen);
	$board.data('node', curnode);
	$('.piece').remove();
	redrawBoard(); 
	game.pushMove(curnode, false);
};

/*

ui stuff

getMoveString: pass a node and a themove and get back algebraic move notation
updateMoveList: get current board node, generate movelist and update the list on the right
updateGameMoveList: update game move list on the right with the moves that have been played
updateBoard: update pieces and display based on the board's current node

*/

var getMoveString = function(curnode, ml) {
	var mlhtml = '';
	if(ml.length > 2 && ml[2] === 'castle' && (ml[3] === BLACK_KING_A || ml[3] === WHITE_KING_A)) {
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">o-o</span>';
	} else if(ml.length > 2 && ml[2] === 'castle' && (ml[3] === BLACK_QUEEN_A || ml[3] == WHITE_QUEEN_A)) {
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">o-o-o</span>';
	} else {
		mlhtml += game.ucpieces[game.pieces.numbers[curnode.position[ml[0]]]];
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">' + game.algebraicSquares.numbers[ml[0]] + '</span>';
		if(curnode.position[ml[1]] || (ml.length > 2 && ml[3] === 'ep-capture')) {
			mlhtml += 'x';
		}
		mlhtml += '<span class="sq2" data-square="' + ml[1] + '">' + game.algebraicSquares.numbers[ml[1]] + '</span>';
		if(ml.length > 2) {
			switch(ml[2]) {
			case 'promote':
				mlhtml += '=' + game.ucpieces[game.pieces.numbers[ml[3]]];
				break;
			case 'ep-capture':
				mlhtml += 'ep';
				break;
			}
		}
	}
	mlhtml += '</li>';
	return mlhtml;
};

var updateMoveList = function() {
	// general ui function: run moveGen and update the move list ui
	if(!game.gameOn) return false;
	var curnode = $board.data('node');
	var ml = game.moveGen( curnode );
	var mlhtml = '';
	if(curnode.drawClock > 49 || !ml.length) {
		game.gameOn = false;
		if(!ml.length) {
			if(kingInCheck(curnode, curnode.move)) {
				mlhtml = 'Checkmate!! ';
				mlhtml += (curnode.move) ? 'Black' : 'White';
				mlhtml += ' wins!!';
			} else {
				mlhtml = 'Draw by stalemate!!';
			}
		} else {
			mlhtml = 'Draw via 50-move rule.';
		}
		$('#possible-moves .button-action').attr('disabled', 'disabled');
		alert(mlhtml);
		mlhtml = '<p>' + mlhtml + '</p>';
		$movelist.html(mlhtml);
		return false;
	} else {
		game.gameOn = true;
	}
	$('#possible-moves .button-action').removeAttr('disabled');
	mlhtml = '<ul>';
	ml.forEach(function(mlm, index) {
		mlhtml += '<li data-movegenid="' + index + '">' + getMoveString(curnode, mlm) + '</li>';
	});
	mlhtml += '</ul>';
	$movelist.html(mlhtml);
	return true;
};

var updateGameMoveList = function() {
	var gmhtml = '';
	game.gamemoves.forEach(function(gm, gmi) {
		gmhtml += '<li class="movenumber">' + gmi + '.</li>';
		if(typeof gm[0] !== 'undefined') {
			gmhtml += '<li class="gm-white move-item" data-fen="' + gm[0].fen + '">' + gm[0].movestring + '</li>';
		}
		if(typeof gm[1] !== 'undefined') {
			gmhtml += '<li class="gm-black move-item" data-fen="' + gm[1].fen + '">' + gm[1].movestring + '</li>';
		}
	});
	$('#game-moves ul').html(gmhtml);
};

var redrawBoard = function() {
	var thisnode = $board.data('node');
	var thisposition = thisnode.position;
	var mark = 64;
	var row = 7, col = 7;
	var pieceHTML = '';
	var thispiece, thisColor;

	while(mark--) {
		if(thisposition[mark]) {
			thispiece = game.pieces.numbers[thisposition[mark]];
			thisColor = (thispiece.toLowerCase() === thispiece) ? 'pblack' : 'pwhite';
			pieceHTML += '<span id="piece-' + mark + '" data-square="' + mark + '" class="piece ' + thisColor + '" style="left: ' + (col * squareSize) + 'px; top: ' + (row * squareSize) + 'px">' + (thispiece !== ' ' ? game.ucpieces[thispiece] : '&nbsp;') + '</span>';
		}
		col --;
		if(col === -1) {
			row --;
			col = 7;
		}
	}
	$('.piece').remove();
	$('#board').append(pieceHTML);
	game.highlightTurn();
};

var doMoveUI = function(themove) {
	var toRow = themove[1] >> 3;
	var toCol = themove[1] - (toRow * 8);
	$('#piece-' + themove[1]).remove();
	$('#piece-' + themove[0]).attr('id', 'piece-' + themove[1]).css({
		left: toCol * squareSize,
		top: toRow * squareSize
	}).data('square', themove[1]);
	if(themove.length > 2) {
		if(themove[2] === 'castle') {
			if(themove[3] === WHITE_KING_A) {
				doMoveUI([63,61]);
			} 
			if(themove[3] === WHITE_QUEEN_A) {
				doMoveUI([56,59]);
			} 
			if(themove[3] === BLACK_KING_A) {
				doMoveUI([7,5]);
			} 
			if(themove[3] === BLACK_QUEEN_A) {
				doMoveUI([0,3]);
			} 
		} else if(themove[2] === 'promote') {
			$('#piece-' + themove[1]).html(game.ucpieces[game.pieces.numbers[themove[3]]]);
		} else if(themove[2] === 'ep-capture') {
			$('#piece-' + themove[3]).remove();
		}
	}
};

var updateBoard = function() {
	var thisnode = $board.data('node');

	if(typeof game.gamemoves[thisnode.moveNumber] === 'undefined') game.gamemoves[thisnode.moveNumber] = [];
	var curmove = (thisnode.move) ? 0 : 1;
	var thisposition = thisnode.position;
	var epsquare = (+thisnode.enpassantSquare === -1) ? '-' : thisnode.enpassantSquare;
	var castle = '';

	if(epsquare > -1) epsquare = game.algebraicSquares.numbers[epsquare];
	for(var i in thisnode.castle) {
		if(thisnode.castle[i]) {
			castle += i + ' ';
		} else {
			castle += '- ';
		}
	}

	$('.fromsq').removeClass('fromsq');
	$('#movenumber').html('<p class=\"info\">Move number: ' + thisnode.moveNumber + '</p>');
	$('#drawclock').html('<p class=\"info\">Draw clock: ' + thisnode.drawClock + '</p>');
	$('#enpassant').html('<p class=\"info\">En passant square: ' + epsquare + '</p>');
	$('#castle').html('<p class=\"info\">Castles: ' + castle + '</p>');
	$movelist.find('ul').html('');
	game.gameOn = updateMoveList();
	updateGameMoveList();
 
	return game.gameOn;
};

$doc.ready(function(){
	var html = '';
	var b = true;
	var row = 0, col = 0;
	for(var r = 0; r < 64; r++) {
		html += '<div id="square' + r + '" class="square ' + (b?'white':'black') + '" data-square="' + r + '"> </div>';
		col ++;
		if(col === 8) {
			row ++;
			col = 0;
		}
		if((r+1) / 8 !== ~~((r+1) / 8)) b = !b;
	}
	$board.html(html);
	html = '';

	var playerHTML = '';
	Object.keys(game.engines).forEach(function(i) {
		playerHTML += '<option value="' + i + '">' + game.engines[i].displayName + '</option>';
	});
	$('.player-dd').html(playerHTML);

	$('#player1').val(game.playerSettings[0]);
	$('#player2').val(game.playerSettings[1]);

	game.resetGame();
});

$('#submitfen').on('click', function() {
	game.resetGame($('#fen').val());
});

$doc.on('click', '.cancel-modal', function() {
	$('.modal').css('display', 'none');
});

$doc.on('click', '.promote-button', function() {
	var $this = $(this);
	var parentModal = $this.parents('.modal').eq(0);
	if(!parentModal.length) return false;
	var fromsq = parentModal.data('fromsq');
	var tosq = parentModal.data('tosq');
	var themove = [fromsq, tosq, 'promote', $this.data().piece];
	var curnode = $board.data('node');
	game.pushMove(curnode, themove);
	doMoveUI(themove);
	$('.modal').css('display', 'none');
});

$doc.on('click', '#possible-moves li', function() {
	if(!game.gameOn) return false;
	var thisnode = $board.data('node');
	var thismove = game.moveGen(thisnode)[$(this).data().movegenid];
	game.pushMove(thisnode, thismove);
	doMoveUI(thismove);
});

$doc.on('click', '#game-moves li.move-item', function() {
	var thisFen = $(this).attr('data-fen');
	var curnode = parsefen(thisFen);
	$('#fen').val(thisFen);
	$board.data('node', curnode);
	updateBoard();
	redrawBoard();
});

$doc.on('click touchend', '.piece, .square', function() {
	if(!game.gameOn) return false;
	var $this = $(this);
	$('.modal').css('display', 'none');
	if($('.fromsq').length) {
		var curnode = $board.data('node');
		var ml = game.moveGen(curnode);
		var fromsq = +$('.fromsq').eq(0).data().square;
		var tosq = +$this.data().square;
		var themove = 0;
		for(var i in ml) {
			if(ml[i][0] === fromsq && ml[i][1] === tosq) {
				themove = i;
				break;
			}
		}
		if(themove) {
			if(ml[themove][2] !== 'promote') doMoveUI(ml[themove]);
			if(ml[themove].length > 2 && ml[themove][2] === 'promote') {
				var sqpos = $(this).position();
				if((sqpos.left -= 150) < 0) sqpos.left = 0;
				if((sqpos.top -= 50) < 0) sqpos.top = 0;
				if(curnode.move) {
					$('#promote-white').css({
						display: 'block'
					}).data({ tosq: tosq, fromsq: fromsq });
				} else {
					$('#promote-black').css({
						display: 'block'
					}).data({ tosq: tosq, fromsq: fromsq });
				}
				return true;
			}
			setTimeout(function() { game.pushMove(curnode, ml[themove]); }, 300);
		} else if($this.hasClass('movablePiece')) {
			$('.fromsq').removeClass('fromsq');
			$this.addClass('fromsq');
		}
	} else if($this.hasClass('movablePiece')) {
		$this.addClass('fromsq');
	}
});

$('.player-dd').on('change', function() {
	if(this.name === 'player1') game.playerSettings[0] = $(this).val();
	if(this.name === 'player2') game.playerSettings[1] = $(this).val();
	if(!game.gameOn) return false;
	var curnode = $board.data('node');
	if((curnode.move && game.playerSettings[0] !== 'Player') || (!curnode.move && game.playerSettings[1] !== 'Player')) {
		game.requestMove();
	}
});

$('#reset-game').on('click', function() {
	game.resetGame();
});

game.engines.randomMover = {
	name: 'randomMover',
	displayName: 'randomMover',
	getMove: function(curnode) {
		var ml = game.moveGen( curnode );
		var themove = ml[~~(Math.random() * ml.length)];
		return { move: themove };
	}
};

var winHeight = $win.height();
var winWidth = $win.width();
var squareSize = 0;

var adjustLayout = function() {
	winHeight = $win.height();
	winWidth = $win.width();
	var boardSize;
	var $boardContainer = $('#board-container');
	$boardContainer.css({ width: '' });
	boardSize = $boardContainer.width() + 55;
	if(boardSize > winHeight) {
		boardSize = winHeight;
	}
	if(winWidth > 640) {
		$boardContainer.css({ width: boardSize - 60, height: boardSize - 60 });
		$('#board').css({
			fontSize: boardSize / 12
		});
	} else {
		$boardContainer.css({ width: boardSize, height: boardSize });
		$('#board').css({
			fontSize: boardSize / 11
		});
	}
	squareSize = $('.square').width() + 2;
	redrawBoard();
	// var boardInner = $('.board-inner').width();
	// squareSize = boardInner / 8;
	// $('.csquare, .piece, .square').css({
	// 	width: squareSize,
	// 	height: squareSize
	// });
}
$win.on('load resize', adjustLayout);

$bc.on('mouseenter', '.piece', function() {
	var $this = $(this);
	var square = $this.data().square;
	$('#square' + square).addClass('hover');
});
$bc.on('mouseleave', '.piece', function() {
	var $this = $(this);
	var square = $this.data().square;
	$('#square' + square).removeClass('hover');
});
$('#flip-board').on('click', function() {
	$('#board-container').toggleClass('flipped');
});