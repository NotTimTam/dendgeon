"use strict";

// Keyboard.
let keyboard = [];

window.onkeydown = (e) => {
	keyboard[e.key] = true;
};

window.onkeyup = (e) => {
	keyboard[e.key] = false;
};
