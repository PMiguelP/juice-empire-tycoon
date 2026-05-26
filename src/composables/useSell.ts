import type { Ref } from "vue";

const SELL_PRICE_MAP: Record<string, number> = {
	"seed-bag": 25,
	shovel: 75,
	potion: 35,
	roasta: 5,
	chappir: 25,
};

export const useSell = (
	coins: Ref<number>,
	sellSlots: Ref<Array<string | null>>,
	saveState: () => void,
) => {
	const getSellPrice = (itemId: string | null) => {
		if (!itemId) {
			return 0;
		}
		return SELL_PRICE_MAP[itemId] ?? 5;
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
