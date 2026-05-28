import type { Ref } from "vue";
import type { InventoryEntry, InventoryStack } from "../items";
import { getItemId, getItemQuantity } from "../items";

const SELL_PRICE_MAP: Record<string, number> = {
	"seed-bag": 25,
	fertilizer: 18,
	orange: 6,
	pomegranate: 9,
	peach: 8,
	lemon: 5,
	water: 2,
	"empty-bottle": 4,
	"orange-juice": 28,
	"pomegranate-juice": 38,
	"peach-juice": 34,
	"lemon-juice": 26,
	shovel: 75,
	potion: 35,
	roasta: 5,
	chappir: 25,
};

export const useSell = (
	coins: Ref<number>,
	sellSlots: Ref<Array<InventoryStack | null>>,
	saveState: () => void,
) => {
	const getSellPrice = (item: InventoryEntry) => {
		const itemId = getItemId(item);
		if (!itemId) {
			return 0;
		}
		return (SELL_PRICE_MAP[itemId] ?? 5) * getItemQuantity(item);
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
	};

	return {
		getSellPrice,
		sellItems,
	};
};
