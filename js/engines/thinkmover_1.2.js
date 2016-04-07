game.engines.thinkMover_1_2 = {
	name: 'thinkMover_1_2',
	displayName: 'thinkMover 1.2',
	getMove: function(curnode) {

		var startTime = (new Date()).getTime();
		//	numbers: [' ', 'p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']
		var basicValue = [0, -1, -3, -3.1, -5, -9, 0, 1, 3, 3.1, 5, 9, 0];

		var pawnColMap = [0.11, 0.12, 0.13, 0.16, 0.17, 0.08, 0.1, 0.1];
		var maxply = 3;
		var nodecount = 0;
		var ob = {};

		//   a  b  c  d  e  f  g  h
		// 8 0  1  2  3  4  5  6  7
		// 7 8  9  10 11 12 13 14 15
		// 6 16 17 18 19 20 21 22 23
		// 5 24 25 26 27 28 29 30 31
		// 4 32 33 34 35 36 37 38 39
		// 3 40 41 42 43 44 45 46 47
		// 2 48 49 50 51 52 53 54 55
		// 1 56 57 58 59 60 61 62 63

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

		ob['prebqkeereeppbppppeneeneeepeepeeeBeeePeeeeeeeeNeePPPPePPPRNBQReKew0011'] = [
			// e4 e5 nf3 nc6 bb5 a6 ba4 nf6 o-o be7 re1
			[100, 9, 25] // b5
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
			// d4 d5 c4 e6
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

		function evaluatePosition(position) {
			var evals = 0, sq, rank, col, thisVal;
			var whitepieces = 0;
			var blackpieces = 0;
			var whitepawns = [0, 0, 0, 0, 0, 0, 0, 0];
			var blackpawns = [0, 0, 0, 0, 0, 0, 0, 0];

			// gather some useful data for the real evaluation loop
			for(var index = 0; index < 64; index += 1) {
				sq = position[index];

				if(sq === 0) continue;

				rank = index >> 3;
				col = index - (rank << 3);

				if(sq > 6) {
					whitepieces += basicValue[sq];
				} else {
					blackpieces += basicValue[sq];
				}

				if(sq === WHITE_PAWN) {
					whitepawns[col] += 1;
				}
				if(sq === BLACK_PAWN) {
					blackpawns[col] += 1;
				}
			}
			var whitepenalty = 0;
			var blackpenalty = 0;
			for(var index = 0; index < 8; index += 1) {
				if(whitepawns[index] > 0) {
					// isolated pawns
					if(!whitepawns[index - 1] && !whitepawns[index + 1]) {
						whitepenalty += 0.25;
					} 
					// doubled pawns
					if(whitepawns[index] !== 1) {
						whitepenalty += 0.35;
					}
				}
				if(blackpawns[index] > 0) {
					// isolated pawns
					if(!blackpawns[index - 1] && !blackpawns[index + 1]) {
						blackpenalty += 0.25;
					} 
					// doubled pawns
					if(blackpawns[index] !== 1) {
						blackpenalty += 0.35;
					}
				}
			}
			// real evaluation loop
			for(var index = 0; index < 64; index += 1) {
				sq = position[index];

				if(sq === 0) continue;
				rank = index >> 3;
				col = index - (rank << 3);

				if(sq === BLACK_PAWN) {
					// reward pawns for pushing ahead
					thisVal = -1 - (rank * pawnColMap[col]);
				} else if(sq === WHITE_PAWN) {
					thisVal = 1 + ((7 - rank) * pawnColMap[col]);

				} else if(sq === BLACK_KNIGHT) {
				 	if(rank === 0) {
				 		// penalize knights for sitting on back rank
						thisVal = -2.65;
				 	} else if(col === 0 || col === 7) {
				 		// slightly less penalty for sitting on left or right edge
						thisVal = -2.8;
					} else {
						thisVal = -3;
					}
				} else if(sq === WHITE_KNIGHT) {
				 	if(rank === 7) {
						thisVal = 2.65;
				 	} else if(col === 0 || col === 7) {
						thisVal = 2.8;
					} else {
						thisVal = 3;
					}

				} else if(sq === BLACK_BISHOP) {
					// encourage bishops to move from their home squares
				 	if(index === 2 || index === 5) {
						thisVal = -2.8;
					} else {
						thisVal = -3.07;
					}
				} else if(sq === WHITE_BISHOP) {
				 	if(index === 58 || index === 61) {
						thisVal = 2.8;
					} else {
						thisVal = 3.07;
					}
				} else if(sq === BLACK_ROOK) {
				 	if(blackpawns[col] === 0) {
						if(whitepawns[col] === 0) {
							// if no pawns on same col, reward the most
							thisVal = -5.52;
						} else {
							// if just enemy pawns on same col, reward a little
							thisVal = -5.32;
						}
					} else {
						thisVal = -5;
					}
				} else if(sq === WHITE_ROOK) {
				 	if(whitepawns[col] === 0) {
						if(blackpawns[col] === 0) {
							thisVal = 5.52;
						} else {
							thisVal = 5.32;
						}
					} else {
						thisVal = 5;
					}
				} else if(sq === BLACK_KING) {
				 	if(whitepieces > 22) {
						// if basic material for white is > 22, reward for moving away from center
				 		thisVal = -3 - (Math.abs(rank - 4) * 0.06 + Math.abs(col - 4) * 0.06);
					} else {
						// if basic material for white is <= 22, reward for moving toward the center
				 		thisVal = -3 + (Math.abs(rank - 4) * 0.03 + Math.abs(col - 4) * 0.03);
					}
				} else if(sq === WHITE_KING) {
				 	if(blackpieces > 22) {
						// if basic material for white is > 22, reward for moving away from center
				 		thisVal = 3 + (Math.abs(rank - 4) * 0.06 + Math.abs(col - 4) * 0.06);
					} else {
						// if basic material for white is <= 22, reward for moving toward the center
				 		thisVal = 3 - (Math.abs(rank - 4) * 0.03 + Math.abs(col - 4) * 0.03);
					}
				} else {
					thisVal = basicValue[sq];
				}
				evals += thisVal;
			}
			evals -= whitepenalty;
			evals += blackpenalty;
			return evals;
		}
		function searchNode( curnode, ply, qsq ) {
			nodecount += 1;
			var bestMove = [];
			var bestEval = 0;
			var ml = game.moveGen( curnode );
			var mllength = ml.length;
			var mobility = 0;
			var thisnode, thisEval, isStaticCapture;
			if(ply === maxply) {
				var posString = makePositionString(curnode);
				if(ob[posString]) {
					var obIndex = 0, randAccumulator = ob[posString][0][0], randOB = ~~(Math.random() * 100);
					while(randAccumulator < randOB) {
						obIndex += 1;
						randAccumulator += ob[posString][obIndex][0];
					}
					return [ ob[posString][obIndex][1], ob[posString][obIndex][2] ];
				}
			}
			if(mllength !== 0) {
				for(var index = 0; index < mllength; index += 1) {
					themove = ml[index];
					isStaticCapture = false;
					thisEval = false;
					if(themove[1] === qsq ) {
						isStaticCapture = true;
					} else if(qsq) {
						continue;
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
				}
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
			if(typeof ml[bestMove[0]] === 'undefined') {
				console.log(ml, bestMove)
			}
			console.log('moves', ml[bestMove[0]], bestEval);
			return ml[bestMove[0]];
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

