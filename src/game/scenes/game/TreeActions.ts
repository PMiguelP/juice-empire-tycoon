import Phaser from "phaser";
import type { TreeManager } from "./TreeManager";
import type { PlantTarget, SulfateQuality } from "./types";

export class TreeActions {
	constructor(private readonly manager: TreeManager) {}

	handlePlantRequest(payload: {
		seedId?: string;
		target?: PlantTarget;
		onResult?: (success: boolean) => void;
	}) {
		let success = false;
		try {
			success = this.manager.tryPlantTree(payload.seedId ?? "", payload.target);
		} catch (error) {
			console.warn("Plant request failed safely", error);
		}
		payload.onResult?.(success);
	}

	handleHarvestRequest(payload: {
		hasScissors?: boolean;
		onHarvest?: (fruitId: string, quantity: number) => boolean;
		onResult?: (success: boolean) => void;
	}) {
		const tree = this.manager.getHarvestableTree();
		if (!tree || tree.hasPests) {
			payload.onResult?.(false);
			return;
		}

		const maxFruit = payload.hasScissors ? 5 : 4;
		const quantity = Phaser.Math.Between(3, maxFruit);
		const accepted = payload.onHarvest?.(tree.fruitId, quantity) ?? true;
		if (!accepted) {
			payload.onResult?.(false);
			return;
		}

		tree.harvestCount += 1;
		tree.hasFruit = false;
		tree.isWatered = false;
		tree.isFertilized = false;
		tree.regrowStartedAt = null;
		tree.isRegrowing = false;
		tree.regrowTimer?.remove(false);
		tree.regrowTimer = undefined;
		this.manager.renderer.draw(tree);
		this.manager.emitTreeStateChanged();
		payload.onResult?.(true);
	}

	handleWaterRequest(payload: { onResult?: (success: boolean) => void }) {
		const tree = this.manager.getNearbyTree(
			(candidate) => candidate.stage === "full",
		);
		if (!tree || tree.harvestCount >= 3) {
			payload.onResult?.(false);
			return;
		}
		tree.isWatered = true;
		this.manager.growth.tryStartFruitRegrowth(tree);
		this.manager.renderer.draw(tree);
		this.manager.emitTreeStateChanged();
		payload.onResult?.(true);
	}

	handleFertilizeRequest(payload: { onResult?: (success: boolean) => void }) {
		const tree = this.manager.getNearbyTree(
			(candidate) => candidate.stage === "full",
		);
		if (!tree || tree.harvestCount >= 3) {
			payload.onResult?.(false);
			return;
		}
		tree.isFertilized = true;
		this.manager.growth.tryStartFruitRegrowth(tree);
		this.manager.renderer.draw(tree);
		this.manager.emitTreeStateChanged();
		payload.onResult?.(true);
	}

	handleSulfateRequest(payload: {
		quality?: SulfateQuality;
		onResult?: (success: boolean) => void;
	}) {
		const tree = this.manager.getNearbyTree(
			(candidate) => candidate.stage === "full",
		);
		if (!tree || tree.harvestCount >= 3) {
			payload.onResult?.(false);
			return;
		}

		const quality = payload.quality ?? "good";
		tree.hasPests = false;
		tree.sulfateQuality = quality;
		tree.pestCheckedDay = this.manager.currentDay;
		tree.pestProtectionUntilDay =
			this.manager.currentDay + this.manager.pests.getProtectionDays(quality);
		this.manager.growth.tryStartFruitRegrowth(tree);
		this.manager.renderer.draw(tree);
		this.manager.emitTreeStateChanged();
		payload.onResult?.(true);
	}
}
