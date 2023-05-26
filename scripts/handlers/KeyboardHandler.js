/**
 * Imports
 */
import EventListenerHandler from "./EventListenerHandler.js";

/**
 * Handles user input via the keyboard.
 */
class KeyboardHandler {
	constructor() {
		this.keys = {}; // Stores keys that are being pressed.

		// Create event listeners for catching key presses.
		EventListenerHandler.addEventListener(
			"keydown",
			this.__keyDown.bind(this)
		);
		EventListenerHandler.addEventListener("keyup", this.__keyUp.bind(this));
	}

	/**
	 * Normalizes key labels from event listeners.
	 * @param {string} key The key label to normalize.
	 * @returns {string} The normalized key label.
	 */
	__normalizeKey(key) {
		try {
			key = key.toLowerCase();

			switch (key) {
				case " ":
					return "space";
				default:
					return key;
			}
		} catch (err) {
			console.error("Failed to normalize key value.", err);
			return null;
		}
	}

	/**
	 * Event listener for keys being pressed.
	 * @param {Event} e - The event detected by the event listener.
	 */
	__keyDown(e) {
		try {
			if (e.ctrlKey) e.preventDefault();
			const { key } = e;
			this.keys[this.__normalizeKey(key)] = true;
		} catch (err) {
			console.error("Failed to handle keydown.", err);
		}
	}

	/**
	 * Event listener for keys being released.
	 * @param {Event} e - The event detected by the event listener.
	 */
	__keyUp(e) {
		try {
			if (e.ctrlKey) e.preventDefault();
			const { key } = e;
			delete this.keys[this.__normalizeKey(key)];
		} catch (err) {
			console.error("Failed to handle keyup.", err);
		}
	}

	/**
	 * Create a new keypress listener to detect when keys are pressed.
	 * @param {function} callback The function to run when an event is detected.
	 */
	addKeypressListener(callback) {
		try {
			EventListenerHandler.addEventListener("keypress", callback);
		} catch (err) {
			console.error("Failed to add a key press event.", err);
		}
	}
}

export default KeyboardHandler;
