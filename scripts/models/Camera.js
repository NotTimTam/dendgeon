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

		this.fov = 90;
		this.__rawRenderDistance = 24;

		this.lockToPlayer = true; // Whether to have the camera follow the player.
	}

	/**
	 * Get the render distance in pixels.
	 */
	get renderDistance() {
		return this.__rawRenderDistance * world.grid;
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
