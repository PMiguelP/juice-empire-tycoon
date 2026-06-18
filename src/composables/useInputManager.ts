import type { Ref } from "vue";

type MenuMode = "main" | "pause";
type OverlayKey =
	| "farm"
	| "inventory"
	| "barnChest"
	| "shop"
	| "sell"
	| "juice"
	| "contracts"
	| "water"
	| "sulfate";

type InputManagerOptions = {
	enabled?: Ref<boolean>;
	mainMenuOpen?: Ref<boolean>;
	menuOpen: Ref<boolean>;
	pauseMenuOpen: Ref<boolean>;
	menuMode: Ref<MenuMode>;
	farmMenuOpen: Ref<boolean>;
	inventoryMenuOpen: Ref<boolean>;
	barnChestOpen: Ref<boolean>;
	shopMenuOpen: Ref<boolean>;
	sellMenuOpen: Ref<boolean>;
	juiceMenuOpen: Ref<boolean>;
	contractsMenuOpen: Ref<boolean>;
	waterMinigameOpen: Ref<boolean>;
	sulfateMinigameOpen: Ref<boolean>;
	selectedBackpackIndex: Ref<number | null>;
	inventoryIndex: Ref<number>;
	hasSave: Ref<boolean>;
	saveState: () => void;
	loadState: () => Promise<void>;
	storageKey: string;
	activateRadialAction?: () => void;
	openSulfateMixer?: () => void;
	currentMapKey?: Ref<string>;
	pointerPlantSeedId?: Ref<string | null>;
	cancelPointerPlanting?: () => void;
};

const ESCAPE_CLOSE_ORDER: OverlayKey[] = [
	"sulfate",
	"water",
	"juice",
	"sell",
	"shop",
	"contracts",
	"inventory",
	"barnChest",
	"farm",
];

const SELECTION_OVERLAYS = new Set<OverlayKey>([
	"inventory",
	"barnChest",
	"shop",
	"sell",
	"juice",
]);

export const useInputManager = (options: InputManagerOptions) => {
	const overlays: Record<OverlayKey, Ref<boolean>> = {
		farm: options.farmMenuOpen,
		inventory: options.inventoryMenuOpen,
		barnChest: options.barnChestOpen,
		shop: options.shopMenuOpen,
		sell: options.sellMenuOpen,
		juice: options.juiceMenuOpen,
		contracts: options.contractsMenuOpen,
		water: options.waterMinigameOpen,
		sulfate: options.sulfateMinigameOpen,
	};

	const closeGameplayOverlays = (except?: OverlayKey) => {
		options.menuOpen.value = false;
		options.pauseMenuOpen.value = false;

		for (const [key, overlay] of Object.entries(overlays) as Array<
			[OverlayKey, Ref<boolean>]
		>) {
			if (key !== except) {
				overlay.value = false;
			}
		}
	};

	const toggleOverlay = (key: OverlayKey, clearSelection = false) => {
		const overlay = overlays[key];
		overlay.value = !overlay.value;

		if (clearSelection) {
			options.selectedBackpackIndex.value = null;
		}

		if (overlay.value) {
			closeGameplayOverlays(key);
		}
	};

	const closeFirstOpenOverlay = () => {
		for (const key of ESCAPE_CLOSE_ORDER) {
			if (!overlays[key].value) {
				continue;
			}

			overlays[key].value = false;
			if (SELECTION_OVERLAYS.has(key)) {
				options.selectedBackpackIndex.value = null;
			}
			return true;
		}

		if (options.menuOpen.value) {
			options.menuOpen.value = false;
			return true;
		}

		return false;
	};

	const handleKey = (event: KeyboardEvent) => {
		const pressedKey =
			typeof event.key === "string" ? event.key.toLowerCase() : "";
		const isKey = (code: string, key: string, keyCode: number) => {
			return event.code === code || pressedKey === key || event.keyCode === keyCode;
		};
		const canOpenInMap = (mapKey: string) => {
			return !options.currentMapKey || options.currentMapKey.value === mapKey;
		};

		if (options.enabled && !options.enabled.value) {
			return;
		}

		if (options.mainMenuOpen?.value) {
			return;
		}

		if (isKey("KeyE", "e", 69) && !event.repeat) {
			if (options.waterMinigameOpen.value || options.sulfateMinigameOpen.value) {
				return;
			}
			if (options.menuOpen.value) {
				options.activateRadialAction?.();
				options.menuOpen.value = false;
				return;
			}
			options.cancelPointerPlanting?.();
			closeGameplayOverlays();
			options.menuOpen.value = !options.menuOpen.value;
			return;
		}

		if (isKey("KeyK", "k", 75) && !event.repeat) {
			if (!canOpenInMap("camera")) {
				return;
			}
			toggleOverlay("farm");
			return;
		}

		if (isKey("KeyG", "g", 71) && !event.repeat) {
			toggleOverlay("inventory", true);
			return;
		}

		if (
			isKey("KeyL", "l", 76) &&
			!event.repeat
		) {
			if (!canOpenInMap("mercadocompra")) {
				return;
			}
			toggleOverlay("shop", true);
			return;
		}

		if (
			isKey("KeyP", "p", 80) &&
			!event.repeat
		) {
			if (!canOpenInMap("mercadovenda")) {
				return;
			}
			toggleOverlay("sell", true);
			return;
		}

		if (isKey("KeyJ", "j", 74) && !event.repeat) {
			if (!canOpenInMap("centrifugadora")) {
				return;
			}
			toggleOverlay("juice", true);
			return;
		}

		if (isKey("KeyN", "n", 78) && !event.repeat) {
			event.preventDefault();
			event.stopPropagation();
			toggleOverlay("water");
			return;
		}

		if (isKey("KeyM", "m", 77) && !event.repeat) {
			event.preventDefault();
			event.stopPropagation();
			options.openSulfateMixer?.();
			return;
		}

		if (event.code === "Escape") {
			if (options.pointerPlantSeedId?.value) {
				options.cancelPointerPlanting?.();
				return;
			}

			if (closeFirstOpenOverlay()) {
				return;
			}

			options.menuMode.value = "pause";
			options.pauseMenuOpen.value = !options.pauseMenuOpen.value;
			return;
		}

		if (isKey("KeyR", "r", 82) && event.shiftKey) {
			localStorage.removeItem(options.storageKey);
			options.hasSave.value = false;
			void options.loadState();
			return;
		}

		if (event.code.startsWith("Digit")) {
			const keyValue = Number(event.code.replace("Digit", ""));
			if (keyValue >= 1 && keyValue <= 5) {
				options.inventoryIndex.value = keyValue - 1;
				options.saveState();
			}
		}
	};

	const attach = () => {
		window.addEventListener("keydown", handleKey, { capture: true });
	};

	const detach = () => {
		window.removeEventListener("keydown", handleKey, { capture: true });
	};

	return {
		handleKey,
		attach,
		detach,
	};
};
