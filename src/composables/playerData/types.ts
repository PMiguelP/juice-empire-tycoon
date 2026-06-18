import type { InventoryEntry } from "../../items";

export type SulfateQuality = "perfect" | "good" | "poor";
export type SulfateItemId = "sulfate-basic" | "sulfate-strong" | "sulfate-premium";

export type SprayerChargeSave = {
	quality: SulfateQuality;
	sulfateId: SulfateItemId;
};

export type SaveData = {
	saveVersion: number;
	level: number;
	xp?: number;
	coins: number;
	completedContracts?: number;
	missedContracts?: number;
	inventory: InventoryEntry[];
	backpack?: InventoryEntry[];
	barnStorage?: InventoryEntry[];
	sellSlots?: InventoryEntry[];
	juiceSlots?: InventoryEntry[];
	selectedSlot: number;
	plotUnlocks?: boolean[];
	farmTrees?: FarmTreeSave[];
	playerState?: PlayerSave;
	gameClock?: GameClockSave;
	contractOffers?: ContractSave[];
	activeContract?: ContractSave | null;
	sprayerCharge?: SprayerChargeSave | null;
};

export type GameClockSave = {
	day: number;
	minute: number;
};

export type ContractSave = {
	id: string;
	day: number;
	fruitId: string;
	required: number;
	progress: number;
	reward: number;
	completed: boolean;
	durationMinutes: number;
	expiresAt?: number;
};

export type PlayerSave = {
	mapKey: string;
	x: number;
	y: number;
	returnSpawnX?: number | null;
	returnSpawnY?: number | null;
};

export type FarmTreeSave = {
	seedId: string;
	fruitId: string;
	tileKey: string;
	x: number;
	y: number;
	stage: "sprout" | "small" | "full";
	hasFruit: boolean;
	isWatered: boolean;
	isFertilized: boolean;
	harvestCount: number;
	plantedAt: number;
	regrowStartedAt?: number | null;
	sulfateQuality?: SulfateQuality | null;
	hasPests?: boolean;
	pestCheckedDay?: number | null;
	pestProtectionUntilDay?: number | null;
};
