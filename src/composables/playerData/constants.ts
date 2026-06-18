export const STORAGE_KEY = "juice-save-v1";
export const SAVE_VERSION = 15;
export const STARTING_COINS = 150;
export const PLANT_XP_REWARD = 10;
export const HARVEST_XP_REWARD = 15;
export const JUICE_XP_REWARD = 25;
export const WATER_XP_REWARD = 5;
export const DAY_START_MINUTE = 8 * 60;
export const DAY_MINUTES = 24 * 60;
export const CONTRACT_DURATION_MINUTES = 8 * 60;

export const CONTRACT_TARGETS = [
	{ itemId: "orange", required: 6, reward: 70 },
	{ itemId: "lemon", required: 8, reward: 76 },
	{ itemId: "peach", required: 7, reward: 86 },
	{ itemId: "pomegranate", required: 6, reward: 94 },
	{ itemId: "orange-juice", required: 2, reward: 115 },
	{ itemId: "lemon-juice", required: 2, reward: 108 },
	{ itemId: "peach-juice", required: 2, reward: 126 },
	{ itemId: "pomegranate-juice", required: 2, reward: 138 },
];

export const DEFAULT_PLOTS = [
	{ name: "South Field", size: "15 tiles", cost: 0 },
	{ name: "East Field", size: "15 tiles", cost: 200 },
	{ name: "North Field", size: "15 tiles", cost: 350 },
	{ name: "West Field", size: "15 tiles", cost: 500 },
];
