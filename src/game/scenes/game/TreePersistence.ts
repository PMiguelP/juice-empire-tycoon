import type { FarmTreeSave } from "../../../composables/usePlayerData";
import { FULL_TREE_GROW_MS, SMALL_TREE_GROW_MS } from "./constants";
import type { TreePlant } from "./types";

export const getFruitIdForSeed = (seedId: string) => {
	const fruits: Record<string, string> = {
		"orange-tree-seed": "orange",
		"pomegranate-tree-seed": "pomegranate",
		"peach-tree-seed": "peach",
		"lemon-tree-seed": "lemon",
	};
	return fruits[seedId] ?? "orange";
};

export const serializeTree = (tree: TreePlant): FarmTreeSave => {
	return {
		seedId: tree.seedId,
		fruitId: tree.fruitId,
		tileKey: tree.tileKey,
		x: tree.x,
		y: tree.y,
		stage: tree.stage,
		hasFruit: tree.hasFruit,
		isWatered: tree.isWatered,
		isFertilized: tree.isFertilized,
		harvestCount: tree.harvestCount,
		plantedAt: tree.plantedAt,
		regrowStartedAt: tree.regrowStartedAt ?? null,
		sulfateQuality: tree.sulfateQuality ?? null,
		hasPests: tree.hasPests ?? false,
		pestCheckedDay: tree.pestCheckedDay ?? null,
		pestProtectionUntilDay: tree.pestProtectionUntilDay ?? null,
	};
};

export const normalizeTreeTiming = (
	tree: FarmTreeSave,
	getFruitRegrowDuration: (tree: TreePlant | FarmTreeSave) => number,
): FarmTreeSave => {
	const normalized: FarmTreeSave = {
		...tree,
		fruitId: tree.fruitId || getFruitIdForSeed(tree.seedId),
		harvestCount: tree.harvestCount ?? 0,
		plantedAt: tree.plantedAt || Date.now(),
		regrowStartedAt: tree.regrowStartedAt ?? null,
		sulfateQuality: tree.sulfateQuality ?? null,
		hasPests: tree.hasPests ?? false,
		pestCheckedDay: tree.pestCheckedDay ?? null,
		pestProtectionUntilDay: tree.pestProtectionUntilDay ?? null,
	};
	const age = Date.now() - normalized.plantedAt;

	if (normalized.stage !== "full") {
		if (age >= FULL_TREE_GROW_MS) {
			normalized.stage = "full";
			normalized.hasFruit = true;
		} else if (age >= SMALL_TREE_GROW_MS) {
			normalized.stage = "small";
		}
	}

	if (
		normalized.regrowStartedAt &&
		Date.now() - normalized.regrowStartedAt >= getFruitRegrowDuration(normalized)
	) {
		normalized.hasFruit = true;
		normalized.isWatered = false;
		normalized.isFertilized = false;
		normalized.regrowStartedAt = null;
	}

	return normalized;
};
