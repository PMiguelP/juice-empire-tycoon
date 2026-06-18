import { ref, watch, type ComputedRef } from "vue";

export const useOverlayState = (currentMapKey: ComputedRef<string>) => {
	const mainMenuOpen = ref(true);
	const menuOpen = ref(false);
	const pauseMenuOpen = ref(false);
	const menuMode = ref<"main" | "pause">("pause");
	const farmMenuOpen = ref(false);
	const inventoryMenuOpen = ref(false);
	const barnChestOpen = ref(false);
	const shopMenuOpen = ref(false);
	const sellMenuOpen = ref(false);
	const juiceMenuOpen = ref(false);
	const contractsMenuOpen = ref(false);
	const waterMinigameOpen = ref(false);
	const sulfateMinigameOpen = ref(false);
	const selectedBackpackIndex = ref<number | null>(null);

	const closeMenu = () => {
		pauseMenuOpen.value = false;
		if (menuMode.value === "main") {
			menuMode.value = "pause";
		}
	};

	const closeContextMenus = () => {
		menuOpen.value = false;
		pauseMenuOpen.value = false;
		farmMenuOpen.value = false;
		inventoryMenuOpen.value = false;
		barnChestOpen.value = false;
		shopMenuOpen.value = false;
		sellMenuOpen.value = false;
		juiceMenuOpen.value = false;
		contractsMenuOpen.value = false;
		waterMinigameOpen.value = false;
		sulfateMinigameOpen.value = false;
		selectedBackpackIndex.value = null;
	};

	const openFarmMenu = () => {
		if (currentMapKey.value !== "camera") {
			return;
		}
		closeContextMenus();
		farmMenuOpen.value = true;
	};

	const openShopMenu = () => {
		if (currentMapKey.value !== "mercadocompra") {
			return;
		}
		closeContextMenus();
		shopMenuOpen.value = true;
	};

	const openSellMenu = () => {
		if (currentMapKey.value !== "mercadovenda") {
			return;
		}
		closeContextMenus();
		sellMenuOpen.value = true;
	};

	const openJuiceMenu = () => {
		if (currentMapKey.value !== "centrifugadora") {
			return;
		}
		closeContextMenus();
		juiceMenuOpen.value = true;
	};

	const openBarnChest = () => {
		if (currentMapKey.value !== "barn") {
			return;
		}
		closeContextMenus();
		barnChestOpen.value = true;
	};

	const openContractsMenu = () => {
		if (currentMapKey.value !== "camera") {
			return;
		}
		closeContextMenus();
		contractsMenuOpen.value = true;
	};

	watch(currentMapKey, (mapKey) => {
		if (mapKey !== "camera") {
			farmMenuOpen.value = false;
		}
		if (mapKey !== "barn") {
			barnChestOpen.value = false;
		}
		if (mapKey !== "mercadocompra") {
			shopMenuOpen.value = false;
		}
		if (mapKey !== "mercadovenda") {
			sellMenuOpen.value = false;
		}
		if (mapKey !== "centrifugadora") {
			juiceMenuOpen.value = false;
		}
		if (mapKey !== "camera") {
			contractsMenuOpen.value = false;
		}
	});

	return {
		mainMenuOpen,
		menuOpen,
		pauseMenuOpen,
		menuMode,
		farmMenuOpen,
		inventoryMenuOpen,
		barnChestOpen,
		shopMenuOpen,
		sellMenuOpen,
		juiceMenuOpen,
		contractsMenuOpen,
		waterMinigameOpen,
		sulfateMinigameOpen,
		selectedBackpackIndex,
		closeMenu,
		closeContextMenus,
		openFarmMenu,
		openShopMenu,
		openSellMenu,
		openJuiceMenu,
		openBarnChest,
		openContractsMenu,
	};
};
