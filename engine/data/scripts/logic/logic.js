"use strict";

// Specific Objects.

// Items.
class Item {
	constructor(x, y, type = "coin", value = "1") {
		// Position on the screen.
		this.x = x;
		this.y = y;

		// Size for collision detection.
		this.width = 4;
		this.height = 4;

		// The type is the thing that is added to in the player's inventory. The value is how much is added.
		this.type = type;
		this.value = value;

		// The items expiration. Used to remove lingering items.
		this.expire = 99999;
	}

	// Destroy this item.
	destroy() {
		items.items.splice(items.items.indexOf(this), 1);
	}

	// Collect this item into the player's inventory and then destroy it.
	collect() {
		// Modify the player's inventory.
		if (!player.inventory[this.type]) {
			player.inventory[this.type] = this.value;
		} else {
			player.inventory[this.type] += this.value;
		}

		// Destroy this item.
		this.destroy();
	}

	logic() {
		// Tick the item's expiration downward and destroy if necessary.
		this.expire--;
		this.expire <= 0 && this.destroy();

		// Move towards the player.
		if (distance(this.x + 2, this.y + 2, player.x + 4, player.y + 4) < 16) {
			let newPos = cartesian2(
				angle(
					{ x: player.x + 4, y: player.y + 4 },
					{ x: this.x + 2, y: this.y + 2 }
				),
				distance(this.x + 2, this.y + 2, player.x + 4, player.y + 4) / 6
			);

			this.x += newPos.x;
			this.y += newPos.y;

			// Check for collision with the player.
			if (AABB(this, player)) {
				this.collect();
			}
		}
	}

	// Render this item.
	render(ctx) {
		// Check if the item is on screen.
		if (!isOnScreen(this)) return;

		try {
			ctx.beginPath();

			ctx.drawImage(
				items.map, // The tilemap image.
				items.itemIndeces[this.type] !== undefined
					? items.itemIndeces[this.type]
					: 0, // The x and y sub-coordinates to grab the tile's texture from the image.
				0,
				4, // The 4x4 pixel dimensions of that sub-image.
				4,
				Math.round(this.x - player.camera.x), // Proper placement of the tile on screen.
				Math.round(this.y - player.camera.y),
				4, // The size of the tile, as drawn on screen.
				4
			);

			ctx.closePath();
		} catch {
			return;
		}
	}
}

// Item manager.
class ItemManager {
	constructor() {
		this.items = [];

		this.itemIndeces = {
			coin: 0,
		};

		this.map = undefined;
		this.load_tilemap();

		// Debugging: creates lots of coins.
		// for (let i = 0; i < 100; i++) {
		// 	this.createItem(
		// 		8 + Math.random() * 93,
		// 		8 + Math.random() * 45,
		// 		"coin",
		// 		Math.ceil(Math.random() * 8)
		// 	);
		// }
	}

	// Load the image source for the tilemap. Should be done before any rendering is attempted. But the rendering is given a try catch since JS is asynchronous.
	load_tilemap = () => {
		let img = new Image();
		img.onload = () => {
			this.map = img;
		};
		img.src = "./data/images/tilemap_items.png";
	};

	// Add an item to the game.
	createItem(x, y, type, value) {
		let item = new Item(x, y, type, value);

		this.items.push(item);

		return item;
	}

	logic() {
		// Check if the max item limit has been reached.
		while (this.items.length >= 100) {
			this.items.shift();
		}

		// Run game logic for all items.
		for (let item of this.items) {
			// Check if the item is on screen.
			if (!isOnScreen(item)) continue;

			item.logic();
		}
	}

	render(ctx) {
		// Render all items.
		for (let item of this.items) {
			// Check if the item is on screen.
			if (!isOnScreen(item)) continue;

			item.render(ctx);
		}
	}
}
const items = new ItemManager();

// A single tile, usually as part of a room, but can be secluded. (will not render unless in a room)
class Tile {
	constructor(x, y, type) {
		// The tiles position on-screen.
		this.x = x;
		this.y = y;

		// Sizing, only used for collision detection.
		this.width = 8;
		this.height = 8;

		// Global alpha for lighting.
		this.globalAlpha = 0;

		// The type of tile it is... Used to grab tiledata from the tiles array. If the tile doesn't exist then we load an error tile.
		this.type = tiles[type] === undefined ? "err" : type;

		this.data = tiles[this.type];
	}

	logic() {
		// Reset the globalAlpha of the tile each logic loop.
		this.globalAlpha = 0;
	}

	render(ctx) {
		// If the tile is not on-screen, we don't render it.
		if (!isOnScreen(this)) return;

		try {
			// Only apply lighting effects if the option is turned on.
			if (renderLighting) {
				ctx.save();

				// Get and apply the lighting data for this tile.
				ctx.globalAlpha = this.globalAlpha;
			}

			ctx.beginPath();

			ctx.drawImage(
				tiles.map, // The tilemap image.
				this.data.pos.x * 8, // The x and y sub-coordinates to grab the tile's texture from the image.
				this.data.pos.y * 8,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				this.x - player.camera.x, // Proper placement of the tile on screen.
				this.y - player.camera.y,
				8, // The size of the tile, as drawn on screen.
				8
			);

			ctx.closePath();

			// We only need to restore canvas presets if the lighting is being rendered.
			if (renderLighting) {
				ctx.restore();
			}
		} catch {
			return;
		}
	}
}

class Door extends Tile {
	constructor(x, y, type, exits, canCreateRooms = true) {
		super(x, y, type);

		// The room the door exits from.
		this.exits = exits;

		// The direction from the room that the door faces.
		this.direction = null;
		this.calculateDirection();

		// Generate a hallway.
		// this.generateHallway();

		// Determine if we can create rooms based on outside factors.
		if (world.roomCount <= 0) {
			canCreateRooms = false;
		}

		// Generate the next room.
		if (canCreateRooms) {
			let self = this;
			window.setTimeout(() => {
				self.generateNextRoom();
			}, 1);
		}
		this.hasGenerated = false;

		// The status of the door.
		this.open = false;
		this.locked = false;
	}

	// Generate a room from the door based on it's direction.
	generateNextRoom() {
		// Check if this door has already generated a room.
		if (this.hasGenerated) {
			return "This door has already generated a room.";
		}

		// Apply the fact that this door has generated a room, even if it doesn't because there is already one here.
		this.hasGenerated = true;

		// Calculate where the room should be.
		let roomPos = {
			x: this.x,
			y: this.y,
		};

		// Caluculate the type of room.
		let roomType;
		let perlin = (x, y) => {
			// Convert the x and y to room coordinates. (0 (px) === 0 (room pos), 88 (px) === 1 (room pos))
			x /= 88;
			y /= 88;

			// Generate perlin noise for determining the room type.
			let resolution = 0.35; // Finally tunes the noise to different effects.
			let perlin_noise = noise.simplex2(x * resolution, y * resolution);

			// Return needs to be a binary value. (0 or 1)
			return perlin_noise > 0 ? 1 : 0;
		};
		switch (this.direction) {
			case "u":
				roomPos.y -= 11 * 8; // Move the door towards the right distance.
				roomPos.x -= Math.round(11 * 3.6); // Line the doors up.

				roomType = ["dr", "dl"][perlin(roomPos.x, roomPos.y)]; // Determine the room type.

				break;
			case "d":
				roomPos.y += 8; // Move the door towards the right distance.
				roomPos.x -= Math.round(11 * 3.6); // Line the doors up.

				roomType = ["ur", "ul"][perlin(roomPos.x, roomPos.y)]; // Determine the room type.

				break;
			case "l":
				roomPos.x -= 11 * 8; // Move the door towards the right distance.
				roomPos.y -= Math.round(11 * 3.6); // Line the doors up.

				roomType = ["ur", "dr"][perlin(roomPos.x, roomPos.y)]; // Determine the room type.

				break;
			case "r":
				roomPos.x += 8; // Move the door towards the right distance.
				roomPos.y -= Math.round(11 * 3.6); // Line the doors up.

				roomType = ["ul", "dl"][perlin(roomPos.x, roomPos.y)]; // Determine the room type.

				break;
			default:
				// If the direction is wrong, we straight up return.
				return;
		}

		// Check if a room already exists here. If one does, we quit the function now.
		if (world.getRoom(roomPos.x, roomPos.y).length !== 0) {
			return;
		}

		// If there isn't a room here, we generate one.
		world.createRoomFromData(roomPos.x, roomPos.y, roomType, true, true);
	}

	// Calculate the direction the door faces going away from the room.
	calculateDirection() {
		// Determine the center of the room.
		let centerOfRoom = {
			x: this.exits.x + this.exits.width / 2 - 4,
			y: this.exits.y + this.exits.height / 2 - 4,
		};

		// Determine the direction from the room.
		if (this.y === centerOfRoom.y) {
			// If the door is centered on the y-axis.
			if (this.x < centerOfRoom.x) {
				// We are on the left.
				this.direction = "l";
			} else {
				// We are on the right.
				this.direction = "r";
			}
		} else {
			// If the door is not cented on the y-axis.

			if (this.y < centerOfRoom.y) {
				// We are above.
				this.direction = "u";
			} else {
				// We are below.
				this.direction = "d";
			}
		}
	}

	// // Generate a hallway from the door based on it's direction.
	// generateHallway() {
	// 	// Calculate where the hallway should be.
	// 	let hallwayPos = {
	// 		x: this.x,
	// 		y: this.y,
	// 	};

	// 	// Caluculate the type of hallway.
	// 	let hallwayType;
	// 	this.direction === "l" || this.direction === "r"
	// 		? (hallwayType = "lr") // The hallway moves left and right.
	// 		: (hallwayType = "ud"); // The hallway moves up and down.

	// 	// Move the hallway so it lines up properly.
	// 	if (hallwayType === "lr") {
	// 		// If the hallway moves left and right.
	// 		if (this.direction === "l") {
	// 			// If the door is heading left.
	// 			hallwayPos.x -= rooms[hallwayType][0].length * 8 - 8;
	// 		} else {
	// 			// If the door is heading right.
	// 			hallwayPos.x += 8;
	// 		}

	// 		// Center the hallway.
	// 		hallwayPos.y -= (rooms[hallwayType].length / 4) * 8 - 6;
	// 	} else {
	// 		// If the hallway moves up and down.
	// 		if (this.direction === "u") {
	// 			// If the door is heading up.
	// 			hallwayPos.y -= rooms[hallwayType].length * 8 - 8;
	// 		} else {
	// 			// If the door is heading down.
	// 			hallwayPos.y += 8;
	// 		}

	// 		// Center the hallway.
	// 		hallwayPos.x -= (rooms[hallwayType][0].length / 4) * 8 - 6;
	// 	}

	// 	// Generate the hallway.
	// 	world.createRoomFromData(
	// 		hallwayPos.x,
	// 		hallwayPos.y,
	// 		`hall_${hallwayType}`,
	// 		true
	// 	);
	// }

	logic() {
		// Reset the globalAlpha of the tile each logic loop.
		this.globalAlpha = 0;

		// Determine if the door should be open or closed.
		if (this.open) {
			this.data = tiles.door_open;
		} else {
			this.data = tiles[this.type];
		}

		// Open the door with Z.
		let dt = distance(this.x + 4, this.y + 4, player.x + 4, player.y + 4); // The distance between the door and the player.

		// If the door is unlocked, but not open, we open it.
		if (
			dt <= 9 &&
			!this.open &&
			!this.locked &&
			(keyboard.x || keyboard.k)
		) {
			this.open = true;
		}
	}

	render(ctx) {
		// If the tile is not on-screen, we don't render it.
		if (!isOnScreen(this)) return;

		try {
			// Only apply lighting effects if the option is turned on.
			if (renderLighting) {
				ctx.save();

				// Get and apply the lighting data for this tile.
				ctx.globalAlpha = this.globalAlpha;
			}

			ctx.beginPath();

			ctx.drawImage(
				tiles.map, // The tilemap image.
				this.data.pos.x * 8, // The x and y sub-coordinates to grab the tile's texture from the image.
				this.data.pos.y * 8,
				8, // The 8x8 pixel dimensions of that sub-image.
				8,
				this.x - player.camera.x, // Proper placement of the tile on screen.
				this.y - player.camera.y,
				8, // The size of the tile, as drawn on screen.
				8
			);

			ctx.closePath();

			// If we are close enough to the player, and we aren't open, then we get highlighted.
			if (
				distance(this.x + 4, this.y + 4, player.x + 4, player.y + 4) <=
					9 &&
				!this.open
			) {
				ctx.beginPath();
				ctx.strokeStyle = this.locked ? "red" : "yellow";
				ctx.lineWidth = 1;

				ctx.rect(
					Math.round(this.x - player.camera.x),
					Math.round(this.y - player.camera.y),
					8,
					8
				);

				ctx.stroke();
				ctx.closePath();
			}

			// We only need to restore canvas presets if the lighting is being rendered.
			if (renderLighting) {
				ctx.restore();
			}
		} catch {
			return;
		}
	}
}

// A room, contains tiles and events as well as handeling of loot and enemies.
class Room {
	constructor(
		x,
		y,
		autogen = true,
		roomName,
		roomsDoorsCanGenerateRooms = true
	) {
		// The room's position on-screen.
		this.x = x;
		this.y = y;

		this.width = 0;
		this.height = 0;

		// The room's tiles.
		this.tiles = [];

		// Determine wether or not the doors in this room can generate more rooms.
		this.doorsCanGenerateMoreRooms = roomsDoorsCanGenerateRooms;

		// Room events:
		this.type = "ambient";
		// Determine the room type.
		let roomChance = Math.random() * 100; // Room chances span from 0-100.
		if (roomChance < 80) {
			this.type = "hostile";
		} else if (roomChance >= 80) {
			this.type = "coins";
		}
		// Determine the room data statuses.
		this.cleared = false; // Whether or not the player has cleared the room.
		this.active = false; // Whether or not the room activily needs to be cleared.
		this.triggered = false; // Whether or not the player has triggered the room.

		this.enemies = 0;
		this.enemyCache = [];

		if (this.type === "hostile") {
			this.enemies = randInt(1, 3);
		}

		// If the room is not autogenerated, generate the tiles from the roomName.
		if (!autogen) {
			// Populate tiles from existing room data.
			this.populateTiles(roomName);
		} else {
			// If the room is autogenerated, generate it and then populate tiles. :|
			this.autoGen();
		}
	}

	// Creating enemies.
	createEnemy(x, y, health = 1) {
		let enemy = new Enemy(this.x + x, this.y + y, this, health);

		this.enemyCache.push(enemy);

		return enemy;
	}

	// Destroying enemies.
	destroyEnemy(enemy) {
		this.enemyCache.splice(this.enemyCache.indexOf(enemy), 1);
	}

	// Handle all events: loot, enemy spawning, etc.
	eventHandler() {
		if (this.cleared) return; // If the room has already been cleared we have nothing to do.

		// These happen every frame when the room is not cleared.
		// If the hostile type room is cleared of enemies.
		if (
			this.active &&
			this.type === "hostile" &&
			this.enemyCache.length <= 0
		) {
			this.cleared = true;
		}

		// If we have not been cleared, then we check if the player has entered the room, and activate it, unless it is already active.
		if (
			AABB(this, player) &&
			distance(
				this.x + this.width / 2,
				this.y + this.height / 2,
				player.x + 4,
				player.y + 4
			) <
				this.width / 2 - 12 &&
			!this.triggered &&
			!this.active &&
			!this.cleared
		) {
			this.triggered = true;
		}

		// Once the room has been triggered:
		if (this.triggered && !this.cleared) {
			// If it has not been cleared, than we start the event.

			this.triggered = false; // Remove the trigger so this only happens once.
			this.active = true; // Activate the room.

			// Close and lock all the room's doors.
			let doors = this.tiles.filter(
				(tile) =>
					tile.type === "door_closed" || tile.type === "door_open"
			);

			for (let door of doors) {
				door.open = false;
				door.locked = true;
			}

			// Different trigger functionality.
			if (this.type === "coins") {
				// Coin type room generates a random amount of coins at random places inside itself.
				let coinCount = randInt(5, 10);

				for (let i = 0; i < coinCount; i++) {
					items.createItem(
						randInt(this.x + 12, this.x + this.width - 12),
						randInt(this.y + 12, this.y + this.width - 12),
						"coin",
						1
					);
				}

				// Coin type rooms are immediately cleared.
				this.cleared = true;
			} else if (this.type === "hostile") {
				for (let i = 0; i < this.enemies; i++) {
					this.createEnemy(16 + i * 8 + i, this.width / 2, 1);
				}
			} else if (this.type === "ambient") {
				// If the room is ambient.
				this.cleared = true;
			}
		}

		// When the room is cleared. This happens once.
		if (this.cleared && this.active) {
			// If it has been cleared, then we remove the doors.
			player.roomsCleared++; // Add to the count of how many rooms the player has cleared.

			this.triggered = false; // Remove the trigger so this only happens once.
			this.active = false;

			let doors = this.tiles.filter(
				(tile) =>
					tile.type === "door_closed" || tile.type === "door_open"
			);

			for (let door of doors) {
				this.destroyTile(door);
				this.createTile(
					door.x - this.x,
					door.y - this.y,
					randomGroundTile(),
					false
				);
			}

			// Create torches.
			new Torch(this.x + 8, this.y + 8, true);
			new Torch(this.x + 72, this.y + 8, true);
			new Torch(this.x + 72, this.y + 72, true);
			new Torch(this.x + 8, this.y + 72, true);
		}
	}

	// Autogenerate a room.
	autoGen() {
		// The width and height of the room.
		let width = randInt(11, 22);
		let height = randInt(11, 22);

		// The room we generate.
		let genedRoom = [];

		// Loop through the width and height
		for (let y = 0; y < height; y++) {
			if (y !== 0 && y !== height - 1) {
				let xRow = []; // The row we add tiles to.

				for (let x = 0; x < width; x++) {
					if (x !== 0 && x !== width - 1) {
						xRow.push(randInt(1, 2));
					} else {
						xRow.push(3);
					} // Add floor tiles if we are not on the edge.
				}

				genedRoom.push(xRow);
			} else {
				// Add top and bottom walls.
				let xRow = []; // The row we add tiles to.

				for (let x = 0; x < width; x++) {
					// Add regular walls, or lip walls if we are at the top.
					if (y === 0 && x >= 1 && x < width - 1) {
						xRow.push(4);
					} else {
						xRow.push(3);
					}
				}

				genedRoom.push(xRow);
			}
		}

		// Create the tiles from that room generation.
		this.populateTiles(genedRoom);
	}

	// Populate tiles from data.
	populateTiles(room) {
		// Check if the input is roomdata, or a room name.
		let roomData;
		if (typeof room === "string") {
			roomData = rooms[room];
		} else {
			roomData = room;
		}

		// Apply the width and height. (accurate to pixel-dimensions)
		this.width = roomData[0].length * 8;
		this.height = roomData.length * 8;

		// Create all the tiles from the data.
		for (let y in roomData) {
			for (let x in roomData[y]) {
				let searchedTile = roomData[y][x];

				// Grab the wanted tiledata from tiles using the desired tile's ID.
				for (let tile in tiles) {
					if (typeof tiles[tile] !== "object") {
						continue;
					}

					let tileData = tiles[tile];

					if (!"id" in tileData) {
						continue;
					}

					// If we found the tile with the right ID, we grab it and then break.
					if (tileData.id === searchedTile) {
						searchedTile = tile;

						break;
					}
				}

				// Randomize ground tiles.
				if (searchedTile === "ground_1") {
					searchedTile = randomGroundTile();
				}

				// At this point, searchedTile is the key for the tiledata we want.
				this.createTile(
					x * 8,
					y * 8,
					searchedTile,
					this.doorsCanGenerateMoreRooms
				);
			}
		}
	}

	// Create a tile.
	createTile(x, y, type, doorsCanGenerateMoreRooms = true) {
		if (type !== "door_closed" && type !== "door_open") {
			// If it is a regular tile.
			let tile = new Tile(x + this.x, y + this.y, type);
			this.tiles.push(tile);
			world.globalTiles.push(tile);

			return tile;
		} else {
			// If the tile is a door.
			let door = new Door(
				x + this.x,
				y + this.y,
				type,
				this,
				doorsCanGenerateMoreRooms
			);
			this.tiles.push(door);
			world.globalTiles.push(door);

			return door;
		}
	}

	// Destroy a tile.
	destroyTile(tile) {
		this.tiles.splice(this.tiles.indexOf(tile), 1);
		world.globalTiles.splice(world.globalTiles.indexOf(tile), 1);
	}

	// Render this room's enemies.
	renderEnemies(ctx) {
		// Render all enemies in the room.
		if (this.type === "hostile" && this.enemyCache.length > 0) {
			for (let enemy of this.enemyCache) {
				// Check if the enemy is on screen.
				if (!isOnScreen(enemy)) continue;
				enemy.render(ctx);
			}
		}
	}

	logic() {
		// Run the event handler for this room.
		this.eventHandler();

		// Run the logic for all enemies in the room.
		if (this.type === "hostile" && this.enemyCache.length > 0) {
			for (let enemy of this.enemyCache) {
				enemy.logic();
			}
		}

		// Update all tiles.
		for (let tile of this.tiles) {
			tile.logic();
		}
	}

	render(ctx) {
		// Render a placeholder if there are no tiles. ---------------------------- DELETE AFTER DEBUGGING
		if (this.tiles.length === 0) {
			ctx.beginPath();

			ctx.fillStyle = "green";
			ctx.fillRect(
				this.x - player.camera.x,
				this.y - player.camera.y,
				8,
				8
			);

			ctx.closePath();
		}

		// Render all tiles.
		for (let tile of this.tiles) {
			// Check if the tile is on screen.
			if (!isOnScreen(tile)) continue;

			tile.render(ctx);
		}

		// Render all enemies.
		// this.renderEnemies(ctx);
	}
}

// The world, or level, which holds all rooms and major game logic.
class World {
	constructor() {
		// A collection of all the rooms in the world.
		this.rooms = [];
		this.globalTiles = [];

		// Lighting.
		this.globalLights = [];

		// The maximum amount of rooms in the world.
		this.roomCount = 25;
		this.finishedGenerating = false; // If the world has finished generating. (disabled so you can see the world grow on the mini-map)
		this.positionalBounds = {}; // A place to store positional bounds after the world has been generated.
	}

	// OLD LIGHTING CODE.
	// Calculates the lighting of a tile based on light sources around it.
	// getLightingData(x, y) {
	// 	// Loop through all the lights and calculate the lighting values. This is done by getting the average of all light applied to the tile.
	// 	let finalizedLightValue = 0;

	// 	for (let lightSource of this.globalLights) {
	// 		// Calculate the strength of the light on the tile. If the light source doesn't have a defined light strength, we use 10.
	// 		let lightStrength =
	// 			(lightSource.lightStrength ? lightSource.lightStrength : 10) /
	// 			distance(x, y, lightSource.x, lightSource.y);

	// 		finalizedLightValue += lightStrength;
	// 	}

	// 	if (finalizedLightValue > 1) finalizedLightValue = 1;
	// 	else if (finalizedLightValue < 0) finalizedLightValue = 0;

	// 	return finalizedLightValue;
	// }

	// Cast rays and calculate lighting for all globalLights.
	getLighting() {
		for (let lightSource of this.globalLights) {
			// Cast lighting rays.
			this.castLightingRays(lightSource);
		}
	}

	// Cast all lighting rays and determine which tiles should be lit up.
	castLightingRays(lightSource) {
		if (!lightSource.lightStrength) {
			// If the light source doesn not have light properties, we return.
			return "This object does not have a lightStrength property.";
		}

		let rayArea = lightSource.lightDistance
			? lightSource.lightDistance
			: canvas.width / 2; // The furthest we will cast rays in any direction is half the width of the screen, unless the light source has its own distance value.

		for (let tile of this.globalTiles) {
			// Check if the tile is on screen.
			if (!isOnScreen(tile)) continue;

			// Go through every tile and cast a ray to it, if it is close enough.
			if (
				distance(tile.x, tile.y, lightSource.x, lightSource.y) < rayArea
			) {
				// Cast a ray.
				let ray = this.castRay(lightSource, tile, 4);

				// If the ray did not hit anything before reaching the tile, than we increase that tile's global alpha.
				if (!ray.hit) {
					// Calculate the strength of the light on the tile. If the light source doesn't have a defined light strength, we use 10.
					let lightStrength =
						(lightSource.lightStrength
							? lightSource.lightStrength
							: 10) /
						distance(tile.x, tile.y, lightSource.x, lightSource.y);

					tile.globalAlpha += lightStrength;

					if (tile.globalAlpha < 0.1) tile.globalAlpha = 0.1;
				}

				// Draw the ray. (debugging only)
				if (debugging && showRays) {
					if (ray.hit) {
						drawRay(
							lightSource.x + 4,
							lightSource.y + 4,
							ray.x,
							ray.y,
							"red"
						);
					} else {
						drawRay(
							lightSource.x + 4,
							lightSource.y + 4,
							tile.x,
							tile.y,
							"green"
						);
					}
				}
			}
		}
	}

	// Cast a ray and see if it collides.
	castRay(source, target, step = 1) {
		// Create a ray object.
		let ray = {
			x: source.x + 4,
			y: source.y + 4,
			width: 1,
			height: 1,
		};

		// Keep moving and checking the ray until we reach the target.
		while (distance(ray.x, ray.y, target.x, target.y) > step) {
			// Calculate the new position of the ray using a vector. We move forward the number of steps that are predefined using step. The smaller the number the more likely the ray is to hit small objects instead of moving over them.
			let newPos = cartesian2(angle(target, ray), step);

			// Move the ray.
			ray.x += newPos.x;
			ray.y += newPos.y;

			// Get the ray's tile position.
			let tilePos = worldToTile(ray.x, ray.y);
			tilePos.x *= 8;
			tilePos.y *= 8;
			tilePos = this.getTile(tilePos.x, tilePos.y);

			// Do a collision check.
			if (tilePos !== undefined) {
				if (
					AABB(ray, tilePos) &&
					tilePos.data.solid &&
					distance(ray.x, ray.y, tilePos.x + 4, tilePos.y + 4) <= 5
				) {
					// Check if the tile we are aiming for is solid, and we are potentially ignoring it.
					if (
						tilePos.data.solid &&
						target.data.solid &&
						tilePos === target
					) {
						return { hit: false };
					}

					return { hit: true, x: ray.x, y: ray.y }; // Return where the ray ended. Since this is a truthy value, it is still considered a return of "true," with the added benefit of knowing where the ray landed.
				}
			}
		}

		return { hit: false }; // If the ray doesn't collide with anything, than we return false, meaning the cast was "successful."
	}

	// Get the positional bounds of the entire map.
	getPositionalBounds() {
		let positions = {
			lowX: 0,
			lowY: 0,
			highX: 0,
			highY: 0,
		};

		for (let room of this.rooms) {
			if (room.x < positions.lowX) {
				positions.lowX = room.x;
			} else if (room.x > positions.highX) {
				positions.highX = room.x;
			}

			if (room.y < positions.lowY) {
				positions.lowY = room.y;
			} else if (room.y > positions.highY) {
				positions.highY = room.y;
			}
		}

		this.positionalBounds = positions;

		return positions;
	}

	// Clean up the world after it has been generated.
	worldCleanup() {
		// Cleanup doors.
		let doors = this.globalTiles.filter(
			(tile) => tile.type === "door_opened" || tile.type === "door_closed"
		);

		// Loop through all doors and clean them up.
		for (let door of doors) {
			// Get the first tile after a door, in the direction that door opens.
			let tileInDoorDirection = undefined;
			switch (door.direction) {
				case "u":
					tileInDoorDirection = this.getTile(door.x, door.y - 8);
					break;
				case "d":
					tileInDoorDirection = this.getTile(door.x, door.y + 8);
					break;
				case "l":
					tileInDoorDirection = this.getTile(door.x - 8, door.y);
					break;
				case "r":
					tileInDoorDirection = this.getTile(door.x + 8, door.y);
					break;
				default:
					break;
			}

			// If the adjacent tile is a wall or an empty tile, we destroy the door and replace it with a wall.
			if (
				tileInDoorDirection === undefined ||
				tileInDoorDirection.type === "wall" ||
				tileInDoorDirection.type === "wall_ledge"
			) {
				let room = door.exits; // Get the room the door is in.

				room.destroyTile(door); // Delete the door.

				// Replace the door with a wall piece.
				room.createTile(
					door.x - room.x,
					door.y - room.y,
					door.y - room.y === 0 ? "wall_ledge" : "wall", // Spawn a wall normally, or a ledge if its at the top of the room.
					false
				);
			}
		}

		// Remove all the doors from the spawnpoint.
		spawn.tiles.forEach((tile) => {
			if (tile.type === "door_closed" || tile.type === "door_open") {
				spawn.destroyTile(tile);
				spawn.createTile(
					tile.x - spawn.x,
					tile.y - spawn.y,
					randomGroundTile(),
					false
				);
			}
		});

		// Get and store the positional bounds.
		this.getPositionalBounds();

		// Set that the game has finished loading the world to true.
		this.finishedGenerating = true;
	}

	// Get a room by its position.
	getRoom(x, y) {
		return this.rooms.filter((room) => room.x === x && room.y === y);
	}

	// Create a room.
	createRoom(x, y, strict = true) {
		// If there are already too many rooms, we don't make this room.
		if (this.roomCount <= 0) return;

		// If strict mode is on, and there is a collision with another room, we do not create the room.
		let room = new Room(x, y, true, null);

		// Loop through all rooms and check for collision if we are in strict mode.
		if (strict) {
			for (let checkedRoom of this.rooms) {
				if (AABB(room, checkedRoom)) {
					return "Could not create room. It intersects another room.";
				}
			}
		}

		this.rooms.push(room);

		this.roomCount--;
		if (this.roomCount <= 0) {
			this.worldCleanup(); // If all rooms have been made, we clean up the map.
		}

		return room;
	}

	// Create a room from template data.
	createRoomFromData(
		x,
		y,
		roomName,
		strict = true,
		roomsDoorsCanGenerateRooms = true
	) {
		// If there are already too many rooms, we don't make this room.
		if (this.roomCount <= 0) return;

		// If strict mode is on, and there is a collision with another room, we do not create the room.
		let room = new Room(x, y, false, roomName, roomsDoorsCanGenerateRooms);

		// Loop through all rooms and check for collision if we are in strict mode.
		if (strict) {
			for (let checkedRoom of this.rooms) {
				if (AABB(room, checkedRoom)) {
					return "Could not create room. It intersects another room.";
				}
			}
		}

		this.rooms.push(room);

		this.roomCount--;
		if (this.roomCount <= 0) {
			this.worldCleanup(); // If all rooms have been made, we clean up the map.
		}

		return room;
	}

	// Destroy a room.
	destroyRoom(room) {
		this.rooms.splice(this.rooms.indexOf(room), 1);
	}

	// Get a tile.
	getTile(x, y) {
		for (let tile of this.globalTiles) {
			if (tile.x === x && tile.y === y) {
				return tile;
			}
		}

		return undefined;
	}

	logic() {
		// Update all rooms.
		for (let room of this.rooms) {
			room.logic();
		}
	}

	render(ctx) {
		// Calculate lighting.
		if (renderLighting) {
			this.getLighting();
		}

		// Render all rooms.
		for (let room of this.rooms) {
			room.render(ctx);
		}
	}
}

// Gamestate.
let world = new World();

// Create a spawn area.
let spawn = world.createRoomFromData(
	0,
	0,
	// ["a", "u", "d", "l", "r", "ul", "ur", "dl", "dr"][
	// 	Math.floor(Math.random() * 9)
	// ]
	"a"
);
spawn.type = "ambient";

// world.createRoom(0, 0);
