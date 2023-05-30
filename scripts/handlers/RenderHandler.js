/**
 * Imports
 */
import { Mouse, Time, camera, player, world } from "../index.js";
import { degreeToRadian } from "../util/Math.js";

/**
 * Handles 2d and 3d rendering to the screen.
 */
class RenderHandler {
	/**
	 *
	 * @param {string} renderMode The default render mode. (`3d` or `2d`)
	 */
	constructor(renderMode = "3d") {
		// Grab the canvas element and it's context.
		this.canvas = document.querySelector("canvas#render-target");
		this.ctx = this.canvas.getContext("2d");

		// Configure context.
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;

		// Set the current render mode.
		this.mode = renderMode || "3d"; // "2d" || "3d" || "both"

		// Store renderable objects.

		/**
		 * The render resolution is always 4:3 in ratio.
		 * This can be reconfigured by changing the aspect-ratio
		 * property of the canvas, either in the CSS or with the
		 * style attribute of the canvas element.
		 */
		this.__rawResolution = 320; // 640x480 is ideal.
		this.resize();

		// Bind the render loop to the renderer.
		this.loop = this.loop.bind(this);
	}

	/**
	 * Get the current display resolution.
	 */
	get resolution() {
		return Math.round(this.__rawResolution);
	}

	/**
	 * Set the current display resolution.
	 */
	set resolution(val) {
		this.__rawResolution = val;
	}

	/**
	 * Resize the canvas to match the handler's resolution.
	 */
	resize() {
		try {
			const { ctx, resolution } = this;

			ctx.canvas.width = resolution;
			ctx.canvas.height = (resolution / 4) * 3;
		} catch (err) {
			console.error("Failed to resize the canvas.", err);
		}
	}

	/**
	 * Clear the display.
	 */
	clear() {
		try {
			const {
				ctx,
				ctx: {
					canvas: { width, height },
				},
			} = this;

			ctx.beginPath();

			ctx.clearRect(0, 0, width, height);

			ctx.closePath();
		} catch (err) {
			console.error("Failed to clear the screen.", err);
		}
	}

	/**
	 * Run the 2d render pipeline.
	 */
	render2d() {
		try {
			const { ctx } = this;

			ctx.save();

			ctx.setTransform(
				1,
				0,
				0,
				1,
				-camera.x + ctx.canvas.width / 2,
				-camera.y + ctx.canvas.height / 2
			);

			world.render2d(ctx);

			ctx.restore();
		} catch (err) {
			console.error("Failed to run 2d render pipeline.", err);
		}
	}

	/**
	 * Run the 3d render pipeline.
	 */
	render3d() {
		try {
			const { ctx } = this;

			world.render3d(ctx);
		} catch (err) {
			console.error("Failed to run 3d render pipeline.", err);
		}
	}

	/**
	 * Start the rendering loop.
	 */
	start() {
		requestAnimationFrame(this.loop);
	}

	/**
	 * Render loop.
	 */
	loop() {
		try {
			const { mode } = this;

			// Input
			Mouse.__input();
			player.input();
			camera.input();

			// Logic
			Time.execute(); // Calculate deltaTime and FPS.

			// Render
			this.clear(); // Clear the screen each frame.
			if (mode === "3d" || mode === "both") this.render3d();
			if (mode === "2d" || mode === "both") this.render2d();

			requestAnimationFrame(this.loop);
		} catch (err) {
			console.error("Failed to run the render loop.", err);
		}
	}
}

export default RenderHandler;
