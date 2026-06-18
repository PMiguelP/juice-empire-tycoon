import Phaser from "phaser";
import type { Game } from "../Game";
import { INTERIOR_MAP_KEYS } from "./constants";
import {
	INTERACTION_LABELS,
	type InteractionLabelKey,
	type InteractionLanguage,
} from "./interactionLabels";
import { INTERIOR_SERVICE_TARGETS } from "./interactionTargets";
import type { InteractionTarget } from "./types";

export class InteractionTargetResolver {
	private readonly scene: Game;

	constructor(scene: Game) {
		this.scene = scene;
	}

	getTargets() {
		if (!this.scene.map) {
			return [];
		}

		return this.scene.currentMapKey === "mapa"
			? this.getExteriorInteractionTargets()
			: this.getInteriorExitTargets();
	}

	getDistanceToTarget(x: number, y: number, target: InteractionTarget) {
		if (!target.bounds) {
			const dx = x - target.x;
			const dy = y - target.y;
			return Math.sqrt(dx * dx + dy * dy);
		}

		const closestX = Phaser.Math.Clamp(
			x,
			target.bounds.minX,
			target.bounds.maxX,
		);
		const closestY = Phaser.Math.Clamp(
			y,
			target.bounds.minY,
			target.bounds.maxY,
		);
		const dx = x - closestX;
		const dy = y - closestY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	private getExteriorInteractionTargets() {
		if (!this.scene.map) {
			return [];
		}

		const targets: InteractionTarget[] = [];
		for (const mapKey of INTERIOR_MAP_KEYS) {
			const interactionLayer = this.scene.map.getObjectLayer(mapKey);
			if (!interactionLayer?.objects) {
				continue;
			}
			const target = this.getLayerCenterTarget(
				mapKey,
				"enter",
				this.getLabel("enter"),
			);
			if (target) {
				target.mapKey = mapKey;
				targets.push(target);
			}
		}

		return targets;
	}

	private getInteriorExitTargets() {
		if (!this.scene.map) {
			return [];
		}

		const targets: InteractionTarget[] = [];
		const spawnLayer = this.scene.map.getObjectLayer("spawn");
		if (spawnLayer?.objects?.length) {
			const exitTarget = this.getLayerCenterTarget(
				"spawn",
				"exit",
				this.getLabel("exit"),
			);
			if (exitTarget) {
				targets.push(exitTarget);
			}
		} else if (this.scene.mapManager.isInteriorMap()) {
			targets.push({
				x: this.scene.mapManager.mapWidth / 2,
				y: this.scene.mapManager.mapHeight - this.scene.map.tileHeight * 1.5,
				action: "exit",
				label: this.getLabel("exit"),
			});
		}

		targets.push(...this.getInteriorServiceTargets());
		return targets;
	}

	private getInteriorServiceTargets() {
		if (!this.scene.map) {
			return [];
		}

		const services = INTERIOR_SERVICE_TARGETS[this.scene.currentMapKey];
		if (!services) {
			return [];
		}

		return services.flatMap((service) =>
			this.getObjectLayerTargetsOrFallback(
				service.layerName,
				service.action,
				this.getLabel(service.label),
				service.fallbackOffsetX ?? 0,
				service.fallbackOffsetY ?? 0,
			),
		);
	}

	private getObjectLayerTargetsOrFallback(
		layerName: string,
		action: NonNullable<InteractionTarget["action"]>,
		label: string,
		fallbackOffsetX = 0,
		fallbackOffsetY = 0,
	) {
		const targets = this.getObjectLayerTargets(layerName, action, label);
		return targets.length > 0
			? targets
			: [this.createFallbackTarget(action, label, fallbackOffsetX, fallbackOffsetY)];
	}

	private createFallbackTarget(
		action: NonNullable<InteractionTarget["action"]>,
		label: string,
		offsetX = 0,
		offsetY = 0,
	): InteractionTarget {
		return {
			x: this.scene.mapManager.mapWidth / 2 + offsetX,
			y: this.scene.mapManager.mapHeight / 2 + offsetY,
			action,
			label,
		};
	}

	private getObjectLayerTargets(
		layerName: string,
		action: NonNullable<InteractionTarget["action"]>,
		label: string,
	) {
		const target = this.getLayerCenterTarget(layerName, action, label);
		return target ? [target] : [];
	}

	private getLayerCenterTarget(
		layerName: string,
		action: NonNullable<InteractionTarget["action"]>,
		label: string,
	) {
		const objectLayer = this.scene.map?.getObjectLayer(layerName);
		if (!objectLayer?.objects) {
			return null;
		}

		const bounds = objectLayer.objects.reduce(
			(acc, object) => {
				const x = object.x ?? 0;
				const y = object.y ?? 0;
				const width = object.width ?? 0;
				const height = object.height ?? 0;
				return {
					minX: Math.min(acc.minX, x),
					minY: Math.min(acc.minY, y),
					maxX: Math.max(acc.maxX, x + width),
					maxY: Math.max(acc.maxY, y + height),
				};
			},
			{
				minX: Number.POSITIVE_INFINITY,
				minY: Number.POSITIVE_INFINITY,
				maxX: Number.NEGATIVE_INFINITY,
				maxY: Number.NEGATIVE_INFINITY,
			},
		);

		if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY)) {
			return null;
		}

		return {
			x: (bounds.minX + bounds.maxX) / 2,
			y: bounds.maxY,
			bounds,
			action,
			label,
		};
	}

	private getLabel(key: InteractionLabelKey) {
		const language: InteractionLanguage =
			localStorage.getItem("juice-language") === "en" ? "en" : "pt";
		return INTERACTION_LABELS[language][key];
	}
}
