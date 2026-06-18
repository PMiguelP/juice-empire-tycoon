import type { Ref } from "vue";
import type { useInventory } from "./useInventory";

type InventoryApi = ReturnType<typeof useInventory>;

export const useQuickbarAssignment = (
	selectedBackpackIndex: Ref<number | null>,
	inventoryIndex: Ref<number>,
	inventory: InventoryApi,
	saveState: () => void,
) => {
	const selectBackpackSlot = (index: number) => {
		selectedBackpackIndex.value = index;
	};

	const assignToQuickbar = (slotIndex: number) => {
		if (slotIndex < 0 || slotIndex > 4) {
			return;
		}

		if (selectedBackpackIndex.value === null) {
			inventoryIndex.value = slotIndex;
			saveState();
			return;
		}

		inventory.moveStack(
			"backpack",
			selectedBackpackIndex.value,
			"quickbar",
			slotIndex,
		);
		selectedBackpackIndex.value = null;
	};

	return {
		selectBackpackSlot,
		assignToQuickbar,
	};
};
