import type { Ref } from "vue";

type MenuMode = "main" | "pause";

type InputManagerOptions = {
	mainMenuOpen?: Ref<boolean>;
	menuOpen: Ref<boolean>;
	pauseMenuOpen: Ref<boolean>;
	menuMode: Ref<MenuMode>;
	farmMenuOpen: Ref<boolean>;
	inventoryMenuOpen: Ref<boolean>;
	shopMenuOpen: Ref<boolean>;
	sellMenuOpen: Ref<boolean>;
	juiceMenuOpen: Ref<boolean>;
	selectedBackpackIndex: Ref<number | null>;
	inventoryIndex: Ref<number>;
	hasSave: Ref<boolean>;
	saveState: () => void;
	loadState: () => Promise<void>;
	storageKey: string;
};

export const useInputManager = (options: InputManagerOptions) => {
	const handleKey = (event: KeyboardEvent) => {
		if (options.mainMenuOpen?.value) {
			return;
		}

		if (event.code === "KeyE" && !event.repeat) {
			options.menuOpen.value = !options.menuOpen.value;
		}

		if (event.code === "KeyK" && !event.repeat) {
			options.farmMenuOpen.value = !options.farmMenuOpen.value;
			if (options.farmMenuOpen.value) {
				options.menuOpen.value = false;
				options.pauseMenuOpen.value = false;
				options.inventoryMenuOpen.value = false;
				options.shopMenuOpen.value = false;
				options.sellMenuOpen.value = false;
				options.juiceMenuOpen.value = false;
			}
			return;
		}

		if (event.code === "KeyG" && !event.repeat) {
			options.inventoryMenuOpen.value = !options.inventoryMenuOpen.value;
			options.selectedBackpackIndex.value = null;
			if (options.inventoryMenuOpen.value) {
				options.menuOpen.value = false;
				options.pauseMenuOpen.value = false;
				options.farmMenuOpen.value = false;
				options.shopMenuOpen.value = false;
				options.sellMenuOpen.value = false;
				options.juiceMenuOpen.value = false;
			}
			return;
		}

		if (
			(event.code === "KeyL" || event.key?.toLowerCase?.() === "l") &&
			!event.repeat
		) {
			options.shopMenuOpen.value = !options.shopMenuOpen.value;
			options.selectedBackpackIndex.value = null;
			if (options.shopMenuOpen.value) {
				options.menuOpen.value = false;
				options.pauseMenuOpen.value = false;
				options.farmMenuOpen.value = false;
				options.inventoryMenuOpen.value = false;
				options.sellMenuOpen.value = false;
				options.juiceMenuOpen.value = false;
			}
			return;
		}

		if (
			(event.code === "KeyP" ||
				event.key?.toLowerCase?.() === "p" ||
				event.keyCode === 80) &&
			!event.repeat
		) {
			options.sellMenuOpen.value = !options.sellMenuOpen.value;
			options.selectedBackpackIndex.value = null;
			if (options.sellMenuOpen.value) {
				options.menuOpen.value = false;
				options.pauseMenuOpen.value = false;
				options.farmMenuOpen.value = false;
				options.inventoryMenuOpen.value = false;
				options.shopMenuOpen.value = false;
				options.juiceMenuOpen.value = false;
			}
			return;
		}

		if (event.code === "KeyJ" && !event.repeat) {
			options.juiceMenuOpen.value = !options.juiceMenuOpen.value;
			options.selectedBackpackIndex.value = null;
			if (options.juiceMenuOpen.value) {
				options.menuOpen.value = false;
				options.pauseMenuOpen.value = false;
				options.farmMenuOpen.value = false;
				options.inventoryMenuOpen.value = false;
				options.shopMenuOpen.value = false;
				options.sellMenuOpen.value = false;
			}
			return;
		}

		if (event.code === "Escape") {
			if (options.juiceMenuOpen.value) {
				options.juiceMenuOpen.value = false;
				options.selectedBackpackIndex.value = null;
				return;
			}
			if (options.sellMenuOpen.value) {
				options.sellMenuOpen.value = false;
				options.selectedBackpackIndex.value = null;
				return;
			}
			if (options.shopMenuOpen.value) {
				options.shopMenuOpen.value = false;
				options.selectedBackpackIndex.value = null;
				return;
			}
			if (options.inventoryMenuOpen.value) {
				options.inventoryMenuOpen.value = false;
				options.selectedBackpackIndex.value = null;
				return;
			}
			if (options.farmMenuOpen.value) {
				options.farmMenuOpen.value = false;
				return;
			}
			if (options.menuOpen.value) {
				options.menuOpen.value = false;
				return;
			}

			options.menuMode.value = "pause";
			options.pauseMenuOpen.value = !options.pauseMenuOpen.value;
			return;
		}

		if (event.code === "KeyR" && event.shiftKey) {
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
