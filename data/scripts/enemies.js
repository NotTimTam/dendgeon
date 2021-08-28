"use strict";

// Enemies.
class Enemy {
	constructor(x, y, origin, health = 1) {
		// Load the enemie's spritesheet.
		this.load_spritesheet();

		// Animation handling.
		this.animation = {
			map: undefined,
			name: "stand", // The name of the current animation.
			frame: 0, // The frame of the current animation.
			speed: 0, // The speed of the current animation.
			overallSpeed: 4, // The top speed of an animation, calculated with the current speed of the enemy in mind. (lower numbers are faster)
			direction: 0, // The direction the animation should be facing.
			tick: 0, // The current position in the frame.
			frameCounts: {
				// How many frames are in each animation, and at what frame they start.
				stand: {
					start: 0,
					end: 0,
				},
				walk: {
					start: 1,
					end: 2,
				},
			},
		};

		// The room the enemy spawned in.
		this.origin = origin;

		// The enemy's position on-screen/in-game.
		this.x = x;
		this.y = y;

		// The enemy's size for collisions.
		this.width = 8;
		this.height = 8;

		// Physics values. Essentially read-only since there aren't any physics in the game.
		this.physics = {
			lastX: 0,
			lastY: 0,
			velocity: 0,
		};
		this.dir = 3;

		// Max movement speed.
		this.speed = 1;
		this.speed > 8 ? (this.speed = 8) : "";

		// The position around the player to move to.
		this.angleToPlayer = randInt(0, 360);
		this.distanceToPlayer = randInt(10, 2);

		// enemy stats.
		this.health = health;
		this.damage = 1;
	}

	// Load the image source for the spritesheet. Should be done before any rendering is attempted. But the rendering is given a try catch since JS is asynchronous.
	load_spritesheet() {
		let img = new Image();
		img.onload = () => {
			this.animation.map = img;
		};
		img.src = "./data/images/spritesheet_enemy.png";
	}

	// Handle animations
	animate() {
		// Match the animation speed to the enemy's movement speed.
		this.animation.speed =
			(this.physics.velocity.velocity / this.speed) *
			this.animation.overallSpeed;

		// Update animation steps.
		this.animation.tick++; // Add to the tick.

		// Move to the next frame if the speed/tick counter completes.
		if (this.animation.tick > this.animation.speed) {
			this.animation.tick = 0;
			this.animation.frame++;
		}

		// Determine which animation should be playing.
		if (this.physics.velocity.velocity < 0.01) {
			this.animation.name = "stand";
		} else {
			this.animation.name = "walk";
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

	// Check for a collision in a direction.
	checkCol(dir) {
		// The hypothetical bounding box, or where the enemy would be if the movement was applied.
		let hbb = {
			x: this.x,
			y: this.y,
			width: 8,
			height: 8,
		};

		// The tile position in the world the enemy would be in if we moved.
		let hbbTilePos = worldToTile(hbb.x, hbb.y);

		// Check collisions with tiles.
		for (let tile of world.globalTiles) {
			if (distance(tile.x, tile.y, hbb.x, hbb.y) <= 16) {
				if (AABB(hbb, tile) && tile.data.solid) {
					return true;
				}
			} else {
				continue;
			}
		}

		return false;
	}

	// Check collisions with other enemies.
	checkColWithEnemies() {
		// The hypothetical bounding box, or where the enemy would be if the movement was applied.
		let hbb = {
			x: this.x,
			y: this.y,
			width: 8,
			height: 8,
		};

		// Check collisions with other enemies.
		for (let enemy of this.origin.enemyCache) {
			if (enemy === this) {
				continue; // Skip this in the array.
			}

			// Check the collision.
			if (AABB(hbb, enemy)) {
				return enemy;
			}
		}

		return false;
	}

	logic() {
		// Store the enemy's current position.
		this.physics.lastX = this.x;
		this.physics.lastY = this.y;

		let targetPos = cartesian2(this.angleToPlayer, 0);

		// Check for collisions in the direction of travel and then apply the travel if there are none.
		// if (
		// 	distance(
		// 		this.x + 4,
		// 		this.y + 4,
		// 		player.x + 4 + targetPos.x,
		// 		player.y + 4 + targetPos.y
		// 	) > 10
		// ) {
		if (player.y + 4 + targetPos.y < this.y) {
			if (!this.checkCol(0)) {
				this.y -= this.speed;
			}
			this.dir = 0;
		}
		if (player.x + 4 + targetPos.x > this.x) {
			if (!this.checkCol(1)) {
				this.x += this.speed;
				this.animation.direction = 1; // Set the player's animation direction.
			}
			this.dir = 1;
		}
		if (player.y + 4 + targetPos.y > this.y) {
			if (!this.checkCol(2)) {
				this.y += this.speed;
			}
			this.dir = 2;
		}
		if (player.x + 4 + targetPos.x < this.x) {
			if (!this.checkCol(3)) {
				this.x -= this.speed;
				this.animation.direction = -1; // Set the player's animation direction.
			}
			this.dir = 3;
		}
		//}

		// Check the enemy's health.
		if (this.health <= 0) {
			this.origin.destroyEnemy(this);
		}

		// Calculate the enemy's velocity.
		this.physics.velocity = vector2(
			Math.abs(this.x - this.physics.lastX),
			Math.abs(this.y - this.physics.lastY)
		);

		this.animate();
	}

	render(ctx) {
		try {
			ctx.beginPath();

			ctx.drawImage(
				this.animation.map, // The tilemap image.
				this.animation.frame * 8 +
					(this.animation.direction === 1 && 24), // The x and y sub-coordinates to grab the tile's texture from the image.
				0,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				Math.round(this.x) - player.camera.x, // Proper placement of the tile on screen.
				Math.round(this.y) - player.camera.y,
				8, // The size of the tile, as drawn on screen.
				8
			);

			ctx.closePath();
		} catch {
			return;
		}
	}
}
