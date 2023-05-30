/**
 * Imports
 */
import { player, world } from "../index.js";

/**
 * Handles camera positioning and rendering.
 */
class Camera {
	constructor() {
		this.__rawX = 0;
		this.__rawY = 0;

		this.__rawAngle = 0;

		this.fov = 90; // 90 is ideal.
		this.__rawRenderDistance = 48; // 48 is ideal.
		this.__rawLightDistance = 24; // 24 is ideal.
		this.__rawWallHeightGridRatio = 16; // 16 is ideal.

		this.resolutionDegradation = 1; // 1 is ideal.

		this.lockToPlayer = true; // Whether to have the camera follow the player.
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
		if (!this.lockToPlayer) return;
		this.x = player.x;
		this.y = player.y;
	}
}

export default Camera;
