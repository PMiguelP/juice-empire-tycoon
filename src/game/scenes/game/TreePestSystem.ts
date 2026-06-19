import type { SulfateQuality, TreePlant } from "./types";

const PEST_CHANCE = 0.10;           // was 0.16 — 1-in-10 chance per day
const FERTILIZED_PEST_CHANCE = 0.04; // was 0.08 — fertilizer halves the risk
const SULFATE_PROTECTION_DAYS: Record<SulfateQuality, number> = {
	perfect: 4, // was 3
	good:    2,
	poor:    1,
};

export class TreePestSystem {
	getProtectionDays(quality: SulfateQuality) {
		return SULFATE_PROTECTION_DAYS[quality];
	}

	applyDailyPests(
		trees: TreePlant[],
		currentDay: number,
		currentMapKey: string,
		drawTree: (tree: TreePlant) => void,
	) {
		if (currentMapKey !== "mapa") {
			return false;
		}

		let changed = false;
		for (const tree of trees) {
			if (tree.stage !== "full" || tree.harvestCount >= 3) {
				continue;
			}

			if (tree.pestProtectionUntilDay && tree.pestProtectionUntilDay < currentDay) {
				tree.pestProtectionUntilDay = null;
				tree.sulfateQuality = null;
				changed = true;
			}

			if (!tree.hasFruit || tree.hasPests || tree.pestCheckedDay === currentDay) {
				continue;
			}

			tree.pestCheckedDay = currentDay;
			const isProtected =
				Boolean(tree.pestProtectionUntilDay) &&
				(tree.pestProtectionUntilDay ?? 0) >= currentDay;
			if (!isProtected) {
				const chance = tree.isFertilized ? FERTILIZED_PEST_CHANCE : PEST_CHANCE;
				tree.hasPests = Math.random() < chance;
			}
			drawTree(tree);
			changed = true;
		}

		return changed;
	}
}
