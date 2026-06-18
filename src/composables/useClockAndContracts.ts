import { computed, type Ref } from "vue";
import type { ContractSave, GameClockSave } from "./usePlayerData";
import { getTotalGameMinutes } from "./playerData/normalizers";

export const useClockAndContracts = (
	gameClock: Ref<GameClockSave>,
	activeContract: Ref<ContractSave | null>,
	itemLabel: (itemId: string) => string,
) => {
	const clockLabel = computed(() => {
		const hour = Math.floor(gameClock.value.minute / 60);
		const minute = gameClock.value.minute % 60;
		return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
	});

	const dayPhase = computed(() => {
		const minute = gameClock.value.minute;
		if (minute < 6 * 60 || minute >= 21 * 60) {
			return "night";
		}
		if (minute >= 18 * 60) {
			return "evening";
		}
		return "day";
	});

	const contractSummary = computed(() => {
		const contract = activeContract.value;
		if (!contract) {
			return null;
		}
		const remainingMinutes =
			contract.expiresAt === undefined
				? null
				: Math.max(0, contract.expiresAt - getTotalGameMinutes(gameClock.value));
		const timeLeftLabel =
			remainingMinutes === null
				? null
				: `${String(Math.floor(remainingMinutes / 60)).padStart(2, "0")}:${String(
						remainingMinutes % 60,
					).padStart(2, "0")}`;
		return {
			...contract,
			itemName: itemLabel(contract.fruitId),
			timeLeftLabel,
		};
	});

	return {
		clockLabel,
		dayPhase,
		contractSummary,
	};
};
