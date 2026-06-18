import { computed, ref, type Ref } from "vue";
import { getItemId, type InventoryStack } from "../items";
import type { ContractSave, PlayerSave } from "./usePlayerData";

type SelectionStateOptions = {
	contractOffers: Ref<ContractSave[]>;
	inventory: Ref<Array<InventoryStack | null>>;
	inventoryIndex: Ref<number>;
	playerState: Ref<PlayerSave | null>;
};

export const useAppSelectionState = ({
	contractOffers,
	inventory,
	inventoryIndex,
	playerState,
}: SelectionStateOptions) => {
	const activeIndex = ref(0);
	const selectedPlotIndex = ref(0);
	const selectedContractId = ref<string | null>(null);
	const selectedRecipeIndex = ref(0);
	const pointerPlantSeedId = ref<string | null>(null);

	const currentMapKey = computed(() => playerState.value?.mapKey ?? "mapa");
	const selectedItemId = computed(() =>
		getItemId(inventory.value[inventoryIndex.value]),
	);
	const activePlantSeedId = computed(() => pointerPlantSeedId.value);
	const selectedContract = computed(() => {
		return (
			contractOffers.value.find(
				(contract) => contract.id === selectedContractId.value,
			) ??
			contractOffers.value[0] ??
			null
		);
	});

	const stopPointerPlanting = () => {
		pointerPlantSeedId.value = null;
	};

	const startPointerPlanting = (seedId: string) => {
		pointerPlantSeedId.value = seedId;
	};

	return {
		activeIndex,
		selectedPlotIndex,
		selectedContractId,
		selectedRecipeIndex,
		pointerPlantSeedId,
		currentMapKey,
		selectedItemId,
		activePlantSeedId,
		selectedContract,
		stopPointerPlanting,
		startPointerPlanting,
		setActive: (index: number) => {
			activeIndex.value = index;
		},
		selectPlot: (index: number) => {
			selectedPlotIndex.value = index;
		},
		selectContract: (contractId: string) => {
			selectedContractId.value = contractId;
		},
		selectRecipe: (index: number) => {
			selectedRecipeIndex.value = index;
		},
	};
};
