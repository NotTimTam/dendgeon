import { Keyboard, Mouse, Time, camera, world } from "../index.js";
import Ray from "../models/Ray.js";
import { normalizeAngle, vectorToPosition } from "../util/Math.js";

/**
 * The player object and its relative data and functions.
 */
class PlayerController {
	/**
	 * @param {number} x The player's starting x-position in pixels.
	 * @param {number} y The player's starting y-position in pixels.
	 * @param {*} options The player options object to pass through.
	 * @param {number} options.speed The player's movement speed in pixels per (averaged) frame. (default `200`)
	 */
	constructor(x = 0, y = 0, options) {
		this.x = x;
		this.y = y;

		this.speed =
			options && options.hasOwnProperty("speed") ? options.speed : 200;

		this.angle = 0.1;
	}

	/**
	 * Handle user input.
	 */
	input() {
		try {
			const {
				arrowup: up,
				arrowdown: down,
				arrowleft: left,
				arrowright: right,
				w,
				a,
				s,
				d,
				shift,
			} = Keyboard.keys;

			const { sensitivity } = Mouse;

			const { speed } = this;

			let speedMultiplier = 1;

			if ((up || w) && (left || a)) {
				speedMultiplier = 0.7071; // Adjust speed for diagonal movement (sqrt(2)/2)
			} else if ((up || w) && (right || d)) {
				speedMultiplier = 0.7071; // Adjust speed for diagonal movement (sqrt(2)/2)
			} else if ((down || s) && (left || a)) {
				speedMultiplier = 0.7071; // Adjust speed for diagonal movement (sqrt(2)/2)
			} else if ((down || s) && (right || d)) {
				speedMultiplier = 0.7071; // Adjust speed for diagonal movement (sqrt(2)/2)
			}

			if (shift) speedMultiplier *= 2;

			const actSpeed = speed * speedMultiplier * Time.deltaTime;

			if (up || w) {
				// this.y -= actSpeed;
				const rayResult = new Ray(this.x, this.y, this.angle).cast(
					1,
					actSpeed
				);
				if (!rayResult.hit) {
					const [newX, newY] = vectorToPosition(this.angle, actSpeed);
					this.x += newX;
					this.y += newY;
				}
			}
			if (down || s) {
				// this.y += actSpeed;
				const rayResult = new Ray(
					this.x,
					this.y,
					180 + this.angle
				).cast(1, actSpeed);
				if (!rayResult.hit) {
					const [newX, newY] = vectorToPosition(
						180 + this.angle,
						actSpeed
					);
					this.x += newX;
					this.y += newY;
				}
			}
			if (left || a) {
				// this.x -= actSpeed;
				const rayResult = new Ray(this.x, this.y, this.angle - 90).cast(
					1,
					actSpeed
				);
				if (!rayResult.hit) {
					const [newX, newY] = vectorToPosition(
						this.angle - 90,
						actSpeed
					);
					this.x += newX;
					this.y += newY;
				}
			}
			if (right || d) {
				// this.x += actSpeed;
				const rayResult = new Ray(this.x, this.y, this.angle + 90).cast(
					1,
					actSpeed
				);
				if (!rayResult.hit) {
					const [newX, newY] = vectorToPosition(
						this.angle + 90,
						actSpeed
					);
					this.x += newX;
					this.y += newY;
				}
			}

			if (this.x < 1) this.x = 1;
			if (this.y < 1) this.y = 1;
			if (this.x > world.width - 1) this.x = world.width - 1;
			if (this.y > world.height - 1) this.y = world.height - 1;

			// Rotation.
			// this.angle += Mouse.x * (sensitivity * Time.deltaTime);

			this.angle += Mouse.x - (this.lastMouseX || 0);

			this.lastMouseX = Mouse.x;

			// * Time.deltaTime;

			this.angle = normalizeAngle(this.angle);
		} catch (err) {
			console.error("Failed to take player input.", err);
		}
	}

	/**
	 * Render the player in 2d mode.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	render2d(ctx) {
		try {
			const { x, y, angle } = this;
			const { grid } = world;

			// Draw player viewport.

			const { fov } = camera;

			ctx.beginPath();
			ctx.lineWidth = 1;

			ctx.strokeStyle = "pink";

			const [lX, lY] = vectorToPosition(angle - fov / 2, grid);

			ctx.moveTo(Math.round(x), Math.round(y));
			ctx.lineTo(lX + x, lY + y);

			ctx.stroke();

			const [rX, rY] = vectorToPosition(angle + fov / 2, grid);

			ctx.moveTo(Math.round(x), Math.round(y));
			ctx.lineTo(rX + x, rY + y);

			ctx.stroke();

			ctx.closePath();

			// Draw player.
			ctx.beginPath();

			ctx.fillStyle = "limegreen";

			ctx.fillRect(
				Math.round(x - grid / 12),
				Math.round(y - grid / 12),
				Math.round(grid / 6),
				Math.round(grid / 6)
			);

			ctx.closePath();
		} catch (err) {
			console.error("Failed to render the player in 2d mode.", err);
		}
	}
}

export default PlayerController;
