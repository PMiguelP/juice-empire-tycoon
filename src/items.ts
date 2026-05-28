export type ItemVisual = {
	color: string;
	accent: string;
	symbol: string;
	image?: string;
};

export type ItemDefinition = {
	id: string;
	price: number;
	maxStack: number;
	visual: ItemVisual;
};

export type InventoryStack = {
	id: string;
	quantity: number;
};

export type InventoryEntry = string | InventoryStack | null;

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
	"seed-bag": {
		id: "seed-bag",
		price: 50,
		maxStack: 30,
		visual: { color: "#8f6b3d", accent: "#d6b06f", symbol: "S" },
	},
	fertilizer: {
		id: "fertilizer",
		price: 35,
		maxStack: 15,
		visual: { color: "#6a5130", accent: "#9fce67", symbol: "F" },
	},
	orange: {
		id: "orange",
		price: 12,
		maxStack: 15,
		visual: { color: "#f28c28", accent: "#ffd166", symbol: "O" },
	},
	pomegranate: {
		id: "pomegranate",
		price: 18,
		maxStack: 12,
		visual: { color: "#9d174d", accent: "#f472b6", symbol: "R" },
	},
	peach: {
		id: "peach",
		price: 15,
		maxStack: 15,
		visual: { color: "#fb9f89", accent: "#ffd08a", symbol: "P" },
	},
	lemon: {
		id: "lemon",
		price: 10,
		maxStack: 20,
		visual: { color: "#facc15", accent: "#fef08a", symbol: "L" },
	},
	water: {
		id: "water",
		price: 4,
		maxStack: 20,
		visual: { color: "#38bdf8", accent: "#bae6fd", symbol: "W" },
	},
	"empty-bottle": {
		id: "empty-bottle",
		price: 8,
		maxStack: 10,
		visual: { color: "#64748b", accent: "#e2e8f0", symbol: "B" },
	},
	"orange-juice": {
		id: "orange-juice",
		price: 34,
		maxStack: 6,
		visual: { color: "#ea580c", accent: "#fed7aa", symbol: "OJ" },
	},
	"pomegranate-juice": {
		id: "pomegranate-juice",
		price: 46,
		maxStack: 6,
		visual: { color: "#be123c", accent: "#fecdd3", symbol: "RJ" },
	},
	"peach-juice": {
		id: "peach-juice",
		price: 40,
		maxStack: 6,
		visual: { color: "#f97316", accent: "#fed7aa", symbol: "PJ" },
	},
	"lemon-juice": {
		id: "lemon-juice",
		price: 32,
		maxStack: 6,
		visual: { color: "#eab308", accent: "#fef9c3", symbol: "LJ" },
	},
	shovel: {
		id: "shovel",
		price: 150,
		maxStack: 1,
		visual: { color: "#475569", accent: "#cbd5e1", symbol: "T" },
	},
	potion: {
		id: "potion",
		price: 75,
		maxStack: 5,
		visual: { color: "#dc2626", accent: "#fecaca", symbol: "+" },
	},
	roasta: {
		id: "roasta",
		price: 10,
		maxStack: 10,
		visual: { color: "#7c2d12", accent: "#fdba74", symbol: "R" },
	},
	chappir: {
		id: "chappir",
		price: 50,
		maxStack: 10,
		visual: { color: "#4338ca", accent: "#c4b5fd", symbol: "C" },
	},
};

export const SHOP_ITEM_IDS = [
	"orange",
	"pomegranate",
	"peach",
	"lemon",
	"water",
	"empty-bottle",
	"seed-bag",
	"fertilizer",
	"shovel",
	"potion",
];

export const getItemId = (entry: InventoryEntry): string | null => {
	if (!entry) {
		return null;
	}
	return typeof entry === "string" ? entry : entry.id;
};

export const getItemQuantity = (entry: InventoryEntry): number => {
	if (!entry) {
		return 0;
	}
	return typeof entry === "string" ? 1 : entry.quantity;
};

export const getMaxStack = (itemId: string | null): number => {
	if (!itemId) {
		return 1;
	}
	return ITEM_CATALOG[itemId]?.maxStack ?? 99;
};

export const normalizeEntry = (entry: InventoryEntry): InventoryStack | null => {
	const itemId = getItemId(entry);
	if (!itemId) {
		return null;
	}

	const quantity = Math.min(Math.max(getItemQuantity(entry), 1), getMaxStack(itemId));
	return { id: itemId, quantity };
};

export const canStackWith = (entry: InventoryEntry, itemId: string): boolean => {
	const currentId = getItemId(entry);
	return currentId === itemId && getItemQuantity(entry) < getMaxStack(itemId);
};

export const addOneToEntry = (
	entry: InventoryEntry,
	itemId: string,
): InventoryStack | null => {
	const normalized = normalizeEntry(entry);
	if (!normalized) {
		return { id: itemId, quantity: 1 };
	}
	if (!canStackWith(normalized, itemId)) {
		return null;
	}
	return { id: itemId, quantity: normalized.quantity + 1 };
};

export const addOneToSlots = (
	slots: Array<InventoryStack | null>,
	itemId: string,
	preferredIndex: number | null = null,
): Array<InventoryStack | null> | null => {
	const next = slots.slice();
	const preferred = preferredIndex ?? -1;

	if (preferred >= 0 && preferred < next.length) {
		const preferredEntry = addOneToEntry(next[preferred], itemId);
		if (preferredEntry) {
			next[preferred] = preferredEntry;
			return next;
		}
	}

	const stackIndex = next.findIndex((slot) => canStackWith(slot, itemId));
	if (stackIndex >= 0) {
		next[stackIndex] = addOneToEntry(next[stackIndex], itemId);
		return next;
	}

	const emptyIndex = next.findIndex((slot) => !slot);
	if (emptyIndex >= 0) {
		next[emptyIndex] = { id: itemId, quantity: 1 };
		return next;
	}

	return null;
};

export const getItemVisual = (entry: InventoryEntry): ItemVisual | null => {
	const itemId = getItemId(entry);
	if (!itemId) {
		return null;
	}

	return ITEM_CATALOG[itemId]?.visual ?? {
		color: "#334155",
		accent: "#94a3b8",
		symbol: "?",
	};
};
