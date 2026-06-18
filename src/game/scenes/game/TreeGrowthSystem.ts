import type { FarmTreeSave } from "../../../composables/usePlayerData";
import type { Game } from "../Game";
import {
	FRUIT_REGROW_MS,
	FULL_TREE_GROW_MS,
	SMALL_TREE_GROW_MS,
} from "./constants";
import { TreeRenderer } from "./TreeRenderer";
import type { TreePlant } from "./types";

export class TreeGrowthSystem {
	constructor(
		private readonly scene: Game,
		private readonly renderer: TreeRenderer,
		private readonly emitChanged: () => void,
	) {}

	tryStartFruitRegrowth(tree: TreePlant) {
		if (
			tree.hasFruit ||
			tree.isRegrowing ||
			tree.harvestCount >= 3 ||
			!tree.isWatered ||
			!tree.isFertilized
		) {
			return;
		}

		tree.isRegrowing = true;
		tree.regrowStartedAt = Date.now();
		this.scheduleFruitRegrow(tree);
	}

	scheduleFruitRegrow(tree: TreePlant) {
		if (!tree.regrowStartedAt) {
			return;
		}

		tree.regrowTimer?.remove(false);
		const duration = this.getFruitRegrowDuration(tree);
		const remaining = Math.max(0, duration - (Date.now() - tree.regrowStartedAt));
		tree.regrowTimer = this.scene.time.delayedCall(remaining, () => {
			tree.hasFruit = true;
			tree.isWatered = false;
			tree.isFertilized = false;
			tree.isRegrowing = false;
			tree.regrowStartedAt = null;
			tree.regrowTimer = undefined;
			this.renderer.draw(tree);
			this.emitChanged();
		});
	}

	getFruitRegrowDuration(tree: TreePlant | FarmTreeSave) {
		return tree.isFertilized ? FRUIT_REGROW_MS * 0.65 : FRUIT_REGROW_MS;
	}

	scheduleTreeGrowth(tree: TreePlant) {
		for (const timer of tree.growthTimers) {
			timer.remove(false);
		}
		tree.growthTimers = [];

		if (tree.stage === "full") {
			return;
		}

		const age = Date.now() - tree.plantedAt;
		const smallDelay = SMALL_TREE_GROW_MS - age;
		const fullDelay = FULL_TREE_GROW_MS - age;

		if (tree.stage === "sprout" && smallDelay > 0) {
			tree.growthTimers.push(
				this.scene.time.delayedCall(smallDelay, () => {
					tree.stage = "small";
					this.renderer.draw(tree);
					this.emitChanged();
				}),
			);
		}

		if (fullDelay > 0) {
			tree.growthTimers.push(
				this.scene.time.delayedCall(fullDelay, () => {
					tree.stage = "full";
					tree.hasFruit = true;
					this.renderer.draw(tree);
					this.emitChanged();
				}),
			);
			return;
		}

		tree.stage = "full";
		tree.hasFruit = true;
	}
}
