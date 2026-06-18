import { computed, ref } from "vue";
import type { InventoryEntry, InventoryStack } from "../items";
import { normalizeEntry } from "../items";
import {
	DAY_START_MINUTE,
	DEFAULT_PLOTS,
	SAVE_VERSION,
	STARTING_COINS,
	STORAGE_KEY,
} from "./playerData/constants";
import {
	acceptContractOffer,
	advanceClock,
	getContractsFromSave,
	recordContractHarvest,
} from "./playerData/contracts";
import {
	createContractOffersForDay,
	getXpForNextLevel,
	normalizeClock,
	normalizeJuiceSlots,
} from "./playerData/normalizers";
import { applyXpGain, getLevelProgress } from "./playerData/progress";
import {
	getCoinsFromSave,
	normalizeInventorySlots,
	normalizePlotUnlocks,
} from "./playerData/saveNormalizers";
import { normalizeSprayerCharge } from "./playerData/sprayer";
import type {
	ContractSave,
	FarmTreeSave,
	GameClockSave,
	PlayerSave,
	SaveData,
	SprayerChargeSave,
} from "./playerData/types";

export type {
	ContractSave,
	FarmTreeSave,
	GameClockSave,
	PlayerSave,
	SaveData,
	SprayerChargeSave,
	SulfateItemId,
	SulfateQuality,
} from "./playerData/types";
export {
	HARVEST_XP_REWARD,
	JUICE_XP_REWARD,
	PLANT_XP_REWARD,
	SPRAYER_CHARGE_USES,
	STORAGE_KEY,
	WATER_XP_REWARD,
} from "./playerData/constants";

export const usePlayerData = () => {
	const level = ref(1);
	const xp = ref(0);
	const coins = ref(STARTING_COINS);
	const completedContracts = ref(0);
	const missedContracts = ref(0);
	const inventory = ref<Array<InventoryStack | null>>([null, null, null, null, null]);
	const backpack = ref<Array<InventoryStack | null>>(
		Array.from({ length: 15 }, () => null),
	);
	const barnStorage = ref<Array<InventoryStack | null>>(
		Array.from({ length: 18 }, () => null),
	);
	const inventoryIndex = ref(0);
	const plotUnlocks = ref<boolean[]>([true, false, false, false]);
	const sellSlots = ref<Array<InventoryStack | null>>(
		Array.from({ length: 6 }, () => null),
	);
	const juiceSlots = ref<Array<InventoryStack | null>>(
		Array.from({ length: 3 }, () => null),
	);
	const farmTrees = ref<FarmTreeSave[]>([]);
	const playerState = ref<PlayerSave | null>(null);
	const gameClock = ref<GameClockSave>({ day: 1, minute: DAY_START_MINUTE });
	const contractOffers = ref<ContractSave[]>(createContractOffersForDay(1));
	const activeContract = ref<ContractSave | null>(null);
	const sprayerCharge = ref<SprayerChargeSave | null>(null);
	const hasSave = ref(false);
	const hasExistingSave = ref(false);
	const farmPlots = DEFAULT_PLOTS;
	const xpForNextLevel = computed(() => getXpForNextLevel(level.value));
	const levelProgress = computed(() => getLevelProgress(xp.value, level.value));

	const applySave = (data: SaveData) => {
		level.value = data.level ?? 1;
		xp.value = Math.max(0, Math.floor(data.xp ?? 0));
		coins.value = getCoinsFromSave(data);
		completedContracts.value = Math.max(0, Math.floor(data.completedContracts ?? 0));
		missedContracts.value = Math.max(0, Math.floor(data.missedContracts ?? 0));
		inventory.value = normalizeInventorySlots(data.inventory, 5);
		backpack.value = normalizeInventorySlots(data.backpack, 15);
		barnStorage.value = normalizeInventorySlots(data.barnStorage, 18);
		sellSlots.value = normalizeInventorySlots(data.sellSlots, 6);
		juiceSlots.value = normalizeJuiceSlots(data.juiceSlots);
		inventoryIndex.value = Math.min(Math.max(data.selectedSlot ?? 0, 0), 4);
		plotUnlocks.value = normalizePlotUnlocks(data.plotUnlocks, farmPlots.length);
		farmTrees.value = Array.isArray(data.farmTrees)
			? data.farmTrees.map((tree) => ({ ...tree }))
			: [];
		playerState.value = data.playerState ? { ...data.playerState } : null;
		gameClock.value = normalizeClock(data.gameClock);
		const contracts = getContractsFromSave(
			data.saveVersion,
			data.contractOffers,
			data.activeContract,
			gameClock.value.day,
		);
		contractOffers.value = contracts.offers;
		activeContract.value = contracts.active;
		sprayerCharge.value = normalizeSprayerCharge(data.sprayerCharge);
	};

	const getSaveData = (): SaveData => {
		return {
			saveVersion: SAVE_VERSION,
			level: level.value,
			xp: xp.value,
			coins: coins.value,
			completedContracts: completedContracts.value,
			missedContracts: missedContracts.value,
			inventory: inventory.value,
			backpack: backpack.value,
			barnStorage: barnStorage.value,
			sellSlots: sellSlots.value,
			juiceSlots: juiceSlots.value,
			selectedSlot: inventoryIndex.value,
			plotUnlocks: plotUnlocks.value,
			farmTrees: farmTrees.value,
			playerState: playerState.value ?? undefined,
			gameClock: gameClock.value,
			contractOffers: contractOffers.value,
			activeContract: activeContract.value,
			sprayerCharge: sprayerCharge.value,
		};
	};

	const saveState = () => {
		const data = getSaveData();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		hasSave.value = true;
		hasExistingSave.value = true;
	};

	const loadState = async () => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as SaveData;
				if ((parsed.saveVersion ?? 0) <= SAVE_VERSION) {
					applySave(parsed);
					hasSave.value = true;
					hasExistingSave.value = true;
					if (parsed.saveVersion !== SAVE_VERSION) {
						saveState();
					}
					return;
				}
			} catch {
				localStorage.removeItem(STORAGE_KEY);
			}
		}

		hasSave.value = false;
		hasExistingSave.value = false;

		try {
			const response = await fetch(`${import.meta.env.BASE_URL}data/save.json`);
			if (!response.ok) {
				return;
			}

			const data = (await response.json()) as SaveData;
			applySave(data);
			saveState();
			hasExistingSave.value = false;
		} catch {
			hasSave.value = false;
			hasExistingSave.value = false;
		}
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
		xp.value = Math.min(xp.value, getXpForNextLevel(level.value) - 1);
		saveState();
	};

	const addXp = (amount: number) => {
		const result = applyXpGain(xp.value, level.value, amount);
		xp.value = result.xp;
		level.value = result.level;
		saveState();
		return result;
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

	const setFarmTrees = (trees: FarmTreeSave[]) => {
		farmTrees.value = trees.map((tree) => ({ ...tree }));
		saveState();
	};

	const setPlayerState = (nextPlayerState: PlayerSave) => {
		playerState.value = { ...nextPlayerState };
		saveState();
	};

	const setSprayerCharge = (nextCharge: SprayerChargeSave | null) => {
		sprayerCharge.value = nextCharge ? { ...nextCharge } : null;
		saveState();
	};

	const advanceTime = (minutes: number) => {
		const next = advanceClock(gameClock.value, minutes, activeContract.value);
		if (next.offers) {
			contractOffers.value = next.offers;
		}
		missedContracts.value += next.missedDelta;
		activeContract.value = next.activeContract;
		gameClock.value = next.clock;
		saveState();
	};

	const recordHarvest = (fruitId: string, quantity: number) => {
		const result = recordContractHarvest(activeContract.value, fruitId, quantity);
		activeContract.value = result.nextContract;
		if (result.completed) {
			completedContracts.value += 1;
			coins.value += result.reward;
		}
		saveState();
		return { completed: result.completed, reward: result.reward };
	};

	const acceptContract = (contractId: string) => {
		const nextContract = acceptContractOffer(
			contractOffers.value,
			contractId,
			gameClock.value,
			activeContract.value,
		);
		if (!nextContract) {
			return false;
		}

		activeContract.value = nextContract;
		saveState();
		return true;
	};

	const isPlotUnlocked = (index: number) => {
		if (index === 0) {
			return true;
		}
		return Boolean(plotUnlocks.value[index]);
	};

	const unlockPlot = (index: number) => {
		if (isPlotUnlocked(index)) {
			return false;
		}

		const plot = farmPlots[index];
		if (coins.value < plot.cost) {
			return false;
		}

		coins.value -= plot.cost;
		plotUnlocks.value = plotUnlocks.value.map((value, idx) => {
			return idx === index ? true : value;
		});
		saveState();
		return true;
	};

	const canUnlockPlot = (index: number) => {
		if (isPlotUnlocked(index)) {
			return false;
		}
		return coins.value >= farmPlots[index].cost;
	};

	return {
		level,
		xp,
		xpForNextLevel,
		levelProgress,
		coins,
		completedContracts,
		missedContracts,
		inventory,
		backpack,
		barnStorage,
		inventoryIndex,
		plotUnlocks,
		sellSlots,
		juiceSlots,
		farmTrees,
		playerState,
		gameClock,
		contractOffers,
		activeContract,
		sprayerCharge,
		hasSave,
		hasExistingSave,
		farmPlots,
		applySave,
		getSaveData,
		saveState,
		loadState,
		setLevel,
		addCoins,
		addLevel,
		addXp,
		setCoins,
		setInventorySlot,
		setFarmTrees,
		setPlayerState,
		setSprayerCharge,
		advanceTime,
		recordHarvest,
		acceptContract,
		isPlotUnlocked,
		unlockPlot,
		canUnlockPlot,
	};
};
