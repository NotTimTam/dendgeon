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
