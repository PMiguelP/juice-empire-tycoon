import Phaser from "phaser";
import { EventBus } from "../../EventBus";
import type { Game } from "../Game";
import { createInteractionPrompt } from "./interactionPrompt";
import { INTERIOR_ACTION_EVENTS } from "./interactionTargets";
import { InteractionTargetResolver } from "./InteractionTargetResolver";
import type { InteractionTarget } from "./types";

export class InteractionManager {
	private readonly scene: Game;
	private readonly targetResolver: InteractionTargetResolver;
	private interactKey?: Phaser.Input.Keyboard.Key;
	private prompts: Phaser.GameObjects.Container[] = [];
	private targets: InteractionTarget[] = [];
	private readonly interactionRadius = 30;

	constructor(scene: Game) {
		this.scene = scene;
		this.targetResolver = new InteractionTargetResolver(scene);
	}

	setup() {
		this.interactKey = this.scene.input.keyboard?.addKey(
			Phaser.Input.Keyboard.KeyCodes.F,
		);
		this.createMapInteractionPrompts();
	}

	update() {
		if (this.prompts.length === 0) {
			return;
		}

		const feet = this.scene.playerManager.getPlayerFeetPosition();
		let anyVisible = false;
		let nearestVisibleCenter: InteractionTarget | null = null;
		let nearestDistance = Number.POSITIVE_INFINITY;

		for (let index = 0; index < this.prompts.length; index += 1) {
			const prompt = this.prompts[index];
			const center = this.targets[index];
			const dist = this.targetResolver.getDistanceToTarget(feet.x, feet.y, center);
			const visible = dist < this.interactionRadius;
			prompt.setVisible(visible);
			if (visible) {
				anyVisible = true;
				if (dist < nearestDistance) {
					nearestDistance = dist;
					nearestVisibleCenter = center;
				}
			}
		}

		if (
			!anyVisible ||
			!this.interactKey ||
			!Phaser.Input.Keyboard.JustDown(this.interactKey)
		) {
			return;
		}

		if (this.scene.currentMapKey === "mapa" && nearestVisibleCenter?.mapKey) {
			this.scene.suppressNextShutdownPlayerSave = true;
			this.scene.scene.restart({
				mapKey: nearestVisibleCenter.mapKey,
				returnSpawnX: this.scene.player?.x ?? feet.x,
				returnSpawnY: this.scene.player?.y ?? feet.y,
			});
			return;
		}

		if (nearestVisibleCenter?.action === "exit") {
			this.scene.suppressNextShutdownPlayerSave = true;
			this.scene.scene.restart({
				mapKey: "mapa",
				spawnX: this.scene.returnSpawn?.x,
				spawnY: this.scene.returnSpawn?.y,
			});
			return;
		}

		this.scene.playerManager.emitPlayerStateChanged(true);
		this.emitInteriorInteraction(nearestVisibleCenter?.action);
	}

	destroy() {
		for (const prompt of this.prompts) {
			prompt.destroy(true);
		}
		this.prompts = [];
		this.targets = [];
	}

	private createMapInteractionPrompts() {
		this.targets = this.targetResolver.getTargets();

		for (const target of this.targets) {
			this.prompts.push(
				createInteractionPrompt(
					this.scene,
					target.x,
					target.y - 22,
					target.label ?? "F",
				),
			);
		}
	}

	private emitInteriorInteraction(action?: InteractionTarget["action"]) {
		const eventName = action ? INTERIOR_ACTION_EVENTS[action] : null;
		if (eventName) {
			EventBus.emit(eventName);
		}
	}
}
