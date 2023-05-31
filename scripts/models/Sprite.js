/**
 * Imports
 */
import { Mouse, Time, world } from "../index.js";
import { minMax, normalizeAngle, vectorToPosition } from "../util/Math.js";
import GameObject from "./GameObject.js";

/**
 * A sprite is a simple object with a position in the world.
 */
class Sprite extends GameObject {
	/**
	 * @param {number} x The sprite's x-coordinate.
	 * @param {number} y The sprite's y-coordinate.
	 * @param {number} z The sprite's z-coordinate. (between 0 and 1)
	 * @param {number} width The sprite's width.
	 * @param {number} angle The sprite's starting orientation. (default `0`)
	 */
	constructor(x, y, z = 0, width, angle = 0) {
		super(x, y, z);

		this.angle = angle;
		this.width = width;

		this.type = "sprite";
	}

	testMovement() {
		// this.x += Time.deltaTime * 100;
		// if (this.x > world.width) this.x = 0;
		this.angle++;
		this.angle = normalizeAngle(this.angle);
		// this.y +=
		// 	Time.deltaTime * (600 * [-1, 1][Math.floor(Math.random() * 2)]);
		// if (this.y < 0) this.y = world.height;
		// if (this.y > world.height) this.y = 0;
		// if (!this.zDirection) this.zDirection = 5 * Time.deltaTime;
		// if (this.z >= 1 || this.z <= 0) this.zDirection *= -1;
		// this.z += this.zDirection;
	}

	/**
	 * Render the game object's position in 2d mode.
	 * @param {CanvasRenderingContext2D} ctx The render context.
	 */
	render2d(ctx) {
		try {
			this.testMovement();

			const { x, y, angle, width } = this;
			const { grid } = world;

			// Draw sprite angle.
			ctx.beginPath();
			ctx.lineWidth = 1;

			ctx.strokeStyle = "pink";

			const [lX, lY] = vectorToPosition(angle, grid);

			ctx.moveTo(Math.round(x), Math.round(y));
			ctx.lineTo(lX + x, lY + y);

			ctx.stroke();

			ctx.closePath();

			// Draw sprite.
			ctx.beginPath();

			ctx.strokeStyle = "orange";
			ctx.lineWidth = grid / 12;

			// The size of the sprite.

			const startPos = vectorToPosition(this.angle - 90, width / 2);
			const endPos = vectorToPosition(this.angle + 90, width / 2);

			ctx.moveTo(
				Math.round(x + startPos[0]),
				Math.round(y + startPos[1])
			);
			ctx.lineTo(Math.round(x + endPos[0]), Math.round(y + endPos[1]));
			ctx.stroke();

			ctx.closePath();
		} catch (err) {
			console.error("Failed to render sprite in 2d mode.", err);
		}
	}
}

export default Sprite;
