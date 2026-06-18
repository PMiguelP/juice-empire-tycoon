import { onMounted, onUnmounted } from "vue";
import { EventBus } from "../game/EventBus";
import type { InventoryEntry } from "../items";
import type { FarmTreeSave, PlayerSave } from "./usePlayerData";

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

type GameEventHandlers = {
	setLevel: (level: number) => void;
	addLevel: (delta: number) => void;
	addCoins: (delta: number) => void;
	setCoins: (coins: number) => void;
	setInventorySlot: (slotIndex: number, item: InventoryEntry) => void;
	handleGameReady: () => void;
	syncUnlockedFields: () => void;
	syncTreeState: () => void;
	syncGameDay: () => void;
	syncMenuAmbience: () => void;
	setFarmTrees: (trees: FarmTreeSave[]) => void;
	handlePlayerStateChanged: (state: PlayerSave) => void;
	openFarmMenu: () => void;
	openShopMenu: () => void;
	openSellMenu: () => void;
	openJuiceMenu: () => void;
	openBarnChest: () => void;
	openContractsMenu: () => void;
	openWaterMinigame: () => void;
	handlePointerPlantRequest: (payload: PointerPlantPayload) => void;
	loadInitialState: () => void | Promise<void>;
};

export const useGameEvents = (handlers: GameEventHandlers) => {
	const treeStateHandler = handlers.setFarmTrees as (trees: FarmTreeSave[]) => void;

	const register = () => {
		EventBus.on("hud:set-level", handlers.setLevel);
		EventBus.on("hud:add-level", handlers.addLevel);
		EventBus.on("hud:add-coins", handlers.addCoins);
		EventBus.on("hud:set-coins", handlers.setCoins);
		EventBus.on("hud:set-slot", handlers.setInventorySlot);
		EventBus.on("current-scene-ready", handlers.handleGameReady);
		EventBus.on("current-scene-ready", handlers.syncUnlockedFields);
		EventBus.on("current-scene-ready", handlers.syncTreeState);
		EventBus.on("current-scene-ready", handlers.syncGameDay);
		EventBus.on("current-scene-ready", handlers.syncMenuAmbience);
		EventBus.on("farm:trees-changed", treeStateHandler);
		EventBus.on("farm:player-state-changed", handlers.handlePlayerStateChanged);
		EventBus.on("ui:open-farm", handlers.openFarmMenu);
		EventBus.on("ui:open-shop", handlers.openShopMenu);
		EventBus.on("ui:open-sell", handlers.openSellMenu);
		EventBus.on("ui:open-juice", handlers.openJuiceMenu);
		EventBus.on("ui:open-barn-chest", handlers.openBarnChest);
		EventBus.on("ui:open-contracts", handlers.openContractsMenu);
		EventBus.on("ui:open-water", handlers.openWaterMinigame);
		EventBus.on("ui:plant-at-pointer", handlers.handlePointerPlantRequest);
	};

	const unregister = () => {
		EventBus.off("hud:set-level", handlers.setLevel);
		EventBus.off("hud:add-level", handlers.addLevel);
		EventBus.off("hud:add-coins", handlers.addCoins);
		EventBus.off("hud:set-coins", handlers.setCoins);
		EventBus.off("hud:set-slot", handlers.setInventorySlot);
		EventBus.off("current-scene-ready", handlers.handleGameReady);
		EventBus.off("current-scene-ready", handlers.syncUnlockedFields);
		EventBus.off("current-scene-ready", handlers.syncTreeState);
		EventBus.off("current-scene-ready", handlers.syncGameDay);
		EventBus.off("current-scene-ready", handlers.syncMenuAmbience);
		EventBus.off("farm:trees-changed", treeStateHandler);
		EventBus.off("farm:player-state-changed", handlers.handlePlayerStateChanged);
		EventBus.off("ui:open-farm", handlers.openFarmMenu);
		EventBus.off("ui:open-shop", handlers.openShopMenu);
		EventBus.off("ui:open-sell", handlers.openSellMenu);
		EventBus.off("ui:open-juice", handlers.openJuiceMenu);
		EventBus.off("ui:open-barn-chest", handlers.openBarnChest);
		EventBus.off("ui:open-contracts", handlers.openContractsMenu);
		EventBus.off("ui:open-water", handlers.openWaterMinigame);
		EventBus.off("ui:plant-at-pointer", handlers.handlePointerPlantRequest);
	};

	onMounted(() => {
		register();
		void handlers.loadInitialState();
	});

	onUnmounted(unregister);

	return {
		register,
		unregister,
	};
};
