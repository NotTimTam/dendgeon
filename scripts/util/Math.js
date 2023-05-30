/**
 * Normalize an angle to be within the range of 0-360 degrees.
 * @param {number} angle - The angle to normalize, in degrees.
 * @returns {number} The normalized angle within the range of 0-360 degrees.
 */
export const normalizeAngle = (angle) => {
	angle = angle % 360;
	if (angle < 0) angle += 360;
	return angle;
};

/**
 * Convert a vector to a position.
 * @param {number} angle The angle of the vector in degrees.
 * @param {number} velocity The velocity of the vector in pixels.
 * @returns {Array<number>} An array containing the new position coordinates. (`[x, y]`)
 */
export const vectorToPosition = (angle, velocity) => [
	velocity * Math.cos(degreeToRadian(angle)),
	velocity * Math.sin(degreeToRadian(angle)),
];

/**
 * Convert an angle in degrees to an angle in radians.
 * @param {number} angle The angle to convert.
 * @returns {number} The angle converted to radians.
 */
export const degreeToRadian = (angle) => (angle * Math.PI) / 180;

/**
 * Calculates the distance between two points in a two-dimensional Cartesian coordinate system.
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
export const calculateDistance = (x1, y1, x2, y2) => {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance;
};
