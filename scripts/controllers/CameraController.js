/**
 * Imports
 */
import { player, world } from "../index.js";

/**
 * Handles camera positioning and rendering.
 */
class CameraController {
	/**
	 * @param {*} options The camera options object to pass through.
	 * @param {number} options.fov The camera's field of view. (default `90`)
	 * @param {number} options.renderDistance The camera's render distance. (default `48`)
	 * @param {number} options.lightDistance The camera's light drawing distance. (default `24`)
	 * @param {number} options.wallHeightGridRatio The wall height grid ratio to control wall height. (default `16`)
	 * @param {number} options.resolutionDegredation The amount of pixels per column each frame. (default `1`)
	 * @param {boolean} options.lockToPlayer Whether or not to lock the camera to the player. (default `true`)
	 */
	constructor(options) {
		this.__rawX = 0;
		this.__rawY = 0;

		this.__rawAngle = 0;

		this.fov = options && options.hasOwnProperty("fov") ? options.fov : 90; // 90 is ideal.

		this.__rawRenderDistance =
			options && options.hasOwnProperty("renderDistance")
				? options.renderDistance
				: 48; // 48 is ideal.

		this.__rawLightDistance =
			options && options.hasOwnProperty("lightDistance")
				? options.lightDistance
				: 24; // 24 is ideal.

		this.__rawWallHeightGridRatio =
			options && options.hasOwnProperty("wallHeightGridRatio")
				? options.wallHeightGridRatio
				: 16; // 16 is ideal.

		this.resolutionDegradation =
			options && options.hasOwnProperty("resolutionDegredation")
				? options.resolutionDegredation
				: 1; // 1 is ideal.

		this.lockToPlayer =
			options && options.hasOwnProperty("lockToPlayer")
				? options.lockToPlayer
				: true; // Whether to have the camera follow the player.
	}

	/**
	 * Determine wallheight based on grid dimensions.
	 */
	get wallHeightGridRatio() {
		return world.grid * this.__rawWallHeightGridRatio;
	}

	/**
	 * Get the render distance in pixels.
	 */
	get renderDistance() {
		return this.__rawRenderDistance * world.grid;
	}

	/**
	 * Get the light distance in pixels.
	 */
	get lightDistance() {
		return this.__rawLightDistance * world.grid;
	}

	/**
	 * Get the camera's x position.
	 */
	get x() {
		return this.__rawX;
	}

	/**
	 * Get the camera's y position.
	 */
	get y() {
		return this.__rawY;
	}

	/**
	 * Get the camera's current angle.
	 */
	get angle() {
		return this.__rawAngle;
	}

	/**
	 * Set the x position of the camera.
	 */
	set x(val) {
		this.__rawX = Math.round(val);
	}

	/**
	 * Set the y position of the camera.
	 */
	set y(val) {
		this.__rawY = Math.round(val);
	}

	/**
	 * Set the angle of the camera.
	 */
	set angle(val) {
		this.__rawAngle = Math.round(val);
	}

	/**
	 * Adjust camera's position based on the player.
	 */
	input() {
		try {
			if (!this.lockToPlayer) return;
			this.x = player.x;
			this.y = player.y;
		} catch (err) {
			console.error("Failed to reposition camera.", err);
		}
	}
}

export default CameraController;
