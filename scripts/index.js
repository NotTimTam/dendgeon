/**
 * Imports
 */

import EventListenerHandler from "./handlers/EventListenerHandler.js";
import KeyboardHandler from "./handlers/KeyboardHandler.js";
import MouseHandler from "./handlers/MouseHandler.js";
import RenderHandler from "./handlers/RenderHandler.js";
import TimeHandler from "./handlers/TimeHandler.js";

import Sprite from "./models/Sprite.js";

import CameraController from "./controllers/CameraController.js";
import PlayerController from "./controllers/PlayerController.js";
import WorldController from "./controllers/WorldController.js";

/**
 * Configuration
 */

export const masterConfig = {
	mouse: {
		damping: 12,
		sensitivity: 12,
	},
	renderer: {
		resolution: 320,
	},
	camera: {
		fov: 90,
		renderDistance: 48,
		lightDistance: 24,
		wallHeightGridRatio: 16,
		resolutionDegredation: 1,
		lockToPlayer: true,
	},
	player: { speed: 200 },
	world: {
		grid: 48,
		wallScale: 0.25,
		textureRepeatFactor: 5,
		textureOverlapCompensation: 1,
	},
};

export const fpsDisp = document.querySelector("p#fps");

/**
 * Handlers
 */
export const Time = new TimeHandler();
export const Renderer = new RenderHandler("both", masterConfig.renderer);
export const Events = new EventListenerHandler();
export const Keyboard = new KeyboardHandler();
export const Mouse = new MouseHandler(Renderer, masterConfig.mouse);

/**
 * Models
 */

/**
 * Controllers
 */
export const camera = new CameraController(masterConfig.camera);
export const player = new PlayerController(null, null, masterConfig.player);
export const world = new WorldController("dev_02", masterConfig.world);

world.addGameObject(
	new Sprite(
		3 * masterConfig.world.grid,
		3 * masterConfig.world.grid,
		0,
		world.grid / 2
	)
);

Renderer.start();
