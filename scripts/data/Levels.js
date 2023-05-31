const levels = {
	dev_01: {
		dimensions: [32, 32],
		spawn: [1.5, 1.5, 260],
		structures: [
			{ type: "wall", coords: [0, 0, 32, 0] },
			{ type: "wall", coords: [0, 0, 0, 32] },
			{ type: "wall", coords: [32, 0, 32, 32] },
			{ type: "wall", coords: [0, 32, 32, 32] },
		],
	},
};

export default levels;
