"use strict";

// Global Objects.

// Tilemaps and Spritesheets.
class Sheet {
	constructor(src, locs) {
		this.loaded = false;
		this.src = src;
		this.map = undefined;
		this.locs = locs;

		this.load();
	}

	load = () => {
		let img = new Image();
		img.onload = () => {
			this.map = img;
			this.loaded = true;
		};
		img.src = `./data/images/${this.src}.png`;
	};
}

// Spritestrips for animation. (should be one frame high)
class Anim {
	constructor(
		src,
		firstAnim = "animation1",
		startingFrame = 0,
		speed = 4,
		frameCounts = {
			// How many frames are in each animation, and at what frame they start.
			animation1: {
				start: 0,
				end: 3,
			},
		},
		onFinish,
		extraProps
	) {
		// Animation strip data.
		this.loaded = false;
		this.src = src;
		this.map = undefined;
		this.load();

		// Animation data.
		this.name = firstAnim; // The name of the current animation.
		this.frame = startingFrame; // The frame of the current animation.
		this.speed = speed; // The speed of the current animation. (the lower the number, the faster the animation)
		this.tick = 0; // The current position in the frame.
		this.frameCounts = frameCounts;
		this.onFinish = onFinish; // A function to run when an animation finishes.

		// Load extra props.
		for (let prop in extraProps) {
			this[prop] = extraProps[prop];
		}
	}

	// Load the sprite strip.
	load = () => {
		let img = new Image();
		img.onload = () => {
			this.map = img;
			this.loaded = true;
		};
		img.src = `./data/images/${this.src}.png`;
	};

	// Handle animations
	animate = () => {
		// Check if the image for the animation has loaded yet.
		if (!this.loaded) return;

		// Update animation steps.
		this.tick++; // Add to the tick.

		// Move to the next frame if the speed/tick counter completes.
		if (this.tick > this.speed) {
			this.tick = 0;
			this.frame++;
		}

		// If we have finished an animation, restart it.
		if (this.frame > this.frameCounts[this.name].end) {
			// BREAKDOWN:
			/*  
                where the data for framecounts is stored      the name of the currently playing animation       the frame start or end position of the animation.
                this.frameCounts                              [this.name]                                       start/end
            */
			this.frame = this.frameCounts[this.name].start;

			// If the animation has a defined onFinish function, we run it. (the animation needs to be passed through)
			if (this.onFinish !== undefined) {
				this.onFinish(this);
			}
		}
	};
}

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

const isOnScreen = (object) => {
	if (object.x + object.width < player.camera.x) {
		return false;
	} else if (object.x > player.camera.x + canvas.width) {
		return false;
	}

	if (object.y + object.height < player.camera.y) {
		return false;
	} else if (object.y > player.camera.y + canvas.height) {
		return false;
	}

	return true;
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
