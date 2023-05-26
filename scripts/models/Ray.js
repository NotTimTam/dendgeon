import { player, world } from "../index.js";

/**
 * Convert an angle in degrees to an angle in radians.
 * @param {number} angle The angle to convert.
 * @returns {number} The angle converted to radians.
 */
export const degreeToRadian = (angle) => (angle * Math.PI) / 180;

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

/**
 * Finds all line segments within a given distance of a point.
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {number[][]} lineSegments - Array of line segments represented by start and end coordinates.
 * @param {number} distance - The maximum distance allowed.
 * @returns {number[][]} - Array of line segments within the specified distance.
 */
export const findLinesWithinDistance = (x, y, lineSegments, distance = 1) => {
	const pointToLineDistance = (x, y, x1, y1, x2, y2) => {
		const A = x - x1;
		const B = y - y1;
		const C = x2 - x1;
		const D = y2 - y1;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;

		if (lenSq !== 0)
			// in case of a zero-length line segment
			param = dot / lenSq;

		let xx, yy;

		if (param < 0) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		const dx = x - xx;
		const dy = y - yy;

		return Math.sqrt(dx * dx + dy * dy);
	};
	const linesWithinDistance = [];

	for (const line of lineSegments) {
		const [_, x1, y1, x2, y2] = line;

		// Calculate the distance between the point (x, y) and the line segment
		const segmentDistance = pointToLineDistance(x, y, x1, y1, x2, y2);

		if (segmentDistance <= distance) {
			linesWithinDistance.push(line);
		}
	}

	return linesWithinDistance;
};

/**
 * Checks if a ray intersects with a wall.
 * @param {number[]} ray - The ray represented by [sX, sY, eX, eY] where (sX, sY) is the start point and (eX, eY) is the end point.
 * @param {number[]} wall - The wall represented by [type, sX, sY, eX, eY] where (sX, sY) is the start point and (eX, eY) is the end point. The "type" parameter is ignored.
 * @returns {boolean} Returns true if the ray intersects with the wall, false otherwise.
 */
export const checkRayWallIntersection = (ray, wall) => {
	const [a, b, c, d] = ray;
	const [, p, q, r, s] = wall;

	const det = (c - a) * (s - q) - (r - p) * (d - b);
	if (det === 0) {
		return [false];
	} else {
		const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;

		if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
			const hitX = a + lambda * (c - a);
			const hitY = b + lambda * (d - b);

			const wallLength =
				Math.sqrt(Math.pow(r - p, 2) + Math.pow(s - q, 2)) + 2;
			const positionX = Math.sqrt(
				Math.pow(hitX - p, 2) + Math.pow(hitY - q, 2)
			);
			const position = positionX / wallLength;

			return [true, position];
		} else {
			return [false];
		}
	}
};

/**
 * Handles raycasting and response.
 */
class Ray {
	/**
	 * @param {number} x The x-coordinate to start at.
	 * @param {number} y The y-coordinate to start at.
	 * @param {number} angle The angle (in degrees) to cast the ray at.
	 */
	constructor(x, y, angle) {
		this.start = [x, y];

		this.x = x;
		this.y = y;

		this.angle = normalizeAngle(angle);

		this.hit = false;
	}

	/**
	 * Cast the ray.
	 * @param {number} fidelity The degree of precision in pixels. A value of 1 means the ray is checking every 1 pixel.
	 * @param {number} maxCheckDistance The max distance in pixels to check against.
	 */
	cast(fidelity = 1, maxCheckDistance) {
		try {
			this.e = 0;

			while (
				(maxCheckDistance ? this.e <= maxCheckDistance : true) &&
				this.x > 0 &&
				this.y > 0 &&
				this.y < world.width &&
				this.x < world.height
			) {
				const [newX, newY] = vectorToPosition(this.angle, fidelity);
				this.x += newX;
				this.y += newY;

				const nearLines = findLinesWithinDistance(
					this.x,
					this.y,
					world.walls,
					fidelity
				);

				for (const line of nearLines) {
					const [hit, hitPosition] = checkRayWallIntersection(
						[...this.start, this.x, this.y],
						line
					);
					if (hit) {
						this.hit = hitPosition;

						return this;
					}
				}

				this.e += fidelity;
			}

			this.hit = false;
			return this;
		} catch (err) {
			console.error("Failed to cast ray.", err);
		}
	}

	render2d(ctx) {
		try {
			const {
				start: [startX, startY],
				x,
				y,
			} = this;

			ctx.beginPath();

			ctx.strokeStyle = this.hit ? "tomato" : "limegreen";
			ctx.lineWidth = 1;

			ctx.moveTo(startX, startY);
			ctx.lineTo(x, y);

			ctx.stroke();

			ctx.closePath();
		} catch (err) {
			console.error("Failed to render the ray in 2d.", err);
		}
	}
}

export default Ray;
