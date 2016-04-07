(function () {

'use strict';

var BLACK_PAWN = 1,
	BLACK_KNIGHT = 2,
	BLACK_BISHOP = 3,
	BLACK_ROOK = 4,
	BLACK_QUEEN = 5,
	BLACK_KING = 6,

	WHITE_PAWN = 8,
	WHITE_KNIGHT = 9,
	WHITE_BISHOP = 10,
	WHITE_ROOK = 11,
	WHITE_QUEEN = 12,
	WHITE_KING = 13;

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

var coords = [];
var coords0 = [];
var sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		coords[sq] = [9-r, i+1];
		coords0[sq] = [8-r, i];
		sq++;
	}
}
var pieces = {
	symbols: {
		p: 1,
		n: 2,
		b: 3,
		r: 4,
		q: 5,
		k: 6,
		P: 8,
		N: 9,
		B: 10,
		R: 11,
		Q: 12,
		K: 13
	}, 
	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K'],
	hashNumbers: ['e', 'p', 'n', 'b', 'r', 'q', 'k', null, 'P', 'N', 'B', 'R', 'Q', 'K']
};

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
var makePositionString = function(thisnode) {
	var positionString = 'p';

	for (var i = 0; i < 64; i += 1) {
		positionString += pieces.hashNumbers[thisnode.position[i]];
	}
	positionString += (thisnode.move ? 'w' : 'b');
	positionString += (thisnode.castle.K ? '1' : '0');
	positionString += (thisnode.castle.Q ? '1' : '0');
	positionString += (thisnode.castle.k ? '1' : '0');
	positionString += (thisnode.castle.q ? '1' : '0');
	return positionString;
}


		var moveGen = function(thisnode) {

			// function that returns a list of legal moves
			// for a given board position (node)

			var tS;
			var color = thisnode.move;
			var tP = thisnode.position;
			var movelist = [];
			var curX = 0;
			var curY = 1;
			var cS, cY, cX, stop;
			var kingpos;

		 	var ENEMY_PAWN, ENEMY_KNIGHT, ENEMY_BISHOP, ENEMY_ROOK, ENEMY_QUEEN, ENEMY_KING;

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

		 	for(var i = 0; i < 64; i++) {

				// tS === 'this' square (numerical value of piece, see pieces.numbers for reference)
				// tP === 'this' position (array 0-63 of piece #'s)

				tS = tP[i];
				if(tS === 0 || (color && tS < 7) || (!color && tS > 7)) continue;

				if(typeof tS === 'string') console.log('string detected', tP);

				// curX and curY store rank/col information to avoid *'s and /'s
				curY = i >> 3;
				curX = i - (curY << 3) + 1;
				curY += 1;

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
					if(curX > 1 && tP[i+7] > 7) {
						if(curY !== 7) {
							movelist.push([i, i+7]);
						} else {
							movelist.push([i, i+7, 'promote', BLACK_KNIGHT]);
							movelist.push([i, i+7, 'promote', BLACK_BISHOP]);
							movelist.push([i, i+7, 'promote', BLACK_ROOK]);
							movelist.push([i, i+7, 'promote', BLACK_QUEEN]);
						}
					}
					if(curX < 8 && tP[i+9] > 7) {
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
					if(curY > 1) {
						if(curY > 2) {
							if(curX > 1 && tP[i-17] < 7) movelist.push([i, i-17]);
							if(curX < 8 && tP[i-15] < 7) movelist.push([i, i-15]);
						}
						if(curX < 7 && tP[i-6] < 7) movelist.push([i, i-6]);
						if(curX > 2 && tP[i-10] < 7) movelist.push([i, i-10]);
					}
					if(curY < 8) {
						if(curY < 7) {
							if(curX > 1 && tP[i+15] < 7) movelist.push([i, i+15]);
							if(curX < 8 && tP[i+17] < 7) movelist.push([i, i+17]);
						}
						if(curX < 7 && tP[i+10] < 7) movelist.push([i, i+10]);
						if(curX > 2 && tP[i+6] < 7) movelist.push([i, i+6]);
					}
					break;

				case BLACK_KNIGHT:
					if(curY > 1) {
						if(curY > 2) {
							if(curX > 1 && (tP[i-17] === 0 || tP[i-17] > 7)) movelist.push([i, i-17]);
							if(curX < 8 && (tP[i-15] === 0 || tP[i-15] > 7)) movelist.push([i, i-15]);
						}
						if(curX < 7 && (tP[i-6] === 0 || tP[i-6] > 7)) movelist.push([i, i-6]);
						if(curX > 2 && (tP[i-10] === 0 || tP[i-10] > 7)) movelist.push([i, i-10]);
					}
					if(curY < 8) {
						if(curY < 7) {
							if(curX > 1 && (tP[i+15] === 0 || tP[i+15] > 7)) movelist.push([i, i+15]);
							if(curX < 8 && (tP[i+17] === 0 || tP[i+17] > 7)) movelist.push([i, i+17]);
						}
						if(curX < 7 && (tP[i+10] === 0 || tP[i+10] > 7)) movelist.push([i, i+10]);
						if(curX > 2 && (tP[i+6] === 0 || tP[i+6] > 7)) movelist.push([i, i+6]);
					}
					break;

				case WHITE_BISHOP:
					if(curX !== 1 && curY !== 1) {
						cS = i; cX = curX; cY = curY;
						while(cX-- > 1 && cY-- > 1) {
							cS -= 9; 
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 1) {
						cS = i; cX = curX; cY = curY;
						while(cX++ < 8 && cY-- > 1) {
							cS -= 7; 
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1 && curY !== 8) {
						cS = i; cX = curX; cY = curY;
						while(cX-- > 1 && cY++ < 8) {
							cS += 7; 
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 8) {
						cS = i; cX = curX; cY = curY;
						while(cX++ < 8 && cY++ < 8) {
							cS += 9; 
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case BLACK_BISHOP:
					if(curX !== 1 && curY !== 1) {
						cS = i; cX = curX; cY = curY;
						while(cX-- > 1 && cY-- > 1) {
							cS -= 9;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 1) {
						cS = i; cX = curX; cY = curY;
						while(cX++ < 8 && cY-- > 1) {
							cS -= 7;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1 && curY !== 8) {
						cS = i; cX = curX; cY = curY;
						while(cX-- > 1 && cY++ < 8) {
							cS += 7;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 8) {
						cS = i; cX = curX; cY = curY;
						while(cX++ < 8 && cY++ < 8) {
							cS += 9;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case WHITE_ROOK:
					if(curX !== 1) {
						cS = i; cX = curX-1;
						while(cX--) {
							cS --;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8) {
						cS = i; cX = curX+1;
						while(cX++ < 9) {
							cS ++;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 1) {
						cS = i; cY = curY-1;
						while(cY--) {
							cS -= 8;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 8) {
						cS = i; cY = curY+1;
						while(cY++ < 9) {
							cS += 8;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case BLACK_ROOK:
					if(curX !== 1) {
						cS = i; cX = curX-1;
						while(cX--) {
							cS --;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8) {
						cS = i; cX = curX+1;
						while(cX++ < 9) {
							cS ++;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 1) {
						cS = i; cY = curY-1;
						while(cY--) {
							cS -= 8;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 8) {
						cS = i; cY = curY+1;
						while(cY++ < 9) {
							cS += 8;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case WHITE_QUEEN:
					if(curX !== 1 && curY !== 1) {
						cS = i; cX = curX-1; cY = curY-1;
						while(cX-- > 0 && cY-- > 0) {
							cS -= 9;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 1) {
						cS = i; cX = curX+1; cY = curY-1;
						while(cX < 9 && cY > 0) {
							cS -= 7; cX ++; cY --;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1 && curY !== 8) {
						cS = i; cX = curX-1; cY = curY+1;
						while(cX > 0 && cY < 9) {
							cS += 7; cX --; cY ++;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 8) {
						cS = i; cX = curX+1; cY = curY+1;
						while(cX < 9 && cY < 9) {
							cS += 9; cX ++; cY ++;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1) {
						cS = i; cX = curX-1;
						while(cX) {
							cS --; cX --;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8) {
						cS = i; cX = curX+1;
						while(cX < 9) {
							cS += 1; cX +=1;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 1) {
						cS = i; cY = curY-1;
						while(cY) {
							cS -= 8; cY -=1;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 8) {
						cS = i; cY = curY+1;
						while(cY < 9) {
							cS += 8; cY +=1;
							if(tP[cS] < 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case BLACK_QUEEN:
					if(curX !== 1 && curY !== 1) {
						cS = i; cX = curX-1; cY = curY-1;
						while(cX-- > 0 && cY-- > 0) {
							cS -= 9;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 1) {
						cS = i; cX = curX+1; cY = curY-1;
						while(cX < 9 && cY > 0) {
							cS -= 7; cX ++; cY --;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1 && curY !== 8) {
						cS = i; cX = curX-1; cY = curY+1;
						while(cX > 0 && cY < 9) {
							cS += 7; cX --; cY ++;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8 && curY !== 8) {
						cS = i; cX = curX+1; cY = curY+1;
						while(cX < 9 && cY < 9) {
							cS += 9; cX ++; cY ++;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 1) {
						cS = i; cX = curX-1;
						while(cX) {
							cS --; cX --;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curX !== 8) {
						cS = i; cX = curX+1;
						while(cX < 9) {
							cS += 1; cX +=1;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 1) {
						cS = i; cY = curY-1;
						while(cY) {
							cS -= 8; cY -=1;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					if(curY !== 8) {
						cS = i; cY = curY+1;
						while(cY < 9) {
							cS += 8; cY +=1;
							if(tP[cS] === 0 || tP[cS] > 7) movelist.push([i, cS]);
							if(tP[cS] !== 0) break;
						}
					}
					break;

				case WHITE_KING: // white king

					kingpos = i;
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
						if(tP[i-9] < 7) movelist.push([i, i-9]);
						if(tP[i+7] < 7) movelist.push([i, i+7]);
					}
					if(tP[i+8] < 7) movelist.push([i, i+8]);
					if(tP[i-8] < 7) movelist.push([i, i-8]);
					if(curX < 8) {
						if(tP[i+1] < 7) movelist.push([i, i+1]);
						if(tP[i-7] < 7) movelist.push([i, i-7]);
						if(tP[i+9] < 7) movelist.push([i, i+9]);
					}
					break;

				case BLACK_KING: // black king
					kingpos = i;
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
						if(tP[i-1] === 0 || tP[i-1] > 7) movelist.push([i, i-1]);
						if(tP[i-9] === 0 || tP[i-9] > 7) movelist.push([i, i-9]);
						if(tP[i+7] === 0 || tP[i+7] > 7) movelist.push([i, i+7]);
					}
					if(tP[i-8] === 0 || tP[i-8] > 7) movelist.push([i, i-8]);
					if(tP[i+8] === 0 || tP[i+8] > 7) movelist.push([i, i+8]);
					if(curX < 8) {
						if(tP[i+1] === 0 || tP[i+1] > 7) movelist.push([i, i+1]);
						if(tP[i-7] === 0 || tP[i-7] > 7) movelist.push([i, i-7]);
						if(tP[i+9] === 0 || tP[i+9] > 7) movelist.push([i, i+9]);
					}
				}

			}
			var tempnode;
			var ml = movelist.length;
			var thismove;
			if(!kingpos) debugger;
			while(ml--) {
				thismove = movelist[ml];
				tempnode = fastCloneNode(thisnode);
				if(thismove[0] === kingpos) {
					if(squareInCheck(doMove(tempnode, thismove), thismove[1], color)) {
						movelist.splice(ml,1);
					}
				} else if(squareInCheck(doMove(tempnode, thismove), kingpos, color)) {
					movelist.splice(ml,1);
				}
			}
			return movelist;
		};

		var squareInCheck = function(curnode, square, color) {
			// made this square-agnostic instead of king-specific since I need to check for things like
			// a king can't castle through check, so need to check the spaces between. Will also probably
			// use this in position evaluation to analyze pressures in arbitrary spots on the board.

			// See the kingInCheck() function below this one that calls this specifically for kings.
			if(coords[square] === undefined) console.log('coords messed', curnode, square, color);
			var curX = coords[square][0];
			var curY = coords[square][1];
		 	var isCheck = false;
		 	var ENEMY_PAWN, ENEMY_KNIGHT, ENEMY_BISHOP, ENEMY_ROOK, ENEMY_QUEEN, ENEMY_KING;
		 	var cS, cX, cY, stop;

		 	if(color) {
		 		ENEMY_PAWN = 1;
		 		ENEMY_KNIGHT = 2;
		 		ENEMY_BISHOP = 3;
		 		ENEMY_ROOK = 4;
		 		ENEMY_QUEEN = 5;
		 		ENEMY_KING = 6;
		 	} else {
		 		ENEMY_PAWN = 8;
		 		ENEMY_KNIGHT = 9;
		 		ENEMY_BISHOP = 10;
		 		ENEMY_ROOK = 11;
		 		ENEMY_QUEEN = 12;
		 		ENEMY_KING = 13;
		 	}

			// check if a black knight can reach this square
			if(curX < 7) {
				if(curY > 1 && curnode.position[square - 6] === ENEMY_KNIGHT) return true;
				if(curY < 8 && curnode.position[square + 10] === ENEMY_KNIGHT) return true;
			}
			if(curX !== 8) {
				if(curY > 2 && curnode.position[square - 15] === ENEMY_KNIGHT) return true;
				if(curY < 7 && curnode.position[square + 17] === ENEMY_KNIGHT) return true;
			}
			if(curX > 2) {
				if(curY > 1 && curnode.position[square - 10] === ENEMY_KNIGHT) return true;
				if(curY < 8 && curnode.position[square + 6] === ENEMY_KNIGHT) return true;
			}
			if(curX !== 1) {
				if(curY > 2 && curnode.position[square - 17] === ENEMY_KNIGHT) return true;
				if(curY < 7 && curnode.position[square + 15] === ENEMY_KNIGHT) return true;
			}
			var curpiece;

				// check left

			if(curX !== 1) {
				cS = square; cX = curX;
				while(--cX) {
					cS--;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_ROOK || 
						(
							cX === curX - 1 && 
							curpiece === ENEMY_KING
						)
					) return true;
					if(curpiece !== 0) break;
				}
			}

			// check right
			if(curX !== 8) {
				cS = square; cX = curX;
				while(++cX && cX < 9) {
					cS++;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_ROOK || 
						(
							cX === curX + 1 && 
							curpiece === ENEMY_KING
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check up
			if(curY !== 1) {
				cS = square; cY = curY;
				while(--cY) {
					cS-=8;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_ROOK || 
						(
							cY === curY - 1 && 
							curpiece === ENEMY_KING
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check down
			if(curY !== 8) {
				cS = square; cY = curY;
				while(++cY && cY < 9) {
					cS+=8;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_ROOK || 
						(
							cY === curY + 1 && 
							curpiece === ENEMY_KING
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check up/left
			if(curY !== 1 && curX !== 1) {
				cS = square; cX = curX; cY = curY;
				while(--cX && --cY) {
					cS-=9;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_BISHOP || 
						(
							cX === curX - 1 && 
							(
								curpiece === ENEMY_KING || 
								(color && curpiece === ENEMY_PAWN)
							)
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check down/left
			if(curY !== 8 && curX !== 1) {
				cS = square; cX = curX; cY = curY;
				while(--cX && ++cY && cY < 9) {
					cS+=7;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_BISHOP || 
						(
							cX === curX - 1 && 
							(
								curpiece === ENEMY_KING ||
								(!color && curpiece === ENEMY_PAWN)
							)
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check up/right
			if(curY !== 1 && curX !== 8) {
				cS = square; cX = curX; cY = curY;
				while(++cX && cX < 9 && --cY) {
					cS-=7;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_BISHOP || 
						(
							cX === curX + 1 && 
							(
								curpiece === ENEMY_KING || 
								(color && curpiece === ENEMY_PAWN)
							)
						)
					) return true;
					if(curpiece) break;
				}
			}

			// check down/right
			if(curY !== 8 && curX !== 8) {
				cS = square; cX = curX; cY = curY;
				while(++cX && cX < 9 && ++cY && cY < 9) {
					cS+=9;
					curpiece = curnode.position[cS];
					if(curpiece === ENEMY_QUEEN || 
						curpiece === ENEMY_BISHOP || 
						(
							cX === curX + 1 && 
							(
								curpiece === ENEMY_KING ||
								(!color && curpiece === ENEMY_PAWN)
							)
						)
					)	return true;
					if(curpiece) break;
				}
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
			if(curnode.position[themove[0]] === 1 || curnode.position[themove[0]] === 8 || curnode.position[themove[1]]) {
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
			if(themove[0] === 56 && curnode.position[themove[0]] === 11) {
				curnode.castle.Q = false;
			}
			if(themove[0] === 63 && curnode.position[themove[0]] === 11) {
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


		//	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
		var basicValue = [0, -100, -300, -310, -500, -900, 0, 100, 300, 310, 500, 900, 0];

		var nodecount = 0;
		var ob = {};
		var whitepawnmap = [
 			0,  0,  0,  0,  0,  0,  0,  0,
			50, 50, 50, 50, 50, 50, 50, 50,
			10, 10, 20, 30, 30, 20, 10, 10,
			 5,  5, 10, 25, 25, 10,  5,  5,
			 0,  0,  0, 20, 20,  0,  0,  0,
			 5,  0,  0,  5,  5,-10,  5,  5,
			 5, 10, 10,-20,-20, 15, 15,  5,
			 0,  0,  0,  0,  0,  0,  0,  0
		];
		var blackpawnmap = [
			 0,  0,  0,  0,  0,  0,  0,  0,
			 5, 10, 10,-20,-20, 10, 10,  5,
			 5,  0,  0,  5,  5,-10,  0,  5,
			 0,  0,  0, 20, 20,  0,  0,  0,
			 5,  5, 10, 25, 25, 10,  5,  5,
			10, 10, 20, 30, 30, 20, 10, 10,
			50, 50, 50, 50, 50, 50, 50, 50,
			 0,  0,  0,  0,  0,  0,  0,  0
		];

		var whiteknightmap = [
			-50,-40,-30,-30,-30,-30,-40,-50,
			-40,-20,  0,  0,  0,  0,-20,-40,
			-30,  0, 10, 15, 15, 10,  0,-30,
			-30,  5, 15, 20, 20, 15,  5,-30,
			-30,  0, 15, 20, 20, 15,  0,-30,
			-30,  5, 20, 15, 15, 20,  5,-30,
			-40,-20,  0,  5,  5,  0,-20,-40,
			-50,-40,-30,-30,-30,-30,-40,-50
		];

		var blackknightmap = [
			-50,-40,-30,-30,-30,-30,-40,-50,
			-40,-20,  0,  0,  0,  0,-20,-40,
			-30,  5, 20, 15, 15, 20,  5,-30,
			-30,  0, 15, 20, 20, 15,  0,-30,
			-30,  5, 15, 20, 20, 15,  5,-30,
			-30,  0, 10, 15, 15, 10,  0,-30,
			-40,-20,  0,  5,  5,  0,-20,-40,
			-50,-40,-30,-30,-30,-30,-40,-50
		];

		var whitebishopmap = [
			  5,  5,-10,-10,-10,-10,  5,  5,
			  5,  0,  0,  0,  0,  0,  0,  5,
			-10,  0,  5, 10, 10,  5,  0,-10,
			-15,  5,  5, 10, 10,  5,  5,-10,
			-15,  0, 10, 10, 10, 10,  0,-10,
			-10, 10, 10,  5,  5, 10, 10,-10,
			  5, 15,  0,  5,  5,  0, 15, 5,
			  5,  5,-20,-20,-20,-20,  5, 5
		];

		var blackbishopmap = [
			  5,  5,-20,-20,-20,-20,  5, 5,
			  5, 15,  0,  5,  5,  0, 15, 5,
			-10, 10, 10,  5,  5, 10, 10,-10,
			-15,  0, 10, 10, 10, 10,  0,-10,
			-15,  5,  5, 10, 10,  5,  5,-10,
			-10,  0,  5, 10, 10,  5,  0,-10,
			  5,  0,  0,  0,  0,  0,  0,  5,
			  5,  5,-10,-10,-10,-10,  5,  5
		];

		var whitekingmap = [
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-20,-30,-30,-40,-40,-30,-30,-20,
			-10,-20,-30,-30,-30,-30,-20,-10,
			 20, 20,-20,-30,-30,-20, 10, 15,
			 20, 20, 20,  -5,  0, 10, 30, 20
 		];

		var blackkingmap = [
			 20, 20, 20, -5,  0, 10, 30, 20,
			 15, 10,-20,-30,-30,-20, 10, 15,
			-10,-20,-30,-30,-30,-30,-20,-10,
			-20,-30,-30,-40,-40,-30,-30,-20,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30,
			-30,-40,-40,-50,-50,-40,-40,-30
 		];

 		var whitekingendmap = [
			-50,-40,-30,-20,-20,-30,-40,-50,
			-30,-20,-10,  0,  0,-10,-20,-30,
			-30,-10, 20, 30, 30, 20,-10,-30,
			-30,-10, 30, 40, 40, 30,-10,-30,
			-30,-10, 30, 40, 40, 30,-10,-30,
			-30,-10, 20, 30, 30, 20,-10,-30,
			-30,-30,  0,  0,  0,  0,-30,-30,
			-50,-30,-30,-30,-30,-30,-30,-50
 		];

 		var blackkingendmap = [
			-50,-30,-30,-30,-30,-30,-30,-50,
			-30,-30,  0,  0,  0,  0,-30,-30,
			-30,-10, 20, 30, 30, 20,-10,-30,
			-30,-10, 30, 40, 40, 30,-10,-30,
			-30,-10, 30, 40, 40, 30,-10,-30,
			-30,-10, 20, 30, 30, 20,-10,-30,
			-30,-20,-10,  0,  0,-10,-20,-30,
			-50,-40,-30,-20,-20,-30,-40,-50
 		];

		//   a  b  c  d  e  f  g  h
		// 8 0  1  2  3  4  5  6  7
		// 7 8  9  10 11 12 13 14 15
		// 6 16 17 18 19 20 21 22 23
		// 5 24 25 26 27 28 29 30 31
		// 4 32 33 34 35 36 37 38 39
		// 3 40 41 42 43 44 45 46 47
		// 2 48 49 50 51 52 53 54 55
		// 1 56 57 58 59 60 61 62 63

		ob['prnbqkberppppepppeeeepneeeeeeeeeeeePPeeeeeeeeeNeePPeePPPPRNBQKBeRb1111'] = [
			// d4 nf6 c4 e6 nf3
			[45, 9, 17], // b6
			[30, 11, 27], // d5
			[15, 5, 33], // bb4
			[10, 10, 26] // c5
		];

		ob['prnbqkberppppepppeeeepneeeeeeeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRw1111'] = [
			// d4 nf6 c4 e6
			[60, 57, 42], // nc3
			[40, 62, 45] // nf3
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRb1111'] = [
			// d4 nf6 c4
			[45, 12, 20], // e6
			[40, 14, 22], // g6
			[15, 10, 26] // c5
		];

		ob['prnbqkbnrppppepepeeeeeeeeeeeeeepeeeeePpePeeeeeNeePPPPeePeRNBQKBeRb1111'] = [
			// e4 e5 f4 exf4 nf3 g5 h4
			[100, 30, 38] // g4
		];

		ob['prnbqkbnrppppepepeeeeeeeeeeeeeepeeeeePpeeeeeeeNeePPPPeePPRNBQKBeRw1111'] = [
			// e4 e5 f4 exf4 nf3 g5
			[60, 55, 39], // h4
			[40, 61, 34] // bc4
		];

		ob['prnbqkbnrppppepppeeeeeeeeeeeeeeeeeeeePpeeeeeeeNeePPPPeePPRNBQKBeRb1111'] = [
			// e4 e5 f4 exf4 nf3
			[50, 14, 30], // g5
			[30, 11, 27], // d5
			[20, 11, 19] // d6
		];

		ob['prnbqkbnrppppepppeeeeeeeeeeeeeeeeeeeePpeeeeeeeeeePPPPeePPRNBQKBNRw1111'] = [
			// e4 e5 f4 exf4
			[75, 62, 45], // nf3
			[25, 61, 34] // bc4
		];

		ob['prnbqkbnrppppepppeeeeeeeeeeeepeeeeeeePPeeeeeeeeeePPPPeePPRNBQKBNRb1111'] = [
			// e4 e5 f4
			[70, 28, 37], // exf4
			[15, 11, 27], // d5
			[10, 5, 26], // bc5
			[5, 11, 19] // d6
		];

		ob['prebqerkeeepebppppenpeneeepeepeeeeeeePeeeeBPeeNeePPePePPPRNBQReKew0000'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5 bb3 o-o c3 d6
			[85, 55, 47], // h3
			[15, 51, 35] // d4
		];

		ob['prebqerkeeeppbppppeneeneeepeepeeeeeeePeeeeBPeeNeePPePePPPRNBQReKeb0000'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5 bb3 o-o c3
			[60, 11, 19], // d6
			[40, 11, 27] // d5
		];

		ob['prebqerkeeeppbppppeneeneeepeepeeeeeeePeeeeBeeeNeePPPPePPPRNBQReKew0000'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5 bb3 o-o
			[75, 50, 42], // c3
			[15, 48, 32], // a4
			[10, 55, 47] // h3
		];

		ob['prebqkeerepppbppppeneeneeeeeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQReKeb0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1
			[100, 9, 25] // b5
		];

		ob['prebqkberppepppppeeneeneeeeeeeeeeeeeNPeeeeeNeeeeePPPeePPPReBQKBeRb1111'] = [
			// e4 c5 nf3 nc6 d4 cxd4 nxd4 nf6 nc3
			[60, 12, 28], // e5
			[40, 11, 19] // d6
		];

		ob['prebqkberppepppppeeneeneeeeeeeeeeeeeNPeeeeeeeeeeePPPeePPPRNBQKBeRw1111'] = [
			// e4 c5 nf3 nc6 d4 cxd4 nxd4 nf6
			[100, 57, 42] // nc3
		];

		ob['prebqkbnrppepppppeeneeeeeeeeeeeeeeeeNPeeeeeeeeeeePPPeePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3 nc6 d4 cxd4 nxd4 
			[55, 6, 21], // nf6
			[20, 14, 22], // g6
			[15, 12, 28], // e5
			[10, 12, 20] // e6
		];

		ob['prnbqkbnrppepppppeeeeeeeeeeeeeeeeeeepPeeeeeeeeeeePPPeePPPRNBQKBNRw1111'] = [
			// e4 c5 d4 cxd4
			[95, 50, 42], // c3
			[5, 62, 45] // nf3
		];

		ob['prnbqkbnrppepppppeeeeeeeeeepeeeeeeeePPeeeeeeeeeeePPPeePPPRNBQKBNRb1111'] = [
			// e4 c5 d4
			[100, 26, 35] // cxd4
		];

		ob['prnbqkberppepppppeeeeeneeeepPeeeeeePeeeeeeeeeeeeePPeePPPPRNBQKBNRb1111'] = [
			// d4 nf6 c4 c5 d5 
			[60, 9, 25], // b5
			[40, 12, 20] // e6
		];

		ob['prnbqkberppepppppeeeeeneeeepeeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRw1111'] = [
			// d4 nf6 c4 c5
			[80, 35, 27], // d5
			[15, 62, 45], // nf3
			[5, 52, 44] // e3
		];

		ob['prnbqkberppeeppppeeepeneeeeeeeeeeeeeNPeeeeeNeeeeePPPeePPPReBQKBeRb1111'] = [
			// e4 e5 nf3 d6 d4 cxd4 nxd4 nf6 nc3
			[50, 8, 16], // a6
			[30, 14, 22], // g6
			[20, 1, 18] // nc6
		];

		ob['prnbqkberppeeppppeeepeneeeeeeeeeeeeeNPeeeeeeeeeeePPPeePPPRNBQKBeRw1111'] = [
			// e4 e5 nf3 d6 d4 cxd4 nxd4 nf6
			[100, 57, 42] // nc3
		];

		ob['prnbqkbnrppeeppppeeepeeeeeeeeeeeeeeeNPeeeeeeeeeeePPPeePPPRNBQKBeRb1111'] = [
			// e4 e5 nf3 d6 d4 cxd4 nxd4
			[100, 6, 21] // nf6
		];

		ob['prnbqkbnrppeeppppeeepeeeeeeeeeeeeeeepPeeeeeeeeNeePPPeePPPRNBQKBeRw1111'] = [
			// e4 e5 nf3 d6 d4 cxd4
			[100, 45, 35] // nxd4
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeePeeeeeeeNeeeeePPePPPPPReBQKBNRb1111'] = [
			// c4 nf6 nc3
			[50, 14, 22], // g6
			[30, 12, 20], // e6
			[20, 10, 26] // c5
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeePeeeeeeeeeeeeePPePPPPPRNBQKBNRw1111'] = [
			// c4 nf6
			[70, 57, 42], // nc3
			[15, 54, 46], // g3
			[15, 62, 45] // nf3
		];

		ob['prnbqkbnrppppppppeeeeeeeeeeeeeeeeeePeeeeeeeeeeeeePPePPPPPRNBQKBNRb1111'] = [
			// c4
			[40, 6, 21], // nf6
			[35, 12, 28], // e5
			[15, 12, 20], // e6
			[10, 10, 26] // c5
		];

		ob['prnbqkbnrppepepppeeeepeeeeeeeeeeeeeeNPeeeeeeeeeeePPPeePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3 e6 d4 cxd4 nxd4
			[40, 8, 16], // a6
			[35, 6, 21], // nf6
			[25, 1, 18] // nc6
		];

		ob['prnbqkbnrppepepppeeeepeeeeeeeeeeeeeepPeeeeeeeeNeePPPeePPPRNBQKBeRw1111'] = [
			// e4 c5 nf3 e6 d4 cxd4
			[100, 45, 35] // nxd4
		];

		ob['prnbqkbnrppepepppeeeepeeeeepeeeeeeeePPeeeeeeeeNeePPPeePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3 e6 d4
			[100, 26, 35] // cxd4
		];

		ob['prnbqkbnrppepepppeeeepeeeeepeeeeeeeeePeeeeeeeeNeePPPPePPPRNBQKBeRw1111'] = [
			// e4 c5 nf3 e6
			[80, 51, 35], // d4
			[7, 50, 42], // c3
			[7, 57, 42], // nc3
			[6, 51, 43] // d3
		];

		ob['prnbqkbnrppeeepppeepepeeeeeepeeeeeePPeeeeeeNeeNeePPeePPPPReBQKBeRb1111'] = [
			// d4 d5 c4 e6 nc3 c6 nf3
			[40, 6, 21], // nf6
			[40, 27, 34], // dxc4
			[20, 13, 29] // f5
		];

		ob['prnbqkbnrppeeepppeepepeeeeeepeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRw1111'] = [
			// d4 d5 c4 e6 nc3 c6
			[35, 62, 45], // nf3
			[35, 52, 44], // e3
			[15, 34, 27], // cxd5
			[15, 52, 36] // e4
		];

		ob['prnbqkberpppeepppeeeepneeeeepeeBeeePPeeeeeeNeeeeePPeePPPPReeQKBNRb1111'] = [
			// d4 d5 c4 e6 nc3 nf6
			[65, 5, 12], // be7
			[35, 1, 11] // nbd7
		];

		ob['prnbqkberpppeepppeeeepneeeeepeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRw1111'] = [
			// d4 d5 c4 e6 nc3 nf6
			[55, 58, 30], // bg5
			[25, 34, 27], // cxd5
			[20, 62, 45] // nf3
		];

		ob['prnbqkbnrpppeepppeeeepeeeeeepeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRb1111'] = [
			// d4 d5 c4 e6 nc3
			[65, 6, 21], // nf6
			[35, 10, 18] // c6
		];

		ob['prnbqkbnrpppeepppeeeepeeeeeepeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRw1111'] = [
			// d4 d5 c4 e6
			[65, 57, 42], // nc3
			[35, 62, 45] // nf3
		];

		ob['prnbekbnrpppeppppeeeeeeeeqeeeeeeeeeePeeeeeeNeeeeePPPeePPPReBQKBNRb1111'] = [
			// e4 d5 exd5 qxd5 nc3 qa5 d4
			[65, 6, 21], // nf6
			[35, 10, 18] // c6
		];

		ob['prnbekbnrpppeppppeeeeeeeeqeeeeeeeeeeeeeeeeeNeeeeePPPPePPPReBQKBNRw1111'] = [
			// e4 d5 exd5 qxd5 nc3 qa5
			[75, 51, 35], // d4
			[15, 62, 45], // nf3
			[10, 61, 34] // bc4
		];

		ob['prnbekbnrpppeppppeeeeeeeeeeeqeeeeeeeeeeeeeeNeeeeePPPPePPPReBQKBNRb1111'] = [
			// e4 d5 exd5 qxd5 nc3
			[100, 27, 24] // qa5
		];

		ob['prnbekbnrpppeppppeeeeeeeeeeeqeeeeeeeeeeeeeeeeeeeePPPPePPPRNBQKBNRw1111'] = [
			// e4 d5 exd5 qxd5
			[100, 57, 42] // nc3
		];

		ob['prnbqkbnrpppeppppeeeeeeeeeeePeeeeeeeeeeeeeeeeeeeePPPPePPPRNBQKBNRb1111'] = [
			// e4 d5 exd5
			[60, 3, 27], // qxd5
			[40, 6, 21] // nf6
		];

		ob['prnbqkbnrpppeppppeeeeeeeeeeepeeeeeeeePeeeeeeeeeeePPPPePPPRNBQKBNRw1111'] = [
			// e4 d5
			[100, 36, 27] // exd5
		];

		ob['prnbqkeerpppeppbpeeepenpeeeeeeeeeeePPPeeeeeNeeNeePPeeePPPReBQKBeRb1111'] = [
			// d4 nf6 c4 g6 nc3 bg7 e4 nf3
			[100, 4, 6] // o-o
		];

		ob['prnbqkeerpppeppbpeeepenpeeeeeeeeeeePPPeeeeeNeeeeePPeeePPPReBQKBNRw1111'] = [
			// d4 nf6 c4 g6 nc3 bg7 e4
			[40, 62, 45], // nf3
			[35, 53, 45], // f3
			[25, 61, 52] // be2
		];

		ob['prnbqkeerppppppbpeeeeenpeeeeeeeeeeePPPeeeeeNeeeeePPeeePPPReBQKBNRb1111'] = [
			// d4 nf6 c4 g6 nc3 bg7 e4
			[85, 11, 19], // d6
			[15, 4, 6] // o-o
		];

		ob['prnbqkeerppppppbpeeeeenpeeeeeeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRw1111'] = [
			// d4 nf6 c4 g6 nc3 bg7
			[85, 52, 36], // e4
			[15, 62, 45] // nf3
		];

		ob['prnbqkberppppppepeeeeenpeeeeeeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRb1111'] = [
			// d4 nf6 c4 g6 nc3
			[75, 5, 14], // bg7
			[25, 11, 27] // d5
		];

		ob['prnbqkberppppppepeeeeenpeeeeeeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRw1111'] = [
			// d4 nf6 c4 g6
			[100, 57, 42] // nc3
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeePeeeeeeeeeeNeePPePPPPPRNBQKBeRb1111'] = [
			// nf3 nf6 c4
			[45, 14, 22], // g6
			[35, 12, 20], // e6
			[20, 10, 26] // c5
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeeeeeeeeeeeeeNeePPPPPPPPRNBQKBeRw1111'] = [
			// nf3 nf6
			[60, 50, 34], // c4
			[30, 54, 46], // g3
			[10, 51, 35] // d4
		];

		ob['prnbqkbnrppppppppeeeeeeeeeeeeeeeeeeeeeeeeeeeeeNeePPPPPPPPRNBQKBeRb1111'] = [
			// nf3
			[60, 6, 21], // nf6
			[30, 11, 27], // d5
			[10, 10, 26] // c5
		];

		ob['prnbqkbnrpppeepppeeeepeeeeeepeeeeeeePPeeeeeeeeeeePPPeePPPRNBQKBNRw1111'] = [
			// e4 e6 d4 d5
			[40, 57, 42], // nc3
			[35, 57, 51], // nd2
			[15, 36, 28], // e5
			[10, 36, 27] // exd5
		];

		ob['prnbqkbnrppppepppeeeepeeeeeeeeeeeeeePPeeeeeeeeeeePPPeePPPRNBQKBNRb1111'] = [
			// e4 e6 d4
			[100, 11, 27] // d5
		];

		ob['prnbqkbnrppppepppeeeepeeeeeeeeeeeeeeePeeeeeeeeeeePPPPePPPRNBQKBNRw1111'] = [
			// e4 e6
			[100, 51, 35] // d4
		];

		ob['prnbqkbnrpppeppppeeeeeeeeeeepeeeeeeePeeeeeeeeeeeePPPePPPPRNBQKBNRw1111'] = [
			// d4 d5
			[65, 50, 34], // c4
			[35, 62, 45] // nf3
		];

		ob['prebqkeereepebppppenpeneeepeepeeeeeeePeeeeBeeeNeePPPPePPPRNBQReKew0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5 bb3 d6
			[100, 50, 42] // c3
		];

		ob['prebqkeereeppbppppeneeneeepeepeeeeeeePeeeeBeeeNeePPPPePPPRNBQReKeb0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5 bb3
			[60, 11, 19], // d6
			[40, 4, 6] // o-o
		];

		ob['prebqkeereeppbppppeneeneeepeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQReKew0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1 b5
			[100, 32, 41] // bb3
		];

		ob['prebqkeerepppbppppeneeneeeeeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQeRKew0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7
			[100, 61, 60] // re1
		];

		ob['prebqkberepppeppppeneeneeeeeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQeRKeb0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o
			[80, 5, 12], // be7
			[20, 9, 25] // b5
		];

		ob['prebqkberepppeppppeneeneeeeeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6
			[100, 60, 62] // o-o
		];

		ob['prebqkbnrepppeppppeneeeeeeeeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4
			[90, 6, 21], // nf6
			[10, 11, 19] // d6
		];

		ob['prebqkberpppeepppeenpeneeeBeepeeeeeeePeeeeePPeNeePPeeePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bb5 nf6 d3 d6 c3
			[35, 14, 22], // g6
			[33, 5, 12], // be7
			[32, 2, 11] // bd7
		];

		ob['prebqkberpppeepppeenpeneeeBeepeeeeeeePeeeeeePeNeePPPeePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bb5 nf6 d3 d6
			[55, 50, 42], // c3
			[45, 60, 62] // o-o
		];

		ob['prebqkberppppepppeeneeneeeBeepeeeeeeePeeeeeePeNeePPPeePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bb5 nf6 d3
			[50, 11, 19], // d6
			[50, 5, 26] // bc5
		];

		ob['prebqkberppppepppeeneeneeeBeepeeeeeeePeeeeeeeeNeePPPPePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bb5 nf6
			[75, 60, 62], // o-o
			[25, 51, 43] // d3
		];

		ob['prnbqkbnrpppeepppeeeepeeeeeepeeeeeePPeeeeeeNeeeeePPeePPPPReBQKBNRb1111'] = [
			// d4 d5 c4 e6 
			[70, 6, 21], // nf6
			[30, 10, 18] // c6
		];

		ob['prnbqkbnrpppeppppeeeeeeeeeeeeeeeeeepPeeeeeeeeeeeePPeePPPPRNBQKBNRw1111'] = [
			// d4 d5 c4 dxc4
			[70, 57, 42], // nc3
			[30, 62, 45] // nf3
		];

		ob['prnbqkbnrpppeppppeeeeeeeeeeepeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRb1111'] = [
			// d4 d5 c4
			[40, 12, 20], // e6
			[40, 10, 18], // c6
			[20, 27, 34] // dxc4
		];

		ob['prebqkbnrppppepppeeneeeeeeeeeeeeeeeepPeeeeeeeeNeePPPeePPPRNBQKBeRw1111'] = [
			// e4 e5 nf3 nc6 d4 exd4
			[100, 45, 35] // nxd4
		];

		ob['prebqkeerppppepppeeneeneeeebepeeeeeBPPeeeeePeeNeePPeeePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bc4 bc5 c3 nf6 d4
			[100, 28, 35] // cxd4
		];

		ob['prebqkeerppppepppeeneeneeeebepeeeeeBePeeeeePeeNeePPePePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bc4 bc5 c3 nf6
			[60, 51, 35], // d4
			[40, 51, 43] // d3
		];

		ob['prebqkenrppppepppeeneeeeeeebepeeeeeBePeeeeePeeNeePPePePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bc4 bc5 c3
			[100, 6, 21] // nf6
		];

		ob['prebqkenrppppepppeeneeeeeeebepeeeeeBePeeeeeeeeNeePPPPePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bc4 bc5
			[50, 50, 42], // c3
			[20, 51, 43], // d3
			[15, 60, 62], // o-o
			[15, 57, 42] // nc3
		];

		ob['prebqkbnrppppepppeeneeeeeeeeepeeeeeBePeeeeeeeeNeePPPPePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bc4
			[60, 5, 26], // bc5
			[40, 6, 21] // nf6
		];

		ob['prebqkbnrppppepppeeneeeeeeeeepeeeeeePPeeeeeeeeNeePPPeePPPRNBQKBeRb1111'] = [
			// e4 e5 nf3 nc6 d4
			[100, 28, 35]
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeePPeeeeeeeeeeeePPeePPPPRNBQKBNRb1111'] = [
			// d4 nf6 c4
			[45, 12, 20], // e6
			[35, 14, 22], // g6
			[20, 10, 26] // c5
		];

		ob['prnbqkberppppppppeeeeeneeeeeeeeeeeeePeeeeeeeeeeeePPPePPPPRNBQKBNRw1111'] = [
			// d4 nf6
			[60, 50, 34], // c4
			[40, 62, 45] // nf3
		];

		ob['prnbqkbnrppppppppeeeeeeeeeeeeeeeeeeePeeeeeeeeeeeePPPePPPPRNBQKBNRb1111'] = [
			// d4
			[60, 6, 21], // nf6
			[40, 11, 27] // d5
		];

		ob['prebqkbnrppepppppeeneeeeeeepeeeeeeeePPeeeeeeeeNeePPPeePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3 nc6 nc6 d4
			[100, 26, 35] // cxd4
		];

		ob['prnbqkbnrppeeppppeeepeeeeeepeeeeeeeePPeeeeeeeeNeePPPeePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3 nc6 d6 d4
			[100, 26, 35] // cxd4
		];

		ob['prnbqkbnrppeeppppeeepeeeeeepeeeeeeeeePeeeeeeeeNeePPPPePPPRNBQKBeRw1111'] = [
			// e4 c5 nf3 nc6 d6
			[90, 51, 35], // d4
			[10, 61, 25] // bb5
		];

		ob['prnbqkbnrppepppppeeeeeeeeeepeeeeeeeeePeeeeeeeeNeePPPPePPPRNBQKBeRb1111'] = [
			// e4 c5 nf3
			[45, 11, 19], // d6
			[40, 1, 18], // nc6
			[15, 12, 20] // e6
		];

		ob['prnbqkbnrppepppppeeeeeeeeeepeeeeeeeeePeeeeeeeeeeePPPPePPPRNBQKBNRw1111'] = [
			// e4 c5
			[90, 62, 45], // nf3
			[5, 57, 42], // nc3
			[3, 50, 42], // c3
			[2, 51, 35] // d4
		];

		ob['prebqkbnrepppeppppeneeeeeeBeepeeeeeeePeeeeeeeeNeePPPPePPPRNBQKeeRw1111'] = [
			// e4 e5 nf3 nc6 bb5 a6
			[86, 25, 32], // Ba4
			[14, 25, 18] // Nxc6
		];

		ob['prnbqkbnrppppppppeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeePPPPPPPPRNBQKBNRw1111'] = [
			// start
			[45, 52, 36], // e4
			[40, 51, 35], // d4
			[10, 62, 45], // nf3
			[8, 50, 34], // c4
			[5, 54, 46], // g3
			[2, 49, 41] // b3
		];
		ob['prnbqkbnrppppppppeeeeeeeeeeeeeeeeeeeePeeeeeeeeeeePPPPePPPRNBQKBNRb1111'] = [
			// e4
			[50, 10, 26], // c5
			[35, 12, 28], // e5
			[9, 12, 20], // e6
			[4, 10, 18], // c6
			[2, 11, 19] // d6
		];
		ob['prnbqkbnrppppepppeeeeeeeeeeeepeeeeeeePeeeeeeeeeeePPPPePPPRNBQKBNRw1111'] = [
			// e4 e5
			[88, 62, 45], // nf3
			[6, 57, 42], // nc3
			[6, 53, 37] // f4
		];

		ob['prnbqkbnrppppepppeeeeeeeeeeeepeeeeeeePeeeeeeeeNeePPPPePPPRNBQKBeRb1111'] = [
			// e4 e5 nf3
			[95, 1, 18], //nc6
			[5, 6, 21] // nf6
		];

		ob['prebqkbnrppppepppeeneeeeeeeeepeeeeeeePeeeeeeeeNeePPPPePPPRNBQKBeRw1111'] = [
			// e4 e5 nf3 nc6
			[70, 61, 25], // bb5
			[20, 61, 34], // bc4
			[10, 51, 35] // d4
		];

		ob['prebqkbnrppppepppeeneeeeeeBeepeeeeeeePeeeeeeeeNeePPPPePPPRNBQKeeRb1111'] = [
			// e4 e5 nf3 nc6 bb5
			[86, 8, 16], // a6
			[10, 6, 21], // Nf6
			[4, 13, 29] // f5
		];

		function evaluatePosition(thisnode) {
			if(thisnode.drawClock > 49) return 0;

			var position = thisnode.position;
			var evals = 0, sq, rank, col, pieceloclength, piece, pos, thisVal, index;
			var whitepieces = 0;
			var blackpieces = 0;
			var whitepawns = [0, 0, 0, 0, 0, 0, 0, 0];
			var blackpawns = [0, 0, 0, 0, 0, 0, 0, 0];
			var piecelocs = [];
			var whiterook = 9, blackrook = 9;

			// gather some useful data for the real evaluation loop
			// index = 64;
			for(index = 0; index < 64; index++) {
				if((sq = position[index]) === 0) continue;

				rank = index >> 3;
				col = index - (rank << 3);

				if(sq > 7) {
					whitepieces += basicValue[sq];
					piecelocs[piecelocs.length] = index; 
					if(sq === 8) {
						whitepawns[col] += 1;
					}
				} else {
					blackpieces += basicValue[sq];
					piecelocs[piecelocs.length] = index;
					if(sq === 1) {
						blackpawns[col] += 1;
					}
				}
			}

			// real evaluation loop
			pieceloclength = piecelocs.length;

			for(index = 0; index < pieceloclength; index++) {
				pos = piecelocs[index];
				piece = position[pos];

				rank = pos >> 3;
				col = pos - (rank << 3);

				if(piece === 1) {
					// reward pawns for pushing ahead
					thisVal = -100 - blackpawnmap[pos];
					if(!blackpawns[col - 1] && !blackpawns[col + 1]) {
						thisVal += 22;
					}
					if(blackpawns[col] !== 1) {
						thisVal += 11;
					}
				} else if(piece === 8) {
					thisVal = 100 + whitepawnmap[pos];
					if(!whitepawns[col - 1] && !whitepawns[col + 1]) {
						thisVal -= 22;
					}
					if(whitepawns[col] !== 1) {
						thisVal -= 11;
					}
				} else if(piece === 2) {
					thisVal = -300 - blackknightmap[pos];
				} else if(piece === 9) {
					thisVal = 300 + whiteknightmap[pos];
				} else if(piece === 3) {
					thisVal = -300 - blackbishopmap[pos];
				} else if(piece === 10) {
					thisVal = 300 + whitebishopmap[pos];
				} else if(piece === 4) {
				 	if(blackpawns[col] === 0) {
						if(whitepawns[col] === 0) {
							// if no pawns on same col, reward the most
							thisVal = -541;
						} else {
							// if just enemy pawns on same col, reward a little
							thisVal = -518;
						}
					} else {
						thisVal = -500;
					}
				} else if(piece === 11) {
				 	if(whitepawns[col] === 0) {
						if(blackpawns[col] === 0) {
							thisVal = 541;
						} else {
							thisVal = 518;
						}
					} else {
						thisVal = 500;
					}
				} else if(piece === 6) {
				 	if(whitepieces > 2400) {
						// if basic material for white is > 22, reward for moving away from center
				 		thisVal = -300 - blackkingmap[pos];
					} else {
						// if basic material for white is <= 22, reward for moving toward the center
				 		thisVal = -300 - blackkingendmap[pos];
					}
				} else if(piece === 13) {
				 	if(blackpieces < -2400) {
						// if basic material for white is > 22, reward for moving away from center
				 		thisVal = 300 + whitekingmap[pos];
					} else {
						// if basic material for white is <= 22, reward for moving toward the center
				 		thisVal = 300 + whitekingendmap[pos];
					}
				} else {
					thisVal = basicValue[piece];
				}
				evals += thisVal;
			}
			return evals;
		}
		function searchNode( curnode, ply, qsq, alpha, beta ) {
			nodecount += 1;
			var bestMove = [];
			var bestEval = 0;
			var ml = moveGen( curnode );
			var mllength = ml.length;
			var mobility = 0;
			var thisnode, thisEval, isStaticCapture;
			var themove;
			if(mllength !== 0) {
				for(var thisnode, index = 0; index < mllength; index += 1) {
					themove = ml[index];
					isStaticCapture = false;
					if(qsq && themove[1] === qsq) {
						isStaticCapture = true;
					} else if(qsq) {
						continue;
					}
					thisEval = false;
					thisnode = doMove(fastCloneNode(curnode), themove);
					if(ply !== 0) {
						thisEval = searchNode(thisnode, ply - 1, false, alpha, beta);
					} else if(qsq === false && thisnode.position[themove[1]] !== 0) {
						thisEval = searchNode(thisnode, ply, themove[1], alpha, beta);
						if(thisEval === false) {
							thisEval = evaluatePosition(thisnode);
						}
					} else {
						thisEval = evaluatePosition(thisnode);
					}
					if(thisEval === false) {
						thisEval = evaluatePosition(thisnode);
					}
					if(bestMove.length === 0) {
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
				}
				if(bestMove.length === 0) {
					return false;
				}
			} else if(qsq) {
				return false;
			} else {
				if(curnode.move) {
					if(kingInCheck(curnode, true)) {
						// this is black checkmate, black wins
						if(ply !== maxply) {
							return -9999;
						} else {
							return { move: ml[bestMove[0]], score: -9999, nodecount: nodecount };
						}
					} else {
						// draw
						if(ply !== maxply) {
							return 0;
						} else {
							return { move: ml[bestMove[0]], score: 0, nodecount: nodecount };
						}
					}
				} else {
					if(kingInCheck(curnode, false)) {
						// this is white checkmate, white wins
						if(ply !== maxply) {
							return 9999;
						} else {
							return { move: ml[bestMove[0]], score: 9999, nodecount: nodecount };
						}
					} else {
						// draw
						if(ply !== maxply) {
							return 0;
						} else {
							return { move: ml[bestMove[0]], score: 0, nodecount: nodecount };
						}
					}
				}
			}
			if(ply !== maxply) {
				return bestEval;
			}
			if(typeof ml[bestMove[0]] === 'undefined') {
				console.log('undefined bm', ml, bestMove)
			}
			return { move: ml[bestMove[0]], score: bestEval, nodecount: nodecount };
		}
//		console.log('best:', ml[bestMove], bestEval, curnode);
var maxply = 3;
var workerpool = [];
var maxworkers = 4;
var pooler = false;

onmessage = function(e) {
	var basicTotal = 0, index, sq;
	var curnode = e.data.node;
	maxply = e.data.maxply;
	for(index = 0; index < 64; index++) {
		if((sq = curnode.position[index]) === 0) continue;
		basicTotal += Math.abs(basicValue[sq]);
	}
	if(basicTotal < 2200) maxply +=1;
	var resultMove = searchNode(curnode, maxply, false, 9998, -9998);
	postMessage(resultMove);
};

if(typeof game === 'object') {
	game.engines.thinkMover_1_6 = {
		name: 'thinkMover_1_6',
		displayName: 'thinkMover 1.6 (test)',
		type: 'async',
		convertNode: function(node) {
			for(var i = 0; i < 64; i++) {
				if(node.position[i] > 6) {
					node.position[i] ++;
				}
			}
			return node;
		},
		requestMove: function(curnode) {
			var startTime = (new Date()).getTime();
			var bestEval = 0;
			var bestMove = false;
			var workersdone = 0;
			var nodecount = 0;
			var enginename = this.name;
			var curnode = this.convertNode(fastCloneNode(curnode));
			var ml = moveGen(curnode);
			var posString = makePositionString(curnode);
			if(ob[posString]) {
				var obIndex = 0, randAccumulator = ob[posString][0][0], randOB = ~~(Math.random() * 100);
				while(randAccumulator < randOB) {
					obIndex += 1;
					randAccumulator += ob[posString][obIndex][0];
				}
				game.receiveMove({ move: [ ob[posString][obIndex][1], ob[posString][obIndex][2] ], output: '<span class="engine-name">' + enginename + '</span> From opening book.' });
				return true;
			// } else {
			// 	console.log(ml)
			}
			for(var i = 0; i < maxworkers; i++) {
				if(!ml.length) {
					workersdone++;
					continue;
				}
				workerpool[i] = new Worker('/chess/js/engines/thinkmover_1.6.js');
				workerpool[i].move = ml[0];
				workerpool[i].postMessage({ node: doMove(fastCloneNode(curnode), ml[0]), maxply: 2 });
				workerpool[i].onmessage = function(e) {
					//console.log(e);
					nodecount += e.data.nodecount;
					if(curnode.move) {
						if(e.data.score > bestEval || bestEval === 0) {
							bestMove = this.move;
							bestEval = e.data.score;
						}
					} else {
						if(e.data.score < bestEval || bestEval === 0) {
							bestMove = this.move;
							bestEval = e.data.score;
						}
					}
					if(ml.length) {
						this.move = ml[0];
						this.postMessage({ node: doMove(fastCloneNode(curnode), ml[0]), maxply: 2 });
					} else {
						workersdone++;
						if(workersdone === maxworkers) {
							var timeTaken = ((new Date()).getTime() - startTime);

							var output = '';
							output += '<span class="engine-name">' + enginename + '</span> ';
							output += 'Nodes: <span>' + nodecount + '</span>, ';
							output += 'Time: <span>' + timeTaken + 'ms</span>, ';
							output += 'Nodes/Second: <span>' + ~~(nodecount / (timeTaken / 1000)) + '</span>, ';
							output += 'Eval: <span>' + bestEval + '</span>';

							game.receiveMove({ move: bestMove, output: output });

							for(var i = 0; i < maxworkers; i++) {
								workerpool[i].terminate();
							}
						}
					}
					ml.splice(0, 1);
				};
				ml.splice(0, 1);
			}
		}
	};
}

})();
