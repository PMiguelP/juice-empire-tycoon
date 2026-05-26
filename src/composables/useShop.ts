import type { Ref } from "vue";

export type ShopItem = {
	id: string;
	name: string;
	price: number;
};

const SHOP_ITEMS: ShopItem[] = [
	{ id: "seed-bag", name: "Seed Bag", price: 50 },
	{ id: "shovel", name: "Shovel", price: 150 },
	{ id: "potion", name: "HP Potion", price: 75 },
	{ id: "roasta", name: "Roasta", price: 10 },
	{ id: "chappir", name: "Chappir", price: 50 },
];

export const useShop = (
	coins: Ref<number>,
	backpack: Ref<Array<string | null>>,
	selectedBackpackIndex: Ref<number | null>,
	saveState: () => void,
) => {
	const buyItem = (itemId: string, price: number) => {
		if (coins.value < price) {
			return;
		}

		const preferredIndex = selectedBackpackIndex.value;
		const nextBackpack = backpack.value.slice();
		let targetIndex = -1;

		if (preferredIndex !== null && !nextBackpack[preferredIndex]) {
			targetIndex = preferredIndex;
		} else {
			targetIndex = nextBackpack.findIndex((slot) => !slot);
		}

		if (targetIndex < 0) {
			return;
		}

		coins.value -= price;
		nextBackpack[targetIndex] = itemId;
		backpack.value = nextBackpack;
		saveState();
	};

	return {
		shopItems: SHOP_ITEMS,
		buyItem,
	};
};
