/**
 * Imports
 */
import { Time } from "../index.js";
import { minMax } from "../util/Math.js";
import EventListenerHandler from "./EventListenerHandler.js";

/**
 * Handles user input via the mouse.
 */
class MouseHandler {
	/**
	 * @param {RenderHandler} renderer The current renderer being used.
	 * @param {*} options The mouse options object to pass through.
	 * @param {number} options.deceleration The deceleration factor for normalizing mouse movement. (default `12`)
	 * @param {number} options.sensitivity Control over mouse sensitivity for player input. (default `12`)
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

		// Mouse control smoothing.
		this.deceleration =
			options && options.hasOwnProperty("deceleration")
				? options.deceleration
				: 12;

		// Mouse responsiveness.
		this.sensitivity =
			options && options.hasOwnProperty("sensitivity")
				? options.sensitivity
				: 12;

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

			this.x = movementX;
			this.y = movementY;
			// const { clientX, clientY } = e;
			// const {
			// 	renderer: { canvas },
			// } = this;

			// const { left, right, top, bottom, width, height } =
			// 	canvas.getBoundingClientRect();

			// this.__rawX = clientX;
			// this.__rawY = clientY;

			// this.x = ((clientX - left) / (right - left)) * width;
			// this.y = ((clientY - top) / (bottom - top)) * height;

			// console.log(`${this.x}, ${this.y}`);
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
			const { deceleration } = this;

			// Adjust the deceleration factor based on the frame rate
			const adjustedDeceleration = minMax(
				deceleration * Time.deltaTime,
				0,
				1
			);

			this.x *= 1 - adjustedDeceleration;
			this.y *= 1 - adjustedDeceleration;
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
