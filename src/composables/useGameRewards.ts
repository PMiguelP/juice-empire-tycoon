import type { ComputedRef, Ref } from "vue";
import { HARVEST_XP_REWARD } from "./usePlayerData";
import { getShopUnlocksBetweenLevels } from "./useMarket";

type RewardText = {
	toasts: {
		levelUp: (level: number) => string;
		unlockedItems: (items: string) => string;
		xpGained: (amount: number) => string;
		contractComplete: (reward: number) => string;
	};
};

type GameRewardsOptions = {
	level: Ref<number>;
	text: ComputedRef<RewardText>;
	addXp: (amount: number) => {
		leveledUp: boolean;
		level: number;
		amount: number;
	};
	recordHarvest: (
		fruitId: string,
		quantity: number,
	) => { completed: boolean; reward: number };
	itemLabel: (itemId: string) => string;
	showToast: (message: string) => void;
};

export const useGameRewards = ({
	level,
	text,
	addXp,
	recordHarvest,
	itemLabel,
	showToast,
}: GameRewardsOptions) => {
	const rewardXp = (amount: number) => {
		const previousLevel = level.value;
		const result = addXp(amount);
		if (!result.leveledUp) {
			showToast(text.value.toasts.xpGained(result.amount));
			return;
		}

		const unlockedItems = getShopUnlocksBetweenLevels(previousLevel, result.level)
			.map((item) => itemLabel(item.id));
		const unlockText =
			unlockedItems.length > 0
				? ` ${text.value.toasts.unlockedItems(unlockedItems.join(", "))}`
				: "";
		showToast(`${text.value.toasts.levelUp(result.level)}${unlockText}`);
	};

	const handleHarvestAccepted = (fruitId: string, quantity: number) => {
		const contractResult = recordHarvest(fruitId, quantity);
		rewardXp(HARVEST_XP_REWARD * Math.max(1, quantity));
		if (contractResult.completed) {
			showToast(text.value.toasts.contractComplete(contractResult.reward));
		}
	};

	return {
		rewardXp,
		handleHarvestAccepted,
	};
};
