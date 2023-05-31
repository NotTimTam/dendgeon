/**
 * Imports
 */
import { Renderer, Time } from "../index.js";
import { minMax } from "../util/Math.js";
import EventListenerHandler from "./EventListenerHandler.js";

/**
 * Handles user input via the mouse.
 */
class MouseHandler {
	/**
	 * @param {RenderHandler} renderer The current renderer being used.
	 * @param {*} options The mouse options object to pass through.
	 * @param {number} options.damping The damping factor for normalizing mouse movement. (default `12`)
	 */
	constructor(renderer, options) {
		// Save a reference to the renderer.
		this.renderer = renderer;

		// Create status variables.
		this.left = false;
		this.middle = false;
		this.right = false;
		this.x = 0;
		this.y = 0;

		this.radius = 20;
		this.lastX = 0;

		// Mouse control smoothing.
		this.damping =
			options && options.hasOwnProperty("damping") ? options.damping : 2;

		/**
		 * Configure event listeners.
		 */

		// Lock pointer to canvas.
		EventListenerHandler.addEventListener(
			"click",
			async () => {
				try {
					await renderer.canvas.requestPointerLock({
						unadjustedMovement: true,
					});
				} catch (err) {
					console.error("Failed to lock mouse to canvas.", err);
				}
			},
			renderer.canvas
		);

		// Track mouse movement.
		EventListenerHandler.addEventListener(
			"mousemove",
			this.__mouseMove.bind(this),
			renderer.canvas
		);

		// Track mouse buttons.
		EventListenerHandler.addEventListener(
			"mousedown",
			this.__mouseDown.bind(this),
			renderer.canvas
		);
	}

	/**
	 * Event listener for the mouse being moved.
	 * @param {Event} e - The event detected by the event listener.
	 */
	__mouseMove(e) {
		try {
			const { movementX, movementY } = e;
			const { canvas } = Renderer;
			const { radius, damping } = this;

			this.x += movementX / damping;
			this.y += movementY / damping;

			if (this.x > canvas.width + radius) {
				this.x = -radius;
			}
			if (this.y > canvas.height + radius) {
				this.y = -radius;
			}
			if (this.x < -radius) {
				this.x = canvas.width + radius;
			}
			if (this.y < -radius) {
				this.y = canvas.height + radius;
			}
		} catch (err) {
			console.error("Failed to handle mouse movement.", err);
		}
	}

	/**
	 * Event listener for mouse buttons being pressed.
	 * @param {Event} e - The event detected by the event listener.
	 */
	__mouseDown(e) {
		try {
			const { button } = e;

			switch (button) {
				case 0:
					this.left = true;
					break;
				case 1:
					this.middle = true;
					break;
				case 2:
					this.right = true;
					break;
				default:
					return;
			}
		} catch (err) {
			console.error("Failed to handle mouse press event.", err);
		}
	}

	/**
	 * Event listener for mouse buttons being released.
	 * @param {Event} e - The event detected by the event listener.
	 */
	__mouseUp(e) {
		try {
			const { button } = e;

			switch (button) {
				case 0:
					this.left = false;
					break;
				case 1:
					this.middle = false;
					break;
				case 2:
					this.right = false;
					break;
				default:
					return;
			}
		} catch (err) {
			console.error("Failed to handle mouse release event.", err);
		}
	}

	/**
	 * Control the mouse's positional values over time.
	 */
	__input() {
		try {
			const { damping } = this;

			// Adjust the deceleration factor based on the frame rate
			const adjustedDamping = minMax(damping * Time.deltaTime, 0, 1);

			// console.log((1 - adjustedDamping).toFixed(2));

			// this.x *= adjustedDamping;
			// this.y *= adjustedDamping;
		} catch (err) {
			console.error("Failed to normalize mouse input.", err);
		}
	}

	/**
	 * Create a new click listener to detect when mouse buttons are pressed.
	 * @param {function} callback The function to run when an event is detected.
	 */
	addClickListener(callback) {
		try {
			const { renderer } = this;

			EventListenerHandler.addEventListener(
				"click",
				callback,
				renderer.canvas
			);
		} catch (err) {
			console.error("Failed to add a click event.", err);
		}
	}
}

export default MouseHandler;
