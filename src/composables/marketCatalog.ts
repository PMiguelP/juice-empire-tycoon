import { ITEM_CATALOG, SHOP_ITEM_IDS } from "../items";

export type ShopItem = {
	id: string;
	price: number;
	unlockLevel?: number;
	locked?: boolean;
};

export const SHOP_ITEMS: ShopItem[] = SHOP_ITEM_IDS.map((id) => ({
	id,
	price: ITEM_CATALOG[id].price,
}));

export const SHOP_UNLOCK_LEVELS: Record<string, number> = {
	"fertilizer-growth": 2,
	"sulfate-strong": 2,
	"fertilizer-premium": 4,
	"sulfate-premium": 4,
};

export const SELL_PRICES: Record<string, number> = {
	"seed-bag": 25,
	fertilizer: 18,
	"orange-tree-seed": 14,
	"pomegranate-tree-seed": 18,
	"peach-tree-seed": 16,
	"lemon-tree-seed": 12,
	"fertilizer-basic": 9,
	"fertilizer-growth": 21,
	"fertilizer-premium": 39,
	"sulfate-basic": 8,
	"sulfate-strong": 19,
	"sulfate-premium": 36,
	orange: 6,
	pomegranate: 9,
	peach: 8,
	lemon: 5,
	water: 2,
	"filled-water-jug": 2,
	"empty-bottle": 4,
	"orange-juice": 28,
	"pomegranate-juice": 38,
	"peach-juice": 34,
	"lemon-juice": 26,
	shovel: 75,
	scissors: 48,
	"watering-can": 60,
	"filled-watering-can": 60,
	sprayer: 68,
	potion: 35,
	roasta: 5,
	chappir: 25,
};

export const getShopUnlockLevel = (itemId: string) => {
	return SHOP_UNLOCK_LEVELS[itemId] ?? 1;
};

export const getShopUnlocksForLevel = (level: number) => {
	return SHOP_ITEMS.filter((item) => getShopUnlockLevel(item.id) === level);
};

export const getShopUnlocksBetweenLevels = (
	previousLevel: number,
	nextLevel: number,
) => {
	return SHOP_ITEMS.filter((item) => {
		const unlockLevel = getShopUnlockLevel(item.id);
		return unlockLevel > previousLevel && unlockLevel <= nextLevel;
	});
};
