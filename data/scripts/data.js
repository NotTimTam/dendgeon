"use strict";

// Room templates
const rooms = {
	a: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3],
	],

	ae: [
		[3, 4, 4, 4, 4, 1, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3],
	],

	u: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	d: [
		[3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3],
	],

	l: [
		[3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	r: [
		[3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	ud: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3],
	],

	lr: [
		[3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	ul: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	ur: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	],

	dl: [
		[3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3],
	],

	dr: [
		[3, 4, 4, 4, 4, 6, 4, 4, 4, 4, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
		[3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3],
	],

	// hall_ud: [
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// 	[3, 1, 1, 1, 3],
	// ],

	// hall_lr: [
	// 	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	// 	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	// 	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	// 	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	// 	[3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
	// ],
};
