export const STORAGE_KEY = "juice-save-v1";
export const SAVE_VERSION = 15;
export const STARTING_COINS = 280;          // was 150 — enough to buy seeds + a tool
export const PLANT_XP_REWARD = 12;          // was 10
export const HARVEST_XP_REWARD = 20;        // was 15
export const JUICE_XP_REWARD = 30;          // was 25
export const WATER_XP_REWARD = 5;
export const SPRAYER_CHARGE_USES = 4;
export const DAY_START_MINUTE = 8 * 60;
export const DAY_MINUTES = 24 * 60;
export const CONTRACT_DURATION_MINUTES = 12 * 60; // was 8h — now 12h game (~4 real min)

export const CONTRACT_TARGETS = [
	{ itemId: "orange",            required: 4, reward: 80  }, // was req=6  rew=70
	{ itemId: "lemon",             required: 5, reward: 88  }, // was req=8  rew=76
	{ itemId: "peach",             required: 5, reward: 100 }, // was req=7  rew=86
	{ itemId: "pomegranate",       required: 4, reward: 110 }, // was req=6  rew=94
	{ itemId: "orange-juice",      required: 2, reward: 130 }, // was rew=115
	{ itemId: "lemon-juice",       required: 2, reward: 122 }, // was rew=108
	{ itemId: "peach-juice",       required: 2, reward: 145 }, // was rew=126
	{ itemId: "pomegranate-juice", required: 2, reward: 158 }, // was rew=138
];

export const DEFAULT_PLOTS = [
	{ name: "South Field", size: "15 tiles", cost: 0 },
	{ name: "East Field", size: "15 tiles", cost: 200 },
	{ name: "North Field", size: "15 tiles", cost: 350 },
	{ name: "West Field", size: "15 tiles", cost: 500 },
];
