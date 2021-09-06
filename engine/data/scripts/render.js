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

// Render a string of numbers on the screen using pixel art.
function renderNumber(x, y, number) {
	// Check that the number sheet has loaded.
	if (!nums.loaded) return;

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

// Render a ray.
function drawRay(x1, y1, x2, y2, color) {
	ctx.beginPath();

	ctx.strokeStyle = color;
	ctx.lineWidth = 1;

	ctx.moveTo(x1 - player.camera.x, y1 - player.camera.y);
	ctx.lineTo(x2 - player.camera.x, y2 - player.camera.y);

	ctx.stroke();
	ctx.closePath();
}

// Render loop.

function renderLoop() {
	// If the world hasn't finished generating, we don't render.
	if (!world.finishedGenerating) {
		clearCanvas();
		ctx.beginPath();

		ctx.font = "bold 12px consolas";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText(
			"LOADING",
			Math.round(canvas.width / 2),
			Math.round(canvas.height / 2)
		);

		ctx.closePath();
	} else {
		// INPUT.
		player.input();

		// LOGIC. (only runs if the game isn't paused)
		if (!paused) {
			world.logic(); // Update the world.
			entities.logic(); // Update the entities.
			items.logic(); // Update the items.
			player.logic(); // Update the player.
		}

		// RENDER.
		clearCanvas();
		world.render(ctx); // Render the world, all of its rooms and tiles.
		items.render(ctx); // Render all the items in the game.
		entities.render(ctx); // Render all the entities in the game.
		player.render(ctx); // Render the player.
		world.getRoom(player.roomPos.x, player.roomPos.y)[0].renderEnemies(ctx); // Render nearby enemies.

		// If the settings allow the rendering of UI.
		if (renderUI) {
			player.renderUI(ctx); // Render the player's UI.

			// Only render the mini-map if the UI is being loaded and the settings allow it.
			if (renderMiniMap) {
				player.renderMiniMap(ctx);
			}
		}
	}

	window.requestAnimationFrame(renderLoop);
}

window.requestAnimationFrame(renderLoop);
