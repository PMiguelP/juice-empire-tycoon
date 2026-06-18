import { CONSUMABLES_ITEMS } from "./items/consumables";
import { FRUIT_ITEMS } from "./items/fruit";
import { SEEDS_ITEMS } from "./items/seeds";
import { TOOLS_ITEMS } from "./items/tools";

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
	...SEEDS_ITEMS,
	...CONSUMABLES_ITEMS,
	...FRUIT_ITEMS,
	...TOOLS_ITEMS,
};

export const SHOP_ITEM_IDS = [
	"orange-tree-seed",
	"pomegranate-tree-seed",
	"peach-tree-seed",
	"lemon-tree-seed",
	"fertilizer-basic",
	"fertilizer-growth",
	"fertilizer-premium",
	"sulfate-basic",
	"sulfate-strong",
	"sulfate-premium",
	"water",
	"empty-bottle",
	"scissors",
	"watering-can",
	"sprayer",
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

export const addQuantityToEntry = (
	entry: InventoryEntry,
	itemId: string,
	quantity: number,
): InventoryStack | null => {
	if (!Number.isInteger(quantity) || quantity < 1) {
		return null;
	}

	const normalized = normalizeEntry(entry);
	if (!normalized) {
		if (quantity > getMaxStack(itemId)) {
			return null;
		}
		return { id: itemId, quantity };
	}

	if (getItemId(normalized) !== itemId) {
		return null;
	}

	const nextQuantity = normalized.quantity + quantity;
	if (nextQuantity > getMaxStack(itemId)) {
		return null;
	}

	return { id: itemId, quantity: nextQuantity };
};

export const addQuantityToSlots = (
	slots: Array<InventoryStack | null>,
	itemId: string,
	quantity: number,
	preferredIndex: number | null = null,
): Array<InventoryStack | null> | null => {
	if (!Number.isInteger(quantity) || quantity < 1 || quantity > getMaxStack(itemId)) {
		return null;
	}

	const next = slots.slice();
	let remaining = quantity;
	const preferred = preferredIndex ?? -1;

	if (preferred >= 0 && preferred < next.length) {
		const preferredId = getItemId(next[preferred]);
		if (!next[preferred] || preferredId === itemId) {
			const currentQuantity = getItemQuantity(next[preferred]);
			const capacity = getMaxStack(itemId) - currentQuantity;
			const amount = Math.min(capacity, remaining);
			if (amount > 0) {
				next[preferred] = { id: itemId, quantity: currentQuantity + amount };
				remaining -= amount;
			}
		}
	}

	for (let index = 0; index < next.length && remaining > 0; index += 1) {
		if (index === preferred) {
			continue;
		}
		if (getItemId(next[index]) !== itemId) {
			continue;
		}
		const currentQuantity = getItemQuantity(next[index]);
		const capacity = getMaxStack(itemId) - currentQuantity;
		const amount = Math.min(capacity, remaining);
		if (amount > 0) {
			next[index] = { id: itemId, quantity: currentQuantity + amount };
			remaining -= amount;
		}
	}

	for (let index = 0; index < next.length && remaining > 0; index += 1) {
		if (next[index]) {
			continue;
		}
		const amount = Math.min(getMaxStack(itemId), remaining);
		next[index] = { id: itemId, quantity: amount };
		remaining -= amount;
	}

	return remaining === 0 ? next : null;
};

export const removeQuantityFromEntry = (
	entry: InventoryEntry,
	quantity: number,
): InventoryStack | null => {
	const itemId = getItemId(entry);
	if (!itemId || !Number.isInteger(quantity) || quantity < 1) {
		return normalizeEntry(entry);
	}

	const nextQuantity = getItemQuantity(entry) - quantity;
	return nextQuantity > 0 ? { id: itemId, quantity: nextQuantity } : null;
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
