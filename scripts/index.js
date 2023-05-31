/**
 * Imports
 */

import EventListenerHandler from "./handlers/EventListenerHandler.js";
import KeyboardHandler from "./handlers/KeyboardHandler.js";
import MouseHandler from "./handlers/MouseHandler.js";
import RenderHandler from "./handlers/RenderHandler.js";
import TimeHandler from "./handlers/TimeHandler.js";

import Camera from "./models/Camera.js";
import Player from "./models/Player.js";
import World from "./models/World.js";

/**
 * Configuration
 */

export const fpsDisp = document.querySelector("p#fps");

/**
 * Handlers
 */
export const Time = new TimeHandler();
export const Renderer = new RenderHandler("both");
export const Events = new EventListenerHandler();
export const Keyboard = new KeyboardHandler();
export const Mouse = new MouseHandler(Renderer);

/**
 * Objects & Models
 */
export const camera = new Camera();
export const player = new Player();
export const world = new World("dev_02");

Renderer.start();
