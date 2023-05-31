/**
 * Normalize an angle to be within the range of 0-360 degrees.
 * @param {number} angle The angle to normalize, in degrees.
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
 * @returns {number[]} An array containing the new position coordinates. (`[x, y]`)
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
 * Convert an angle in radians to an angle in degrees.
 * @param {number} angle The angle to convert in radians.
 * @returns {number} The angle converted to degrees.
 */
export const radianToDegree = (angle) => (angle * 180) / Math.PI;

/**
 * Calculates the distance between two points in a two-dimensional Cartesian coordinate system.
 * @param {number} x1 The x-coordinate of the first point.
 * @param {number} y1 The y-coordinate of the first point.
 * @param {number} x2 The x-coordinate of the second point.
 * @param {number} y2 The y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
export const calculateDistance = (x1, y1, x2, y2) => {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance;
};

/**
 * Clamp a value for opacity control in shadows.
 * @param {number} n The number to clamp.
 * @param {number} l The lower clamp value.
 * @param {number} u The upper clamp value.
 * @returns The clamped number.
 */
export const shadowClamp = (n, l = 0.01, u = 0.99) =>
	n >= 0 && n <= l ? 1 - n : n >= u && n <= 1 ? n : 1;

/**
 * Keep a number between the bounds of two other numbers.
 * @param {number} n The number to bind.
 * @param {number} min The smallest allowed value.
 * @param {number} max The largest allowed value.
 * @returns {number} The number, as affected by the min/max values.
 */
export const minMax = (n, min = 0, max = 1) => {
	if (n < min) n = min;
	if (n > max) n = max;
	return n;
};

/**
 * Calculates the angle in radians between two sets of 2D points.
 * @param {number[]} pointA The first point coordinates `[x, y]`.
 * @param {number[]} pointB The second point coordinates `[x, y]`.
 * @returns {number} The angle between the two points in radians.
 */
export const calculateAngle = (pointA, pointB) =>
	radianToDegree(Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]));

/**
 * Calculates the nearest point on the edge of a rectangle to another point.
 * @param {number} x The x-coordinate of the point.
 * @param {number} y The y-coordinate of the point.
 * @param {number[]} rect An array containing the x, y, width, and height of the rectangle.
 * @returns {number[]} An array containing the x and y coordinates of the nearest point on the edge of the rectangle.
 */
export const getNearestPointOnRectangleEdge = (
	x,
	y,
	[rectX, rectY, width, height]
) => {
	// Calculate the closest x-coordinate on the rectangle's edge
	let closestX = Math.max(rectX, Math.min(x, rectX + width));

	// Calculate the closest y-coordinate on the rectangle's edge
	let closestY = Math.max(rectY, Math.min(y, rectY + height));

	// If the point is inside the rectangle, adjust the closest point to the nearest edge
	if (x >= rectX && x <= rectX + width && y >= rectY && y <= rectY + height) {
		const leftDistance = x - rectX;
		const rightDistance = rectX + width - x;
		const topDistance = y - rectY;
		const bottomDistance = rectY + height - y;

		const minDistance = Math.min(
			leftDistance,
			rightDistance,
			topDistance,
			bottomDistance
		);

		if (minDistance === leftDistance) {
			closestX = rectX;
		} else if (minDistance === rightDistance) {
			closestX = rectX + width;
		} else if (minDistance === topDistance) {
			closestY = rectY;
		} else {
			closestY = rectY + height;
		}
	}

	return [closestX, closestY];
};
