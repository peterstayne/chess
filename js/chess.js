var algebraicSquares = {
	ranks: ['h','g','f','e','d','c','b','a'],   // backwards because top rank is rank 0 internally
	symbols: {},
	numbers: []
};
var gamemoves = [];
var coords = [];
var sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		algebraicSquares.symbols[algebraicSquares.ranks[r-1]+(8-i)] = sq;
		algebraicSquares.numbers[sq] = algebraicSquares.ranks[r-1]+(8-i);
		coords[sq] = [9-r, i+1];
		sq++;
	}
}

var ucpieces = {
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
}
var pieces = {
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
	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
};
var node = function() {
	this.position = [];
	this.castle = {
		k: false,
		q: false,
		K: false,
		Q: false
	};
	this.isBorE = function(square) {
		return (this.position[square] < 7);
	};
	this.isWorE = function(square) {
		return (!this.position[square] || this.position[square] > 6);
	};
	this.isB = function(square) {
		return (this.position[square] && this.position[square] < 7);
	};
	this.isW = function(square) {
		return (this.position[square] > 6);
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

var perft = function(thisnode) {

	// perft is the name of a function in a chess program that returns a list of legal moves
	// for a given board position (node)

	var tS;
	var i = 64;
	var color = thisnode.move;
	var tP = thisnode.position;
	var movelist = [];
	var curX = 9;
	var curY = 8;

	while(i--) {

		// curX and curY store rank/col information to avoid *'s and /'s

		curX--;
		if(!curX) { curY--; curX = 8; }

		// tS == 'this' square (numerical value of piece, see pieces.numbers for reference)
		// tP == 'this' position (array 0-63 of piece #'s)

		tS = tP[i];
		if(!tS || (color && tS < 7) || (!color && tS > 6)) continue;
		if(color) {

			// white

			switch(tS) {
			case 7: // white pawn
				// 1 square forward
				if(curY > 2 && !tP[i-8]) movelist.push([i, i-8]);
				// en passant
				if(curY === 4) {
					if(curX > 1 && i-9 == thisnode.enpassantSquare) {
						movelist.push([i, i-9, "ep-capture", i-1]);
					}
					if(curX < 8 && i-7 == thisnode.enpassantSquare) {
						movelist.push([i, i-7, "ep-capture", i+1]);
					}
				}
				// promote via moving
				if(curY === 2 && !tP[i-8]) {
					movelist.push([i, i-8, "promote", 8]);
					movelist.push([i, i-8, "promote", 9]);
					movelist.push([i, i-8, "promote", 10]);
					movelist.push([i, i-8, "promote", 11]);
				}
				// 2 square opening move
				if(curY === 7 && !tP[i-16] && !tP[i-8]) movelist.push([i, i-16, "ep-enable", i-8]);
				// captures
				if(curY > 1) {
					if(curX < 8 && thisnode.isB(i-7)) {
						if(curY > 2) {
							movelist.push([i, i-7]);
						} else {
							// promote via capture
							movelist.push([i, i-7, "promote", 8]);
							movelist.push([i, i-7, "promote", 9]);
							movelist.push([i, i-7, "promote", 10]);
							movelist.push([i, i-7, "promote", 11]);
						}
					}
					if(curX > 1 && thisnode.isB(i-9)) {
						if(curY > 2) {
							movelist.push([i, i-9]);
						} else {
							movelist.push([i, i-9, "promote", 8]);
							movelist.push([i, i-9, "promote", 9]);
							movelist.push([i, i-9, "promote", 10]);
							movelist.push([i, i-9, "promote", 11]);
						}
					}
				}
				break;
			case 8: // white knight
				if(curY > 1) {
					if(curY > 2) {
						if(curX > 1 && thisnode.isBorE(i-17)) movelist.push([i, i-17]);
						if(curX < 8 && thisnode.isBorE(i-15)) movelist.push([i, i-15]);
					}
					if(curX < 7 && thisnode.isBorE(i-6)) movelist.push([i, i-6]);
					if(curX > 2 && thisnode.isBorE(i-10)) movelist.push([i, i-10]);
				}
				if(curY < 8) {
					if(curY < 7) {
						if(curX > 1 && thisnode.isBorE(i+15)) movelist.push([i, i+15]);
						if(curX < 8 && thisnode.isBorE(i+17)) movelist.push([i, i+17]);
					}
					if(curX < 7 && thisnode.isBorE(i+10)) movelist.push([i, i+10]);
					if(curX > 2 && thisnode.isBorE(i+6)) movelist.push([i, i+6]);
				}
				break;
			case 9: // white bishop
				cS = i; cX = curX-1; cY = curY-1; stop = false;
				while(cX > 0 && cY > 0 && !stop) {
					cS -= 9; cX -=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY-1; stop = false;
				while(cX < 9 && cY > 0 && !stop) {
					cS -= 7; cX +=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; cY = curY+1; stop = false;
				while(cX > 0 && cY < 9 && !stop) {
					cS += 7; cX -=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY+1; stop = false;
				while(cX < 9 && cY < 9 && !stop) {
					cS += 9; cX +=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 10: // black rook
				cS = i; cX = curX-1; stop = false;
				while(cX && !stop) {
					cS -= 1; cX -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; stop = false;
				while(cX < 9 && !stop) {
					cS += 1; cX +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY-1; stop = false;
				while(cY && !stop) {
					cS -= 8; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY+1; stop = false;
				while(cY < 9 && !stop) {
					cS += 8; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 11: // black queen
				cS = i; cX = curX-1; cY = curY-1; stop = false;
				while(cX > 0 && cY > 0 && !stop) {
					cS -= 9; cX -=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY-1; stop = false;
				while(cX < 9 && cY > 0 && !stop) {
					cS -= 7; cX +=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; cY = curY+1; stop = false;
				while(cX > 0 && cY < 9 && !stop) {
					cS += 7; cX -=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY+1; stop = false;
				while(cX < 9 && cY < 9 && !stop) {
					cS += 9; cX +=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; stop = false;
				while(cX && !stop) {
					cS -= 1; cX -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; stop = false;
				while(cX < 9 && !stop) {
					cS += 1; cX +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY-1; stop = false;
				while(cY && !stop) {
					cS -= 8; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY+1; stop = false;
				while(cY < 9 && !stop) {
					cS += 8; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] && tP[cS] < 7) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 12: // white king
				if(thisnode.castle.K && 
					!+thisnode.position[61] && 
					!+thisnode.position[62] && 
					!squareInCheck(thisnode, 60, true) && 
					!squareInCheck(thisnode, 61, true) && 
					!squareInCheck(thisnode, 62, true)
				) {
					movelist.push([i, i+2, "castle", "K"]);
				}
				if(thisnode.castle.Q && 
					!+thisnode.position[57] && 
					!+thisnode.position[58] && 
					!+thisnode.position[59] && 
					!squareInCheck(thisnode, 57, true) && 
					!squareInCheck(thisnode, 58, true) && 
					!squareInCheck(thisnode, 59, true) && 
					!squareInCheck(thisnode, 60, true)
				) {
					movelist.push([i, i-2, "castle", "Q"]);
				}
				if(curX > 1) {
					if(thisnode.isBorE(i-1)) movelist.push([i, i-1]);
					if(curY > 1 && thisnode.isBorE(i-9)) movelist.push([i, i-9]);
					if(curY < 8 && thisnode.isBorE(i+7)) movelist.push([i, i+7]);
				}
				if(curY < 8 && thisnode.isBorE(i+8)) movelist.push([i, i+8]);
				if(curY > 1 && thisnode.isBorE(i-8)) movelist.push([i, i-8]);
				if(curX < 8) {
					if(thisnode.isBorE(i+1)) movelist.push([i, i+1]);
					if(curY > 1 && thisnode.isBorE(i-7)) movelist.push([i, i-7]);
					if(curY < 8 && thisnode.isBorE(i+9)) movelist.push([i, i+9]);
				}
				break;
			}
		} else {

			// black

			switch(tS) {
			case 1:  // black pawn
				if(curY < 7 && !tP[i+8]) movelist.push([i, i+8]);
				if(curY === 5) {
					if(curX > 1 && i+9 == thisnode.enpassantSquare) {
						movelist.push([i, i+9, "ep-capture", i+1]);
					}
					if(curX < 8 && i+7 == thisnode.enpassantSquare) {
						movelist.push([i, i+7, "ep-capture", i-1]);
					}
				}
				if(curY === 7 && !tP[i+8]) {
					movelist.push([i, i+8, "promote", 2]);
					movelist.push([i, i+8, "promote", 3]);
					movelist.push([i, i+8, "promote", 4]);
					movelist.push([i, i+8, "promote", 5]);
				}
				if(curY === 2 && !tP[i+16] && !tP[i+8]) movelist.push([i, i+16, "ep-enable", i+8]);
				if(curY < 8) {
					if(curX > 1 && thisnode.isW(i+7)) {
						if(curY < 7) {
							movelist.push([i, i+7]);
						} else {
							movelist.push([i, i+7, "promote", 2]);
							movelist.push([i, i+7, "promote", 3]);
							movelist.push([i, i+7, "promote", 4]);
							movelist.push([i, i+7, "promote", 5]);
						}
					}
					if(curX < 8 && thisnode.isW(i+9)) {
						if(curY < 7) {
							movelist.push([i, i+9]);
						} else {
							movelist.push([i, i+9, "promote", 2]);
							movelist.push([i, i+9, "promote", 3]);
							movelist.push([i, i+9, "promote", 4]);
							movelist.push([i, i+9, "promote", 5]);
						}
					}
				}
				break;
			case 2:  // black knight
				if(curY > 1) {
					if(curY > 2) {
						if(curX > 1 && thisnode.isWorE(i-17)) movelist.push([i, i-17]);
						if(curX < 8 && thisnode.isWorE(i-15)) movelist.push([i, i-15]);
					}
					if(curX < 7 && thisnode.isWorE(i-6)) movelist.push([i, i-6]);
					if(curX > 2 && thisnode.isWorE(i-10)) movelist.push([i, i-10]);
				}
				if(curY < 8) {
					if(curY < 7) {
						if(curX > 1 && thisnode.isWorE(i+15)) movelist.push([i, i+15]);
						if(curX < 8 && thisnode.isWorE(i+17)) movelist.push([i, i+17]);
					}
					if(curX < 7 && thisnode.isWorE(i+10)) movelist.push([i, i+10]);
					if(curX > 2 && thisnode.isWorE(i+6)) movelist.push([i, i+6]);
				}
				break;
			case 3: // black bishop
				cS = i; cX = curX-1; cY = curY-1; stop = false;
				while(cX > 0 && cY > 0 && !stop) {
					cS -= 9; cX -=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY-1; stop = false;
				while(cX < 9 && cY && !stop) {
					cS -= 7; cX +=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; cY = curY+1; stop = false;
				while(cX && cY < 9 && !stop) {
					cS += 7; cX -=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY+1; stop = false;
				while(cX < 9 && cY < 9 && !stop) {
					cS += 9; cX +=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 4: // black rook
				cS = i; cX = curX-1; stop = false;
				while(cX && !stop) {
					cS -= 1; cX -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; stop = false;
				while(cX < 9 && !stop) {
					cS += 1; cX +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY-1; stop = false;
				while(cY && !stop) {
					cS -= 8; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY+1; stop = false;
				while(cY < 9 && !stop) {
					cS += 8; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 5: // black queen
				cS = i; cX = curX-1; cY = curY-1; stop = false;
				while(cX > 0 && cY > 0 && !stop) {
					cS -= 9; cX -=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY-1; stop = false;
				while(cX < 9 && cY && !stop) {
					cS -= 7; cX +=1; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; cY = curY+1; stop = false;
				while(cX && cY < 9 && !stop) {
					cS += 7; cX -=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; cY = curY+1; stop = false;
				while(cX < 9 && cY < 9 && !stop) {
					cS += 9; cX +=1; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX-1; stop = false;
				while(cX && !stop) {
					cS -= 1; cX -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cX = curX+1; stop = false;
				while(cX < 9 && !stop) {
					cS += 1; cX +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY-1; stop = false;
				while(cY && !stop) {
					cS -= 8; cY -=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				cS = i; cY = curY+1; stop = false;
				while(cY < 9 && !stop) {
					cS += 8; cY +=1;
					if(!tP[cS]) {
						movelist.push([i, cS]);
					} else if(tP[cS] > 6) {
						movelist.push([i, cS]);
						stop = true;
					} else {
						stop = true;
					}
				}
				break;
			case 6: // black king
				if(thisnode.castle.k && 
					!+thisnode.position[5] && 
					!+thisnode.position[6] && 
					!squareInCheck(thisnode, 4, false) && 
					!squareInCheck(thisnode, 5, false) && 
					!squareInCheck(thisnode, 6, false)
				) {
					movelist.push([i, i+2, "castle", "k"]);
				}
				if(thisnode.castle.q && 
					!+thisnode.position[1] && 
					!+thisnode.position[2] && 
					!+thisnode.position[3] && 
					!squareInCheck(thisnode, 1, false) && 
					!squareInCheck(thisnode, 2, false) && 
					!squareInCheck(thisnode, 3, false) && 
					!squareInCheck(thisnode, 4, false)
				) {
					movelist.push([i, i-2, "castle", "q"]);
				}
				if(curX > 1) {
					if(thisnode.isWorE(i-1)) movelist.push([i, i-1]);
					if(curY > 1 && thisnode.isWorE(i-9)) movelist.push([i, i-9]);
					if(curY < 8 && thisnode.isWorE(i+7)) movelist.push([i, i+7]);
				}
				if(curY > 1 && thisnode.isWorE(i-8)) movelist.push([i, i-8]);
				if(curY < 8 && thisnode.isWorE(i+8)) movelist.push([i, i+8]);
				if(curX < 8) {
					if(thisnode.isWorE(i+1)) movelist.push([i, i+1]);
					if(curY > 1 && thisnode.isWorE(i-7)) movelist.push([i, i-7]);
					if(curY < 8 && thisnode.isWorE(i+9)) movelist.push([i, i+9]);
				}
				break;
			}
		}
	}
	var tempnode;
	var ml = movelist.length;
	while(ml--) {
		tempnode = JSON.parse(JSON.stringify(thisnode));
		if(kingInCheck(domove(tempnode, movelist[ml]), color)) movelist.splice(ml,1);
	}
	return movelist;
}
var parsefen = function(fen) {
	var returnNode = new node();
	var fenparts = fen.split(" ");
	positions = fenparts[0].split("/");
	var row = 0;
	var col = 0;
	var mark = 0;
	for(var i in positions) {
		col = 0;
		for(var p = 0; p < positions[i].length; p++) {
			mark = ((row * 8) + col);
			this_position = positions[i][p];
			this_position_code = this_position.charCodeAt();
			if(this_position_code > 47 && this_position_code < 58) {
				for(var r = 0; r < +(this_position); r++) {
					returnNode.position[mark + r] = 0;
				}
				col += (+this_position);
			} else {
				returnNode.position[mark] = pieces.symbols[this_position];
				col++;
			}
		}
		row++;
	}
	returnNode.move = (fenparts[1].toLowerCase() == "w");
	var castlemark = fenparts[2].length;
	while(castlemark--) {
		if(fenparts[2][castlemark] in {'k':'', 'K':'', 'q':'', 'Q':''}) {
			returnNode.castle[fenparts[2][castlemark]] = true;
		}
	}
	if(fenparts[3] != "-" && typeof algebraicSquares.symbols[fenparts[3]] !== "undefined") {
		returnNode.enpassantSquare = algebraicSquares.symbols[fenparts[3]];
	} else {
		returnNode.enpassantSquare = -1;
	}
	if(fenparts[4] == +fenparts[4]) returnNode.drawClock = +fenparts[4];
	if(fenparts[5] == +fenparts[5]) returnNode.moveNumber = +fenparts[5];

	return returnNode;
}

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
				fen += pieces.numbers[curnode.position[sq]];
			} else {
				empty++;
			}
		}
		if(empty) fen += empty;
		if(y < 7) fen += '/';
	}
	fen += (curnode.move) ? " w" : " b";
	var castlestr = '';
	for(var i in curnode.castle) {
		if(curnode.castle[i]) {
			castlestr += i;
		}
	}
	if(castlestr != '') {
		fen += ' ' + castlestr;
	} else {
		fen += ' -';
	}
	if(curnode.enpassantSquare > -1) {
		fen += ' ' + algebraicSquares.numbers[curnode.enpassantSquare];
	} else {
		fen += ' -';
	}
	fen += ' ' + curnode.drawClock + ' ' + curnode.moveNumber;
	return fen;
}

var updateBoard = function() {

	var thisnode = $("#board").data("node");

	if(typeof gamemoves[thisnode.moveNumber] === 'undefined') gamemoves[thisnode.moveNumber] = [];
	var curmove = (thisnode.move) ? 0 : 1;
	var thisposition = thisnode.position;
	var mark = 64;
	var epsquare = (+thisnode.enpassantSquare == -1) ? "-" : thisnode.enpassantSquare;
	var castle = '';

	if(epsquare > -1) epsquare = algebraicSquares.numbers[epsquare];
	for(var i in thisnode.castle) {
		if(thisnode.castle[i]) {
			castle += i + ' ';
		} else {
			castle += '- ';
		}
	}

	$(".fromsq").removeClass("fromsq");
	if(thisnode.move) {
		$("#turn").html("<p class=\"white\">White's Turn</p>");
	} else {
		$("#turn").html("<p class=\"black\">Black's Turn</p>");
	}
	$("#movenumber").html("<p class=\"info\">Move number: " + thisnode.moveNumber + "</p>");
	$("#drawclock").html("<p class=\"info\">Draw clock: " + thisnode.drawClock + "</p>");
	$("#enpassant").html("<p class=\"info\">En passant square: " + epsquare + "</p>");
	$("#castle").html("<p class=\"info\">Castles: " + castle + "</p>");
	$("#movelist ul").html('');
	updateMoveList();
	updateGameMoveList();
	while(mark--) {
		thispiece = pieces.numbers[thisposition[mark]];
		thisColor = (thispiece.toLowerCase() === thispiece) ? "pblack" : "pwhite";
		$(".square").eq(mark).html("<span class=\"" + thisColor + "\">" + (thispiece != ' ' ? ucpieces[thispiece] : '&nbsp;') + "</span>");
	}
	return true;
}

var squareInCheck = function(curnode, square, color) {
	// made this square-agnostic instead of king-specific since I need to check for things like
	// a king can't castle through check, so need to check the spaces between. Will also probably
	// use this in position evaluation to analyze pressures in arbitrary spots on the board.

	// See the kingInCheck() function below this one that calls this specifically for kings.
	var curX = coords[square][0];
	var curY = coords[square][1];
 	var isCheck = false;
 	if(color) {
 		// check if a black knight can reach this square
 		if(curX < 7 && curY > 1 && curnode.position[square - 6] == 2) return true;
 		if(curX < 7 && curY < 8 && curnode.position[square + 10] == 2) return true;
 		if(curX < 8 && curY > 2 && curnode.position[square - 15] == 2) return true;
 		if(curX < 8 && curY < 7 && curnode.position[square + 17] == 2) return true;

 		if(curX > 2 && curY > 1 && curnode.position[square - 10] == 2) return true;
 		if(curX > 2 && curY < 8 && curnode.position[square + 6] == 2) return true;
 		if(curX > 1 && curY > 2 && curnode.position[square - 17] == 2) return true;
 		if(curX > 1 && curY < 7 && curnode.position[square + 15] == 2) return true;

		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && !stop) {
			cS--;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 4 || (cX == curX - 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && !stop) {
			cS++;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 4 || (cX == curX + 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cY-- && !stop) {
			cS-=8;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 4 || (cY == curY - 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cY++ && cY < 9 && !stop) {
			cS+=8;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 4 || (cY == curY + 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && cY-- && !stop) {
			cS-=9;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 3 || (cX == curX - 1 && cY == curY - 1 && (curnode.position[cS] == 6 || curnode.position[cS] == 1))) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && cY++ && cY < 9 && !stop) {
			cS+=7;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 3 || (cX == curX - 1 && cY == curY + 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && cY-- && !stop) {
			cS-=7;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 3 || (cX == curX + 1 && cY == curY - 1 && (curnode.position[cS] == 6 || curnode.position[cS] == 1))) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && cY++ && cY < 9 && !stop) {
			cS+=9;
			if(curnode.position[cS] == 5 || curnode.position[cS] == 3 || (cX == curX + 1 && cY == curY + 1 && curnode.position[cS] == 6)) return true;
			if(+curnode.position[cS]) stop = true;
		}
	} else {
 		if(curX < 7 && curY > 1 && curnode.position[square - 6] == 8) return true;
 		if(curX < 7 && curY < 8 && curnode.position[square + 10] == 8) return true;
 		if(curX < 8 && curY > 2 && curnode.position[square - 15] == 8) return true;
 		if(curX < 8 && curY < 7 && curnode.position[square + 17] == 8) return true;

 		if(curX > 2 && curY > 1 && curnode.position[square - 10] == 8) return true;
 		if(curX > 2 && curY < 8 && curnode.position[square + 6] == 8) return true;
 		if(curX > 1 && curY > 2 && curnode.position[square - 17] == 8) return true;
 		if(curX > 1 && curY < 7 && curnode.position[square + 15] == 8) return true;

		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && !stop) {
			cS--;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 10 || (cX == curX - 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && !stop) {
			cS++;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 10 || (cX == curX + 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cY-- && !stop) {
			cS-=8;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 10 || (cY == curY - 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cY++ && cY < 9 && !stop) {
			cS+=8;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 10 || (cY == curY + 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && cY-- && !stop) {
			cS-=9;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 9 || (cX == curX - 1 && cY == curY - 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX-- && cY++ && cY < 9 && !stop) {
			cS+=7;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 9 || (cX == curX - 1 && cY == curY + 1 && (curnode.position[cS] == 12 || curnode.position[cS] == 7))) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && cY-- && !stop) {
			cS-=7;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 9 || (cX == curX + 1 && cY == curY - 1 && curnode.position[cS] == 12)) return true;
			if(+curnode.position[cS]) stop = true;
		}
		cS = square; cX = curX; cY = curY; stop = false;
		while(cX++ && cX < 9 && cY++ && cY < 9 && !stop) {
			cS+=9;
			if(curnode.position[cS] == 11 || curnode.position[cS] == 9 || (cX == curX + 1 && cY == curY + 1 && (curnode.position[cS] == 12 || curnode.position[cS] == 7))) return true;
			if(+curnode.position[cS]) stop = true;
		}

	}
	return false;
}
var kingInCheck = function(curnode, color) {
	var sq = 64;
	while(sq--) {
		if(!color && curnode.position[sq] == 6) {
			return squareInCheck(curnode, sq, color);
		}
		if(color && curnode.position[sq] == 12) {
			return squareInCheck(curnode, sq, color);
		}
	}
	return false;
}

var domove = function(curnode, themove) {
	// take in a node and a move and return a new node with the move having been played.

	// update drawClock (50 moves without pawn move or capture = draw)
	if(curnode.position[themove[0]] == 1 || curnode.position[themove[0]] == 7 || curnode.position[themove[1]]) {
		curnode.drawClock = 0;
	} else {
		curnode.drawClock++;
	}
	if(curnode.position[themove[0]] == 6) {
		curnode.castle.k = false;
		curnode.castle.q = false;
	}
	if(curnode.position[themove[0]] == 12) {
		curnode.castle.K = false;
		curnode.castle.Q = false;
	}
	if(themove[0] == 0 && curnode.position[themove[0]] == 4) {
		curnode.castle.q = false;
	}
	if(themove[0] == 7 && curnode.position[themove[0]] == 4) {
		curnode.castle.k = false;
	}
	if(themove[0] == 56 && curnode.position[themove[0]] == 10) {
		curnode.castle.Q = false;
	}
	if(themove[0] == 63 && curnode.position[themove[0]] == 10) {
		curnode.castle.K = false;
	}

	// actually move the piece
	curnode.position[themove[1]] = curnode.position[themove[0]];
	curnode.position[themove[0]] = 0;
	curnode.enpassantSquare = -1;
	if(themove.length > 2) {
		switch(themove[2]) {
		case "promote":
			curnode.position[themove[1]] = themove[3];
			break;
		case "ep-enable":
			curnode.enpassantSquare = themove[3];
			break;
		case "ep-capture":
			curnode.position[themove[3]] = 0;
			break;
		case "castle":
			switch(themove[3]) {
			case "k":
				curnode.position[5] = curnode.position[7];
				curnode.position[7] = 0;
				break;
			case "q":
				curnode.position[3] = curnode.position[0];
				curnode.position[0] = 0;
				break;
			case "K":
				curnode.position[61] = curnode.position[63];
				curnode.position[63] = 0;
				break;
			case "Q":
				curnode.position[59] = curnode.position[56];
				curnode.position[56] = 0;
				break;
			}
		}
	}
	if(!curnode.move) curnode.moveNumber++;
	curnode.move = !curnode.move;
	return curnode;
}

var pushMove = function(curnode, move) {
	if(typeof gamemoves[curnode.moveNumber] === 'undefined') gamemoves[curnode.moveNumber] = [];
	var curmove = (curnode.move) ? 0 : 1;
	var movestr = (!move) ? '...' : getMoveString(curnode, move);
	var tempnode = JSON.parse(JSON.stringify(curnode));
	tempnode = domove(tempnode, move);
	gamemoves[curnode.moveNumber][curmove] = {
		fen: outputfen(tempnode),
		movestring: movestr
	}
	if(!curmove && typeof gamemoves[curnode.moveNumber][1] !== 'undefined') gamemoves[curnode.moveNumber].splice(1,1);
	gamemoves.splice(curnode.moveNumber + 1, gamemoves.length - curnode.moveNumber);
}

var updateGameMoveList = function() {
	var gmhtml = '<ul>';
	for(var i in gamemoves) {
		gmhtml += '<li class="movenumber">' + i + '.</li>';
		if(typeof gamemoves[i][0] !== "undefined") {
			gmhtml += '<li class="gm-white move-item" data-fen="' + gamemoves[i][0].fen + '">' + gamemoves[i][0].movestring + '</li>';
		}
		if(typeof gamemoves[i][1] !== "undefined") {
			gmhtml += '<li class="gm-black move-item" data-fen="' + gamemoves[i][1].fen + '">' + gamemoves[i][1].movestring + '</li>';
		}
	}
	gmhtml += '</ul>';
	$("#game-moves").html(gmhtml);
}
var getMoveString = function(curnode, ml) {
	var mlhtml = '';
	if(ml.length > 2 && ml[2] == 'castle' && (ml[3] == 'k' || ml[3] =='K')) {
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">o-o</span>';
	} else if(ml.length > 2 && ml[2] == 'castle' && (ml[3] == 'q' || ml[3] =='Q')) {
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">o-o-o</span>';
	} else {
		mlhtml += ucpieces[pieces.numbers[curnode.position[ml[0]]]];
		mlhtml += '<span class="sq1" data-square="' + ml[0] + '">' + algebraicSquares.numbers[ml[0]] + '</span>';
		if(curnode.position[ml[1]] || (ml.length > 2 && ml[3] == "ep-capture")) {
			mlhtml += 'x';
		} else {
			mlhtml += '-';
		}
		mlhtml += '<span class="sq2" data-square="' + ml[1] + '">' + algebraicSquares.numbers[ml[1]] + '</span>';
		if(ml.length > 2) {
			switch(ml[2]) {
			case "promote":
				mlhtml += '=' + ucpieces[pieces.numbers[ml[3]]];
				break;
			case "ep-capture":
				mlhtml += 'ep';
				break;
			}
		}
	}
	mlhtml += '</li>';
	return mlhtml;
}
var updateMoveList = function() {
	// general ui function: run perft and update the move list ui
	var curnode = $("#board").data("node");
	var ml = perft( curnode );
	var mlhtml = '';
	if(!ml.length) {
		if(kingInCheck(curnode, curnode.move)) {
			mlhtml = 'checkmate!!';
		} else {
			mlhtml = 'stalemate!!';
		}
		$("#possible-moves .button-action").attr("disabled", "disabled");
		alert(mlhtml);
		mlhtml = '<p>' + mlhtml + '</p>';
		$("#movelist").html(mlhtml);
		return false;
	}
	$("#possible-moves .button-action").removeAttr("disabled");
	mlhtml = '<ul>';
	for(var i in ml) mlhtml += '<li data-perftid="' + i + '">' + getMoveString(curnode, ml[i]) + '</li>';
	mlhtml += '</ul>';
	$("#movelist").html(mlhtml);
}

$(document).ready(function(){
	var html = '';
	var b = true;
	for(var r = 0; r < 64; r++) {
		html += '<div id="square' + r + '" class="square ' + (b?'white':'black') + '"> </div>';
		if((r+1) / 8 != ~~((r+1) / 8)) b = !b;
	}
	$("#board").html(html);
	html = '';

	$("#submitfen").click(function() {
		$(".square").text(' ');
		var curnode = parsefen($("#fen").val());
		$("#board").data("node", curnode);
		gamemoves = [];
		pushMove(curnode, false);
		updateBoard();
	});
	$("#submitfen").trigger('click');
	$("#do-random").click(function() {
		var curnode = $("#board").data("node");
		var ml = perft( curnode );
		var themove = ml[~~(Math.random() * ml.length)];
		pushMove(curnode, themove);
		curnode = domove(curnode, themove);
		$("#board").data("node", curnode);
		updateBoard();
	});
	$(document).delegate(".square", "click", function() {
		if($(".fromsq").length) {
			var curnode = $("#board").data("node");
			var ml = perft(curnode);
			var fromsq = +($(".fromsq").eq(0).attr("id").replace("square", ""));
			var tosq = +($(this).attr("id").replace("square", ""));
			var themove = 0;
			for(var i in ml) {
				if(ml[i][0] == fromsq && ml[i][1] == tosq) {
					themove = i;
					break;
				}
			}
			if(themove) {
				pushMove(curnode, ml[themove]);
				curnode = domove(curnode, ml[themove]);
				$("#board").data("node", curnode);
				updateBoard();
			} else {
				$(".fromsq").removeClass("fromsq");
				$(this).addClass("fromsq");
			}
		} else {
			$(this).addClass("fromsq");
		}
	});
});

$(document).delegate("#possible-moves li", "click", function() {
	var thisnode = $("#board").data("node");
	var thismove = perft(thisnode)[$(this).attr("data-perftid")];
	pushMove(curnode, thismove);
	thisnode = domove(thisnode, thismove);
	$("#board").data("node", thisnode);
	updateBoard();
});
$(document).delegate("#game-moves li.move-item", "click", function() {
	var curnode = parsefen($(this).attr("data-fen"));
	$("#board").data("node", curnode);
	updateBoard();
});