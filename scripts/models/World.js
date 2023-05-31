/**
 * Imports
 */
import levels from "../data/Levels.js";
import { Renderer, camera, player } from "../index.js";
import {
	calculateDistance,
	degreeToRadian,
	shadowClamp,
} from "../util/Math.js";
import Ray from "./Ray.js";

/**
 * Manages levels and their objects.
 */
class World {
	/**
	 * @param {string} initialLevel The title of the level to load initially. Leave null for nothing.
	 */
	constructor(initialLevel = null) {
		this.grid = 48; // 2d display gap control.

		// 3d rendering configuration.
		this.wallScale = 0.25;
		this.textureRepeatFactor = 5;
		this.textureOverlapCompensation = 1;

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
		const { grid } = this;

		for (const structure of structures) {
			if (structure.type === "wall") {
				const [width, height] = dimensions;
				const [sX, sY, eX, eY] = structure.coords;

				if (sX < 0) structure.coords[0] = 0;
				if (sY < 0) structure.coords[1] = 0;
				if (eX < 0) structure.coords[2] = 0;
				if (eY < 0) structure.coords[3] = 0;

				if (sX > width) structure.coords[0] = width;
				if (sY > height) structure.coords[1] = height;
				if (eX > width) structure.coords[2] = width;
				if (eY > height) structure.coords[3] = height;

				structure.coords = [
					structure.coords[0] * grid,
					structure.coords[1] * grid,
					structure.coords[2] * grid,
					structure.coords[3] * grid,
				];
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

			this.walls = this.level.structures.filter(
				({ type }) => type === "wall"
			);

			// Configure objects.
			player.x = spawn[0] * grid;
			player.y = spawn[1] * grid;
			player.angle = spawn[2] || 0.1;
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
		const { grid } = this;

		const [sX, sY, eX, eY] = wall.coords;

		ctx.beginPath();

		ctx.strokeStyle = "blue";
		ctx.lineWidth = grid / 12;

		ctx.moveTo(sX, sY);
		ctx.lineTo(eX, eY);
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
			switch (structure.type) {
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

	/**
	 * Render all walls in 2d.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	__3dWalls(ctx) {
		const {
			fov,
			resolutionDegradation,
			renderDistance,
			lightDistance,
			wallHeightGridRatio,
		} = camera;
		const {
			canvas: { width, height },
		} = Renderer;
		const { x, y, angle } = player;
		const { wallScale, textureRepeatFactor, textureOverlapCompensation } =
			this;

		const halfHeight = height / 2;

		const wallTexture = document.querySelector("#brickimage");

		// const wallArray = Array.from(
		// 	{ length: Math.ceil(width / resolutionDegradation) },
		// 	(_, i) => i * resolutionDegradation
		// )
		// 	// Map each screen column to a ray and cast it.
		// 	.map((i) => {
		// 		const a = angle + fov * (i / width) + -fov / 2;
		// 		return [a, new Ray(x, y, a).cast(3, renderDistance), i];
		// 	})
		// 	// Get only rays that hit.
		// 	.filter(([_, ray]) => ray.hit)
		// 	.sort(([_, a], [__, b]) => {
		// 		const distance1 = calculateDistance(x, y, a.x, a.y);
		// 		const distance2 = calculateDistance(x, y, b.x, b.y);

		// 		return distance2 - distance1;
		// 	})
		// 	.forEach(([a, ray, i]) => {
		// 		const distance = calculateDistance(x, y, ray.x, ray.y);

		// 		const perpendicularDistance =
		// 			distance * Math.cos(degreeToRadian(a - angle));

		// 		const wallHeight =
		// 			(wallHeightGridRatio / perpendicularDistance) *
		// 			halfHeight *
		// 			wallScale;

		// 		const [hitPos, wallLength] = ray.hit;

		// 		const textureX =
		// 			((wallLength / textureRepeatFactor) *
		// 				(hitPos % wallLength)) %
		// 			wallTexture.width;

		// 		const opaq =
		// 			((lightDistance - calculateDistance(x, y, ray.x, ray.y)) /
		// 				lightDistance) *
		// 			shadowClamp(hitPos, 0.01, 0.99);

		// 		// Draw the textured wall
		// 		ctx.drawImage(
		// 			wallTexture,
		// 			textureX, // Grab X
		// 			0, // Grab Y
		// 			resolutionDegradation, // Grab Width
		// 			wallTexture.height, // Grab Height
		// 			Math.round(i), // Draw X
		// 			halfHeight - wallHeight / 2, // Draw Y
		// 			resolutionDegradation + textureOverlapCompensation, // Draw width
		// 			wallHeight // Draw Height
		// 		);

		// 		// Apply light filter for distance.
		// 		ctx.beginPath();

		// 		ctx.fillStyle = `rgba(0,0,0, ${0.5 - opaq})`;

		// 		ctx.fillRect(
		// 			i,
		// 			halfHeight - wallHeight / 2,
		// 			resolutionDegradation + textureOverlapCompensation,
		// 			wallHeight
		// 		);

		// 		ctx.closePath();
		// 	});

		for (let i = 0; i < width; i += resolutionDegradation) {
			const rAngle = angle + fov * (i / width) + -fov / 2;
			const ray = new Ray(x, y, rAngle).cast(3, renderDistance);

			const distance = calculateDistance(x, y, ray.x, ray.y);

			const perpendicularDistance =
				distance * Math.cos(degreeToRadian(rAngle - angle));

			const wallHeight =
				(wallHeightGridRatio / perpendicularDistance) *
				halfHeight *
				wallScale;

			if (!ray.hit) continue;

			const [hitPos, wallLength, wall] = ray.hit;

			// const textureX =
			// 	((wallLength / textureRepeatFactor) * (hitPos % wallLength)) %
			// 	wallTexture.width;

			const opaq =
				((lightDistance - calculateDistance(x, y, ray.x, ray.y)) /
					lightDistance) *
				shadowClamp(hitPos, 0.01, 0.99);

			// Draw the textured wall
			// ctx.drawImage(
			// 	wallTexture,
			// 	textureX, // Grab X
			// 	0, // Grab Y
			// 	resolutionDegradation, // Grab Width
			// 	wallTexture.height, // Grab Height
			// 	i, // Draw X
			// 	halfHeight - wallHeight / 2, // Draw Y
			// 	resolutionDegradation, // Draw width
			// 	wallHeight // Draw Height
			// );

			// Draw a colored wall.
			const [r, g, b, a] = wall.color || [100, 100, 100, 1];
			ctx.beginPath();

			ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a || 1})`;

			ctx.fillRect(
				i,
				halfHeight - wallHeight / 2,
				resolutionDegradation,
				wallHeight
			);

			ctx.closePath();

			// Apply vertical shading.
			ctx.beginPath();

			ctx.fillStyle = `rgba(0,0,0, ${0.5 - opaq})`;

			ctx.fillRect(
				i,
				halfHeight - wallHeight / 2 - textureOverlapCompensation,
				resolutionDegradation,
				wallHeight + textureOverlapCompensation * 2
			);

			ctx.closePath();

			// Apply horizontal shading.
			const horizontalShadowClamp = shadowClamp(
				hitPos % wallLength,
				0.1,
				0.9
			);

			if (horizontalShadowClamp !== 1) {
				ctx.beginPath();

				ctx.fillStyle = `rgba(0,0,0, ${horizontalShadowClamp - 0.9})`;

				ctx.fillRect(
					i,
					halfHeight - wallHeight / 2 - textureOverlapCompensation,
					resolutionDegradation,
					wallHeight + textureOverlapCompensation * 2
				);

				ctx.closePath();
			}
		}
	}

	/**
	 * Render the floor and ceiling in 3d.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	__3dFloorAndCeiling(ctx) {
		const {
			canvas: { width, height },
			resolutionDegradation,
		} = Renderer;

		const ceilingDarkness = 2;
		const floorDarkness = 4;

		for (let y = height / 2; y < height; y++) {
			ctx.beginPath();

			ctx.fillStyle = `rgba(100,100,100, ${y / height / floorDarkness})`;
			ctx.fillRect(0, y, width, 1);

			ctx.closePath();
		}

		for (let y = height / 2 - 1; y > 1; y--) {
			ctx.beginPath();

			ctx.fillStyle = `rgba(100,100,100, ${
				(height - y) / height / ceilingDarkness
			})`;
			ctx.fillRect(0, y, width, 1);

			ctx.closePath();
		}

		// Blue sky.
		// ctx.beginPath();

		// ctx.fillStyle = `skyblue`;
		// ctx.fillRect(0, 0, width, height / 2);

		// ctx.closePath();
	}

	// 3d rendering.
	__3dViewRaycast(ctx) {
		this.__3dFloorAndCeiling(ctx);
		this.__3dWalls(ctx);
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
