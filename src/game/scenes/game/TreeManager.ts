import Phaser from "phaser";
import type { FarmTreeSave } from "../../../composables/usePlayerData";
import { EventBus } from "../../EventBus";
import type { Game } from "../Game";
import { TreeActions } from "./TreeActions";
import { TreeGrowthSystem } from "./TreeGrowthSystem";
import {
	getFruitIdForSeed,
	normalizeTreeTiming,
	serializeTree,
} from "./TreePersistence";
import { TreePestSystem } from "./TreePestSystem";
import { TreePlantingSystem } from "./TreePlantingSystem";
import { TreeRenderer } from "./TreeRenderer";
import { TreeOccupancySystem } from "./TreeOccupancySystem";
import type { PlantTarget, SulfateQuality, TreePlant } from "./types";

export class TreeManager {
	private readonly scene: Game;
	readonly renderer = new TreeRenderer();
	readonly pests = new TreePestSystem();
	readonly growth: TreeGrowthSystem;
	private readonly actions: TreeActions;
	private readonly planting: TreePlantingSystem;
	private readonly occupancy = new TreeOccupancySystem();
	private plantedTrees: TreePlant[] = [];
	private selectedSeedId: string | null = null;
	currentDay = 1;

	constructor(scene: Game) {
		this.scene = scene;
		this.growth = new TreeGrowthSystem(
			this.scene,
			this.renderer,
			() => this.emitTreeStateChanged(),
		);
		this.actions = new TreeActions(this);
		this.planting = new TreePlantingSystem(
			this.scene,
			(tileX, tileY) => this.isTreeAreaFree(tileX, tileY),
			(tileX, tileY) => this.isTreeTileFree(tileX, tileY),
			(seedId, target) => {
				EventBus.emit("ui:plant-at-pointer", { seedId, target });
			},
		);
	}

	handlePlantRequest(payload: {
		seedId?: string;
		target?: PlantTarget;
		onResult?: (success: boolean) => void;
	}) {
		this.actions.handlePlantRequest(payload);
	}

	handleHarvestRequest(payload: {
		hasScissors?: boolean;
		onHarvest?: (fruitId: string, quantity: number) => boolean;
		onResult?: (success: boolean) => void;
	}) {
		this.actions.handleHarvestRequest(payload);
	}

	handleWaterRequest(payload: { onResult?: (success: boolean) => void }) {
		this.actions.handleWaterRequest(payload);
	}

	handleFertilizeRequest(payload: { onResult?: (success: boolean) => void }) {
		this.actions.handleFertilizeRequest(payload);
	}

	handleSulfateRequest(payload: {
		quality?: SulfateQuality;
		onResult?: (success: boolean) => void;
	}) {
		this.actions.handleSulfateRequest(payload);
	}

	handleDayChanged(day: number) {
		const nextDay = Math.max(1, Math.floor(day));
		if (nextDay === this.currentDay && this.plantedTrees.length > 0) {
			return;
		}
		this.currentDay = nextDay;
		this.applyDailyPests();
	}

	handleTreeState(trees: FarmTreeSave[]) {
		if (this.scene.currentMapKey !== "mapa") {
			return;
		}

		this.destroyPlantedTrees();
		this.occupancy.clear();

		for (const savedTree of trees) {
			const normalizedTree = normalizeTreeTiming(
				savedTree,
				(tree) => this.growth.getFruitRegrowDuration(tree),
			);
			const tree = this.createTreeFromSave(normalizedTree);
			this.plantedTrees.push(tree);
			this.occupancy.blockAreaFromKey(tree.tileKey);
			this.renderer.draw(tree);
			this.growth.scheduleTreeGrowth(tree);
			this.growth.scheduleFruitRegrow(tree);
		}

		this.applyDailyPests();
		this.emitTreeStateChanged();
	}

	destroy() {
		this.planting.destroy();
		this.destroyPlantedTrees();
		this.occupancy.clear();
	}

	update() {
		this.planting.updatePointerPreview(this.selectedSeedId);
		this.updateTreeTransparency();
	}

	handleSelectedItem(itemId: string | null) {
		this.selectedSeedId = itemId?.endsWith("-tree-seed") ? itemId : null;
		if (!this.selectedSeedId) {
			this.planting.hidePreview();
		}
	}

	tryPlantTree(seedId: string, requestedTarget?: PlantTarget) {
		if (!this.scene.map || !this.scene.player || this.scene.currentMapKey !== "mapa") {
			return false;
		}
		if (!seedId.endsWith("-tree-seed")) {
			return false;
		}

		const target = requestedTarget
			? this.planting.resolvePlantTarget(requestedTarget.tileX, requestedTarget.tileY)
			: this.planting.getPlantableTilePosition();
		if (!target) {
			return false;
		}

		this.occupancy.blockArea(target.tileX, target.tileY);
		const tileKey = `${target.tileX}:${target.tileY}`;
		this.createTreeGrowth(seedId, tileKey, target.worldX, target.worldY);
		this.emitTreeStateChanged();
		return true;
	}

	private isTreeAreaFree(tileX: number, tileY: number) {
		return this.occupancy.isAreaFree(tileX, tileY);
	}

	private isTreeTileFree(tileX: number, tileY: number) {
		return this.occupancy.isTileFree(tileX, tileY);
	}

	getHarvestableTree() {
		return this.getNearbyTree((tree) => tree.stage === "full" && tree.hasFruit);
	}

	getNearbyTree(predicate: (tree: TreePlant) => boolean) {
		if (!this.scene.player) {
			return null;
		}

		const target = this.scene.playerManager.getFacingTilePosition();
		let nearestTree: TreePlant | null = null;
		let nearestDistance = Number.POSITIVE_INFINITY;

		for (const tree of this.plantedTrees) {
			if (!predicate(tree)) {
				continue;
			}
			const targetDistance = Phaser.Math.Distance.Between(
				target.worldX,
				target.worldY,
				tree.x,
				tree.y,
			);
			const feet = this.scene.playerManager.getPlayerFeetPosition();
			const playerDistance = Phaser.Math.Distance.Between(
				feet.x,
				feet.y,
				tree.x,
				tree.y,
			);
			const distance = Math.min(targetDistance, playerDistance);
			if (distance < nearestDistance && distance <= 52) {
				nearestDistance = distance;
				nearestTree = tree;
			}
		}

		return nearestTree;
	}

	private createTreeGrowth(
		seedId: string,
		tileKey: string,
		x: number,
		y: number,
	) {
		const tree = this.createTreeFromSave({
			seedId,
			fruitId: getFruitIdForSeed(seedId),
			tileKey,
			x,
			y,
			stage: "sprout",
			hasFruit: false,
			isWatered: false,
			isFertilized: false,
			harvestCount: 0,
			plantedAt: Date.now(),
			regrowStartedAt: null,
			sulfateQuality: null,
			hasPests: false,
			pestCheckedDay: null,
			pestProtectionUntilDay: null,
		});
		this.plantedTrees.push(tree);
		this.occupancy.blockAreaFromKey(tree.tileKey);
		this.renderer.draw(tree);
		this.growth.scheduleTreeGrowth(tree);
	}

	private createTreeFromSave(savedTree: FarmTreeSave): TreePlant {
		const trunkCollider = this.scene.add.rectangle(
			savedTree.x,
			savedTree.y - 5,
			12,
			10,
			0x000000,
			0,
		);
		this.scene.physics.add.existing(trunkCollider, true);
		if (this.scene.player) {
			this.scene.physics.add.collider(this.scene.player, trunkCollider);
		}

		return {
			...savedTree,
			stage: savedTree.stage,
			isRegrowing: Boolean(savedTree.regrowStartedAt),
			graphics: this.scene.add.graphics().setDepth(savedTree.y),
			trunkCollider,
			growthTimers: [],
		};
	}

	private destroyPlantedTrees() {
		for (const tree of this.plantedTrees) {
			for (const timer of tree.growthTimers) {
				timer.remove(false);
			}
			tree.regrowTimer?.remove(false);
			tree.graphics.destroy();
			tree.trunkCollider.destroy();
		}
		this.plantedTrees = [];
	}

	emitTreeStateChanged() {
		EventBus.emit(
			"farm:trees-changed",
			this.plantedTrees.map((tree) => serializeTree(tree)),
		);
	}

	private applyDailyPests() {
		const changed = this.pests.applyDailyPests(
			this.plantedTrees,
			this.currentDay,
			this.scene.currentMapKey,
			(tree) => this.renderer.draw(tree),
		);
		if (changed) {
			this.emitTreeStateChanged();
		}
	}

	private updateTreeTransparency() {
		if (!this.scene.player || this.plantedTrees.length === 0) {
			return;
		}

		const feet = this.scene.playerManager.getPlayerFeetPosition();
		for (const tree of this.plantedTrees) {
			if (tree.stage === "sprout") {
				tree.graphics.setAlpha(1);
				continue;
			}

			const behindCanopy =
				Math.abs(feet.x - tree.x) < 34 &&
				feet.y < tree.y + 8 &&
				feet.y > tree.y - 86;
			tree.graphics.setAlpha(behindCanopy ? 0.45 : 1);
		}
	}

}
