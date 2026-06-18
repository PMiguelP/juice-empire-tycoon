import type { ItemDefinition } from "../items";

export const TOOLS_ITEMS: Record<string, ItemDefinition> = {
	"water": {
		id: "water",
		price: 4,
		maxStack: 20,
		visual: {
			color: "#38bdf8",
			accent: "#bae6fd",
			symbol: "G",
			image: "assets/icons/Garrafoes_1.png",
		},
	},
	"filled-water-jug": {
		id: "filled-water-jug",
		price: 4,
		maxStack: 20,
		visual: {
			color: "#38bdf8",
			accent: "#bae6fd",
			symbol: "G",
			image: "assets/icons/Garrafoes_2.png",
		},
	},
	"empty-bottle": {
		id: "empty-bottle",
		price: 8,
		maxStack: 10,
		visual: {
			color: "#64748b",
			accent: "#e2e8f0",
			symbol: "B",
			image: "assets/icons/garrafavazia.png",
		},
	},
	"shovel": {
		id: "shovel",
		price: 150,
		maxStack: 1,
		visual: { color: "#475569", accent: "#cbd5e1", symbol: "T" },
	},
	"scissors": {
		id: "scissors",
		price: 95,
		maxStack: 1,
		visual: {
			color: "#64748b",
			accent: "#e2e8f0",
			symbol: "SC",
			image: "assets/icons/tesoura.png",
		},
	},
	"watering-can": {
		id: "watering-can",
		price: 120,
		maxStack: 1,
		visual: {
			color: "#2563eb",
			accent: "#bfdbfe",
			symbol: "R",
			image: "assets/icons/regadorvazio.png",
		},
	},
	"filled-watering-can": {
		id: "filled-watering-can",
		price: 120,
		maxStack: 5,
		visual: {
			color: "#2563eb",
			accent: "#bfdbfe",
			symbol: "R",
			image: "assets/icons/comagua.png",
		},
	},
	"sprayer": {
		id: "sprayer",
		price: 135,
		maxStack: 1,
		visual: {
			color: "#16a34a",
			accent: "#bbf7d0",
			symbol: "SU",
			image: "assets/icons/sulfatador.png",
		},
	},
	"potion": {
		id: "potion",
		price: 75,
		maxStack: 5,
		visual: { color: "#dc2626", accent: "#fecaca", symbol: "+" },
	},
	"roasta": {
		id: "roasta",
		price: 10,
		maxStack: 10,
		visual: { color: "#7c2d12", accent: "#fdba74", symbol: "R" },
	},
	"chappir": {
		id: "chappir",
		price: 50,
		maxStack: 10,
		visual: { color: "#4338ca", accent: "#c4b5fd", symbol: "C" },
	},
};
