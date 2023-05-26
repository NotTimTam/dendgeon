/**
 * Handles event listeners
 */
class EventListenerHandler {
	/**
	 * Add an event listener.
	 * @param {string} type The string type label for the event listener.
	 * @param {function} callback The function to call when an event is detected.
	 * @param {*} altTarget An (optional) alternative object target to the window to add the event listener to.
	 * @returns The newly created event listener.
	 */
	static addEventListener(type, callback, altTarget) {
		if (!altTarget) altTarget = window;
		return altTarget.addEventListener(type, callback);
	}
}

export default EventListenerHandler;
