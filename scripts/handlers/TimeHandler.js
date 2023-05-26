/**
 * Handles frame rate and delta time.
 */
class TimeHandler {
	constructor() {
		// Store default values for frame rate and delta time.
		this.fps = 0;
		this.deltaTime = 0;
	}

	/**
	 * Calculate FPS and deltaTime.
	 */
	execute() {
		if (!this.__lastCall) {
			this.__lastCall = performance.now();
			this.fps = 0;
			return;
		}

		// Calculate delta time.
		this.deltaTime = (performance.now() - this.__lastCall) / 1000;

		// Set last call.
		this.__lastCall = performance.now();

		// Calculate framerate.
		this.fps = 1 / this.deltaTime;
	}
}

export default TimeHandler;
