var algebraicSquares = {
	ranks: ['h','g','f','e','d','c','b','a'],   // backwards because top rank is rank 0 internally
	symbols: {},
	numbers: []
};
var sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		algebraicSquares.symbols[algebraicSquares.ranks[i]+(9-r)] = sq;
		algebraicSquares.numbers[sq] = algebraicSquares.ranks[r-1]+(8-i);
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
	this.drawClock = 0;
	this.moveNumber = 1;
	this.enpassantSquare = '-';
	this.score = 0;
	this.move = true;    // true = white, false = black
};

var perft = function(thisnode) {
	var tS;
	var i = 64;
	var color = thisnode.move;
	var tP = thisnode.position;
	var movelist = [];
	var curX = 9;
	var curY = 8;
	while(i--) {

		curX--;
		if(!curX) { curY--; curX = 8; }

		tS = tP[i];
		if(!tS || (color && tS < 7) || (!color && tS > 6)) continue;

		if(color) {
			if(tS === 7) { // white pawn
				if(curY && !tP[i-8]) movelist.push([i, i-8]);
				if(curY === 7 && !tP[i-16]) movelist.push([i, i-16]);
			}
			if(tS === 8) { //white knight
				if(curY > 1) {
					if(curY > 2) {
						if(curX < 8 && tP[i-17] < 7) movelist.push([i, i-17]);
						if(curX > 1 && tP[i-15] < 7) movelist.push([i, i-15]);
					}
					if(curX < 7 && tP[i-6] < 7) movelist.push([i, i-6]);
					if(curX > 2 && tP[i-10] < 7) movelist.push([i, i-10]);
				}
				if(curY < 8) {
					if(curY < 7) {
						if(curX < 8 && tP[i+15] < 7) movelist.push([i, i+15]);
						if(curX > 1 && tP[i+17] < 7) movelist.push([i, i+17]);
					}
					if(curX < 7 && tP[i+10] < 7) movelist.push([i, i+10]);
					if(curX > 2 && tP[i+6] < 7) movelist.push([i, i+6]);
				}
			}
		} else {
			if(tS === 1) {  // black pawn
				if(curY < 8 && !tP[i+8]) movelist.push([i, i+8]);
				if(curY === 2 && !tP[i+16]) movelist.push([i, i+16]);
			}
			if(tS === 2) { //black knight
				if(curY > 1) {
					if(curY > 2) {
						if(curX < 8 && (!tP[i-17] || tP[i-17] > 6)) movelist.push([i, i-17]);
						if(curX > 1 && (!tP[i-15] || tP[i-15] > 6)) movelist.push([i, i-15]);	
					}
					if(curX < 7 && (!tP[i-6] || tP[i-6] > 6)) movelist.push([i, i-6]);
					if(curX > 2 && (!tP[i-10] || tP[i-10] > 6)) movelist.push([i, i-10]);
				}
				if(curY < 8) {
					if(curY < 7) {
						if(curX < 8 && (!tP[i+15] || tP[i+15] > 6)) movelist.push([i, i+15]);
						if(curX > 1 && (!tP[i+17] || tP[i+17] > 6)) movelist.push([i, i+17]);
					}
					if(curX < 7 && (!tP[i+10] || tP[i+10] > 6)) movelist.push([i, i+10]);
					if(curX > 2 && (!tP[i+6] || tP[i+6] > 6)) movelist.push([i, i+6]);
				}
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
		if(fenparts[4] == +fenparts[4]) {
			returnNode.drawClock = +fenparts[4];
		}
		if(fenparts[5] == +fenparts[5]) {
			returnNode.moveNumber = +fenparts[5];
		}
		return returnNode;
	}
};

var updateBoard = function() {
	var thisnode = $("#board").data("node")
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