var algebraicSquares = {
	ranks: ['h','g','f','e','d','c','b','a'],   // backwards because top rank is rank 0 internally
	symbols: {},
	numbers: []
};
var coords = [];
var sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		algebraicSquares.symbols[algebraicSquares.ranks[i]+(9-r)] = sq;
		algebraicSquares.numbers[sq] = algebraicSquares.ranks[r-1]+(8-i);
		coords[sq] = [i, 8-r];
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
				if(curY && !tP[i-8]) movelist.push([i, i-8]);
				if(curY === 7 && !tP[i-16] && !tP[i-8]) movelist.push([i, i-16]);
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
				if(curY < 8 && !tP[i+8]) movelist.push([i, i+8]);
				if(curY === 2 && !tP[i+16] && !tP[i+8]) movelist.push([i, i+16]);
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
	return movelist;
}
var board = {
	parsefen: function(fen) {
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
};

var updateBoard = function() {
	var thisnode = $("#board").data("node");
	var thisposition = thisnode.position;
	var mark = 64;
	if(thisnode.move) {
		$("#turn").html("<p class=\"white\">White's Turn</p>");
	} else {
		$("#turn").html("<p class=\"black\">Black's Turn</p>");
	}
	$("#movenumber").html("<p class=\"info\">Move number: " + thisnode.moveNumber + "</p>");
	$("#drawclock").html("<p class=\"info\">Draw clock: " + thisnode.drawClock + "</p>");
	$("#enpassant").html("<p class=\"info\">En passant square: " + thisnode.enpassantSquare + "</p>");
	var castle = '';
	for(var i in thisnode.castle) {
		castle += i + ' ';
	}
	$("#castle").html("<p class=\"info\">Castles: " + castle + "</p>");

	while(mark--) {
		thispiece = pieces.numbers[thisposition[mark]];
		thisColor = (thispiece.toLowerCase() === thispiece) ? "pblack" : "pwhite";
		$(".square").eq(mark).html("<span class=\"" + thisColor + "\">" + (thispiece != ' ' ? ucpieces[thispiece] : '&nbsp;') + "</span>");
	}
	return true;
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
		$("#board").data("node", board.parsefen($("#fen").val()));
		updateBoard();
	});
	$("#submitfen").trigger('click');
	$("#do-random").click(function() {
		var curnode = $("#board").data("node");
		var ml = perft( curnode );
		var themove = ml[~~(Math.random() * ml.length)];
		curnode.position[themove[1]] = curnode.position[themove[0]];
		curnode.position[themove[0]] = 0;
		curnode.move = !curnode.move;
		$("#board").data("node", curnode);
		updateBoard();
	});
	$("#do-perft").click(function() {
		var ml = perft( $("#board").data("node") );
		var mlhtml = '<ul>';
		for(var i in ml) {
			mlhtml += '<li><span class="sq1" data-square="' + ml[i][0] + '">' + algebraicSquares.numbers[ml[i][0]] + '</span> -> <span class="sq2" data-square="' + ml[i][1] + '">' + algebraicSquares.numbers[ml[i][1]] + '</span></li>';
		}
		mlhtml += '</ul>';
		$("#movelist").html(mlhtml);
	});
});

$(document).delegate("#possible-moves li", "click", function() {
	var $this = $(this);
	$(".fromsq").removeClass("fromsq");
	$(".tosq").removeClass("tosq");
	$(".square").eq($(".sq1", $this).attr("data-square")).addClass("fromsq");
	$(".square").eq($(".sq2", $this).attr("data-square")).addClass("tosq");
});