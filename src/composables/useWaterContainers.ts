import type { Ref } from "vue";
import type { InventoryEntry } from "../items";
import { getItemId, getItemQuantity } from "../items";
import type { useInventory } from "./useInventory";

type InventoryApi = ReturnType<typeof useInventory>;

const WATER_CONTAINER_IDS: Record<string, string> = {
	water: "filled-water-jug",
	"watering-can": "filled-watering-can",
};

const EMPTY_WATER_CONTAINER_IDS: Record<string, string> = {
	"filled-water-jug": "water",
	"filled-watering-can": "watering-can",
};

const WATER_CONTAINER_CHARGES: Record<string, number> = {
	water: 1,
	"watering-can": 5,
};

export const isFilledWaterContainer = (
	itemId: string | null | undefined,
): itemId is "filled-water-jug" | "filled-watering-can" => {
	return itemId === "filled-water-jug" || itemId === "filled-watering-can";
};

export const isEmptyWaterContainer = (
	itemId: string | null | undefined,
): itemId is "water" | "watering-can" => {
	return itemId === "water" || itemId === "watering-can";
};

export const useWaterContainers = (
	quickbar: Ref<InventoryEntry[]>,
	quickbarIndex: Ref<number>,
	inventory: InventoryApi,
) => {
	const placeInHandOrBackpack = (itemId: string, quantity: number) => {
		const placedInHand = inventory.placeIntoFirstAvailable(
			"quickbar",
			itemId,
			quantity,
			quickbarIndex.value,
		);
		if (!placedInHand) {
			inventory.placeIntoFirstAvailable("backpack", itemId, quantity);
		}
	};

	const fillSelectedContainer = (quantity: number) => {
		const selectedItem = quickbar.value[quickbarIndex.value] ?? null;
		const selectedItemId = getItemId(selectedItem);
		const filledItemId = selectedItemId ? WATER_CONTAINER_IDS[selectedItemId] : null;
		const chargesPerContainer = selectedItemId
			? WATER_CONTAINER_CHARGES[selectedItemId] ?? 1
			: 1;
		const availableContainers = getItemQuantity(selectedItem);
		const containersToFill = filledItemId ? Math.min(quantity, availableContainers) : 0;
		const filledQuantity = containersToFill * chargesPerContainer;

		if (filledItemId && filledQuantity > 0) {
			inventory.removeFromSlot("quickbar", quickbarIndex.value, containersToFill);
			placeInHandOrBackpack(filledItemId, filledQuantity);
			return;
		}

		inventory.placeIntoFirstAvailable("backpack", "filled-water-jug", quantity);
	};

	const emptySelectedContainer = (filledItemId: string) => {
		const emptyItemId = EMPTY_WATER_CONTAINER_IDS[filledItemId];
		const selectedItem = quickbar.value[quickbarIndex.value] ?? null;
		const remainingUses = Math.max(0, getItemQuantity(selectedItem) - 1);
		inventory.removeFromSlot("quickbar", quickbarIndex.value, 1);

		if (!emptyItemId || (filledItemId === "filled-watering-can" && remainingUses > 0)) {
			return;
		}

		placeInHandOrBackpack(emptyItemId, 1);
	};

	return {
		fillSelectedContainer,
		emptySelectedContainer,
	};
};
