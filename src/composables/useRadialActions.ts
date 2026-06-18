import type { ComputedRef, Ref } from "vue";
import { EventBus } from "../game/EventBus";
import type { InventoryEntry } from "../items";
import { getItemId } from "../items";
import type { SprayerChargeSave } from "./usePlayerData";
import type { useInventory } from "./useInventory";
import { isFilledWaterContainer } from "./useWaterContainers";

type InventoryApi = ReturnType<typeof useInventory>;

type RadialMenuItem = {
	label: string;
};

type RadialActionKind =
	| "plant"
	| "water"
	| "harvest"
	| "fertilize"
	| "sulfate";

type RadialActionMessages = {
	needsWater: string;
	waterTree: string;
	harvestTree: string;
	needsFertilizer: string;
	fertilizeTree: string;
	needsSulfate: string;
	needsSprayer: string;
	prepareSulfate: string;
	sulfateTree: string;
	needsSeed: string;
	plantSpace: string;
};

type RadialActionOptions = {
	activeIndex: Ref<number>;
	menuItems: ComputedRef<RadialMenuItem[]>;
	messages: ComputedRef<RadialActionMessages>;
	quickbar: Ref<InventoryEntry[]>;
	quickbarIndex: Ref<number>;
	inventory: InventoryApi;
	sprayerCharge: Ref<SprayerChargeSave | null>;
	setSprayerCharge: (charge: SprayerChargeSave | null) => void;
	emptyWaterContainer: (filledItemId: string) => void;
	onHarvestAccepted?: (fruitId: string, quantity: number) => void;
	onWaterAccepted?: () => void;
	startPointerPlanting?: (seedId: string) => void;
	openSulfateMixer?: () => void;
	notify?: (message: string) => void;
};

const TREE_SEED_IDS = new Set([
	"orange-tree-seed",
	"pomegranate-tree-seed",
	"peach-tree-seed",
	"lemon-tree-seed",
]);

const actionIncludes = (label: string, ...words: string[]) => {
	return words.some((word) => label.includes(word));
};

const getActionKind = (
	index: number,
	label: string,
): RadialActionKind | null => {
	if (index === 0 || actionIncludes(label, "semear", "sow")) {
		return "plant";
	}
	if (index === 1 || actionIncludes(label, "regar", "water")) {
		return "water";
	}
	if (index === 2 || actionIncludes(label, "colher", "harvest")) {
		return "harvest";
	}
	if (index === 3 || actionIncludes(label, "fertilizar", "fertilize")) {
		return "fertilize";
	}
	if (index === 4 || actionIncludes(label, "sulfatar", "sulfate")) {
		return "sulfate";
	}
	return null;
};

export const useRadialActions = ({
	activeIndex,
	menuItems,
	messages,
	quickbar,
	quickbarIndex,
	inventory,
	sprayerCharge,
	setSprayerCharge,
	emptyWaterContainer,
	onHarvestAccepted,
	onWaterAccepted,
	startPointerPlanting,
	openSulfateMixer,
	notify,
}: RadialActionOptions) => {
	const playSound = (key: string, volume = 0.36) => {
		EventBus.emit("audio:play", { key, volume });
	};

	const showError = (message: string) => {
		playSound("error", 0.22);
		EventBus.emit("ui:world-error", message);
		notify?.(message);
	};

	const consumeQuickbarItem = () => {
		inventory.removeFromSlot("quickbar", quickbarIndex.value, 1);
	};

	const handleWaterAction = (selectedItemId: string | null) => {
		if (!isFilledWaterContainer(selectedItemId)) {
			showError(messages.value.needsWater);
			return;
		}

		EventBus.emit("farm:water-request", {
			onResult: (success: boolean) => {
				if (success) {
					playSound("water-tree", 0.34);
					emptyWaterContainer(selectedItemId);
					onWaterAccepted?.();
				} else {
					showError(messages.value.waterTree);
				}
			},
		});
	};

	const handleHarvestAction = (selectedItemId: string | null) => {
		EventBus.emit("farm:harvest-request", {
			hasScissors: selectedItemId === "scissors",
			onHarvest: (fruitId: string, quantity: number) => {
				const accepted = inventory.placeIntoFirstAvailable(
					"backpack",
					fruitId,
					quantity,
				);
				if (accepted) {
					playSound("harvest", 0.34);
					onHarvestAccepted?.(fruitId, quantity);
				}
				return accepted;
			},
			onResult: (success: boolean) => {
				if (!success) {
					showError(messages.value.harvestTree);
				}
			},
		});
	};

	const handleFertilizeAction = (selectedItemId: string | null) => {
		if (!selectedItemId?.startsWith("fertilizer")) {
			showError(messages.value.needsFertilizer);
			return;
		}

		EventBus.emit("farm:fertilize-request", {
			onResult: (success: boolean) => {
				if (success) {
					playSound("fertilize", 0.34);
					consumeQuickbarItem();
				} else {
					showError(messages.value.fertilizeTree);
				}
			},
		});
	};

	const handleSulfateAction = (selectedItemId: string | null) => {
		if (!sprayerCharge.value) {
			if (selectedItemId === "sprayer") {
				showError(messages.value.prepareSulfate);
				return;
			}
			if (!selectedItemId?.startsWith("sulfate")) {
				showError(messages.value.needsSulfate);
				return;
			}
			openSulfateMixer?.();
			return;
		}

		if (selectedItemId !== "sprayer") {
			showError(messages.value.needsSprayer);
			return;
		}

		EventBus.emit("farm:sulfate-request", {
			quality: sprayerCharge.value.quality,
			onResult: (success: boolean) => {
				if (success) {
					playSound("sulfate", 0.34);
					setSprayerCharge(null);
				} else {
					showError(messages.value.sulfateTree);
				}
			},
		});
	};

	const handlePlantAction = (selectedItemId: string | null) => {
		if (!selectedItemId || !TREE_SEED_IDS.has(selectedItemId)) {
			showError(messages.value.needsSeed);
			return;
		}

		startPointerPlanting?.(selectedItemId);
	};

	const activateRadialAction = (index: number) => {
		activeIndex.value = index;
		const actionLabel = menuItems.value[index]?.label.toLowerCase() ?? "";
		const actionKind = getActionKind(index, actionLabel);
		const selectedItem = quickbar.value[quickbarIndex.value] ?? null;
		const selectedItemId = getItemId(selectedItem);

		if (actionKind === "water") {
			handleWaterAction(selectedItemId);
			return;
		}
		if (actionKind === "harvest") {
			handleHarvestAction(selectedItemId);
			return;
		}
		if (actionKind === "fertilize") {
			handleFertilizeAction(selectedItemId);
			return;
		}
		if (actionKind === "sulfate") {
			handleSulfateAction(selectedItemId);
			return;
		}
		if (actionKind === "plant") {
			handlePlantAction(selectedItemId);
		}
	};

	return {
		activateRadialAction,
	};
};
