"use strict";

// Global functions.
const worldToTile = (x, y) => {
	return {
		x: Math.round(x / 8 - 0.5),
		y: Math.round(y / 8 - 0.5),
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

// Player.
class Player {
	constructor(x, y) {
		// The player's position on-screen/in-game.
		this.x = x;
		this.y = y;

		// What tile the player is mostly standing on.
		this.tilePos = {};

		// The tile the player is moving towards.
		this.goalTile = {};

		this.speed = 2;

		this.camera = {
			x: 0,
			y: 0,
		};
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

		let hbbTilePos = worldToTile(hbb.x, hbb.y);

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

		this.goalTile = world.getTile(
			Math.round(this.goalTile.x * 8),
			Math.round(this.goalTile.y * 8)
		);

		if (this.goalTile === undefined) {
			return false;
		} else if (AABB(hbb, this.goalTile) && this.goalTile.data.solid) {
			return true;
		}

		return false;
	}

	input() {
		// Check for collisions in the direction of travel and then apply the travel if there are none.
		if (keyboard.ArrowUp || keyboard.w) {
			if (!this.checkCol(0)) {
				this.y -= this.speed;
			}
		}
		if (keyboard.ArrowRight || keyboard.d) {
			if (!this.checkCol(1)) {
				this.x += this.speed;
			}
		}
		if (keyboard.ArrowDown || keyboard.s) {
			if (!this.checkCol(2)) {
				this.y += this.speed;
			}
		}
		if (keyboard.ArrowLeft || keyboard.a) {
			if (!this.checkCol(3)) {
				this.x -= this.speed;
			}
		}
	}

	logic() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		this.tilePos = worldToTile(this.x, this.y);

		this.camera.x = Math.round(this.x - 60);
		this.camera.y = Math.round(this.y - 60);
	}

	render(ctx) {
		ctx.beginPath();

		ctx.fillStyle = "red";

		ctx.fillRect(
			Math.round(this.x - this.camera.x),
			Math.round(this.y - this.camera.y),
			8,
			8
		);

		ctx.closePath();

		// ctx.beginPath();
		// ctx.strokeStyle = "green";
		// ctx.lineWidth = 0.5;
		// ctx.rect(
		// 	this.tilePos.x * 8 - this.camera.x,
		// 	this.tilePos.y * 8 - this.camera.y,
		// 	8,
		// 	8
		// );
		// ctx.stroke();

		// ctx.closePath();

		// ctx.beginPath();
		// ctx.strokeStyle = "orange";
		// ctx.lineWidth = 0.5;
		// if (this.goalTile !== undefined) {
		// 	ctx.rect(
		// 		(this.goalTile.x / 8) * 8 - this.camera.x,
		// 		(this.goalTile.y / 8) * 8 - this.camera.y,
		// 		8,
		// 		8
		// 	);
		// }

		// ctx.stroke();

		// ctx.closePath();
	}
}

const player = new Player(16, 16);

// Map.
const tiles = {
	map: undefined,
	tileSize: 8,

	load: () => {
		let img = new Image();
		img.onload = () => {
			tiles.map = img;
		};
		img.src = "./data/images/tilemap.png";
	},

	err: {
		solid: false,

		pos: {
			x: 0,
			y: 2,
		},

		id: 0,
	},

	ground_1: {
		solid: false,

		pos: {
			x: 0,
			y: 0,
		},

		id: 1,
	},
	ground_2: {
		solid: false,

		pos: {
			x: 0,
			y: 0,
		},

		id: 2,
	},

	// WALLS
	wall_center: {
		solid: true,

		pos: {
			x: 0,
			y: 1,
		},

		id: 3,
	},
	wall_left: {
		solid: true,

		pos: {
			x: 1,
			y: 1,
		},

		id: 4,
	},
	wall_right: {
		solid: true,

		pos: {
			x: 2,
			y: 1,
		},

		id: 5,
	},
	wall_up: {
		solid: true,

		pos: {
			x: 3,
			y: 1,
		},

		id: 6,
	},
	wall_down: {
		solid: true,

		pos: {
			x: 4,
			y: 1,
		},

		id: 7,
	},
	wall_top_left: {
		solid: true,

		pos: {
			x: 5,
			y: 1,
		},

		id: 8,
	},
	wall_top_right: {
		solid: true,

		pos: {
			x: 6,
			y: 1,
		},

		id: 9,
	},
	wall_bottom_right: {
		solid: true,

		pos: {
			x: 7,
			y: 1,
		},

		id: 10,
	},
	wall_bottom_left: {
		solid: true,

		pos: {
			x: 8,
			y: 1,
		},

		id: 11,
	},
	wall_column: {
		solid: true,

		pos: {
			x: 9,
			y: 1,
		},

		id: 12,
	},
	wall_row: {
		solid: true,

		pos: {
			x: 10,
			y: 1,
		},

		id: 13,
	},
};
// Load the tilemap texture image if it hasn't been already.
tiles.load();

// Room templates
const rooms = {
	dev_room: [
		[8, 13, 13, 13, 13, 13, 13, 9],
		[12, 1, 2, 1, 2, 1, 2, 12],
		[12, 1, 1, 1, 1, 1, 1, 12],
		[12, 1, 2, 1, 2, 1, 2, 12],
		[12, 1, 1, 1, 1, 1, 1, 12],
		[12, 1, 2, 1, 2, 1, 2, 12],
		[12, 1, 1, 1, 1, 1, 1, 12],
		[11, 13, 13, 13, 13, 13, 13, 10],
	],
};

// A single tile, usually as part of a room, but can be secluded. (will not render unless in a room)
class Tile {
	constructor(x, y, type) {
		// The tiles position on-screen.
		this.x = x;
		this.y = y;

		// Sizing, only used for collision detection.
		this.width = 8;
		this.height = 8;

		// The type of tile it is... Used to grab tiledata from the tiles array. If the tile doesn't exist then we load an error tile.
		this.type = tiles[type] === undefined ? "err" : type;

		this.data = tiles[this.type];
	}

	// Check wether or not this tile is currently on-screen.
	onScreen() {
		// Check x's.
		if (this.x + 8 < player.camera.x) {
			return false;
		} else if (this.x > player.camera.x + canvas.width) {
			return false;
		}

		// Check y's.
		if (this.y + 8 < player.camera.y) {
			return false;
		} else if (this.y > player.camera.y + canvas.height) {
			return false;
		}

		// Otherwise return "true". (i.e. it is on screen)
		return true;
	}

	logic() {}

	render(ctx) {
		// If the tile is not on-screen, we don't render it.
		if (!this.onScreen()) {
			return;
		}

		try {
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
		} catch {
			return;
		}
	}
}

// A room, contains tiles and events as well as handeling of loot and enemies.
class Room {
	constructor(x, y) {
		// The room's position on-screen.
		this.x = x;
		this.y = y;

		this.tiles = [];
	}

	// Populate tiles from data.
	populateTiles(roomName) {
		let roomData = rooms[roomName];

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

				// At this point, searchedTile is the key for the tiledata we want.
				this.createTile(x * 8, y * 8, searchedTile);
			}
		}
	}

	// Create a tile.
	createTile(x, y, type) {
		let tile = new Tile(x, y, type);
		this.tiles.push(tile);
		world.globalTiles.push(tile);

		return tile;
	}

	// Destroy a tile.
	destroyTile(tile) {
		this.tiles.splice(this.tiles.indexOf(tile), 1);
		world.globalTiles.splice(world.globalTiles.indexOf(tile), 1);
	}

	logic() {}

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
			tile.render(ctx);
		}
	}
}

// A room that connects two other rooms.
class Hallway extends Room {
	constructor(x, y) {
		super(x, y);
	}

	logic() {}

	render(ctx) {}
}

// The world, or level, which holds all rooms and major game logic.
class World {
	constructor() {
		// A collection of all the rooms in the world.
		this.rooms = [];
		this.globalTiles = [];
	}

	// Create a room.
	createRoom(x, y) {
		let room = new Room(x, y);
		this.rooms.push(room);

		return room;
	}

	// Create a room from template data.
	createRoomFromData(x, y, roomName) {
		let room = this.createRoom(x, y);

		room.populateTiles(roomName);

		return room;
	}

	// Destroy a room.
	destroyRoom(room) {
		this.rooms.splice(this.rooms.indexOf(room), 1);
	}

	// Get a tile.
	getTile(x, y) {
		for (let tile of this.globalTiles) {
			if (tile.x == x && tile.y == y) {
				return tile;
			}
		}

		return undefined;
	}

	logic() {}

	render(ctx) {
		// Render all rooms.
		for (let room of this.rooms) {
			room.render(ctx);
		}
	}
}

// Gamestate.
let world = new World();
world.createRoomFromData(0, 0, "dev_room");
