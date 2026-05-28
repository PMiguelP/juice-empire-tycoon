import type { Ref } from "vue";
import type { InventoryStack } from "../items";
import { ITEM_CATALOG, SHOP_ITEM_IDS } from "../items";
import { addOneToSlots } from "../items";

export type ShopItem = {
	id: string;
	price: number;
};

const SHOP_ITEMS: ShopItem[] = SHOP_ITEM_IDS.map((id) => ({
	id,
	price: ITEM_CATALOG[id].price,
}));

export const useShop = (
	coins: Ref<number>,
	backpack: Ref<Array<InventoryStack | null>>,
	selectedBackpackIndex: Ref<number | null>,
	saveState: () => void,
) => {
	const buyItem = (itemId: string, price: number) => {
		if (coins.value < price) {
			return;
		}

		const nextBackpack = addOneToSlots(
			backpack.value,
			itemId,
			selectedBackpackIndex.value,
		);
		if (!nextBackpack) {
			return;
		}

		coins.value -= price;
		backpack.value = nextBackpack;
		saveState();
	};

	return {
		shopItems: SHOP_ITEMS,
		buyItem,
	};
};
