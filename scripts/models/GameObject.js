/**
 * Handles user input via the mouse.
 */
class GameObject {
	/**
	 * @param {number} x The object's x-coordinate.
	 * @param {number} y The object's y-coordinate.
	 * @param {number} z The object's z-coordinate. (between 0 and 1)
	 */
	constructor(x, y, z = 0) {
		this.x = x;
		this.y = y;
		this.__rawZ = z;

		this.type = "generic";
	}

	/**
	 * Set the z-coordinate of the object.
	 */
	set z(val) {
		if (val < 0) this.__rawZ = 0;
		else if (val > 1) this.__rawZ = 1;
		else this.__rawZ = val;
	}

	/**
	 * Get the z-coordinate of the object.
	 */
	get z() {
		return this.__rawZ;
	}
}

export default GameObject;
