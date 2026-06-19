import type { InventoryEntry } from "../../items";
import { normalizeEntry } from "../../items";
import { SAVE_VERSION, STARTING_COINS } from "./constants";
import type { SaveData } from "./types";

export const getCoinsFromSave = (data: SaveData) => {
	const savedCoins = Math.max(0, Math.floor(data.coins ?? STARTING_COINS));
	const savedLevel = data.level ?? 1;
	const savedXp = Math.max(0, Math.floor(data.xp ?? 0));
	const isOldEmptyStart =
		(data.saveVersion ?? 0) < SAVE_VERSION &&
		savedLevel === 1 &&
		savedXp === 0 &&
		savedCoins === 0;

	return isOldEmptyStart ? STARTING_COINS : savedCoins;
};

export const normalizeInventorySlots = (
	items: InventoryEntry[] | undefined,
	length: number,
) => {
	return Array.from({ length }, (_, index) => {
		return normalizeEntry(items?.[index] ?? null);
	});
};

export const normalizePlotUnlocks = (
	plotUnlocks: boolean[] | undefined,
	plotCount: number,
) => {
	const unlocks =
		plotUnlocks && plotUnlocks.length === plotCount
			? plotUnlocks.slice()
			: [true, false, false, false];
	unlocks[0] = true;
	return unlocks;
};
