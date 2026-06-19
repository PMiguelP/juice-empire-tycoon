import type { InventoryEntry } from "../../items";
import { getItemId, normalizeEntry } from "../../items";
import {
	CONTRACT_DURATION_MINUTES,
	CONTRACT_TARGETS,
	DAY_MINUTES,
	DAY_START_MINUTE,
} from "./constants";
import type { ContractSave, GameClockSave } from "./types";

export const normalizeClock = (clock?: GameClockSave): GameClockSave => {
	const day = Math.max(1, Math.floor(clock?.day ?? 1));
	const minute = Math.min(
		DAY_MINUTES - 1,
		Math.max(0, Math.floor(clock?.minute ?? DAY_START_MINUTE)),
	);
	return { day, minute };
};

export const getTotalGameMinutes = (clock: GameClockSave) => {
	return (clock.day - 1) * DAY_MINUTES + clock.minute;
};

const getSeededContractSort = (day: number, index: number) => {
	let seed = (day * 0x9e3779b1 + index * 0x85ebca6b) >>> 0;
	seed += 0x6d2b79f5;
	let value = seed;
	value = Math.imul(value ^ (value >>> 15), value | 1);
	value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

export const createContractOffersForDay = (day: number): ContractSave[] => {
	// Difficulty ramps +1 every 3 days (was every 2), capped at 5 (was 8)
	const difficultyBonus = Math.min(5, Math.floor((day - 1) / 3));
	const shuffledTargets = CONTRACT_TARGETS.map((target, index) => ({
		target,
		sort: getSeededContractSort(day, index),
	}))
		.sort((left, right) => left.sort - right.sort)
		.slice(0, 4);

	return shuffledTargets.map(({ target }, index) => {
		const sizeBonus = index % 2 === 0 ? 0 : 1; // was 2
		const required = target.required + difficultyBonus + sizeBonus;
		return {
			id: `contract-day-${day}-${index + 1}`,
			day,
			fruitId: target.itemId,
			required,
			progress: 0,
			reward: target.reward + day * 10 + required * 5 + index * 12,
			completed: false,
			durationMinutes: CONTRACT_DURATION_MINUTES,
		};
	});
};

export const createContractForDay = (day: number): ContractSave => {
	const [contract] = createContractOffersForDay(day);
	return {
		...contract,
		day,
	};
};

export const getXpForNextLevel = (level: number) => {
	return 80 + Math.max(0, level - 1) * 40;
};

export const normalizeJuiceSlots = (slots?: InventoryEntry[]) => {
	if (!Array.isArray(slots)) {
		return Array.from({ length: 3 }, () => null);
	}

	if (slots.length <= 3) {
		return Array.from({ length: 3 }, (_, index) => {
			return normalizeEntry(slots[index] ?? null);
		});
	}

	const findSlot = (
		indexes: number[],
		predicate: (itemId: string | null) => boolean,
	) => {
		for (const index of indexes) {
			const entry = normalizeEntry(slots[index] ?? null);
			if (predicate(getItemId(entry))) {
				return entry;
			}
		}
		return null;
	};

	return [
		findSlot([0, 1, 2], (itemId) =>
			Boolean(
				itemId && ["orange", "pomegranate", "peach", "lemon"].includes(itemId),
			),
		),
		findSlot([3, 4], (itemId) => itemId === "filled-water-jug"),
		findSlot([5, 6], (itemId) => itemId === "empty-bottle"),
	];
};
