/**
 * Imports
 */
import levels from "../data/Levels.js";
import { Renderer, camera, player } from "../index.js";
import Ray, { calculateDistance, degreeToRadian } from "./Ray.js";

/**
 * Manages levels and their objects.
 */
class World {
	/**
	 * @param {string} initialLevel The title of the level to load initially. Leave null for nothing.
	 */
	constructor(initialLevel = null) {
		this.grid = 48; // 2d display gap control.

		// Level configuration.
		this.level = null;
		if (initialLevel) this.loadLevel(initialLevel);
	}

	/**
	 * Get width (in pixels) of the world.
	 */
	get width() {
		return this.level ? this.grid * this.level.dimensions[0] : 0;
	}

	/**
	 * Get height (in pixels) of the world.
	 */
	get height() {
		return this.level ? this.grid * this.level.dimensions[1] : 0;
	}

	/**
	 * Ensure structures in the level are within bounds.
	 * @param {Array<Structure>} structures The array of structures from the level.
	 * @param {Array} dimensions The 2d array of the world's dimensions.
	 */
	__normalizeStructures(structures, dimensions) {
		for (const structure of structures) {
			if (structure[0] === "wall") {
				const [width, height] = dimensions;
				const [_, sX, sY, eX, eY] = structure;

				if (sX < 0) structure[1] = 0;
				if (sY < 0) structure[2] = 0;
				if (eX < 0) structure[3] = 0;
				if (eY < 0) structure[4] = 0;

				if (sX > width) structure[1] = width;
				if (sY > height) structure[2] = height;
				if (eX > width) structure[3] = width;
				if (eY > height) structure[4] = height;
			} else continue;
		}

		return structures;
	}

	/**
	 * Load a new level into the game.
	 * @param {string} name The name of the level to load in.
	 */
	loadLevel(name) {
		try {
			if (!levels[name]) throw "A level with that name does not exist.";

			// Store the level data.
			this.level = levels[name];

			this.level.structures = this.__normalizeStructures(
				this.level.structures,
				this.level.dimensions
			);

			const {
				grid,
				level: { spawn },
			} = this;

			this.walls = this.level.structures
				.filter(([type]) => type === "wall")
				.map(([_, sX, sY, eX, eY]) => [
					_,
					sX * grid,
					sY * grid,
					eX * grid,
					eY * grid,
				]);

			// Configure objects.
			player.x = spawn[0] * grid;
			player.y = spawn[1] * grid;
		} catch (err) {
			console.error(`Failed to load level with label "${name}"`, err);
		}
	}

	// 2d rendering.

	/**
	 * Render the map grid in 2d.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	__2dGrid(ctx) {
		const { grid, level } = this;
		const {
			dimensions: [width, height],
		} = level;

		ctx.beginPath();

		ctx.fillStyle = "grey";

		for (let x = 0; x <= width; x += 1)
			for (let y = 0; y <= height; y += 1) {
				ctx.fillRect(x * grid, y * grid, grid / 12, grid / 12);
			}

		ctx.closePath();
	}

	/**
	 * Render a wall in 2d.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 * @param {Array<number>} wall The wall coordinates to render.
	 */
	__2dWall(ctx, wall) {
		const { grid, level } = this;

		const [_, sX, sY, eX, eY] = wall;

		ctx.beginPath();

		ctx.strokeStyle = "blue";
		ctx.lineWidth = grid / 12;

		ctx.moveTo(sX * grid, sY * grid);
		ctx.lineTo(eX * grid, eY * grid);
		ctx.stroke();

		ctx.closePath();
	}

	/**
	 * Render all walls in 2d.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	__2dWalls(ctx) {
		const { level } = this;
		const { structures } = level;

		for (const structure of structures) {
			switch (structure[0]) {
				case "wall":
					this.__2dWall(ctx, structure);
					break;
				default:
					break;
			}

			// ctx.beginPath();
			// ctx.fillStyle = "blue";
			// ctx.fillRect(x * grid, y * grid, 4, 4);
			// ctx.closePath();
		}
	}

	/**
	 * Render the world in 2d mode.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	render2d(ctx) {
		try {
			if (!this.level) return;

			this.__2dGrid(ctx);
			this.__2dWalls(ctx);
			player.render2d(ctx);
		} catch (err) {
			console.error("Failed to render world in 2d mode.", err);
		}
	}

	// 3d rendering.
	__3dViewRaycast(ctx) {
		const { fov, renderDistance } = camera;
		const {
			canvas: { width },
		} = Renderer;
		const { x, y, angle } = player;

		// player.render2d(ctx);

		const resolutionDegredation = 4;

		for (let i = 0; i < width; i += resolutionDegredation) {
			const a = angle + fov * (i / width) + -fov / 2;

			const ray = new Ray(x, y, a).cast(3, renderDistance);
			const height =
				(renderDistance - calculateDistance(x, y, ray.x, ray.y)) /
				renderDistance;

			console.log(height);

			// ray.render2d(ctx);

			if (!ray.hit) continue;
			ctx.beginPath();

			ctx.fillStyle = `rgba(${height * 255},0,255, ${height})`;

			ctx.fillRect(
				i,
				(ctx.canvas.height - ctx.canvas.height * height) / 2,
				resolutionDegredation,
				ctx.canvas.height * height
			);

			ctx.closePath();
		}

		// let i = 0;
		// for (let a = -fov / 2; a < fov / 2; a += 1) {
		// 	const ray = new Ray(x, y, angle + a).cast(3, renderDistance);
		// 	ray.render2d(ctx);

		// 	if (!ray.hit) {
		// 		continue;
		// 	}

		// 	const dist = calculateDistance(x, y, ray.x, ray.y);

		// 	ctx.beginPath();

		// 	ctx.fillStyle = "blue";

		// 	ctx.fillRect(
		// 		i * ratio,
		// 		ctx.canvas.height - (dist / renderDistance) * ctx.canvas.height,
		// 		ratio,
		// 		ctx.canvas.height - (dist / renderDistance) * ctx.canvas.height
		// 	);

		// 	ctx.closePath();

		// 	i++;
		// }
	}

	/**
	 * Render the world in 3d mode.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	render3d(ctx) {
		try {
			if (!this.level) return;

			this.__3dViewRaycast(ctx);
		} catch (err) {
			console.error("Failed to render world in 3d mode.", err);
		}
	}
}

export default World;
