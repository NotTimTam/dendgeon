"use strict";

// Player.
class Player {
	constructor(x, y) {
		// Load the player's spritesheet.
		this.load_spritesheet();

		// Load the UI spritesheet.
		this.ui = new Sheet("spritesheet_ui", {
			heart: { x: 0, y: 0 },
			coin: { x: 1, y: 0 },
		});

		// Animation handling.
		this.animation = {
			map: undefined,
			name: "stand", // The name of the current animation.
			frame: 0, // The frame of the current animation.
			speed: 0, // The speed of the current animation.
			overallSpeed: 4, // The top speed of an animation, calculated with the current speed of the player in mind. (lower numbers are faster)
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
					end: 3,
				},
			},
		};

		// The player's position on-screen/in-game.
		this.x = x;
		this.y = y;

		// The player's size for collisions.
		this.width = 8;
		this.height = 8;

		// Physics values. Essentially read-only since there aren't any physics in the game.
		this.physics = {
			lastX: 0,
			lastY: 0,
			velocity: 0,
		};
		this.dir = 3;

		// Light.
		this.lightStrength = 15;

		// Max movement speed.
		this.speed = 1;
		this.speed > 8 ? (this.speed = 8) : "";

		// What tile the player is mostly standing on.
		this.tilePos = {};

		// The room the player is in.
		this.roomPos = {};

		// The tile the player is moving towards.
		this.goalTile = {};

		// Camera positioning.
		this.camera = {
			x: 0, // The camera's current position.
			y: 0,
			desX: 0, // The position the camera is smoothly moving towards.
			desY: 0,
		};

		// Player inventory.
		this.inventory = {
			health: 3,
			coin: 0,
		};

		// Player attack.
		this.attackAnimation = {
			attacking: false,
			map: undefined,
			frame: 0, // The frame of the animation.
			speed: 1, // The speed of the current animation.
			direction: 0, // The direction the animation should be facing.
			tick: 0, // The current position in the frame.
			endFrame: 6,
			hitbox: {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			},
		};
		this.hitStrength = 1; // How much damage the player does.

		// Load the player's attack animation spritesheet.
		this.load_attack_spritesheet();
	}

	// Load the image source for the spritesheet. Should be done before any rendering is attempted. But the rendering is given a try catch since JS is asynchronous.
	load_spritesheet() {
		let img = new Image();
		img.onload = () => {
			this.animation.map = img;
		};
		img.src = "./data/images/spritesheet_player.png";
	}

	// Load the image source for the attack spritesheet.
	load_attack_spritesheet() {
		let img = new Image();
		img.onload = () => {
			this.attackAnimation.map = img;
		};
		img.src = "./data/images/spritesheet_player_attack.png";
	}

	// Attack handling.
	attack() {
		if (!this.attackAnimation.attacking) {
			this.attackAnimation.attacking = true;
		}
	}
	animateAttacking() {
		// Only animate the attack animation if we are attacking.
		if (this.attackAnimation.attacking) {
			// Update animation steps.
			this.attackAnimation.tick++; // Add to the tick.

			// Move to the next frame if the speed/tick counter completes.
			if (this.attackAnimation.tick > this.attackAnimation.speed) {
				this.attackAnimation.tick = 0;
				this.attackAnimation.frame++;
			}

			// If we have finished an animation, then we end.
			if (this.attackAnimation.frame > this.attackAnimation.endFrame) {
				this.attackAnimation.frame = 0;
				this.attackAnimation.attacking = false;
			}
		}
	}

	// Handle animations
	animate() {
		// Match the animation speed to the player's movement speed.
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

		// Animate attacking.
		this.animateAttacking();
	}

	// Check for a collision in a direction.
	checkCol(dir) {
		// The hypothetical bounding box, or where the player would be if the movement was applied.
		let hbb = {
			x: this.x,
			y: this.y,
			width: 8,
			height: 8,
		};

		// The tile position in the world the player would be in if we moved.
		let hbbTilePos = worldToTile(hbb.x, hbb.y);

		// Apply hypothetical movement to the hypothetical position and grab the tile that is in front of the player in that direction.
		switch (dir) {
			case 0:
				hbb.y -= this.speed;
				this.goalTile = { x: hbbTilePos.x, y: hbbTilePos.y - 1 };
				break;
			case 1:
				hbb.x += this.speed;
				this.goalTile = { x: hbbTilePos.x + 1, y: hbbTilePos.y };
				break;
			case 2:
				hbb.y += this.speed;
				this.goalTile = { x: hbbTilePos.x, y: hbbTilePos.y + 1 };
				break;
			case 3:
				hbb.x -= this.speed;
				this.goalTile = { x: hbbTilePos.x - 1, y: hbbTilePos.y };
				break;
			default:
				break;
		}

		// Get the the actual tile from the global tile array.
		this.goalTile = world.getTile(
			Math.round(this.goalTile.x * 8),
			Math.round(this.goalTile.y * 8)
		);

		// Check for collisions and return the outcome.
		if (
			this.goalTile !== undefined &&
			AABB(hbb, this.goalTile) &&
			this.goalTile.data.solid
		) {
			return true;
		}

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

	// Render the player's ui.
	renderUI(ctx) {
		// Health.

		// Draw each heart.
		if (this.inventory.health > 0) {
			for (let i = 0; i < this.inventory.health; i++) {
				try {
					ctx.beginPath();

					ctx.drawImage(
						this.ui.map, // The tilemap image.
						this.ui.locs.heart.x * 8, // The position of the sub-image in the map.
						this.ui.locs.heart.y * 8,
						8, // The 8x8 pixel dimensions of that sub-image.
						8,
						Math.round(1 + i * 8 + i), // Proper placement of the tile on screen.
						1,
						8, // The size of the tile, as drawn on screen.
						8
					);

					ctx.closePath();
				} catch {}
			}
		}

		// Coins.
		try {
			ctx.beginPath();

			ctx.drawImage(
				this.ui.map, // The tilemap image.
				this.ui.locs.coin.x * 8, // The position of the sub-image in the map.
				this.ui.locs.coin.y * 8,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				1, // Proper placement of the tile on screen.
				Math.round(canvas.height - 9),
				8, // The size of the tile, as drawn on screen.
				8
			);

			ctx.closePath();

			renderNumber(
				9,
				canvas.height - 9,
				this.inventory.coin > 999 ? 999 : this.inventory.coin
			);
		} catch {}
	}

	input() {
		// Store the player's current positon;
		this.physics.lastX = this.x;
		this.physics.lastY = this.y;

		// Sprinting.
		// if (keyboard.Shift) {
		// 	this.speed = 2;
		// } else {
		// 	this.speed = 1;
		// }

		// Check for collisions in the direction of travel and then apply the travel if there are none.
		if (keyboard.ArrowUp || keyboard.w) {
			if (!this.checkCol(0)) {
				this.y -= this.speed;
			}
			this.dir = 0;
		}
		if (keyboard.ArrowRight || keyboard.d) {
			if (!this.checkCol(1)) {
				this.x += this.speed;
				this.animation.direction = 1; // Set the player's animation direction.
			}
			this.dir = 1;
		}
		if (keyboard.ArrowDown || keyboard.s) {
			if (!this.checkCol(2)) {
				this.y += this.speed;
			}
			this.dir = 2;
		}
		if (keyboard.ArrowLeft || keyboard.a) {
			if (!this.checkCol(3)) {
				this.x -= this.speed;
				this.animation.direction = -1; // Set the player's animation direction.
			}
			this.dir = 3;
		}

		// Attack
		if (keyboard.j || keyboard.z) {
			this.attack();
		}

		// Calculate the player's velocity.
		this.physics.velocity = vector2(
			Math.abs(this.x - this.physics.lastX),
			Math.abs(this.y - this.physics.lastY)
		);
	}

	logic() {
		// Inventory data.
		this.inventory.health % 1 !== 0 &&
			(this.inventory.health = Math.floor(this.inventory.health));

		// Positional data.
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		this.tilePos = worldToTile(this.x, this.y);
		this.roomPos = worldToRoom(this.x, this.y);

		// Set where the camera should be.
		this.camera.desX = Math.round(this.x + 4 - canvas.width / 2);
		this.camera.desY = Math.round(this.y + 4 - canvas.height / 2);

		let smoothspeed = 6;

		// Smooth camera movement.
		let newCamPos = cartesian2(
			angle({ x: this.camera.desX, y: this.camera.desY }, this.camera),
			distance(
				this.camera.x,
				this.camera.y,
				this.camera.desX,
				this.camera.desY
			) / smoothspeed
		);

		this.camera.x += newCamPos.x;
		this.camera.y += newCamPos.y;

		this.camera.x = Math.round(this.camera.x);
		this.camera.y = Math.round(this.camera.y);

		this.animate();
	}

	render(ctx) {
		try {
			ctx.beginPath();

			ctx.drawImage(
				this.animation.map, // The tilemap image.
				this.animation.frame * 8 +
					(this.animation.direction === 1 && 32), // The x and y sub-coordinates to grab the animation's texture from the image.
				0,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				this.x - this.camera.x, // Proper placement of the animation on screen.
				this.y - this.camera.y,
				8, // The size of the animation, as drawn on screen.
				8
			);

			ctx.closePath();

			// Render attack
			if (this.attackAnimation.attacking) {
				let pos = {
					x: 0,
					y: 0,
				};
				switch (this.dir) {
					case 0:
						pos.y -= 7;
						this.attackAnimation.hitbox = {
							x: this.x + pos.x + 1,
							y: this.y + pos.y + 3,
							width: 7,
							height: 3,
						};
						break;
					case 1:
						pos.x += 8;
						pos.y++;
						this.attackAnimation.hitbox = {
							x: this.x + pos.x + 1,
							y: this.y + pos.y + 1,
							width: 3,
							height: 7,
						};
						break;
					case 2:
						pos.y += 8;
						this.attackAnimation.hitbox = {
							x: this.x + pos.x + 1,
							y: this.y + pos.y + 1,
							width: 7,
							height: 3,
						};
						break;
					case 3:
						pos.x -= 8;
						pos.y++;
						this.attackAnimation.hitbox = {
							x: this.x + pos.x + 4,
							y: this.y + pos.y + 1,
							width: 3,
							height: 7,
						};
						break;
					default:
						break;
				}

				ctx.beginPath();

				ctx.drawImage(
					this.attackAnimation.map, // The tilemap image.
					this.attackAnimation.frame * 8 + this.dir * 56, // The x and y sub-coordinates to grab the animation's texture from the image.
					0,
					8, // The 8x8 pixel dimensions of that sub-image.
					8,
					this.x + pos.x - this.camera.x, // Proper placement of the animation on screen.
					this.y + pos.y - this.camera.y,
					8, // The size of the animation, as drawn on screen.
					8
				);

				ctx.closePath();
			}
		} catch {
			return;
		}
	}
}

const player = new Player(8 * 5, 8 * 5);
