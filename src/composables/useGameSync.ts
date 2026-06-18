import { watch, type ComputedRef, type Ref } from "vue";
import { EventBus } from "../game/EventBus";
import type {
	FarmTreeSave,
	GameClockSave,
	PlayerSave,
} from "./usePlayerData";

type MenuMode = "main" | "pause";

type GameSyncOptions = {
	plotUnlocks: Ref<boolean[]>;
	farmTrees: Ref<FarmTreeSave[]>;
	playerState: Ref<PlayerSave | null>;
	gameClock: Ref<GameClockSave>;
	selectedItemId: ComputedRef<string | null>;
	saveLoaded: Ref<boolean>;
	gameReady: Ref<boolean>;
	pauseMenuOpen: Ref<boolean>;
	menuMode: Ref<MenuMode>;
	setPlayerState: (state: PlayerSave) => void;
	syncMenuAmbience: () => void;
};

export const useGameSync = ({
	plotUnlocks,
	farmTrees,
	playerState,
	gameClock,
	selectedItemId,
	saveLoaded,
	gameReady,
	pauseMenuOpen,
	menuMode,
	setPlayerState,
	syncMenuAmbience,
}: GameSyncOptions) => {
	const syncUnlockedFields = () => {
		const unlockedFields = plotUnlocks.value
			.map((isUnlocked, index) => (isUnlocked ? `field${index + 1}` : null))
			.filter((fieldName): fieldName is string => Boolean(fieldName));
		EventBus.emit("farm:set-unlocked-fields", unlockedFields);
	};

	const syncTreeState = () => {
		EventBus.emit("farm:set-tree-state", farmTrees.value);
	};

	const syncPlayerState = () => {
		if (playerState.value) {
			EventBus.emit("farm:set-player-state", playerState.value);
		}
	};

	const syncGameDay = () => {
		EventBus.emit("farm:day-changed", gameClock.value.day);
	};

	const syncSelectedItem = () => {
		EventBus.emit("farm:set-selected-item", selectedItemId.value);
	};

	const syncLoadedState = () => {
		saveLoaded.value = true;
		syncUnlockedFields();
		syncTreeState();
		syncPlayerState();
		syncGameDay();
		syncSelectedItem();
		syncMenuAmbience();
	};

	const afterSaveImport = () => {
		syncLoadedState();
		pauseMenuOpen.value = false;
		menuMode.value = "pause";
	};

	const handlePlayerStateChanged = (state: PlayerSave) => {
		if (saveLoaded.value) {
			setPlayerState(state);
		}
	};

	const handleGameReady = () => {
		gameReady.value = true;
		syncMenuAmbience();
	};

	const handleCurrentActiveScene = () => {
		handleGameReady();
		syncUnlockedFields();
		syncTreeState();
		syncGameDay();
		syncSelectedItem();
		syncMenuAmbience();
	};

	watch(plotUnlocks, syncUnlockedFields, { deep: true });
	watch(() => gameClock.value.day, syncGameDay);
	watch(selectedItemId, syncSelectedItem);

	return {
		syncUnlockedFields,
		syncTreeState,
		syncPlayerState,
		syncGameDay,
		syncSelectedItem,
		syncLoadedState,
		afterSaveImport,
		handlePlayerStateChanged,
		handleGameReady,
		handleCurrentActiveScene,
	};
};
