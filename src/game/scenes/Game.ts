import Phaser from "phaser";
import type { FarmTreeSave, PlayerSave } from "../../composables/usePlayerData";
import { EventBus } from "../EventBus";
import { InteractionManager } from "./game/InteractionManager";
import { MapManager } from "./game/MapManager";
import { PlayerManager } from "./game/PlayerManager";
import { TreeManager } from "./game/TreeManager";
import type { GameSceneData, PlantTarget, SulfateQuality } from "./game/types";

type PlantRequestPayload = {
	seedId?: string;
	target?: PlantTarget;
	onResult?: (success: boolean) => void;
};

type HarvestRequestPayload = {
	hasScissors?: boolean;
	onHarvest?: (fruitId: string, quantity: number) => boolean;
};

type ResultPayload = {
	onResult?: (success: boolean) => void;
};

type SulfateRequestPayload = ResultPayload & {
	quality?: SulfateQuality;
};

type AudioKey =
	| "walk"
	| "juice"
	| "water-fill"
	| "water-tree"
	| "plant"
	| "harvest"
	| "fertilize"
	| "sulfate"
	| "error"
	| "buy"
	| "menu-ambience";

type AudioPayload =
	| AudioKey
	| {
			key: AudioKey;
			volume?: number;
	  };

export class Game extends Phaser.Scene {
	camera!: Phaser.Cameras.Scene2D.Camera;
	map: Phaser.Tilemaps.Tilemap | null = null;
	player?: Phaser.Physics.Arcade.Sprite;
	currentMapKey = "mapa";
	returnSpawn: { x: number; y: number } | null = null;
	suppressNextShutdownPlayerSave = false;

	mapManager!: MapManager;
	playerManager!: PlayerManager;
	treeManager!: TreeManager;
	interactionManager!: InteractionManager;
	private menuAmbience?: Phaser.Sound.BaseSound;

	constructor() {
		super("Game");
	}

	create(data?: GameSceneData) {
		this.mapManager = new MapManager(this);
		this.mapManager.setup(data);

		this.returnSpawn =
			typeof data?.returnSpawnX === "number" &&
			typeof data?.returnSpawnY === "number"
				? { x: data.returnSpawnX, y: data.returnSpawnY }
				: null;

		this.playerManager = new PlayerManager(this);
		this.playerManager.setup(data);

		this.treeManager = new TreeManager(this);
		this.interactionManager = new InteractionManager(this);
		this.interactionManager.setup();

		this.registerEventBusListeners();
		EventBus.emit("current-scene-ready", this);
		this.playerManager.emitPlayerStateChanged(true);
	}

	update() {
		this.playerManager?.update();
		this.interactionManager?.update();
		this.treeManager?.update();

	}

	private registerEventBusListeners() {
		EventBus.on("farm:plant-request", this.handlePlantRequest, this);
		EventBus.on("farm:harvest-request", this.handleHarvestRequest, this);
		EventBus.on("farm:water-request", this.handleWaterRequest, this);
		EventBus.on("farm:fertilize-request", this.handleFertilizeRequest, this);
		EventBus.on("farm:sulfate-request", this.handleSulfateRequest, this);
		EventBus.on("farm:day-changed", this.handleDayChanged, this);
		EventBus.on("audio:play", this.handleAudioPlay, this);
		EventBus.on("audio:menu-ambience", this.handleMenuAmbience, this);
		EventBus.on("farm:set-unlocked-fields", this.handleUnlockedFields, this);
		EventBus.on("farm:set-tree-state", this.handleTreeState, this);
		EventBus.on("farm:set-player-state", this.handlePlayerState, this);
		EventBus.on("farm:set-selected-item", this.handleSelectedItem, this);
		EventBus.on("ui:world-error", this.handleWorldError, this);

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			if (!this.suppressNextShutdownPlayerSave) {
				this.playerManager.emitPlayerStateChanged(true);
			}
			this.unregisterEventBusListeners();
			this.handleMenuAmbience(false);
			this.menuAmbience?.destroy();
			this.menuAmbience = undefined;
			this.playerManager.destroy();
			this.interactionManager.destroy();
			this.treeManager.destroy();
		});
	}

	private unregisterEventBusListeners() {
		EventBus.off("farm:plant-request", this.handlePlantRequest, this);
		EventBus.off("farm:harvest-request", this.handleHarvestRequest, this);
		EventBus.off("farm:water-request", this.handleWaterRequest, this);
		EventBus.off("farm:fertilize-request", this.handleFertilizeRequest, this);
		EventBus.off("farm:sulfate-request", this.handleSulfateRequest, this);
		EventBus.off("farm:day-changed", this.handleDayChanged, this);
		EventBus.off("audio:play", this.handleAudioPlay, this);
		EventBus.off("audio:menu-ambience", this.handleMenuAmbience, this);
		EventBus.off("farm:set-unlocked-fields", this.handleUnlockedFields, this);
		EventBus.off("farm:set-tree-state", this.handleTreeState, this);
		EventBus.off("farm:set-player-state", this.handlePlayerState, this);
		EventBus.off("farm:set-selected-item", this.handleSelectedItem, this);
		EventBus.off("ui:world-error", this.handleWorldError, this);
	}

	private handlePlantRequest(payload: PlantRequestPayload) {
		this.treeManager.handlePlantRequest(payload);
	}

	private handleHarvestRequest(payload: HarvestRequestPayload) {
		this.treeManager.handleHarvestRequest(payload);
	}

	private handleWaterRequest(payload: ResultPayload) {
		this.treeManager.handleWaterRequest(payload);
	}

	private handleFertilizeRequest(payload: ResultPayload) {
		this.treeManager.handleFertilizeRequest(payload);
	}

	private handleSulfateRequest(payload: SulfateRequestPayload) {
		this.treeManager.handleSulfateRequest(payload);
	}

	private handleDayChanged(day: number) {
		this.treeManager.handleDayChanged(day);
	}

	private handleAudioPlay(payload: AudioPayload) {
		const key = typeof payload === "string" ? payload : payload.key;
		const volume = typeof payload === "string" ? 0.36 : (payload.volume ?? 0.36);
		const audioKey = `sfx-${key}`;
		if (!this.cache.audio.exists(audioKey)) {
			return;
		}
		this.sound.play(audioKey, { volume });
	}

	private handleMenuAmbience(shouldPlay: boolean) {
		if (!this.cache.audio.exists("sfx-menu-ambience")) {
			return;
		}
		if (!this.menuAmbience) {
			this.menuAmbience = this.sound.add("sfx-menu-ambience", {
				loop: true,
				volume: 0.18,
			});
		}
		if (shouldPlay) {
			if (!this.menuAmbience.isPlaying) {
				this.menuAmbience.play();
			}
			return;
		}
		if (this.menuAmbience.isPlaying) {
			this.menuAmbience.stop();
		}
	}

	private handleUnlockedFields(fieldNames: string[]) {
		this.mapManager.handleUnlockedFields(fieldNames);
	}

	private handleTreeState(trees: FarmTreeSave[]) {
		this.treeManager.handleTreeState(trees);
	}

	private handlePlayerState(state: PlayerSave) {
		this.playerManager.handlePlayerState(state);
	}

	private handleSelectedItem(itemId: string | null) {
		this.treeManager.handleSelectedItem(itemId);
	}

	private handleWorldError(message: string) {
		if (!this.player || !message) {
			return;
		}

		const label = this.add
			.text(this.player.x, this.player.y - 42, message, {
				fontFamily: "monospace",
				fontSize: "9px",
				color: "#fef3c7",
				backgroundColor: "rgba(22, 25, 34, 0.82)",
				padding: { x: 6, y: 4 },
				align: "center",
				wordWrap: { width: 150 },
			})
			.setOrigin(0.5)
			.setDepth(20_000);

		this.tweens.add({
			targets: label,
			y: label.y - 18,
			alpha: 0,
			duration: 1200,
			ease: "Sine.easeOut",
			onComplete: () => label.destroy(),
		});
	}
}
