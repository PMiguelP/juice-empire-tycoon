import type { ItemDefinition } from "../items";

export const SEEDS_ITEMS: Record<string, ItemDefinition> = {
	"seed-bag": {
		id: "seed-bag",
		price: 50,
		maxStack: 30,
		visual: { color: "#8f6b3d", accent: "#d6b06f", symbol: "S" },
	},
	"orange-tree-seed": {
		id: "orange-tree-seed",
		price: 28,
		maxStack: 20,
		visual: {
			color: "#f28c28",
			accent: "#14532d",
			symbol: "OS",
			image: "assets/icons/sementelaranjeira.png",
		},
	},
	"pomegranate-tree-seed": {
		id: "pomegranate-tree-seed",
		price: 36,
		maxStack: 16,
		visual: {
			color: "#9d174d",
			accent: "#166534",
			symbol: "RS",
			image: "assets/icons/sementeromanzeira.png",
		},
	},
	"peach-tree-seed": {
		id: "peach-tree-seed",
		price: 32,
		maxStack: 18,
		visual: {
			color: "#fb9f89",
			accent: "#15803d",
			symbol: "PS",
			image: "assets/icons/sementepessegueiro.png",
		},
	},
	"lemon-tree-seed": {
		id: "lemon-tree-seed",
		price: 24,
		maxStack: 20,
		visual: {
			color: "#facc15",
			accent: "#166534",
			symbol: "LS",
			image: "assets/icons/sementelimoeiro.png",
		},
	},
};
