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
	render(ctx) {
		// Check if the entity is on screen.
		if (!isOnScreen(this)) return;
	}
}

// A torch object.
class Torch extends Entity {
	constructor(x, y, lightPulses = true) {
		super(x, y); // Do regular entity stuff.

		// Lighting data.
		this.initLightStrength = randRange(6, 10); // STore the initial light strength value.
		this.lightStrength = this.initLightStrength; // The strength of the light this torch emits.
		this.lightDistance = randRange(24, 32);
		this.lightPulses = lightPulses; // Wether or not the light strength of the torch changes slightly to look like a flame growing and shrinking.

		// Add this to the global light sources so its light is applied to tiles.
		world.globalLights.push(this);

		// Collisions data.
		this.width = 8;
		this.height = 8;
		this.solid = true; // Torches can be walked through.

		// Animation data.
		this.animation = new Anim(
			"spritesheet_torch",
			"loop",
			0,
			4,
			{
				// How many frames are in each animation, and at what frame they start.
				loop: {
					start: 0,
					end: 2,
				},
			},
			undefined,
			{}
		);
	}

	// Animate the torch.
	animate() {
		// Flicker the light if we should.
		if (this.lightPulses && this.animation.frame % 3) {
			this.lightStrength += randRange(-1, 1);
		}

		this.animation.animate();
	}

	logic() {
		// Check if the entity is on screen. (since the only logic performed is for animation, it isn't necessary off-screen)
		if (!isOnScreen(this)) return;

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
		// Check if the entity is on screen.
		if (!isOnScreen(this)) return;

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
