import { ref } from "vue";
import type { InventoryEntry, InventoryStack } from "../items";
import { normalizeEntry } from "../items";

export type SaveData = {
	saveVersion: number;
	level: number;
	coins: number;
	inventory: InventoryEntry[];
	backpack?: InventoryEntry[];
	juiceSlots?: InventoryEntry[];
	selectedSlot: number;
	plotUnlocks?: boolean[];
};

export const STORAGE_KEY = "juice-save-v1";
const SAVE_VERSION = 4;

const DEFAULT_PLOTS = [
	{ name: "South Field", size: "15 tiles", cost: 0 },
	{ name: "East Field", size: "15 tiles", cost: 200 },
	{ name: "North Field", size: "15 tiles", cost: 200 },
];

export const usePlayerData = () => {
	const level = ref(1);
	const coins = ref(0);
	const inventory = ref<Array<InventoryStack | null>>([null, null, null, null, null]);
	const backpack = ref<Array<InventoryStack | null>>(
		Array.from({ length: 15 }, () => null),
	);
	const inventoryIndex = ref(0);
	const plotUnlocks = ref<boolean[]>([true, false, false]);
	const sellSlots = ref<Array<InventoryStack | null>>(
		Array.from({ length: 6 }, () => null),
	);
	const juiceSlots = ref<Array<InventoryStack | null>>(
		Array.from({ length: 7 }, () => null),
	);
	const hasSave = ref(false);
	const farmPlots = DEFAULT_PLOTS;

	const applySave = (data: SaveData) => {
		level.value = data.level ?? 1;
		coins.value = data.coins ?? 0;
		inventory.value = Array.from({ length: 5 }, (_, index) => {
			return normalizeEntry(data.inventory?.[index] ?? null);
		});
		backpack.value = Array.from({ length: 15 }, (_, index) => {
			return normalizeEntry(data.backpack?.[index] ?? null);
		});
		juiceSlots.value = Array.from({ length: 7 }, (_, index) => {
			return normalizeEntry(data.juiceSlots?.[index] ?? null);
		});
		inventoryIndex.value = Math.min(Math.max(data.selectedSlot ?? 0, 0), 4);
		if (data.plotUnlocks && data.plotUnlocks.length === farmPlots.length) {
			plotUnlocks.value = data.plotUnlocks.slice();
		} else {
			plotUnlocks.value = [true, false, false];
		}
		plotUnlocks.value[0] = true;
	};

	const getSaveData = (): SaveData => {
		return {
			saveVersion: SAVE_VERSION,
			level: level.value,
			coins: coins.value,
			inventory: inventory.value,
			backpack: backpack.value,
			juiceSlots: juiceSlots.value,
			selectedSlot: inventoryIndex.value,
			plotUnlocks: plotUnlocks.value,
		};
	};

	const saveState = () => {
		const data = getSaveData();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		hasSave.value = true;
	};

	const loadState = async () => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			const parsed = JSON.parse(saved) as SaveData;
			if (parsed.saveVersion <= SAVE_VERSION) {
				applySave(parsed);
				hasSave.value = true;
				if (parsed.saveVersion !== SAVE_VERSION) {
					saveState();
				}
				return;
			}
		}

		hasSave.value = false;

		const response = await fetch("/data/save.json");
		if (!response.ok) {
			return;
		}

		const data = (await response.json()) as SaveData;
		applySave(data);
		saveState();
	};

	const setLevel = (nextLevel: number) => {
		level.value = Math.max(1, Math.floor(nextLevel));
		saveState();
	};

	const addCoins = (delta: number) => {
		coins.value = Math.max(0, coins.value + delta);
		saveState();
	};

	const addLevel = (delta: number) => {
		level.value = Math.max(1, level.value + delta);
		saveState();
	};

	const setCoins = (nextCoins: number) => {
		coins.value = Math.max(0, Math.floor(nextCoins));
		saveState();
	};

	const setInventorySlot = (slotIndex: number, item: InventoryEntry) => {
		if (slotIndex < 0 || slotIndex > 4) {
			return;
		}

		const next = inventory.value.slice();
		next[slotIndex] = normalizeEntry(item);
		inventory.value = next;
		saveState();
	};

	const isPlotUnlocked = (index: number) => {
		if (index === 0) {
			return true;
		}
		return Boolean(plotUnlocks.value[index]);
	};

	const unlockPlot = (index: number) => {
		if (isPlotUnlocked(index)) {
			return;
		}

		const plot = farmPlots[index];
		if (coins.value < plot.cost) {
			return;
		}

		coins.value -= plot.cost;
		plotUnlocks.value = plotUnlocks.value.map((value, idx) => {
			return idx === index ? true : value;
		});
		saveState();
	};

	const canUnlockPlot = (index: number) => {
		if (isPlotUnlocked(index)) {
			return false;
		}
		return coins.value >= farmPlots[index].cost;
	};

	return {
		level,
		coins,
		inventory,
		backpack,
		inventoryIndex,
		plotUnlocks,
		sellSlots,
		juiceSlots,
		hasSave,
		farmPlots,
		applySave,
		getSaveData,
		saveState,
		loadState,
		setLevel,
		addCoins,
		addLevel,
		setCoins,
		setInventorySlot,
		isPlotUnlocked,
		unlockPlot,
		canUnlockPlot,
	};
};
