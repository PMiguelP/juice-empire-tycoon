import type { ComputedRef, Ref } from "vue";
import { EventBus } from "../game/EventBus";
import type { useInventory } from "./useInventory";

type InventoryApi = ReturnType<typeof useInventory>;

type PointerPlantPayload = {
	seedId: string;
	target: {
		tileX: number;
		tileY: number;
		worldX: number;
		worldY: number;
		fieldName: string;
	};
};

type PointerPlantMessages = {
	needsSeed: string;
	plantSpace: string;
};

type PointerPlantingOptions = {
	selectedItemId: ComputedRef<string | null>;
	inventoryIndex: Ref<number>;
	inventory: InventoryApi;
	messages: ComputedRef<PointerPlantMessages>;
	playSound: (key: string, volume?: number) => void;
	showToast: (message: string) => void;
	rewardPlant: () => void;
};

export const usePointerPlanting = ({
	selectedItemId,
	inventoryIndex,
	inventory,
	messages,
	playSound,
	showToast,
	rewardPlant,
}: PointerPlantingOptions) => {
	const showWorldError = (message: string) => {
		playSound("error", 0.22);
		EventBus.emit("ui:world-error", message);
		showToast(message);
	};

	const handlePointerPlantRequest = (payload: PointerPlantPayload) => {
		if (selectedItemId.value !== payload.seedId) {
			showWorldError(messages.value.needsSeed);
			return;
		}

		EventBus.emit("farm:plant-request", {
			seedId: payload.seedId,
			target: payload.target,
			onResult: (success: boolean) => {
				if (!success) {
					showWorldError(messages.value.plantSpace);
					return;
				}
				playSound("plant", 0.34);
				inventory.removeFromSlot("quickbar", inventoryIndex.value, 1);
				rewardPlant();
			},
		});
	};

	return {
		handlePointerPlantRequest,
	};
};
