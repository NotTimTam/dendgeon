"use strict";

// Global functions.
const worldToTile = (x, y) => {
	return {
		x: Math.round(x / 8 - 0.5),
		y: Math.round(y / 8 - 0.5),
	};
};
const worldToRoom = (x, y) => {
	return {
		x: Math.round(x / 88 - 0.5) * 88,
		y: Math.round(y / 88 - 0.5) * 88,
	};
};

const AABB = (rect1, rect2) => {
	if (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	) {
		return true;
	} else {
		return false;
	}
};

const angle = (object1, object2) => {
	return deg(Math.atan2(object1.y - object2.y, object1.x - object2.x));
};

const randRange = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const distance = (x1, y1, x2, y2) => {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

const deg = (radian) => {
	return radian * (180 / Math.PI);
};
const rad = (degree) => {
	return degree * (Math.PI / 180);
};

const randInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const vector2 = (x, y) => {
	return {
		dirRadian: Math.atan2(y, x),
		dirDegree: deg(Math.atan2(y, x)),
		velocity: Math.sqrt(x ** 2 + y ** 2),
	};
};

const cartesian2 = (angle, velocity) => {
	return {
		x: velocity * Math.cos(rad(angle)),
		y: velocity * Math.sin(rad(angle)),
	};
};

const randomGroundTile = () => {
	let randy = randInt(0, 10);

	let retVal;

	if (randy === 0) {
		retVal = 1;
	} else if (randy === 1) {
		retVal = 2;
	} else if (randy > 1 && randy < 6) {
		retVal = 4;
	} else {
		retVal = 3;
	}

	return `ground_${retVal}`;
};
