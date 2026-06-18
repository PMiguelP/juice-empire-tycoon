import { computed, type Ref } from "vue";
import type { InventoryEntry, InventoryStack } from "../items";
import { getItemId, getItemQuantity, ITEM_CATALOG } from "../items";
import type { SlotKind, useInventory } from "./useInventory";
import { EventBus } from "../game/EventBus";
import { getShopUnlockLevel, SELL_PRICES, SHOP_ITEMS } from "./marketCatalog";
export {
	getShopUnlockLevel,
	getShopUnlocksBetweenLevels,
	getShopUnlocksForLevel,
	SELL_PRICES,
	SHOP_ITEMS,
} from "./marketCatalog";

type InventoryApi = ReturnType<typeof useInventory>;

export const useMarket = (
	level: Ref<number>,
	coins: Ref<number>,
	sellSlots: Ref<Array<InventoryStack | null>>,
	inventory: InventoryApi,
	selectedBackpackIndex: Ref<number | null>,
	saveState: () => void,
) => {
	const playMarketSound = (key: "buy" | "error", volume: number) => {
		EventBus.emit("audio:play", { key, volume });
	};

	const playMarketError = () => {
		playMarketSound("error", 0.22);
	};

	const normalizeQuantity = (quantity: number) => {
		return Math.max(1, Math.floor(quantity));
	};

	const shopItems = computed(() => {
		return SHOP_ITEMS.map((item) => {
			const unlockLevel = getShopUnlockLevel(item.id);
			return {
				...item,
				unlockLevel,
				locked: unlockLevel > level.value,
			};
		});
	});

	const canBuyItem = (itemId: string) => {
		return getShopUnlockLevel(itemId) <= level.value;
	};

	const getSellPrice = (item: InventoryEntry) => {
		const itemId = getItemId(item);
		if (!itemId) {
			return 0;
		}
		return (SELL_PRICES[itemId] ?? 5) * getItemQuantity(item);
	};

	const buyWithPlacement = (
		itemId: string,
		quantity: number,
		placeItem: (amount: number) => boolean,
	) => {
		const amount = normalizeQuantity(quantity);
		const price = ITEM_CATALOG[itemId]?.price ?? 0;

		if (!canBuyItem(itemId) || coins.value < price * amount) {
			playMarketError();
			return false;
		}

		if (!placeItem(amount)) {
			playMarketError();
			return false;
		}

		coins.value -= price * amount;
		saveState();
		playMarketSound("buy", 0.36);
		return true;
	};

	const buyIntoSlot = (
		kind: SlotKind,
		index: number,
		itemId: string,
		quantity = 1,
	) => {
		return buyWithPlacement(itemId, quantity, (amount) =>
			inventory.placeIntoSlot(kind, index, itemId, amount, false),
		);
	};

	const buyItem = (itemId: string, _price?: number, quantity = 1) => {
		return buyWithPlacement(itemId, quantity, (amount) =>
			inventory.placeIntoFirstAvailable(
				"backpack",
				itemId,
				amount,
				selectedBackpackIndex.value,
				false,
			),
		);
	};

	const stageSellItem = (
		kind: "backpack" | "quickbar",
		index: number,
		quantity: number,
	) => {
		const sourceEntry = inventory.getSlots(kind)[index];
		const itemId = getItemId(sourceEntry);
		if (!itemId) {
			return false;
		}
		const amount = Math.min(
			normalizeQuantity(quantity),
			getItemQuantity(sourceEntry),
		);
		const sellSlots = inventory.getSlots("sell");
		for (let sellIndex = 0; sellIndex < sellSlots.length; sellIndex += 1) {
			const slotId = getItemId(sellSlots[sellIndex]);
			if (
				(!slotId || slotId === itemId) &&
				inventory.moveStack(kind, index, "sell", sellIndex, amount)
			) {
				return true;
			}
		}
		return false;
	};

	const clearSellBench = () => {
		let changed = false;
		for (let index = 0; index < sellSlots.value.length; index += 1) {
			const item = sellSlots.value[index];
			const itemId = getItemId(item);
			if (!itemId) {
				continue;
			}
			if (
				inventory.placeIntoFirstAvailable(
					"backpack",
					itemId,
					getItemQuantity(item),
				)
			) {
				const nextSellSlots = sellSlots.value.slice();
				nextSellSlots[index] = null;
				sellSlots.value = nextSellSlots;
				changed = true;
			}
		}
		if (changed) {
			saveState();
		}
	};

	const sellItems = () => {
		let total = 0;
		const next = sellSlots.value.map((item) => {
			total += getSellPrice(item);
			return null;
		});
		if (total <= 0) {
			return;
		}
		coins.value += total;
		sellSlots.value = next;
		saveState();
		playMarketSound("buy", 0.32);
	};

	return {
		shopItems,
		getSellPrice,
		sellItems,
		buyItem,
		buyIntoSlot,
		stageSellItem,
		clearSellBench,
	};
};
