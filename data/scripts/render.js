"use strict";

// Canvas setup.
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let pixelRatio;

// Resize canvas.
function resizeCanvas() {
	pixelRatio = window.devicePixelRatio / ctx.backingStorePixelRatio;

	let screenSize = (window.innerWidth + window.innerHeight) / 2;
	while (
		screenSize > window.innerWidth - 50 ||
		screenSize > window.innerHeight - 50
	) {
		screenSize--;
	}

	canvas.style.width = `${screenSize}px`;
	canvas.style.height = `${screenSize}px`;

	canvas.width = 128;
	canvas.height = 128;
}
resizeCanvas();
window.onresize = () => resizeCanvas();

// Clear canvas.
function clearCanvas() {
	ctx.beginPath();

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.closePath();
}

// Render text.
const nums = new Sheet("spritesheet_nums", {
	0: { x: 0, y: 0 },
	1: { x: 1, y: 0 },
	2: { x: 2, y: 0 },
	3: { x: 3, y: 0 },
	4: { x: 4, y: 0 },
	5: { x: 5, y: 0 },
	6: { x: 6, y: 0 },
	7: { x: 7, y: 0 },
	8: { x: 8, y: 0 },
	9: { x: 9, y: 0 },
});

function renderNumber(x, y, number) {
	x = Math.round(x);
	y = Math.round(y);

	let numArray = number.toString().split("");

	for (let i = 0; i < numArray.length; i++) {
		ctx.beginPath();

		ctx.drawImage(
			nums.map, // The tilemap image.
			nums.locs[numArray[i]].x * 8, // The position of the sub-image in the map.
			nums.locs[numArray[i]].y * 8,
			8, // The 8x8 pixel dimensions of that sub-image.
			8,
			Math.round(x + i * 8 + i), // Proper placement of the tile on screen.
			Math.round(y),
			8, // The size of the tile, as drawn on screen.
			8
		);

		ctx.closePath();
	}
}

// Render loop.
function renderLoop() {
	// INPUT.
	player.input();

	// LOGIC.
	world.logic(); // Update the world.
	items.logic(); // Update the items.
	player.logic(); // Update the player.

	// RENDER.
	clearCanvas();
	world.render(ctx); // Render the world, all of its rooms and tiles.
	items.render(ctx); // Render all the items in the game.
	player.render(ctx); // Render the player.

	player.renderUI(ctx); // Render the player's UI.

	window.requestAnimationFrame(renderLoop);
}
window.requestAnimationFrame(renderLoop);
