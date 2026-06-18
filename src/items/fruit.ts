import type { ItemDefinition } from "../items";

export const FRUIT_ITEMS: Record<string, ItemDefinition> = {
	"orange": {
		id: "orange",
		price: 12,
		maxStack: 15,
		visual: {
			color: "#f28c28",
			accent: "#ffd166",
			symbol: "O",
			image: "/assets/icons/laranja.png",
		},
	},
	"pomegranate": {
		id: "pomegranate",
		price: 18,
		maxStack: 12,
		visual: {
			color: "#9d174d",
			accent: "#f472b6",
			symbol: "R",
			image: "/assets/icons/roma.png",
		},
	},
	"peach": {
		id: "peach",
		price: 15,
		maxStack: 15,
		visual: {
			color: "#fb9f89",
			accent: "#ffd08a",
			symbol: "P",
			image: "/assets/icons/pessego.png",
		},
	},
	"lemon": {
		id: "lemon",
		price: 10,
		maxStack: 20,
		visual: {
			color: "#facc15",
			accent: "#fef08a",
			symbol: "L",
			image: "/assets/icons/limao.png",
		},
	},
	"orange-juice": {
		id: "orange-juice",
		price: 34,
		maxStack: 6,
		visual: {
			color: "#ea580c",
			accent: "#fed7aa",
			symbol: "OJ",
			image: "/assets/icons/Frasco_1.png",
		},
	},
	"pomegranate-juice": {
		id: "pomegranate-juice",
		price: 46,
		maxStack: 6,
		visual: {
			color: "#be123c",
			accent: "#fecdd3",
			symbol: "RJ",
			image: "/assets/icons/Frasco_2.png",
		},
	},
	"peach-juice": {
		id: "peach-juice",
		price: 40,
		maxStack: 6,
		visual: {
			color: "#f97316",
			accent: "#fed7aa",
			symbol: "PJ",
			image: "/assets/icons/Frasco_3.png",
		},
	},
	"lemon-juice": {
		id: "lemon-juice",
		price: 32,
		maxStack: 6,
		visual: {
			color: "#eab308",
			accent: "#fef9c3",
			symbol: "LJ",
			image: "/assets/icons/Frasco_4.png",
		},
	},
};
