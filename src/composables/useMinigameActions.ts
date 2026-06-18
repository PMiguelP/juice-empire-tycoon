import { computed, type ComputedRef, type Ref } from "vue";
import type {
	SprayerChargeSave,
	SulfateItemId,
	SulfateQuality,
} from "./usePlayerData";
import type { useInventory } from "./useInventory";

type InventoryApi = ReturnType<typeof useInventory>;

type MinigameText = {
	radial: {
		errors: {
			needsSulfate: string;
		};
	};
	toasts: {
		waterReady: (quantity: number) => string;
		waterFailed: string;
		sulfateReady: string;
		sulfateFailed: string;
	};
};

type MinigameActionOptions = {
	waterMinigameOpen: Ref<boolean>;
	sulfateMinigameOpen: Ref<boolean>;
	selectedItemId: ComputedRef<string | null>;
	inventoryIndex: Ref<number>;
	inventory: InventoryApi;
	setSprayerCharge: (charge: SprayerChargeSave | null) => void;
	fillSelectedContainer: (quantity: number) => void;
	closeContextMenus: () => void;
	playSound: (key: string, volume?: number) => void;
	showToast: (message: string) => void;
	text: ComputedRef<MinigameText>;
};

export const useMinigameActions = ({
	waterMinigameOpen,
	sulfateMinigameOpen,
	selectedItemId,
	inventoryIndex,
	inventory,
	setSprayerCharge,
	fillSelectedContainer,
	closeContextMenus,
	playSound,
	showToast,
	text,
}: MinigameActionOptions) => {
	const selectedSulfateId = computed(() => {
		return selectedItemId.value?.startsWith("sulfate")
			? (selectedItemId.value as SulfateItemId)
			: "sulfate-basic";
	});

	const showSulfateMissing = () => {
		playSound("error", 0.22);
		showToast(text.value.radial.errors.needsSulfate);
	};

	const requestSulfateMixer = () => {
		if (!selectedItemId.value?.startsWith("sulfate")) {
			showSulfateMissing();
			return;
		}
		closeContextMenus();
		sulfateMinigameOpen.value = true;
	};

	const closeWaterMinigame = () => {
		waterMinigameOpen.value = false;
	};

	const closeSulfateMinigame = () => {
		sulfateMinigameOpen.value = false;
	};

	const handleWaterMinigameSuccess = (quantity: number) => {
		fillSelectedContainer(quantity);
		playSound("water-fill", 0.38);
		showToast(text.value.toasts.waterReady(quantity));
		closeWaterMinigame();
	};

	const handleWaterMinigameFail = () => {
		playSound("error", 0.22);
		showToast(text.value.toasts.waterFailed);
		closeWaterMinigame();
	};

	const handleSulfateMinigameSuccess = (quality: SulfateQuality) => {
		if (!selectedItemId.value?.startsWith("sulfate")) {
			showSulfateMissing();
			closeSulfateMinigame();
			return;
		}
		const sulfateId = selectedItemId.value as SulfateItemId;
		if (!inventory.removeFromSlot("quickbar", inventoryIndex.value, 1, false)) {
			showSulfateMissing();
			closeSulfateMinigame();
			return;
		}
		setSprayerCharge({ quality, sulfateId });
		playSound("sulfate", 0.24);
		showToast(text.value.toasts.sulfateReady);
		closeSulfateMinigame();
	};

	const handleSulfateMinigameFail = () => {
		setSprayerCharge(null);
		playSound("error", 0.22);
		showToast(text.value.toasts.sulfateFailed);
		closeSulfateMinigame();
	};

	return {
		selectedSulfateId,
		requestSulfateMixer,
		closeWaterMinigame,
		closeSulfateMinigame,
		handleWaterMinigameSuccess,
		handleWaterMinigameFail,
		handleSulfateMinigameSuccess,
		handleSulfateMinigameFail,
	};
};
