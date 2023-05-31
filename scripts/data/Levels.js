const levels = {
	dev_01: {
		dimensions: [8, 8],
		spawn: [1.5, 1.5, 45.1],
		structures: [
			{ type: "wall", coords: [0, 0, 8, 0] },
			{ type: "wall", coords: [0, 0, 0, 8] },
			{ type: "wall", coords: [8, 0, 8, 8] },
			{ type: "wall", coords: [0, 8, 8, 8] },
		],
	},
	dev_02: {
		dimensions: [32, 32],
		spawn: [1.5, 1.5, 45.1],
		structures: [
			{ type: "wall", coords: [0, 0, 32, 0] },
			{ type: "wall", coords: [0, 0, 0, 32] },
			{ type: "wall", coords: [32, 0, 32, 32] },
			{ type: "wall", coords: [0, 32, 32, 32] },
		],
	},
	dev_03: {
		dimensions: [32, 32],
		spawn: [0.5, 0.5, 90.1],
		structures: [
			// Outer walls.
			{ type: "wall", coords: [0, 0, 32, 0] },
			{ type: "wall", coords: [0, 0, 0, 32] },
			{ type: "wall", coords: [32, 0, 32, 32] },
			{ type: "wall", coords: [0, 32, 32, 32] },

			//  Maze
			{ type: "wall", coords: [2, 0, 2, 30] },
			{ type: "wall", coords: [2, 30, 30, 30] },
			{ type: "wall", coords: [30, 30, 2, 10] },
		],
	},
};

export default levels;
