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

	const contextualMenus = {
		farm: { open: farmMenuOpen, mapKey: "camera" },
		contracts: { open: contractsMenuOpen, mapKey: "camera" },
		barnChest: { open: barnChestOpen, mapKey: "barn" },
		shop: { open: shopMenuOpen, mapKey: "mercadocompra" },
		sell: { open: sellMenuOpen, mapKey: "mercadovenda" },
		juice: { open: juiceMenuOpen, mapKey: "centrifugadora" },
	};
	const allContextMenus = [
		menuOpen,
		pauseMenuOpen,
		farmMenuOpen,
		inventoryMenuOpen,
		barnChestOpen,
		shopMenuOpen,
		sellMenuOpen,
		juiceMenuOpen,
		contractsMenuOpen,
		waterMinigameOpen,
		sulfateMinigameOpen,
	];

	const closeMenu = () => {
		pauseMenuOpen.value = false;
		if (menuMode.value === "main") {
			menuMode.value = "pause";
		}
	};

	const closeContextMenus = () => {
		for (const overlay of allContextMenus) {
			overlay.value = false;
		}
		selectedBackpackIndex.value = null;
	};

	const openContextMenu = (key: keyof typeof contextualMenus) => {
		const menu = contextualMenus[key];
		if (currentMapKey.value !== menu.mapKey) {
			return;
		}
		closeContextMenus();
		menu.open.value = true;
	};

	const openFarmMenu = () => openContextMenu("farm");
	const openShopMenu = () => openContextMenu("shop");
	const openSellMenu = () => openContextMenu("sell");
	const openJuiceMenu = () => openContextMenu("juice");
	const openBarnChest = () => openContextMenu("barnChest");
	const openContractsMenu = () => openContextMenu("contracts");

	watch(currentMapKey, (mapKey) => {
		for (const menu of Object.values(contextualMenus)) {
			if (mapKey !== menu.mapKey) {
				menu.open.value = false;
			}
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
