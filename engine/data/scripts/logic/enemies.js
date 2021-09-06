"use strict";

/* 
While enemies are technically entites. Due to being a large object in the game and having
many very specific functions, they are excluded from the entity management system. They
also are rendered above other entities, just like the player.
*/

// Enemies.
class Enemy {
	constructor(x, y, origin, health = 1) {
		// Animation handling.
		this.animation = new Anim("spritesheet_enemy", "move", 0, 16, {
			// How many frames are in each animation, and at what frame they start.
			move: {
				start: 0,
				end: 1,
			},
			hit: {
				start: 2,
				end: 3,
			},
		});

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
		this.distanceToPlayer = 12;

		// enemy stats.
		this.health = health;
		this.maxHealth = health;
		this.damage = 0.5;
		this.attackFrequency = 150; // How often the enemy can hit the player.
		this.lastAttack = 999;
		this.gotHit = 0; // How long to display that the enemy got hit.
	}

	// Handle attacking.
	attack() {
		if (this.lastAttack >= this.attackFrequency) {
			player.camera.shake(5, 1);
			player.inventory.health -= this.damage;

			this.lastAttack = 0;
		}
	}

	// Handle animations
	animate() {
		// If we've been hit recently
		if (this.gotHit > 0) {
			this.animation.name = "hit";
		} else {
			this.animation.name = "move";
		}

		// Run the animation.
		this.animation.animate();
	}

	logic() {
		// Subtract from the amount of time that we display we got hit.
		this.gotHit--;

		// Store the enemy's current position.
		this.physics.lastX = this.x;
		this.physics.lastY = this.y;

		let targetPos = cartesian2(
			angle(player, this),
			distance(this.x, this.y, player.x, player.y) / 6
		);

		let otherTarget = cartesian2(Math.random() * 360, randInt(32, 64));

		targetPos.x += otherTarget.x;
		targetPos.y += otherTarget.y;

		// Check for collisions in the direction of travel and then apply the travel if there are none.
		if (
			distance(
				this.x + 4,
				this.y + 4,
				player.x + 4 + targetPos.x,
				player.y + 4 + targetPos.y
			) > 14
		) {
			if (player.y + 4 + targetPos.y < this.y) {
				this.y -= this.speed;
				this.dir = 0;
			}
			if (player.x + 4 + targetPos.x > this.x) {
				this.x += this.speed;
				this.dir = 1;
			}
			if (player.y + 4 + targetPos.y > this.y) {
				this.y += this.speed;
				this.dir = 2;
			}
			if (player.x + 4 + targetPos.x < this.x) {
				this.x -= this.speed;
				this.dir = 3;
			}
		}

		// Handle attacking.
		if (AABB(this, player)) {
			this.attack();
		}
		this.lastAttack++;

		// Set the enemies animation direction.
		if (player.x > this.x) {
			this.animation.direction = 1;
		} else {
			this.animation.direction = 0;
		}

		// Check if we get hit by the player.
		if (
			player.attackAnimation.attacking &&
			player.attackAnimation.frame === 3 &&
			AABB(this, player.attackAnimation.hitbox)
		) {
			this.health -= player.hitStrength;

			// Knockback.
			let knockback = cartesian2(angle(this, player), player.knockback);

			this.x += knockback.x;
			this.y += knockback.y;

			this.gotHit = 60;
		}

		// Check the enemy's health.
		if (this.health <= 0) {
			this.origin.destroyEnemy(this);
		}

		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		// Calculate the enemy's velocity.
		this.physics.velocity = vector2(
			Math.abs(this.x - this.physics.lastX),
			Math.abs(this.y - this.physics.lastY)
		);

		this.animate();
	}

	render(ctx) {
		// Check if the enemy is on screen.
		if (!isOnScreen(this)) return;

		try {
			// Render enemy.
			ctx.beginPath();

			ctx.drawImage(
				this.animation.map, // The tilemap image.
				this.animation.frame * 8 +
					(this.animation.direction === 1 && 32), // The x and y sub-coordinates to grab the tile's texture from the image.
				0,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				Math.round(this.x) - player.camera.x, // Proper placement of the tile on screen.
				Math.round(this.y) - player.camera.y,
				8, // The size of the tile, as drawn on screen.
				8
			);

			ctx.closePath();

			// Render health bar.
			ctx.beginPath(); // Background.

			ctx.fillStyle = "black";

			ctx.fillRect(
				this.x - player.camera.x - 2,
				this.y - player.camera.y - 1,
				12,
				1
			);

			ctx.closePath();

			ctx.beginPath(); // Bar.

			ctx.fillStyle =
				this.health / this.maxHealth <= 0.25 ? "tomato" : "limegreen";

			ctx.fillRect(
				this.x - player.camera.x - 2,
				this.y - player.camera.y - 1,
				12 * (this.health / this.maxHealth),
				1
			);

			ctx.closePath();
		} catch {
			return;
		}
	}
}
