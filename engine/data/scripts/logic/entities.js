"use strict";

/*
An entity can have rendering, logic, user input, as well as all other properties.

Such as:

- Be a light source.
- Drop items.


Entities are a blank canvas for non-static objects and tiles in the world.

*/

// The global parent of all entities. Used for management. Unlike most global parents, this one does not create entities. It just stores them.
class EntityManager {
	constructor() {
		this.entities = [];
	}

	// The entity manager doesn't require input. But we keep this function to avoid potential errors.
	input() {}

	logic() {
		// Loop through and run logic functions of all entities.
		for (let entity of this.entities) {
			entity.logic();
		}
	}

	render(ctx) {
		// Loop through and run rendering functions of all entities.
		for (let entity of this.entities) {
			entity.render(ctx);
		}
	}
}
let entities = new EntityManager();

// An entity boilerplate.
class Entity {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		// Add this entity to the global parent.
		entities.entities.push(this);
	}

	// Placeholder rendering. Can be used to render a blank entity to show errors... Potentially.
	logic() {}
	render(ctx) {}
}

// A torch object.
class Torch extends Entity {
	constructor(x, y, lightStrength = 10, lightPulses = true) {
		super(x, y); // Do regular entity stuff.

		// Lighting data.
		this.initLightStrength = lightStrength; // STore the initial light strength value.
		this.lightStrength = lightStrength; // The strength of the light this torch emits.
		this.lightDistance = 128 / 8;
		this.lightPulses = lightPulses; // Wether or not the light strength of the torch changes slightly to look like a flame growing and shrinking.

		// Add this to the global light sources so its light is applied to tiles.
		world.globalLights.push(this);

		// Collisions data.
		this.width = 8;
		this.height = 8;
		this.solid = false; // Torches can be walked through.

		// Animation data.
		this.animationMap = new Sheet("spritesheet_torch");

		// Wait for the animation map to load.
		this.loadMap = () => {
			this.animation.map = this.animationMap.map;
		};

		this.animation = {
			map: this.animationMap.map,
			name: "loop", // The name of the current animation.
			frame: 0, // The frame of the current animation.
			speed: 1, // The speed of the current animation. Bigger numbers are slower.
			tick: 0, // The current position in the frame.
			frameCounts: {
				// How many frames are in each animation, and at what frame they start.
				loop: {
					start: 0,
					end: 2,
				},
			},
		};
	}

	// Animate the torch.
	animate() {
		// Check if the animation has been loaded.
		if (this.animation.map === undefined) {
			this.loadMap();
		}

		// Update animation steps.
		this.animation.tick++; // Add to the tick.

		// Move to the next frame if the speed/tick counter completes.
		if (this.animation.tick > this.animation.speed) {
			this.animation.tick = 0;
			this.animation.frame++;

			// Flicker the light if we should.
			if (this.lightPulses && this.animation.frame % 3) {
				this.lightStrength += randRange(-1, 1);
			}
		}

		// If we have finished an animation, restart it.
		if (
			this.animation.frame >
			this.animation.frameCounts[this.animation.name].end
		) {
			// BREAKDOWN:
			/*  
            where the data for framecounts is stored      the name of the currently playing animation       the frame start or end position of the animation.
            this.animation.frameCounts                    [this.animation.name]                             start/end
        */
			this.animation.frame =
				this.animation.frameCounts[this.animation.name].start;
		}
	}

	logic() {
		// Run animations.
		this.animate();

		// Check that the light strength isn't out of bounds.
		if (this.lightStrength < this.initLightStrength / 2) {
			this.lightStrength = this.initLightStrength / 2;
		} else if (this.lightStrength > this.initLightStrength) {
			this.lightStrength = this.initLightStrength;
		}
	}

	render(ctx) {
		// We attempt to render. The only reason this would fail is if the spritesheet hasn't loaded yet. Which for the first few frames after the engine starts, it hasn't.
		try {
			ctx.beginPath();

			ctx.drawImage(
				this.animation.map, // The tilemap image.
				this.animation.frame * 8, // The x and y sub-coordinates to grab the animation's texture from the image.
				0,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				this.x - player.camera.x, // Proper placement of the animation on screen.
				this.y - player.camera.y,
				8, // The size of the animation, as drawn on screen.
				8
			);

			ctx.closePath();
		} catch {
			return;
		}
	}
}

// Debugging:
// new Torch(8, 8, 3, false);
// new Torch(72, 8, 3, false);
// new Torch(72, 72, 3, false);
// new Torch(8, 72, 3, false);
