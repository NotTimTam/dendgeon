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
		entities.push(this);
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
		this.lightStrength = lightStrength; // The strength of the light this torch emits.
		this.lightPulses = lightPulses; // Wether or not the light strength of the torch changes slightly to look like a flame growing and shrinking.

		// Add this to the global light sources so its light is applied to tiles.
		world.globalLights.push(this);

		// Collisions data.
		this.width = 8;
		this.height = 8;
		this.solid = false; // Torches can be walked through.
	}

	logic() {}

	render(ctx) {
        
    }
}

// Debugging:
let t = new Torch();
