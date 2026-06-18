import type { ItemDefinition } from "../items";

export const CONSUMABLES_ITEMS: Record<string, ItemDefinition> = {
	"fertilizer": {
		id: "fertilizer",
		price: 35,
		maxStack: 15,
		visual: { color: "#6a5130", accent: "#9fce67", symbol: "F" },
	},
	"fertilizer-basic": {
		id: "fertilizer-basic",
		price: 18,
		maxStack: 20,
		visual: {
			color: "#6a5130",
			accent: "#bef264",
			symbol: "F1",
			image: "assets/icons/fertelizante1.png",
		},
	},
	"fertilizer-growth": {
		id: "fertilizer-growth",
		price: 42,
		maxStack: 15,
		visual: {
			color: "#365314",
			accent: "#86efac",
			symbol: "F2",
			image: "assets/icons/fertelizante2.png",
		},
	},
	"fertilizer-premium": {
		id: "fertilizer-premium",
		price: 78,
		maxStack: 10,
		visual: {
			color: "#854d0e",
			accent: "#fde68a",
			symbol: "F3",
			image: "assets/icons/fertelizante3.png",
		},
	},
	"sulfate-basic": {
		id: "sulfate-basic",
		price: 16,
		maxStack: 20,
		visual: {
			color: "#0f766e",
			accent: "#99f6e4",
			symbol: "S1",
			image: "assets/icons/sulfate1.png",
		},
	},
	"sulfate-strong": {
		id: "sulfate-strong",
		price: 38,
		maxStack: 15,
		visual: {
			color: "#1d4ed8",
			accent: "#bfdbfe",
			symbol: "S2",
			image: "assets/icons/sulfate2.png",
		},
	},
	"sulfate-premium": {
		id: "sulfate-premium",
		price: 72,
		maxStack: 10,
		visual: {
			color: "#581c87",
			accent: "#e9d5ff",
			symbol: "S3",
			image: "assets/icons/sulfate3.png",
		},
	},
};
