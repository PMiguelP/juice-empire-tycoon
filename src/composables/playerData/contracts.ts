import {
	CONTRACT_DURATION_MINUTES,
	DAY_MINUTES,
	SAVE_VERSION,
} from "./constants";
import { createContractOffersForDay, getTotalGameMinutes } from "./normalizers";
import type { ContractSave, GameClockSave } from "./types";

export const normalizeContract = (
	contract: ContractSave | null | undefined,
): ContractSave | null => {
	if (!contract?.fruitId) {
		return null;
	}

	const required = Math.max(1, Math.floor(contract.required ?? 1));
	const durationMinutes = Math.max(
		60,
		Math.floor(contract.durationMinutes ?? CONTRACT_DURATION_MINUTES),
	);

	return {
		id: contract.id || `contract-day-${contract.day ?? 1}`,
		day: Math.max(1, Math.floor(contract.day ?? 1)),
		fruitId: contract.fruitId,
		required,
		progress: Math.min(required, Math.max(0, Math.floor(contract.progress ?? 0))),
		reward: Math.max(1, Math.floor(contract.reward ?? 1)),
		completed: Boolean(contract.completed),
		durationMinutes,
		expiresAt: contract.expiresAt ? Math.floor(contract.expiresAt) : undefined,
	};
};

export const normalizeContractOffers = (
	offers: ContractSave[] | undefined,
	day: number,
) => {
	const normalized = Array.isArray(offers)
		? offers
				.map((contract) => normalizeContract(contract))
				.filter((contract): contract is ContractSave => Boolean(contract))
		: [];
	return normalized.length > 0 ? normalized : createContractOffersForDay(day);
};

export const getContractsFromSave = (
	saveVersion: number | undefined,
	offers: ContractSave[] | undefined,
	activeContract: ContractSave | null | undefined,
	day: number,
) => {
	const shouldRegenerate = (saveVersion ?? 0) < SAVE_VERSION;
	return {
		offers: shouldRegenerate
			? createContractOffersForDay(day)
			: normalizeContractOffers(offers, day),
		active: shouldRegenerate ? null : normalizeContract(activeContract),
	};
};

export const acceptContractOffer = (
	offers: ContractSave[],
	contractId: string,
	clock: GameClockSave,
	activeContract: ContractSave | null,
) => {
	if (activeContract && !activeContract.completed) {
		return null;
	}

	const offer = offers.find((contract) => contract.id === contractId);
	if (!offer) {
		return null;
	}

	return {
		...offer,
		progress: 0,
		completed: false,
		expiresAt: getTotalGameMinutes(clock) + offer.durationMinutes,
	};
};

export const recordContractHarvest = (
	contract: ContractSave | null,
	fruitId: string,
	quantity: number,
) => {
	if (!contract || contract.completed || contract.fruitId !== fruitId) {
		return { nextContract: contract, completed: false, reward: 0 };
	}

	const progress = Math.min(contract.required, contract.progress + quantity);
	const completed = progress >= contract.required;

	return {
		nextContract: completed
			? null
			: {
					...contract,
					progress,
					completed: false,
				},
		completed,
		reward: completed ? contract.reward : 0,
	};
};

export const advanceClock = (
	clock: GameClockSave,
	minutes: number,
	activeContract: ContractSave | null,
) => {
	const nextClock = { ...clock };
	const previousDay = nextClock.day;
	nextClock.minute += Math.max(0, Math.floor(minutes));
	while (nextClock.minute >= DAY_MINUTES) {
		nextClock.minute -= DAY_MINUTES;
		nextClock.day += 1;
	}

	const totalMinutes = getTotalGameMinutes(nextClock);
	const contractExpired =
		Boolean(activeContract && !activeContract.completed) &&
		activeContract?.expiresAt !== undefined &&
		totalMinutes >= activeContract.expiresAt;

	return {
		clock: nextClock,
		offers:
			nextClock.day !== previousDay
				? createContractOffersForDay(nextClock.day)
				: null,
		activeContract: contractExpired ? null : activeContract,
		missedDelta: contractExpired ? 1 : 0,
	};
};
