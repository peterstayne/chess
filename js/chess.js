var algebraicSquares = {
	ranks: ['h','g','f','e','d','c','b','a'],   // backwards because top rank is rank 0 internally
	symbols: {},
	numbers: []
};
var sq = 0;
for(var i = 0; i<8; i++) {
	for(var r = 8; r; r--) {
		algebraicSquares.symbols[algebraicSquares.ranks[i]+(9-r)] = sq;
		algebraicSquares.numbers[sq] = algebraicSquares.ranks[i]+(9-r);
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


var board = {
	parsefen: function(fen) {
		var returnNode = new node();
		$(".square").text(' ');
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
		var thisnode = board.parsefen($("#fen").val());
		var thisposition = thisnode.position;
		var mark = 64;
		while(mark--) {
			thispiece = pieces.numbers[thisposition[mark]];
			thisColor = (thispiece.toLowerCase() === thispiece) ? "pblack" : "pwhite";
			$(".square").eq(mark).html("<span class=\"" + thisColor + "\">" + ucpieces[thispiece] + "</span>");
		}
	});
	$("#submitfen").trigger('click');
});
